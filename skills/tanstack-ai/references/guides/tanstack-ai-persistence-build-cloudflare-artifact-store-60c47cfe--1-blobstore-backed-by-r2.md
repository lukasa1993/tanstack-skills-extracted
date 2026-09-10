# Build Cloudflare Artifact Store — 1. BlobStore backed by R2

[Guide and prerequisites](./tanstack-ai-persistence-build-cloudflare-artifact-store-60c47cfe.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## 1. BlobStore backed by R2

`R2Object` carries `size`, `etag`, `httpMetadata.contentType`, `customMetadata`,
and `uploaded` (a `Date`). `BlobRecord` wants `createdAt` / `updatedAt` as epoch
ms — R2 tracks only the single `uploaded` instant, so map it to both. `get` /
`head` are the byte-body vs metadata-only split; `R2ObjectBody` already exposes
`body`, `arrayBuffer()`, and `text()`, so a `BlobObject` is essentially the R2
object plus the mapped metadata.

```ts ignore
import { defineBlobStore, resolveBlobRange } from '@tanstack/ai-persistence'
import type { BlobObject, BlobRecord } from '@tanstack/ai-persistence'

// R2 multipart parts must be ≥ 5 MiB and — except for the last — all exactly
// the SAME size, so a part reader has to cut on an exact boundary and carry the
// remainder. 8 MiB × the 10,000-part ceiling puts the multipart path's limit at
// ~80 GiB; raise this for larger objects, and check R2's current object-size
// limits before promising more.
const MULTIPART_PART_SIZE = 8 * 1024 * 1024

/**
 * Cut exactly `limit` bytes off the stream (fewer only at EOF), carrying any
 * overshoot into the next part.
 *
 * `carry` is the leftover from the previous call. Chunks are collected by
 * reference and copied once per part: growing a `Uint8Array` chunk-by-chunk
 * instead would re-copy the whole part on every read — quadratic work for a
 * part built from hundreds of small chunks.
 */
async function readPart(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  limit: number,
  carry: Uint8Array,
): Promise<{ bytes: Uint8Array; carry: Uint8Array; eof: boolean }> {
  const chunks: Array<Uint8Array> = carry.byteLength > 0 ? [carry] : []
  let total = carry.byteLength
  let eof = false
  while (total < limit) {
    const { value, done } = await reader.read()
    if (done) {
      eof = true
      break
    }
    chunks.push(value)
    total += value.byteLength
  }
  const joined = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    joined.set(chunk, offset)
    offset += chunk.byteLength
  }
  // Equal-sized parts: hand back exactly `limit` and keep the rest for next
  // time. At EOF the last part is whatever is left, which R2 allows.
  if (!eof && total > limit) {
    return {
      bytes: joined.subarray(0, limit),
      carry: joined.subarray(limit),
      eof,
    }
  }
  return { bytes: joined, carry: new Uint8Array(0), eof }
}

// R2 takes a single-shot put up to 5 GiB. Above that the upload has to be
// multipart even when the length is known.
const MAX_SINGLE_SHOT_BYTES = 5 * 1024 * 1024 * 1024

/**
 * `R2Bucket.put` requires a stream with a known length; a pass-through
 * TransformStream (what the middleware sends when it had to cap the body) has
 * none. Re-declare the length when `expectedLength` provides it — the
 * middleware only sets it when it is the exact decoded byte count — and
 * otherwise stream through a multipart upload, one buffered part at a time.
 */
async function putStream(
  bucket: R2Bucket,
  key: string,
  body: ReadableStream<Uint8Array>,
  options: R2PutOptions,
  expectedLength: number | undefined,
): Promise<R2Object | null> {
  if (expectedLength !== undefined && expectedLength <= MAX_SINGLE_SHOT_BYTES) {
    return bucket.put(
      key,
      body.pipeThrough(new FixedLengthStream(expectedLength)),
      options,
    )
  }
  // Unknown length, or too big for one shot: multipart, one part at a time.
  const reader = body.getReader()
  const first = await readPart(reader, MULTIPART_PART_SIZE, new Uint8Array(0))
  if (first.eof) {
    // The whole body fit in one part — a plain put is enough.
    return bucket.put(key, first.bytes, options)
  }
  const upload = await bucket.createMultipartUpload(key, options)
  try {
    const parts: Array<R2UploadedPart> = [
      await upload.uploadPart(1, first.bytes),
    ]
    let carry = first.carry
    let partNumber = 2
    for (;;) {
      const part = await readPart(reader, MULTIPART_PART_SIZE, carry)
      carry = part.carry
      if (part.bytes.byteLength > 0) {
        // 10,000 parts is R2's ceiling; failing here beats a confusing error
        // from `complete` after uploading gigabytes.
        if (partNumber > 10_000) {
          throw new Error(
            `Artifact at ${key} exceeds the multipart part limit — raise MULTIPART_PART_SIZE.`,
          )
        }
        parts.push(await upload.uploadPart(partNumber, part.bytes))
        partNumber += 1
      }
      if (part.eof) break
    }
    return await upload.complete(parts)
  } catch (error) {
    await upload.abort().catch(() => undefined)
    throw error
  }
}

function toRecord(obj: R2Object): BlobRecord {
  const uploaded = obj.uploaded.getTime()
  return {
    key: obj.key,
    size: obj.size,
    etag: obj.etag,
    ...(obj.httpMetadata?.contentType
      ? { contentType: obj.httpMetadata.contentType }
      : {}),
    ...(obj.customMetadata ? { customMetadata: obj.customMetadata } : {}),
    createdAt: uploaded,
    updatedAt: uploaded,
  }
}

export function r2BlobStore(bucket: R2Bucket) {
  return defineBlobStore({
    async put(key, body, options) {
      const r2Options = {
        ...(options?.contentType
          ? { httpMetadata: { contentType: options.contentType } }
          : {}),
        ...(options?.customMetadata
          ? { customMetadata: options.customMetadata }
          : {}),
      }
      const obj =
        body instanceof ReadableStream
          ? await putStream(
              bucket,
              key,
              body,
              r2Options,
              options?.expectedLength,
            )
          : await bucket.put(key, body, r2Options)
      // R2.put returns null only when an onlyIf precondition fails — not used here.
      if (!obj) throw new Error(`R2 put failed for ${key}`)
      return toRecord(obj)
    },

    async get(key, options): Promise<BlobObject | null> {
      if (!options?.range) {
        const whole = await bucket.get(key)
        if (!whole) return null
        return {
          ...toRecord(whole),
          body: whole.body,
          arrayBuffer: () => whole.arrayBuffer(),
          text: () => whole.text(),
        }
      }
      // A ranged read is what a serve route turns into `206` — R2 slices in
      // the bucket, so a seek never streams the whole object. `resolveBlobRange`
      // clamps a too-long length and throws on an offset past the end (the
      // route answers `416` from `record.size` before ever calling in). The
      // `head` buys that clamp deterministically — one class-B op against
      // bytes you did not need to send.
      //
      // Retry a bounded number of times: each attempt measures the object and
      // reads a slice of THAT version, and only an overwrite landing between
      // the two calls costs another lap.
      for (let attempt = 0; attempt < 3; attempt++) {
        const head = await bucket.head(key)
        // A ranged read of a key that is not there is a miss, not a
        // whole-object read: falling through to an un-ranged `get` would
        // answer a `206` carrying the entire file.
        if (!head) return null
        const served = resolveBlobRange(head.size, options.range)
        const obj = await bucket.get(key, {
          range: { offset: served.offset, length: served.length },
          // Tie the slice to the version `head` measured. Without this, a
          // `put` landing between the two calls yields a `Content-Range`
          // computed from one object and bytes from another.
          onlyIf: { etagMatches: head.etag },
        })
        // No body means the precondition failed — the object changed under us.
        if (!obj) return null
        if (!('body' in obj)) continue
        return {
          // `toRecord(obj)` reports the WHOLE object's size even on a ranged
          // read — R2's `R2Object.size` is the object, not the slice — which
          // is exactly the contract, and what `Content-Range`'s total needs.
          ...toRecord(obj),
          range: served,
          body: obj.body,
          arrayBuffer: () => obj.arrayBuffer(),
          text: () => obj.text(),
        }
      }
      throw new Error(`R2 object ${key} changed under every ranged read.`)
    },

    async head(key) {
      const obj = await bucket.head(key)
      return obj ? toRecord(obj) : null
    },

    async delete(key) {
      await bucket.delete(key)
    },

    async list(options) {
      // R2 reads `limit: 0` as "use the default", so short-circuit it.
      if (options?.limit === 0) {
        return { objects: [] }
      }
      const page = await bucket.list({
        ...(options?.prefix !== undefined ? { prefix: options.prefix } : {}),
        ...(options?.cursor !== undefined ? { cursor: options.cursor } : {}),
        ...(options?.limit !== undefined ? { limit: options.limit } : {}),
        // R2 omits httpMetadata/customMetadata from list rows unless asked.
        include: ['httpMetadata', 'customMetadata'],
      })
      return {
        objects: page.objects.map(toRecord),
        ...(page.truncated ? { cursor: page.cursor, truncated: true } : {}),
      }
    },
  })
}
```

Invariants that matter (asserted by the conformance testkit):

- `get` / `head` return `null` for a missing key; `delete` is a silent no-op.
- `put` **overwrites** an existing key.
- `put` accepts a `ReadableStream` body with **no declared length** — the
  middleware streams URL-fetched artifacts as exactly that. This is where the
  naive "pass the body straight to `bucket.put`" recipe fails at runtime
  (workerd requires a known length), which is what `putStream` above handles.
- `get` honours `options.range`: it returns **only** that slice, reports it as
  `range`, and keeps `size` on the whole object. That is the `206` a video
  player's seeking depends on, and R2 slices in the bucket so the bytes never
  cross the Worker.
- `list` filters by `prefix` literally (R2 prefix is a literal byte prefix — no
  glob), returns keys in ascending order, and pages via the opaque `cursor` when
  `truncated`. R2's own cursor is opaque and satisfies this directly. `limit: 0`
  must yield an empty, untruncated page — R2 treats `limit: 0` as "use the
  default", so special-case it: `if (options?.limit === 0) return { objects: [] }`.
