# Build Custom Adapter — Engine notes

[Guide and prerequisites](./tanstack-ai-persistence-build-custom-adapter-61b5cbc7.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

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

**Redis / Upstash** — workable for `metadata` and excellent for `LockStore`, but
think before putting `interrupts` there: the listings need ordered secondary
indexes you have to maintain by hand (a sorted set per thread and per run,
scored by `requestedAt`). A common split is Postgres for `messages`/`runs`/
`interrupts` and Redis for locks; compose them with `composePersistence`.

**Anything else** — you only need the seven invariants above. The core never
inspects your storage.
