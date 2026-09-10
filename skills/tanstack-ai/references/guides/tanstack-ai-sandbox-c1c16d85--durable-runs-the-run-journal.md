# Ai Sandbox — Durable runs (the run journal)

[Guide and prerequisites](./tanstack-ai-sandbox-c1c16d85.md) · Published skill · `@tanstack/ai-sandbox@0.5.7`.

## Durable runs (the run journal)

A harness adapter's agent CLI (Claude Code, Codex, …) writes its NDJSON stdout
into a run journal instead of a pipe the host holds open: a shell redirect
appends every line to `/tmp/tanstack-runs/<runId>.ndjson` inside the sandbox
(stderr goes to a `<runId>.err` sidecar, never mixed in), so the host can
return without holding a live process handle, and a reader replays the same
file from byte 0 at any point, including after the original host has died.

```typescript
import { spawnNdjson } from '@tanstack/ai-sandbox'
import type { SandboxHandle } from '@tanstack/ai-sandbox'

export async function runAgent(handle: SandboxHandle, runId: string) {
  const agentCommand = 'claude -p --output-format stream-json'
  for await (const event of spawnNdjson(handle, agentCommand, {
    cwd: '/workspace',
    journal: { runId }, // durability is opt-in: pass `journal` to route through it
  })) {
    // parsed NDJSON objects, translated by the harness adapter as usual
    console.log(event)
  }
}
```

**A `runId` MUST be unique per run.** The journal is append-only by design (a
takeover needs the prefix a previous host already wrote to still be there), so
reusing a `runId` appends to the previous run's journal file. A reader stops at
the FIRST `{"__exit":N}` sentinel it encounters, which is the earlier run's, so
the new run appears to emit nothing, or to fail with the previous run's exit
code. Uniqueness is therefore the caller's job and is deliberately not
enforced — refusing to append would break the append-only property a takeover
depends on.

**Absence, unlike reuse, IS enforced.** Every harness adapter routes through
`resolveDurableRunId(options.runId, { durable, adapter, fallback })`, which
throws `DurableRunIdRequiredError` when sandbox durability is wired and no
`runId` was passed — a generated id is never minted for a durable run, not even
one that is discarded, because no successor host could recompute its journal
path. The `fallback()` to a generated id survives only for non-durable runs,
where several `chat()` paths legitimately pass `runId` as a conditional spread.
The journaling adapters are **Claude Code, Codex, and Grok Build**; ACP and
OpenCode do not journal and pass `durable: false`, so they keep the fallback
unconditionally today and inherit the enforcement automatically if either gains
journaling.

### Reading strategy

`readJournal` (and `spawnNdjson`'s journal path, via `readJournalNdjson`)
picks one of two strategies from the sandbox's advertised capabilities, never
from the provider's name:

- **follow** (`tail -f`, started with `handle.process.spawn`), when
  `capabilities.backgroundProcesses && capabilities.killableProcesses` are
  both true. It streams with no polling cost and is stopped by killing the
  `tail` when the consumer stops reading.
- **bounded poll** (repeated bounded `exec` reads, `DEFAULT_JOURNAL_POLL_MS`,
  250ms) otherwise. `killableProcesses` is `false` for a provider like
  Cloudflare, whose `kill()` is a documented no-op and whose Workers RPC
  cannot serialize an `AbortSignal` across the boundary, so a `tail -f`
  started there could never be stopped and the poll path is used instead.

The bounded read (`journalReadCommand`) base64-frames its output, because
`exec` closes the encoder's stdin, which flushes it, so the whole frame
arrives as one complete result. The follow path (`journalFollowCommand`) does
**not** base64-frame its output: `base64` fully buffers its stdout when that
stdout is not a tty, so `tail -f file | base64` would emit nothing until the
libc stdio buffer fills or `tail -f`'s stdin closes, and that stdin never
closes until the reader kills it, at which point the consumer has already
stopped waiting for bytes. Dropping the frame on the follow path is safe
because the journal is line-delimited JSON and every provider already decodes
stdout text on this path the same way it decodes an agent's own stdout.

### Alignment: replaying without duplicating

`alignToStoredLog` reads a run's already-stored event log with
`durability.snapshot()` (a bounded, point-in-time read; never `read()`, which
tails and never resolves against a log a dead producer never closed),
compares each replayed chunk against the stored one by `chunkFingerprint`, and
forwards only the remainder past what is already stored. Downstream, that
remainder is always passed to `append`, never `upsert`: the journal path only
ever appends, because deciding the append point is exactly what alignment
does. A replayed chunk that does not match the stored chunk at the same index
throws `JournalReplayDivergedError` rather than forwarding data that might be
corrupt.

Message ids on the journaled path come from `createRunScopedIdGen(runId)`,
a per-run counter (`<runId>-0`, `<runId>-1`, …) with no clock and no
randomness, wired as harness translators' `genId`, so re-translating the same
journal bytes twice reproduces the same ids. `chunkFingerprint` excludes only
the `timestamp` field (wall-clock, unreproducible) from the comparison;
everything else, including nested tool-call arguments, participates.

**Determinism is translator-level only.** On `ai-claude-code` and `ai-codex`,
`mergeChunkStreams(translated, channel.stream)` splices host-tool-bridge
events from a live tool execution into the middle of the stream; those events
do not occur again on replay. A run that used a bridged tool can still
diverge on replay for that reason: alignment guarantees reproducibility of
the translation step, not of everything that can happen during a run.

### Cleanup

Once a run reaches its `{"__exit":N}` sentinel, both journal files are
deleted. A run that terminates while **detached** (no host reading its
journal) has no reader to observe the sentinel, so nothing deletes its
journal on the run's own path. `pruneJournals` bounds that: it walks the
journal directory, asks the run store about each runId it decodes, deletes
only the journals whose runs are terminal, and keeps everything it cannot
prove dead (non-terminal, undecodable, or too young to be an orphan). It runs
from a cron the application schedules, not from a run, so an abandoned journal
survives until that sweep — this journal, reader, and alignment primitive do
not clean it up themselves.

The journal, the reader, and `alignToStoredLog` are the primitives a takeover is
built from. `sandboxRunDriver` is what drives one — see the next section.
