# Stores — Contracts and invariants: `RunStore`

[Guide and prerequisites](./tanstack-ai-persistence-stores-e6061122.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

## Contracts and invariants: `RunStore`


`RunStatus`, `TerminalRunStatus`, `RunRecord`, `RunStore`, `defineRunStore`, and
`isTerminalRunStatus` are defined in `@tanstack/ai` and re-exported from
`@tanstack/ai-persistence`. Import those from either; the recipes in this skill
import from `@tanstack/ai-persistence` so an adapter author needs only one
package name.

**`RunError` is the exception — it is NOT re-exported.** Import it from
`@tanstack/ai` directly (`import type { RunError } from '@tanstack/ai'`); the
`@tanstack/ai-persistence` barrel has no such export and the import fails to
resolve.

Four methods are required (`createOrResume` / `update` / `get` /
`findActiveRun`). Two are optional: implement only the ones your backend needs,
and leave the rest off the object entirely (not `undefined`, just absent). A
four-method `RunStore` is a fully valid backend.

`withPersistence` itself calls **none** of the three non-`createOrResume`/`update`
query methods, so leaving both optional ones off costs nothing in the middleware.
Their consumers are elsewhere, and each absence disables exactly one feature:

| method            | consumer                                                  | absent ⇒                                                                 |
| ----------------- | --------------------------------------------------------- | ------------------------------------------------------------------------ |
| `findActiveRun`   | `reconstruct.ts` (`stores.runs?.findActiveRun(threadId)`) | required — cannot be absent; stubbing it to `null` silently kills rejoin |
| `listReclaimable` | `reapDetachedRuns` in `@tanstack/ai-sandbox`              | the store cannot be reaped at all                                        |
| `listByThread`    | application code — nothing in the framework calls it      | nothing framework-side breaks                                            |

Consumers of the two OPTIONAL methods feature-detect with `store.method?.(...)`
and degrade rather than throwing. `findActiveRun` is required, so nothing
feature-detects it.

The conformance testkit does not feature-detect. An optional method that is
missing and not declared in `skipMethods` fails the suite, so an omission is
always a choice you made on purpose rather than a check that quietly did not
run. Declare yours and the suite reports them as skipped with a reason:

```ts
// The shipped sqlite example implements findActiveRun and listReclaimable and
// declares only the one it omits.
runPersistenceConformance('sqlite', () => persistence, {
  skipMethods: ['runs.listByThread'],
})
```

```ts
interface RunStore {
  // Required
  createOrResume(
    input: Pick<RunRecord, 'runId' | 'threadId' | 'startedAt'> & {
      status?: RunStatus
    },
  ): Promise<RunRecord>
  update(
    runId: string,
    patch: Partial<
      Pick<
        RunRecord,
        | 'status'
        | 'finishedAt'
        | 'error'
        | 'usage'
        | 'sandboxKey'
        | 'detachedSince'
        | 'cancelRequested'
        | 'driverEpoch'
      >
    >,
  ): Promise<void>
  get(runId: string): Promise<RunRecord | null>
  findActiveRun(threadId: string): Promise<RunRecord | null>

  // Optional
  listByThread?(threadId: string): Promise<Array<RunRecord>>
  listReclaimable?(opts: {
    now: number
    ttlMs: number
  }): Promise<Array<RunRecord>>
}
```

`RunStatus` is `'running' | 'interrupted' | 'completed' | 'failed' | 'aborted'`.
`'interrupted'` is a human-in-the-loop pause, not terminal: it is what
interrupt-resume continues from, and must never be conflated with `'aborted'`
(an explicit cancellation). `TerminalRunStatus` narrows to
`'completed' | 'failed' | 'aborted'`. `isTerminalRunStatus(status)` is a type
predicate: `(status: RunStatus) => status is TerminalRunStatus`, so calling it
inside a guard narrows `status` to `TerminalRunStatus` for the rest of that
branch, with no cast needed.

`RunRecord.usage` is optional. `withPersistence` sums reported numeric fields
across provider calls for that `runId`, while opaque `providerUsageDetails`
retains the latest reported bag. Known usage is persisted on interruption and
every terminal status.

`RunRecord.error` is a structured `RunError`, not a bare string:

```ts
interface RunError {
  message: string
  code?: string
}
```

`message` is the provider's prose (it changes between model versions and
cannot be branched on); `code` is the stable, machine-branchable
classification a consumer switches over to retry, escalate, or show specific
UI. Store both, and omit `code` from a mapped record when its column is
`null` rather than writing `code: undefined` (`...(row.errorCode != null ? { code: row.errorCode } : {})`).

`defineRunStore<const T extends RunStore>(store: T): T` returns the passed
object's own type, so an optional method your store implements (say,
`listByThread`) stays known-present on the returned value instead of widening
back to `RunStore`'s `| undefined`. You get autocomplete and contract checking
without a separate `: RunStore` annotation, and without a feature-detection
guard on your own return value.

#### The durable-agent-runs fields: `sandboxKey`, `detachedSince`, `cancelRequested`, `driverEpoch`

