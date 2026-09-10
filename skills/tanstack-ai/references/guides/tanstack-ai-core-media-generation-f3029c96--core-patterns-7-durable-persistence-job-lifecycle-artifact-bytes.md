# Media Generation — Core Patterns: 7. Durable persistence (job lifecycle + artifact bytes)

[Guide and prerequisites](./tanstack-ai-core-media-generation-f3029c96.md) · Published skill · `@tanstack/ai@0.54.0`.

## Core Patterns: 7. Durable persistence (job lifecycle + artifact bytes)


To make generations survive a server restart and be re-served later, add
`withGenerationPersistence` from `@tanstack/ai-persistence` as generation
middleware. It requires `stores.generationRuns` (a `GenerationRunStore`, keyed on
the run's own `runId`, with a required `threadId` naming the stable slot the run
fills — that is what a client hydrates by) and, when you also pass an `stores.artifacts` +
`stores.blobs` **pair** (both or neither), it persists the generated media bytes
at blob key `artifacts/<runId>/<artifactId>` with an `ArtifactRecord` per file.
`memoryPersistence()` ships all three for dev/tests.

```typescript
import { generateImage, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiImage } from '@tanstack/ai-openai'
import {
  withGenerationPersistence,
  memoryPersistence,
  retrieveArtifact,
  retrieveBlob,
  reconstructGeneration,
} from '@tanstack/ai-persistence'

const persistence = memoryPersistence() // swap for your DB/object-store adapter

export async function POST(req: Request) {
  const { prompt, threadId } = await req.json()
  return toServerSentEventsResponse(
    generateImage({
      adapter: openaiImage('gpt-image-1'),
      prompt,
      threadId, // the slot recorded on the job + artifacts
      stream: true,
      middleware: [
        withGenerationPersistence(persistence, {
          // Stamp a durable app-origin serve URL (the GET route below) onto
          // each persisted artifact ref, and rewrite the live result's media to
          // it. Both live and restored results then render from your origin.
          artifactUrl: (ref) => `/api/artifacts?id=${ref.artifactId}`,
        }),
      ],
    }),
  )
}

// Serve the stored bytes back (GET /api/artifacts?id=…):
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id') ?? ''
  const record = await retrieveArtifact(persistence, id)
  if (!record) return new Response('Not found', { status: 404 })
  const blob = await retrieveBlob(persistence, record)
  if (!blob?.body) return new Response('Not found', { status: 404 })
  return new Response(blob.body, {
    headers: { 'content-type': record.mimeType },
  })
}
```

That route is enough for images. **Video needs `Range`**: seeking a `<video>`
is built on `206` / `Content-Range`, and Safari refuses to play a source that
ignores `Range` at all. Resolve the header against `record.size` (`416` when it
does not fit), pass `retrieveBlob(persistence, record, { range })`, and answer
`206` from the returned `blob.range` plus `accept-ranges: bytes`. The full
route is in the persistence docs under **Serve video: honour `Range`**.

On the client, `persistence` is **boolean only**: `persistence: true` hydrates
the last generation for the thread on mount, via the connection's
`hydrateGeneration` handler backed by a `reconstructGeneration` GET route. There
is no storage-adapter mode, so nothing about a generation is cached in the
browser.

**`persistence: true` requires a stable `threadId`**, and it is a type error to
set one without the other. That is the generation's scope, the slot successive
runs fill (e.g. `video-9-start-frame`), not a link to a chat. `id` is the
devtools label only and never a persistence key.

The hooks are transparent (like `useChat`): a reload repaints `status` /
`result` / `error`, not a separate `resumeSnapshot`. Because the `artifactUrl`
above stamps a durable URL onto each ref (carried on `result.artifacts`), the
restored `result` rebuilds its media from those refs and serves from your own
origin. Without byte storage, a reload restores `status` / `error` and `result`
stays `null`.

- Building the R2/D1-backed byte stores for a Cloudflare Worker:
  **ai-persistence/build-cloudflare-artifact-store**.
- Store contracts, `composePersistence`, and the wiring end-to-end:
  `docs/persistence/generation-persistence.md` and the
  `ai-core/client-persistence` sub-skill.

---
