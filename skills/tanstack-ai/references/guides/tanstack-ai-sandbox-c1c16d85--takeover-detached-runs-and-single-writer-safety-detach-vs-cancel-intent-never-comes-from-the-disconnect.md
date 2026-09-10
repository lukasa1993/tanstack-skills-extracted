# Ai Sandbox — Takeover: detached runs and single-writer safety: Detach vs cancel — intent NEVER comes from the disconnect

[Guide and prerequisites](./tanstack-ai-sandbox-c1c16d85.md) · Published skill · `@tanstack/ai-sandbox@0.5.7`.

## Takeover: detached runs and single-writer safety: Detach vs cancel — intent NEVER comes from the disconnect


A user pressing Stop and a user closing the tab produce the **identical**
connection close. There is nothing in the disconnect to tell them apart, so
never try. Intent arrives out of band, and there are exactly two bands, either
of which is authoritative:

1. **Durable** — `requestRunCancel(runs, runId)` records `cancelRequested` on
   the run record. This is the only channel that reaches a run being driven by a
   **different** host than the one the cancel landed on, which is the normal
   case for a detached run.
2. **In-process** — abort the run's own `AbortController` with
   `RUN_CANCEL_REASON`. Core reads that reason back into `AbortInfo`, so
   `AbortInfo.cancelRequested` is `true` for that abort and `false` for a plain
   disconnect. Fast path only.

A cancel endpoint should do **both**. `requestRunCancel` deliberately writes no
status: recording intent is not the same as the run having stopped, and only the
driver knows when the agent is dead and the sandbox is gone.

```typescript
import { RUN_CANCEL_REASON, requestRunCancel } from '@tanstack/ai'
import type { RunStore } from '@tanstack/ai'

/** Runs THIS process drives. A run driven by another replica is absent here. */
const driving = new Map<string, AbortController>()

export async function cancelRun(
  runs: RunStore,
  threadId: string,
): Promise<void> {
  const active = await runs.findActiveRun(threadId)
  if (!active) return
  // Band 1: durable, so a remote driver observes it on its next teardown.
  await requestRunCancel(runs, active.runId)
  // Band 2: in-process, so a co-located driver stops immediately.
  driving.get(active.runId)?.abort(RUN_CANCEL_REASON)
}
```

On the client, **`chat.stop()` alone is not a cancel.** It aborts a local
`AbortController` and sends the server nothing, which on a durable run is
indistinguishable from a refresh — so the agent keeps running and keeps
spending tokens with nobody watching. Call a cancel endpoint too.

What each path writes: a disconnect on a durable run with `detachOnDisconnect`
on and no cancel recorded keeps the sandbox and writes `detachedSince` +
`sandboxKey`, while `withPersistence` writes **nothing** (the record stays
`'running'`). A cancel in either band destroys the sandbox regardless of
`destroyOnComplete`, and `withPersistence` writes `'aborted'`. `keepAlive` /
`destroyOnComplete: false` govern _successful completion_ only — they never keep
a sandbox alive through a cancel.