These four `RunRecord` fields exist for the sandbox/durable-run layer to
reattach a run a client disconnected from, and for out-of-band cancellation.
A `RunStore` you write must round-trip all four through `update` → `get`, even
if your app does not use sandboxes yet — the conformance testkit checks this
unconditionally (it is not behind `skipMethods`, because `update`/`get` are
REQUIRED methods).

- **`sandboxKey`** — compound key identifying the sandbox this run is bound
  to, so a reclaimer can find it to tear down.
- **`detachedSince`** — epoch ms when the last viewer detached; absent while
  someone is attached. Read by `listReclaimable`.
- **`cancelRequested`** — set by an explicit out-of-band cancel (see below),
  distinct from a mere disconnect.
- **`driverEpoch`** — monotonic fencing token, bumped by each host that
  claims the run, so a superseded host can discover it lost by comparing the
  stored value against the one it holds.

**Fresh-run reads must be `undefined`, not a coerced falsy default.** A
backend that reads a `NULL`/absent column back as `cancelRequested: false` or
`driverEpoch: 0` is claiming knowledge it does not have ("explicitly not
cancelled") — that is a different fact from "never set". Omit the field from
the mapped record instead
(`...(row.cancel_requested != null ? { cancelRequested: row.cancel_requested !== 0 } : {})`).

**`update` must use `'field' in patch`, not `patch.field !== undefined`, for
these four.** A caller clears `detachedSince` on reattach by passing it
explicitly as `undefined` — `store.update(runId, { detachedSince: undefined })`
— and that must write `NULL`, not be filtered out of the write. Checking
`!== undefined` cannot tell "clear this field" apart from "I didn't mention
this field", so it silently drops the clear and the run looks permanently
detached to the reaper forever after. `'detachedSince' in patch` is `true` for
an explicit `undefined` and `false` when the caller omitted the key entirely —
that is the distinction you need. The same applies to `cancelRequested`
(`false` is a real, meaningful value, not "unset") and to `sandboxKey` /
`driverEpoch`. See `examples/ts-react-chat/src/lib/sqlite-persistence.ts` for
a worked implementation of exactly this pattern.

#### Out-of-band cancellation

Cancel intent is **never inferred from a disconnect** — a user pressing Stop
and a user closing the tab produce an identical connection close, so the two
are indistinguishable from the abort alone. `@tanstack/ai` exports the actual
primitives:

- **`requestRunCancel`** — records durable cancel intent (writes
  `cancelRequested: true` through a `RunStore`), for a run being driven on a
  host other than the one handling the cancel request.
- **`wasCancelRequested`** — reads that intent back.
- **`RUN_CANCEL_REASON`** — the well-known abort reason string used for the
  in-process case (the same host aborting its own signal), paired with
  `isCancelRequestedReason` to check for it.

A `RunStore` you write does not call these directly — they operate on your
store through `update`/`get` — but `cancelRequested` must round-trip
faithfully (previous section) for the durable path to work at all.

- **`createOrResume`** (required): if `runId` exists, return it **unchanged**,
  including its stored `usage`, and ignore the passed `threadId` / `startedAt` /
  `status`. Resuming a run does not reset `startedAt` or overwrite its current
  status. Idempotent retries and double-submit depend on this. `status` defaults
  to `'running'` on first creation.
- **`update`** (required): missing `runId` is a **no-op** (do not throw, do not
  insert).
- **`get`** (required): current record, or `null` when unknown.
- **`listByThread`** (optional): every run for `threadId`, ascending by
  `startedAt`. Only needed to render a thread's past agent activity.
- **`listReclaimable`** (optional): runs where `status === 'running'` AND
  `detachedSince` is set AND `detachedSince <= now - ttlMs`. The cutoff is
  inclusive: a run detached exactly at the cutoff qualifies. This is a query, not
  automatic behavior — the consumer is `reapDetachedRuns` from
  `@tanstack/ai-sandbox`, which the application schedules itself (cron, queue,
  `alarm()`, `waitUntil`), so returning this list has no side effect until that
  sweep runs. `detachedSince` is written for you by `withSandbox`'s detach path
  (alongside `sandboxKey`) and cleared by the takeover path; drop either field and
  nothing can reclaim the sandbox. `cancelRequested` is written by
  `requestRunCancel` and read by `wasCancelRequested`, and the reaper's expiry
  path goes through `requestRunCancel` to stop a run past its TTL.
- **`findActiveRun`** (**required**): the most recent `'running'` run for
  `threadId` (max `startedAt`), or `null` if none is active. Enables reconnect
  from a stable thread id without a client-held run id. Stub it out and
  reconnect silently stops working — `null` is also the correct answer for an
  idle thread, so nothing can detect the difference. It was optional for exactly
  one release cycle and cost precisely that, which is why it is required now.

Capability tiers belong at the STORE level (omit `runs` entirely and declare
`ChatTranscriptStores`), not the method level — never ship a `RunStore` with a
stubbed method. The two list queries above are the only method-level options,
and each must be declared via `skipMethods` when absent.
