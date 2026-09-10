# Ai Sandbox — Takeover: detached runs and single-writer safety: `sandboxRunDriver` — the supported way to drive a resumed run

[Guide and prerequisites](./tanstack-ai-sandbox-c1c16d85.md) · Published skill · `@tanstack/ai-sandbox@0.5.7`.

## Takeover: detached runs and single-writer safety: `sandboxRunDriver` — the supported way to drive a resumed run


Takeover happens in the `GET` handler that already serves resumes. Add a
`driver` and the same request that replays the log also claims the run and keeps
driving it. **Do not hand-roll this.** `sandboxRunDriver` owns the claim, the
epoch fencing, and the quiescence gate; a consumer wiring `pipeToRunLog`
directly is re-implementing exactly the seam that produced this phase's
duplicate-write and false-terminal-write bugs.

```typescript
import { memoryStream, resumeServerSentEventsResponse } from '@tanstack/ai'
import { sandboxRunDriver } from '@tanstack/ai-sandbox'
import type { RunStore, StreamChunk } from '@tanstack/ai'
import type { LockStore } from '@tanstack/ai/locks'

/**
 * The claim hands `drive` an `AbortSignal` that fires the moment this host loses
 * ownership; `chat()` takes an `AbortController`. Mirror one onto the other, or
 * a lost claim never stops the drive.
 */
export function controllerFor(signal: AbortSignal): AbortController {
  const controller = new AbortController()
  const abort = (): void => controller.abort(signal.reason)
  if (signal.aborted) abort()
  else signal.addEventListener('abort', abort, { once: true })
  return controller
}

export function takeoverResponse(
  request: Request,
  runs: RunStore,
  locks: LockStore,
  drive: (input: {
    runId: string
    threadId: string
    signal: AbortSignal
  }) => AsyncIterable<StreamChunk>,
): Response {
  return resumeServerSentEventsResponse({
    adapter: memoryStream(request),
    driver: sandboxRunDriver({
      request,
      runs,
      locks,
      // Per-run factory, same shape as `RunDeps.durability`.
      durability: () => memoryStream(request),
      drive,
      // Serverless: pass `waitUntil: (p) => ctx.waitUntil(p)` to keep the
      // background drive alive. `fenceQuietMs` overrides the quiescence window.
    }),
  })
}
```

Inside `drive`, run `chat()` with `abortController: controllerFor(input.signal)`
and `withSandbox(sandbox, { runs, durability: { adapter, attach: true } })`.
**`attach: true` is the whole difference** — the harness tails the run's
EXISTING journal instead of starting a second agent. It belongs there and never
on `chat()` (core has no sandbox vocabulary), and it is set only by an attach
route, never by a `POST` handler. Load the thread from the message store: the
client sent no history because it is reconnecting, not asking a question — and
pass the run record's `threadId`. Forget it and the attach **refuses up front**
with `DurableThreadIdRequiredError` rather than failing mid-stream: every emitted
chunk carries `threadId`, so a generated one differs from the stored log in its
very first chunk. `resolveDurableThreadId` throws only in the durable-AND-
attaching quadrant — a durable _fresh_ run legitimately mints its `threadId`,
since it is the run that establishes it. `JournalReplayThreadIdMismatchError` is
still what surfaces if a mismatched `threadId` reaches `alignToStoredLog` by some
other route; `sandboxRunDriver` itself forwards `active.threadId` into
`drive({ runId, threadId, signal })`, so the remaining gap is application `drive`
code that does not pass it on to `chat()`.

The response is byte-identical whether or not you pass `driver`: it still
replays from the durability log. The drive runs beside it, appending to the
producer-side log, and the response tails what lands. Everything is total by
construction — no run id, no record, an already-terminal record, another host
holding the claim, or a throwing drive all resolve to "serve the log, drive
nothing", logged server-side.

Branchable failures, all barrel-exported:

```typescript
import {
  RunClaimLostError,
  RunClaimNotAcquiredError,
  RunDriverPipeOutsideClaimError,
} from '@tanstack/ai-sandbox'

export function describeDriveFailure(error: unknown): string {
  if (error instanceof RunClaimNotAcquiredError) {
    // 'terminal' | 'unknown' | 'superseded' — an ordinary contended takeover.
    return `not driving ${error.runId}: ${error.reason}`
  }
  if (error instanceof RunClaimLostError) {
    return `superseded mid-drive at epoch ${error.heldEpoch}`
  }
  if (error instanceof RunDriverPipeOutsideClaimError) {
    // Programming error: the options object was taken apart and `pipe` called
    // outside `claim`, so there is no epoch to fence with.
    return `run ${error.runId}: pipe ran outside its claim`
  }
  throw error
}
```

The first two are normal outcomes of a contended takeover and
`resumeServerSentEventsResponse` already swallows both — expect them in logs,
not in responses.
