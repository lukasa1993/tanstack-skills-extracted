# Build Cloudflare Artifact Store — The two contracts

[Guide and prerequisites](./tanstack-ai-persistence-build-cloudflare-artifact-store-60c47cfe.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## The two contracts

Both come from `@tanstack/ai-persistence`. `defineBlobStore` / `defineArtifactStore`
type an object literal inline (autocomplete + contract checking, no separate
annotation).

```ts
import type {
  ArtifactRecord,
  BlobBody,
  BlobGetOptions,
  BlobListOptions,
  BlobListPage,
  BlobObject,
  BlobPutOptions,
  BlobRecord,
} from '@tanstack/ai-persistence'

// BlobStore — the byte layer. R2 backs it.
interface BlobStore {
  put: (
    key: string,
    body: BlobBody,
    options?: BlobPutOptions,
  ) => Promise<BlobRecord>
  // metadata + byte accessors; `options.range` reads one slice (for `206`s)
  get: (key: string, options?: BlobGetOptions) => Promise<BlobObject | null>
  head: (key: string) => Promise<BlobRecord | null> // metadata only
  delete: (key: string) => Promise<void> // no-op if absent
  list: (options?: BlobListOptions) => Promise<BlobListPage>
}

// ArtifactStore — the metadata layer. D1 backs it.
interface ArtifactStore {
  save: (record: ArtifactRecord) => Promise<void> // insert or overwrite
  get: (artifactId: string) => Promise<ArtifactRecord | null>
  list: (runId: string) => Promise<Array<ArtifactRecord>> // [] when none
  listForThread: (threadId: string) => Promise<Array<ArtifactRecord>>
  delete: (artifactId: string) => Promise<void>
  deleteForRun: (runId: string) => Promise<void>
}
```

`list` and `listForThread` return records ordered by `createdAt`, then by the
ordinal bytewise order of `artifactId`. Compare UTF-8 bytes from left to right.
Do not use locale collation.

`BlobBody` is `ReadableStream<Uint8Array> | ArrayBuffer | ArrayBufferView |
string | Blob`. The non-stream shapes flow straight into `R2Bucket.put`
unchanged — but a `ReadableStream` body does **not**, in the general case:
workerd's `put` requires a stream with a known length (a `Response` body or the
readable half of a `FixedLengthStream`), and the artifact middleware hands you a
`TransformStream`-wrapped body whenever it had to cap a fetched body as it
drains. Passing that stream to `bucket.put` throws `TypeError: Provided readable
stream must have a known length`.

**When does that actually happen?** The wrapper only exists to enforce
`maxArtifactBytes` during the drain, so the middleware applies it only when
nothing else bounds the transfer:

| Provider response                       | Body handed to `put`              | R2 path             |
| --------------------------------------- | --------------------------------- | ------------------- |
| `content-length`, no `content-encoding` | untouched, declared length intact | `bucket.put` direct |
| chunked (no declared length)            | wrapped, length-less              | multipart           |
| `content-encoding: gzip`                | wrapped, length-less              | multipart           |

A provider CDN normally sends `content-length`, so the first row is the common
case and `bucket.put(key, body)` just works. The recipe below is what makes the
other two rows work: it re-declares the length from
`BlobPutOptions.expectedLength` when the middleware could vouch for one, and
otherwise streams through a multipart upload (one 8 MiB part at a time — flat
memory at any artifact size). Write it once and every response shape is
covered.

`withGenerationPersistence(persistence, { maxArtifactBytes: false })` drops the
ceiling and the wrapper altogether, so even a chunked reply arrives untouched.
It buys nothing extra for R2 (a chunked body has no length to preserve), so
choose it on its own merits: no _application_ limit on what an origin can
stream into your bucket. R2's own limits still apply — 5 GiB per single-shot
put, and 10,000 multipart parts (~80 GiB at the 8 MiB part size below). Keep
the cap when `allowInputUrl` lets callers name the URL.

`BlobPutOptions` is
`{ contentType?, customMetadata?, expectedLength? }`; `BlobGetOptions` is
`{ range?: { offset: number, length?: number } }` and maps onto R2's own
`range`; `BlobListOptions` is `{ prefix?, cursor?, limit? }`; `BlobListPage` is
`{ objects: BlobRecord[], cursor?, truncated? }`.
