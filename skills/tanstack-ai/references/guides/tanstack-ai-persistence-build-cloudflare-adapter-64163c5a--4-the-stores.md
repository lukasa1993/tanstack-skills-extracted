# Build Cloudflare Adapter — 4. The stores

[Guide and prerequisites](./tanstack-ai-persistence-build-cloudflare-adapter-64163c5a.md) · Published skill · `@tanstack/ai-persistence@0.6.7`.

## 4. The stores

Two routes, same invariants:

- **Drizzle over D1** — if the app already runs Drizzle, wrap the binding with
  `drizzle(env.DB, { schema })` and follow
  **ai-persistence/build-drizzle-adapter** verbatim (its "if `db` is
  per-request" section is exactly this case). Stop reading here.
- **Raw D1** — implement the four stores against `d1.prepare(sql).bind(...)`:
  `.first()` for `get`, `.all()` for `list*`, `.run()` for writes. D1 speaks
  SQLite, so this mirrors the `node:sqlite` walkthrough in the guide one-for-one;
  everything is already async, so no `Promise.resolve` wrapping.

The invariants are the whole game, whichever route you take:

| Store        | Rule                                                                                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `messages`   | `saveThread` is a full replace (`INSERT … ON CONFLICT(thread_id) DO UPDATE`)                                                                                                                       |
| `runs`       | `createOrResume` reads first, else `INSERT … ON CONFLICT DO NOTHING`, then re-reads                                                                                                                |
| `runs`       | `update` on an unknown id is a silent no-op — never throws, never inserts                                                                                                                          |
| `runs`       | `findActiveRun` (required) returns the latest `'running'` run for the thread, else null                                                                                                            |
| `runs`       | `listByThread` (optional) returns every run for the thread `ORDER BY started_at ASC`                                                                                                               |
| `runs`       | `listByParentRun` (optional) returns child runs for one `parent_run_id`, `ORDER BY started_at ASC`. `reconstructChat` uses it to put subagent cards back                                           |
| `runs`       | `listReclaimable` (optional) returns runs where `status = 'running' AND detached_since IS NOT NULL AND detached_since <= now - ttlMs` (inclusive cutoff); it is a query, not automatic reclamation |
| `interrupts` | `create` is insert-if-absent; never clobber a resolved interrupt back to pending                                                                                                                   |
| `interrupts` | every `list*` ends `ORDER BY requested_at ASC`                                                                                                                                                     |
| `metadata`   | reject nullish `set` with a clear `TypeError`; tell callers to use `delete`                                                                                                                        |

On `runs`, `findActiveRun` is required. `listByThread`, `listByParentRun`, and
`listReclaimable` are optional, so implement those only if the app needs them.
`withPersistence` calls `createOrResume`, `update`, and `get`. `reconstruct.ts` calls
`findActiveRun` for rejoin-by-thread and `listByParentRun` to put subagent
cards back. `@tanstack/ai-sandbox`'s `reapDetachedRuns` calls `listReclaimable`.
`reconstruct.ts` also calls `listByThread` to find the parent runs of children
that a tool call started. Consumers of the optional methods
feature-detect with `store.method?.(...)` and degrade when one is absent. The
conformance testkit does not: each optional method you leave out must be listed
in `skipMethods` or the suite fails. `listByParentRun` is the exception. When it
is absent, the subagent checks skip on their own.

`createOrResume` copies `parentRunId`, `subagentRunId`, and `name` on the first
insert. A later call for the same `runId` leaves them unchanged. If the caller
omits a field, omit it on the mapped record.

`RunRecord.error` is a structured `RunError` (`{ message: string, code?: string }`),
so the table gets two columns rather than one JSON blob: `error` for the
provider's prose and `error_code` for the stable classification an operator
filters and groups by. Write both together in `update`, so a later code-less
failure can never leave a stale `error_code` from an earlier one behind, and
omit `code` from the mapped record when the column is `null`:
`...(row.error != null ? { error: { message: row.error, ...(row.error_code != null ? { code: row.error_code } : {}) } } : {})`.
Other row mappers omit absent optionals the same way
(`...(row.sandbox_key != null ? { sandboxKey: row.sandbox_key } : {})`) so
records compare cleanly against the reference in-memory backend. JSON columns
are `text`: `JSON.parse` on read, `JSON.stringify` on write. Timestamps are
`integer` epoch ms.

`sandbox_key`, `detached_since`, `cancel_requested`, and `driver_epoch` are the
durable-agent-runs columns. In `update`, check `'field' in patch` for all
four — never `patch.field !== undefined` — because a reattach clears
`detachedSince` by passing it explicitly as `undefined`, which must bind
`NULL` into the `SET` clause rather than being filtered out of it (a filtered
clear leaves the stale value and the run looks permanently detached to the
reaper). The same applies to `cancelRequested`: `false` written explicitly is
a real, meaningful value distinct from "never set", not something to coerce
away. See `examples/ts-react-chat/src/lib/sqlite-persistence.ts` (D1 speaks
the same SQLite dialect) for the worked `update` body.
