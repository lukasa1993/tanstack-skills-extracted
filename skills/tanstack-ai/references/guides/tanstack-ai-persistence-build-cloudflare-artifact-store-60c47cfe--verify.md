# Build Cloudflare Artifact Store — Verify

[Guide and prerequisites](./tanstack-ai-persistence-build-cloudflare-artifact-store-60c47cfe.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

## Verify

The shared `runPersistenceConformance` testkit covers all seven stores, including
`generationRuns`, `artifacts`, and `blobs` — point it at your factory rather than
hand-writing these assertions:

```ts ignore
import { runPersistenceConformance } from '@tanstack/ai-persistence/testkit'
import { env } from 'cloudflare:test'
import { generationPersistence } from '../src/lib/generation-persistence'

// A generation-only Worker declares the chat state stores it does not provide.
runPersistenceConformance('app-r2', () => generationPersistence(env), {
  skip: ['messages', 'runs', 'interrupts', 'metadata'],
})
```

Run it against a Miniflare R2 + D1 binding with the migration applied, reset
between runs (see **ai-persistence/build-cloudflare-adapter** for the
`cloudflare:test` harness pattern). It exercises, among the rest:

- `put` then `get` round-trips bytes and metadata; `get`/`head` return `null` for
  a missing key; `delete` is a silent no-op on an absent key.
- `put` accepts a `ReadableStream` body with no declared length (a
  `TransformStream`-wrapped stream) and records the real drained size — the
  shape every URL-fetched artifact arrives in.
- `get` with a `range` returns just that slice, reports it as `range`, and
  still reports the whole object's `size` — what a `206` / `Content-Range`
  response is built from.
- `put` overwrites an existing key (and its `contentType`/`customMetadata`).
- `list` filters by `prefix` **literally and case-sensitively**, returns
  ascending keys, pages through the `cursor` when `truncated` without gaps or
  repeats, and returns an empty untruncated page for `limit: 0`.
- The `ArtifactStore`: `save` is insert-or-overwrite, `get` returns `null` when
  absent, `list(runId)` returns `[]` for an unknown run,
  `listForThread(threadId)` returns the complete ordered history, and `delete` /
  `deleteForRun` remove exactly the expected rows.
- The `GenerationRunStore`: `createOrResume` idempotency, no-op `update` on an
  unknown id, and `findLatestForThread` returning the most recently started
  linked run (terminal ones included).

An end-to-end check is the strongest signal: run `generateImage` through
`withGenerationPersistence(generationPersistence(env), { threadId })`, then confirm the blob
exists at `artifacts/<runId>/<artifactId>` and `retrieveBlob` streams it back.
