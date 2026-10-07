# Build Custom Adapter — Engine notes

[Guide and prerequisites](./tanstack-ai-persistence-build-custom-adapter-61b5cbc7.md) · Published skill · `@tanstack/ai-persistence@0.8.0`.

## Engine notes

**Postgres (`pg`, `postgres.js`, Neon, Supabase)** — `jsonb` columns round-trip
objects, so skip the `JSON.stringify` on read paths (`pg` parses `jsonb` for
you; check what the driver returns before assuming). `bigint` columns come back
as strings in `pg` — use `bigint` with an explicit `Number()` in the mapper, or
store epoch ms in a `double precision`/`bigint` and convert once. Composite key
is `PRIMARY KEY (namespace, key)`.

**Kysely** — define the four tables in the app's `Database` interface, then the
stores are `db.insertInto('chat_runs').values(...).onConflict((oc) => oc.column('run_id').doNothing())`
and `.executeTakeFirst()`. `updateTable(...).execute()` is already a no-op on
zero matches, so invariant 4 comes free.

**node:sqlite / better-sqlite3** — the complete implementation is in the guide
and in `examples/ts-react-chat/src/lib/sqlite-persistence.ts`. Prepared
statements at factory scope, `INSERT ... ON CONFLICT`, JSON as `text`, epoch ms
as `integer`. Wrap sync calls in `async` methods; the contracts are promise-based.

**MongoDB** — one collection per record type, `_id` set to the natural key
(`threadId`, `runId`, `interruptId`). For `metadata`, use `_id: { namespace, key }`
— a compound `_id` subdocument, or a unique index on `{ namespace, key }` — never
a delimiter-joined string. Invariant: `('a:b','c')` and `('a','b:c')` must stay
distinct records, and the conformance suite checks it.
`createOrResume` is `updateOne({ _id }, { $setOnInsert: doc }, { upsert: true })`
then a `findOne` — `$setOnInsert` is the insert-if-absent primitive. Guard the
`E11000` duplicate-key race and re-read. `list*` need `.sort({ requestedAt: 1 })`.

**Redis / Upstash** — all four stores fit, and Redis is excellent for
`LockStore` too. Store each record as one JSON document (RedisJSON, or a JSON
string) and list `runs` and `interrupts` through sorted-set indexes: one per
thread and one per run, scored by `startedAt` / `requestedAt`. Those indexes
are only safe when the record and every index it joins are written by **one
Lua script** (`EVAL`), never as separate commands: insert the record if absent
(`JSON.SET ... NX` or `SET ... NX`), `ZADD` each index only when that insert
happened, and return the stored record. Pass every key the script touches in
`KEYS`, so it also works on a cluster. That one script is `createOrResume`
and `interrupts.create` (invariants 3 and 6), and it stays correct across
instances. `interrupts.commitBatch` is one script too: check every id exists
and is pending, then write them all, or write nothing. If `listReclaimable`
reads a sorted set of detached runs, the `runs.update` that changes `status` or
`detachedSince` must move the run in or out of it in the same script; as two
commands, a crash between them hides a detached run from the reaper. `ZRANGE` on the index
gives the `requestedAt` ordering for free. For `metadata`, build the key so
`('a:b','c')` and `('a','b:c')` stay distinct, for example by escaping the
delimiter. `@upstash/agentkit-tanstack-ai` (`upstashPersistence()`) is a
published implementation of this layout that passes the conformance suite with
all seven stores; on Upstash the app can use it instead of writing this file.

**Anything else** — you only need the seven invariants above. The core never
inspects your storage.
