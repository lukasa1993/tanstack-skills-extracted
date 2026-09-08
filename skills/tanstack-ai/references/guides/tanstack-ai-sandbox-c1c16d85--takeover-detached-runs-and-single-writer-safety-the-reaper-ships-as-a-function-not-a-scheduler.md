# Ai Sandbox — Takeover: detached runs and single-writer safety: The reaper ships as a function, not a scheduler

[Guide and prerequisites](./tanstack-ai-sandbox-c1c16d85.md) · Published skill · `@tanstack/ai-sandbox@0.5.6`.

## Takeover: detached runs and single-writer safety: The reaper ships as a function, not a scheduler


`reapDetachedRuns` (with `sandboxReclaimer` for the sandbox teardown and
`pruneJournals` for the journal directory) is what closes out a detached run, but
nothing in the framework calls it: the application must, from its own cron route,
queue consumer, Durable Object `alarm()`, or `waitUntil`. Wiring `durability` and
never scheduling it leaves detached delivery logs open forever — every attached
tailer parks, the TTL is inert, and sandboxes bill indefinitely.

**`hasFinished` is a REQUIRED option, not a nicety.** The sweep must never drive a
run to find out whether it finished: `pipeToRunLog` is total, so it always writes a
terminal status and always calls `close()`, which on a live run means a false
transcript, every tailer's stream ended, and a record that has left
`listReclaimable` forever (so the sandbox can never be reclaimed). So the sentinel
is detected **out of band**, and neither the delivery log (frozen at the last
delivered chunk once the viewer left) nor this package (`SandboxInstanceStore` has
no `list`) can answer it. `probeRunExit` is the shipped implementation; only your
application can map a `sandboxKey` to a live handle for it. Anything it cannot
answer must be `unknown`, never `finished`:

```typescript
import {
  probeRunExit,
  reapDetachedRuns,
  sandboxReclaimer,
} from '@tanstack/ai-sandbox'
import type { RunRecord } from '@tanstack/ai'
import type { ReapResult, RunExitProbe } from '@tanstack/ai-sandbox'

async function hasFinished(record: RunRecord): Promise<RunExitProbe> {
  if (record.sandboxKey === undefined) return { state: 'unknown' }
  try {
    const instance = await instances.get(record.sandboxKey)
    if (instance === null) return { state: 'unknown' }
    const handle = await sandbox.provider.resume({
      id: instance.providerSandboxId,
    })
    if (handle === null) return { state: 'unknown' }
    return await probeRunExit({ handle, runId: record.runId })
  } catch (error) {
    return { state: 'unknown', error }
  }
}

export function sweepDetachedRuns(): Promise<ReapResult> {
  return reapDetachedRuns({
    runs, // the SAME RunStore the chat routes use
    locks, // the same distributed LockStore withSandbox gets
    durability: durabilityFor, // per-run factory resolving the SAME log
    hasFinished,
    drive: driveRun, // the same `drive` the attach route passes sandboxRunDriver
    now: Date.now(),
    detachedRunTtlMs: 30 * 60 * 1000,
    reclaim: sandboxReclaimer({ provider: sandbox.provider, instances }),
  })
}
```

`reapDetachedRuns` resolves rather than rejects; read its `outcomes` tally. Note
that `'producing'`, `'unknown'`, and `'not-claimed'` mean the run was left
untouched, whereas `'budget-exceeded'` is the opposite — the record IS terminal,
the log IS closed, and `reclaim` fired; it flags a run the probe said had finished
that would not replay in time, i.e. a misbehaving journal read, translation, or
log. `'reclaim-failed'` means the transcript saved but the sandbox is still up, and
no later sweep will retry it — the shipped `sandboxReclaimer` **rejects** (with
`SandboxReclaimFailedError`) when the provider's `destroy` throws, which is what
makes that outcome reachable at all, so a custom `reclaim` must reject too rather
than logging and resolving. It overwrites `'budget-exceeded'` when a run hit both;
`ReapRunEntry.terminalizedAnyway` is set if and only if the budget anomaly
happened and is what keeps that second diagnostic on the entry.

**`ReapOptions.detachedRunTtlMs` is the ONLY detached-run TTL.** It is required,
passed directly to `reapDetachedRuns`, and nothing derives it from `withSandbox`
— there is no TTL option on `durability`, and no other config to keep it in sync
with.

Full reaper wiring — every outcome, `pruneJournals`' keep/delete table, and the
scheduling shapes — is in `docs/sandbox/reaping.md`. The attach/takeover half,
including the client `joinRun` side, is in `docs/sandbox/takeover.md`.
