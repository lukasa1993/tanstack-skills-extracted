# Ai Sandbox — Takeover: detached runs and single-writer safety: A real `LockStore` is required

[Guide and prerequisites](./tanstack-ai-sandbox-c1c16d85.md) · Published skill · `@tanstack/ai-sandbox@0.5.6`.

## Takeover: detached runs and single-writer safety: A real `LockStore` is required


`InMemoryLockStore` **cannot** coordinate across hosts: it serializes claims
within one process, and the signal it hands out is a fresh
`AbortController().signal` that is never aborted, so the lease can never report
a loss. Two replicas then drive one run and duplicate its log. `withSandbox`
emits a warning when durability is wired over an in-memory lock — **including
when no lock is wired at all**, because `defineSandbox`'s `ensure` falls back to
a process-lifetime `InMemoryLockStore`, which is the most in-memory case, not an
exempt one. Wire a distributed store with `withLocks` from `@tanstack/ai/locks`
(ordered **before** `withSandbox`) or the `locks` option.

Also required: a `RunStore` whose `update` round-trips `status`, `finishedAt`,
`error`, `usage`, `sandboxKey`, `detachedSince`, `cancelRequested`, and
`driverEpoch`. The last four are what a hand-written backend tends to omit, and
each omission breaks one mechanism: no `driverEpoch` → no fencing; no
`cancelRequested` → Stop cannot reach a remote driver; no
`detachedSince`/`sandboxKey` → nothing can reclaim the sandbox. `findActiveRun`
and `listReclaimable` are optional (feature-detect them), but you need the first
to rejoin by thread and the second for `reapDetachedRuns` to have anything to
sweep — a store without it cannot be reaped at all.
