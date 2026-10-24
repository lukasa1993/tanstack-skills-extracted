# Ai Persistence — Persistence is a contract, not a database

[Guide and prerequisites](./tanstack-ai-persistence-2fec28cd.md) · Published skill · `@tanstack/ai-persistence@1.0.0`.

## Persistence is a contract, not a database

`@tanstack/ai-persistence` ships the **store interfaces**, the middleware that
drives them, an in-memory reference backend, and a conformance testkit. It does
**not** ship a backend for your database, and you do not need one: implement the
stores against whatever you already run — Postgres, SQLite, D1, Mongo — and hand
the result to `withPersistence`. The core never inspects your tables.

| Ships in the package                                                        | What it is                                                  |
| --------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `MessageStore` / `RunStore` / `InterruptStore` / `MetadataStore`            | The four **chat** state contracts                           |
| `GenerationRunStore` / `ArtifactStore` / `BlobStore`                        | The **generation** contracts (job lifecycle + bytes)        |
| `withPersistence` / `withGenerationPersistence`                             | Chat + generation middleware                                |
| `memoryPersistence()`                                                       | In-process reference backend, all seven stores (dev, tests) |
| `reconstructChat` / `reconstructGeneration`                                 | Server hydrate route helpers (chat / generation)            |
| `retrieveArtifact` / `retrieveBlob`                                         | Serve persisted generation-media bytes back                 |
| `LockStore` / `withLocks` / `InMemoryLockStore` (from `@tanstack/ai/locks`) | Coordination, **not** this package — see ai-core/locks      |
| `@tanstack/ai-persistence/testkit`                                          | `runPersistenceConformance` gate (chat state stores)        |

**Chat vs generation stores.** Chat persistence keys on `threadId` and uses
`messages` + optional `runs` / `interrupts` / `metadata`. Generation persistence
keys on its own `runId` and uses `generationRuns` (required by `withGenerationPersistence`) plus an
optional `artifacts` + `blobs` **pair** — provide both or neither — to store the
generated media bytes at blob key `artifacts/<runId>/<artifactId>`. A generation
run's identity is its own `runId`, but `threadId` is **required** on the record:
it is the stable slot successive runs fill, and `findLatestForThread` — the only
query that hydrates a run — keys on it. To
build the R2/D1-backed byte stores for a Worker, see
**ai-persistence/build-cloudflare-artifact-store**.

**Where bytes land.** Default blob key is `artifacts/<runId>/<artifactId>`. Pass
`storageKey` to `withGenerationPersistence` for your own folder structure — it
receives `{ artifactId, runId, threadId, role, activity, path, mimeType, name }`
and returns the key. Server-side only (a browser-supplied key is path traversal +
cross-tenant writes). The resolved key is recorded on `ArtifactRecord.blobKey`
because it is no longer derivable; read `record.blobKey`, never recompute it.
`blobKey` is required. 0.x records without it are not supported:
`retrieveBlob` throws for them. Backfill `blob_key` before upgrading. A non-unique key
overwrites, so include `artifactId` unless that is intended.

**Byte storage stores generated output, not prompt URLs.** Provider result URLs
expire, so they are downloaded and kept. Prompt media sent as base64
(`source: { type: 'data' }`) is stored too. Prompt media sent as a **URL** is
NOT fetched — that URL is caller-supplied, so downloading it server-side is an
SSRF vector, and the bytes are redundant. Apps that genuinely need a durable
copy opt in with `allowInputUrl`, a predicate so the check can't be skipped:
`allowInputUrl: ({ url }) => url.hostname.endsWith('.cdn.example.com')`. Never
suggest `() => true`. All artifact fetches are http/https-only, timed out
(`artifactFetchTimeoutMs`) and size-capped (`maxArtifactBytes`); input fetches
also block loopback/private/link-local hosts and refuse redirects. `artifactFetch`
injects the `fetch`, for routing through an egress-restricted proxy.

Two related route-level rules: a `GET` that serves artifact bytes by id MUST
authorize the caller against `ArtifactRecord.threadId` before serving (404, not
403, so valid ids aren't confirmed), and `reconstructGeneration` MUST be given
`authorize` on any multi-user route. Both take ids straight from the caller.

Portable sandbox snapshots use the same `messages`, `artifacts`, and `blobs`
stores. Their artifact reader checks the checkpoint thread, but it does not
authenticate a caller. Authorize the thread before any route reads a snapshot
artifact. The snapshot checkpoint store also needs atomic append and fork
operations. A SQLite adapter must write a checkpoint, its head, and blob
reference counts in one transaction.
