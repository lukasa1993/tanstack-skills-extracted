# Build Custom Adapter — 3. The invariants

[Guide and prerequisites](./tanstack-ai-persistence-build-custom-adapter-61b5cbc7.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

## 3. The invariants

Getting one of these wrong is the usual source of stuck approvals and wiped
history. They are engine-independent:

1. **`saveThread` is a full overwrite**, never an append. The argument is the
   complete authoritative transcript.
2. **`loadThread` returns `[]`** for an unknown thread, never `null`.
3. **`createOrResume` is insert-if-absent** — an existing `runId` comes back
   _unchanged_, ignoring the new field values. Resume and double-submit depend
   on it. After a racy insert, re-read rather than trusting your own write.
4. **`runs.update` on an unknown id is a silent no-op** — it must not throw and
   must not insert. (Drivers that throw on zero rows affected need the
   `updateMany`-style call, not the `update`-one-or-throw call.)
5. **`runs.update` distinguishes "field omitted" from "field explicitly
   cleared" for the durable-run fields** (`sandboxKey`, `detachedSince`,
   `cancelRequested`, `driverEpoch`). A reattach clears `detachedSince` by
   passing it explicitly as `undefined` — `update(runId, { detachedSince: undefined })`
   — and that must write `NULL`, not be silently dropped. Check
   `'detachedSince' in patch`, never `patch.detachedSince !== undefined`; the
   latter cannot tell a clear from an omission and leaves every reattached run
   looking permanently detached to the reaper. Same rule for
   `cancelRequested` (`false` is a real value, not "unset") and for
   `sandboxKey` / `driverEpoch`. See
   `examples/ts-react-chat/src/lib/sqlite-persistence.ts` for the pattern.
6. **`interrupts.create` is insert-if-absent** — never clobber a resolved
   interrupt back to pending. Every `list*` is ordered by `requestedAt`
   ascending.
7. **`runs.listReclaimable` uses an inclusive cutoff** (if implemented):
   `status === 'running' AND detachedSince <= now - ttlMs`. It is a query, not
   automatic reclamation: `reapDetachedRuns` from `@tanstack/ai-sandbox` is the
   sweep that consumes it, and the application schedules that sweep. A store
   without this method cannot be reaped. `runs.findActiveRun` is required;
   `runs.listByThread` / `runs.listReclaimable` are optional: implement only
   what the app needs and leave the rest off the object.

Row mappers omit absent optionals
(`...(row.sandbox_key != null ? { sandboxKey: row.sandbox_key } : {})`) so
records compare cleanly against the reference in-memory backend. For a
two-column `error`/`error_code` layout, the mapper is
`...(row.error != null ? { error: { message: row.error, ...(row.error_code != null ? { code: row.error_code } : {}) } } : {})`.
