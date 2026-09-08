# Build Cloudflare Artifact Store — 3. Compose and wire

[Guide and prerequisites](./tanstack-ai-persistence-build-cloudflare-artifact-store-60c47cfe.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

## 3. Compose and wire

Bindings are per-request on Workers, so export a **factory**. Combine the byte
stores with a generation-run store (and, if this Worker also does chat, the chat stores).
Either build the whole `AIPersistence` with `defineAIPersistence`, or layer the
artifact stores onto an existing chat persistence with `composePersistence`:

```ts ignore
import {
  defineAIPersistence,
  composePersistence,
  withGenerationPersistence,
} from '@tanstack/ai-persistence'
import { r2BlobStore } from './r2-blob-store'
import { d1ArtifactStore } from './d1-artifact-store'
import { d1GenerationRunStore } from './d1-job-store' // your GenerationRunStore

/** Call inside a request handler — bindings are not available at module scope. */
export function generationPersistence(env: Env) {
  return defineAIPersistence({
    stores: {
      generationRuns: d1GenerationRunStore(env.DB),
      artifacts: d1ArtifactStore(env.DB),
      blobs: r2BlobStore(env.ARTIFACTS_BUCKET),
    },
  })
}

// …or add bytes to a persistence that already has chat + generation runs:
// composePersistence(chatAndJobsPersistence(env), {
//   overrides: {
//     artifacts: d1ArtifactStore(env.DB),
//     blobs: r2BlobStore(env.ARTIFACTS_BUCKET),
//   },
// })
```

`withGenerationPersistence` throws if exactly one of `artifacts` / `blobs` is
present — provide both or neither. Wire it as generation middleware:

```ts ignore
import { generateImage, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiImage } from '@tanstack/ai-openai'
import { withGenerationPersistence } from '@tanstack/ai-persistence'
import { generationPersistence } from './lib/generation-persistence'

export default {
  async fetch(request: Request, env: Env) {
    const { prompt, threadId } = await request.json()
    const stream = generateImage({
      adapter: openaiImage('gpt-image-1'),
      prompt,
      threadId, // the slot recorded on the job + artifacts
      stream: true,
      middleware: [
        // Nothing is buffered: the artifact streams from the provider CDN
        // into R2. Add `maxArtifactBytes: false` if you want no ceiling at
        // all on what an origin can stream into your bucket (the default is
        // 1 GiB); it is not needed for the streaming itself.
        withGenerationPersistence(generationPersistence(env), { threadId }),
      ],
    })
    return toServerSentEventsResponse(stream)
  },
}
```
