# Ai Sandbox — Takeover: detached runs and single-writer safety: Single-writer safety: BOTH seams are fenced

[Guide and prerequisites](./tanstack-ai-sandbox-c1c16d85.md) · Published skill · `@tanstack/ai-sandbox@0.5.7`.

## Takeover: detached runs and single-writer safety: Single-writer safety: BOTH seams are fenced


Only one host may write a run. The client has no safety net below its offset
de-dup: if two hosts each snapshot the log, compute a "remainder", and append
it, the same logical chunk lands twice under two different offsets, looks new,
and the stream processor applies text and tool-argument deltas unconditionally
— doubled prose and `{"a":1}{"a":1}` tool arguments. Takeover is by definition
two hosts wanting one run, so the exclusion has to be real. Three layers, all
wired by `sandboxRunDriver`: a per-run **lease** (`LockStore.withLock` around
the whole drive), an **epoch** (`RunRecord.driverEpoch`, bumped by each
successful claim and re-read before appends), and **quiescence** (the successor
waits for the stored log to stop growing before its first append;
`DEFAULT_FENCE_QUIET_MS` = 5s, override with `fenceQuietMs`).

**A run's facts live in two places, and both are fenced.** This is the part a
reader gets half-right and then builds a broken poller on:

- **The event log.** A superseded driver's `append` is **refused**, and the
  first refusal latches the fence permanently shut.
- **The run record.** A **terminal-status `update` from a lost claim is
  suppressed** — it resolves without writing. Non-terminal writes still pass
  through (a stale `detachedSince` / `sandboxKey` cannot make a live run look
  finished, and the successor overwrites them anyway).

Fencing only the log would not remove the harm, it would relocate it:
`pipeToRunLog` answers a refused append by writing a terminal record, so a dead
host would mark the successor's healthy run `'failed'`, and every consumer that
branches on terminal status (`isTerminalRunStatus`, `findActiveRun`, a status
poller, a reaper) would believe a live run died on the authority of a host that
no longer owns it. Because both seams are closed, **a terminal status on the
record is trustworthy and a status poller may believe it.**

`close()` is outside both fences, deliberately: it runs on every teardown path
including the teardown _caused_ by losing the claim, and a fenced `close` would
wedge the record at `'running'` with every live tailer parked forever — a
durability `read` only ends when the log closes.

This is **not** airtight fencing. A predecessor paused (GC, VM suspend) longer
than the quiescence window between its last fence check and its append landing
can still write one batch; closing that needs a compare-and-set
`StreamDurability.append` does not offer. Mitigate at deployment level: a
lease-backed distributed `LockStore`, and `fenceQuietMs` above the lease renewal
interval.
