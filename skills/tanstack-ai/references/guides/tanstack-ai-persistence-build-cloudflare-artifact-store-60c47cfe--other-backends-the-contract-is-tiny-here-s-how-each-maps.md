# Build Cloudflare Artifact Store — Other backends — the contract is tiny, here's how each maps

[Guide and prerequisites](./tanstack-ai-persistence-build-cloudflare-artifact-store-60c47cfe.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## Other backends — the contract is tiny, here's how each maps

`BlobStore` is five methods over an object store. Any of these backs it; swap the
factory, keep everything else. `put` maps to the SDK's upload, `get` to a
download that exposes `body`/`arrayBuffer`/`text`, `head` to a metadata fetch,
`delete` to a delete, `list` to a prefixed, cursor-paged list.

| Backend                   | npm                     | One-line sketch                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AWS S3**                | `@aws-sdk/client-s3`    | `put`→`PutObjectCommand`; `get`→`GetObjectCommand` (`Body` is a stream → `body`, `.transformToByteArray()`/`.transformToString()`); `head`→`HeadObjectCommand`; `delete`→`DeleteObjectCommand`; `list`→`ListObjectsV2Command` (`Prefix`, `ContinuationToken`↔`cursor`, `MaxKeys`↔`limit`, `IsTruncated`↔`truncated`).                                                     |
| **Google Cloud Storage**  | `@google-cloud/storage` | `bucket.file(key)`: `put`→`.save(body, { contentType, metadata })`; `get`→`.createReadStream()` for `body` + `.download()` for bytes; `head`→`.getMetadata()`; `delete`→`.delete({ ignoreNotFound: true })`; `list`→`bucket.getFiles({ prefix, maxResults, pageToken })`.                                                                                                 |
| **Vercel Blob**           | `@vercel/blob`          | `put`→`put(key, body, { access: 'public', contentType })`; `get`→`fetch(head(key).url)` (stream `res.body`); `head`→`head(key)` (returns `null`→catch as absent); `delete`→`del(key)`; `list`→`list({ prefix, cursor, limit })` (`hasMore`↔`truncated`).                                                                                                                  |
| **Supabase Storage**      | `@supabase/supabase-js` | `storage.from(bucket)`: `put`→`.upload(key, body, { contentType, upsert: true })`; `get`→`.download(key)` (returns a `Blob` → `body`/`arrayBuffer`/`text`); `head`→`.info(key)` or list-one; `delete`→`.remove([key])`; `list`→`.list(prefix, { limit })` (offset/limit paging → synthesize a `cursor`).                                                                  |
| **Filesystem (dev only)** | `node:fs/promises`      | Root each key under a dir: `put`→`mkdir(dirname, { recursive: true })` + `writeFile`; `get`→`createReadStream` for `body` + `readFile`; `head`→`stat` (`size`, `mtimeMs`→`updatedAt`); `delete`→`rm(path, { force: true })`; `list`→recursive `readdir` filtered by prefix, sorted, sliced by `limit`, cursor = last key. Not for production — no concurrency guarantees. |

For each: `contentType` and `customMetadata` ride the SDK's own metadata fields;
`BlobRecord.createdAt`/`updatedAt` come from the object's stored timestamps
(epoch ms); return `null` from `get`/`head` on a not-found rather than throwing.
