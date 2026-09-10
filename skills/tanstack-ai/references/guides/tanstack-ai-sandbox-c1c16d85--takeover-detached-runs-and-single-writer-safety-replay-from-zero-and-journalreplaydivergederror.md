# Ai Sandbox — Takeover: detached runs and single-writer safety: Replay from zero, and `JournalReplayDivergedError`

[Guide and prerequisites](./tanstack-ai-sandbox-c1c16d85.md) · Published skill · `@tanstack/ai-sandbox@0.5.7`.

## Takeover: detached runs and single-writer safety: Replay from zero, and `JournalReplayDivergedError`


A takeover does **not** resume the journal where the dead host stopped. It
re-reads the journal **from byte zero**, re-translates it, and alignment makes
that safe: the stored log is read once with `snapshot()`, the replay is verified
against it by `chunkFingerprint`, the matching prefix is suppressed, and only
the remainder is appended and delivered. The log _is_ the checkpoint, so no
checkpoint can disagree with it.

If the replay produces a different chunk than the log holds at that index,
`JournalReplayDivergedError` is thrown with the index and both fingerprints:

```typescript
import {
  JournalReplayDivergedError,
  JournalReplayThreadIdMismatchError,
} from '@tanstack/ai-sandbox'

export function report(error: unknown): string {
  // Check the subclass FIRST — it separates a config mistake from a real
  // determinism bug in one check.
  if (error instanceof JournalReplayThreadIdMismatchError) {
    return 'the attach route drove the run without the record threadId'
  }
  if (error instanceof JournalReplayDivergedError) {
    return `diverged at ${error.index}: stored ${error.stored}, replayed ${error.replayed}`
  }
  throw error
}
```

Read it plainly: **translation stopped being deterministic.** Realistic causes
are a `genId` that is not run-scoped, a translator that consults the clock, or a
journal that was rewritten (usually a reused `runId`). **Treat it as a bug to
fix, not a condition to recover from.** Do not catch it and continue: the log is
authoritative and already went to the client, so forwarding past a mismatch
delivers a stream whose prefix and suffix disagree about message identity. Log
the index and both fingerprints, let the run fail, and check `runId` uniqueness
first.

One tolerance exists: on adapters that splice host-tool-bridge events into
their output (`@tanstack/ai-claude-code`, `@tanstack/ai-codex`), the log holds
`CUSTOM` chunks fired by _live_ tool execution that a replay runs no tools to
reproduce. Alignment skips those as out-of-band, up to
`DEFAULT_MAX_OUT_OF_BAND_SKIP` (64) consecutive entries. The bound is what keeps
this a tolerance rather than a forward search for any fingerprint that happens
to match.
