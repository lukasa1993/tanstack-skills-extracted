# Build Cloudflare Artifact Store — 4. Serve the bytes back

[Guide and prerequisites](./tanstack-ai-persistence-build-cloudflare-artifact-store-60c47cfe.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## 4. Serve the bytes back

A GET route resolves an `artifactId` to its record and its stored bytes.
`retrieveArtifact` returns the `ArtifactRecord` (or `null` → 404);
`retrieveBlob` returns the `BlobObject` (metadata + a streamable `body`). Both
resolve the blob key from the record internally, so you never build the key
yourself.

Honour `Range` requests: `<video>` seeking is built on `206` / `Content-Range`,
and Safari refuses to play a source that ignores `Range` entirely. Images never
notice; a few-hundred-MB clip is unwatchable without it. Pass `range` to
`retrieveBlob` — the store slices in R2 — rather than reaching into the bucket
binding from the route, which would tie the route to R2 and bypass the store's
own key resolution.

```ts ignore
import {
  parseRangeHeader,
  retrieveArtifact,
  retrieveBlob,
} from '@tanstack/ai-persistence'
import { generationPersistence } from './lib/generation-persistence'

export async function GET(request: Request, env: Env) {
  const artifactId = new URL(request.url).searchParams.get('id') ?? ''
  const persistence = generationPersistence(env)

  // Authorize before serving — derive the owner from the session, never trust
  // a client-supplied id. (The record carries runId/threadId to check against.)
  const record = await retrieveArtifact(persistence, artifactId)
  if (!record) return new Response('Not found', { status: 404 })

  // `parseRangeHeader` resolves the header against the size on the record —
  // suffix ranges included — so an unsatisfiable range is a 416 here and the
  // store only ever sees a range it can serve.
  const range = parseRangeHeader(request.headers.get('range'), record.size)
  if (range === 'unsatisfiable') {
    return new Response('Range not satisfiable', {
      status: 416,
      headers: { 'content-range': `bytes */${record.size}` },
    })
  }

  // Pass the record, not the id: no second metadata lookup.
  const blob = await retrieveBlob(
    persistence,
    record,
    range ? { range } : undefined,
  )
  if (!blob?.body) return new Response('Not found', { status: 404 })

  // `accept-ranges` on every response, including the whole-file one: it is how
  // a player learns it may seek at all.
  const headers = {
    'content-type': record.mimeType,
    'accept-ranges': 'bytes',
  }
  if (!blob.range) {
    return new Response(blob.body, {
      headers: { ...headers, 'content-length': String(record.size) },
    })
  }
  const { offset, length } = blob.range
  return new Response(blob.body, {
    status: 206,
    headers: {
      ...headers,
      'content-length': String(length),
      'content-range': `bytes ${offset}-${offset + length - 1}/${record.size}`,
    },
  })
}
```

To hydrate a **server-driven generation client** (`persistence: true` + a stable
`threadId`) on mount, also expose `reconstructGeneration(persistence, request)`
on a GET that reads `?threadId=` / `?runId=` — see `ai-core/client-persistence`.
