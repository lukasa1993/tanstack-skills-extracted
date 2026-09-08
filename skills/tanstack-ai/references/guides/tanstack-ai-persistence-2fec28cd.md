# Ai Persistence

<a id="source-tanstack-ai-persistence"></a>

Published skill · `@tanstack/ai-persistence@0.5.6`.

[Topic index](../persistence-coordination.md) · [Source provenance](../SOURCES.md)

# TanStack AI Persistence

> Builds on the `ai-core` skill in `@tanstack/ai`, and usually
> `ai-core/chat-experience`.

TanStack AI splits **delivery durability** from **state persistence**. They
share no code and solve different problems.

| Layer                   | Answers                             | Package / API                                                                                |
| ----------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------- |
| **Delivery durability** | Reconnect to a stream still running | `memoryStream` / `@tanstack/ai-durable-stream` on the response; see resumable streams docs   |
| **State persistence**   | What is the conversation, later?    | Client `persistence` on `useChat` + server `withPersistence` from `@tanstack/ai-persistence` |

A replayable stream is **not** a saved conversation. A saved conversation is
**not** a live stream. Production apps often use both.

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
| `retrieveArtifact` / `retrieveBlob` / `resolveArtifactBlobKey`              | Serve persisted generation-media bytes back                 |
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
because it is no longer derivable; read through `resolveArtifactBlobKey(record)`,
never by recomputing. Records predating `blobKey` fall back to the default
convention — which is why that convention can never be changed retroactively. A
non-unique key overwrites, so include `artifactId` unless that is intended.

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

## Sub-skills

| Need to...                                      | Read                                                  |
| ----------------------------------------------- | ----------------------------------------------------- |
| Wire server-side chat history, runs, interrupts | ./tanstack-ai-persistence-server-3b558cfc.md#source-tanstack-ai-persistence-server                        |
| Survive reloads in the browser                  | ./tanstack-ai-core-client-persistence-9ee3012c.md#source-tanstack-ai-core-client-persistence in `@tanstack/ai` |
| Implement the store interfaces for your DB      | ./tanstack-ai-persistence-stores-e6061122.md#source-tanstack-ai-persistence-stores                        |
| Multi-instance locks (separate from state)      | ./tanstack-ai-core-locks-b6cb9694.md#source-tanstack-ai-core-locks in `@tanstack/ai`              |

Adding persistence to an app? Pick the recipe that matches what it already
runs — each one writes a single `chat-persistence.ts` against the app's
existing database client and schema:

| The app runs...                                      | Read                                                    |
| ---------------------------------------------------- | ------------------------------------------------------- |
| Drizzle ORM (SQLite / Postgres / MySQL)              | ./tanstack-ai-persistence-build-drizzle-adapter-5655a048.md#source-tanstack-ai-persistence-build-drizzle-adapter           |
| Prisma                                               | ./tanstack-ai-persistence-build-prisma-adapter-2687241c.md#source-tanstack-ai-persistence-build-prisma-adapter            |
| Cloudflare Workers + D1 (± Durable Object locks)     | ./tanstack-ai-persistence-build-cloudflare-adapter-64163c5a.md#source-tanstack-ai-persistence-build-cloudflare-adapter        |
| Cloudflare Workers + R2/D1 for generated media bytes | ./tanstack-ai-persistence-build-cloudflare-artifact-store-60c47cfe.md#source-tanstack-ai-persistence-build-cloudflare-artifact-store |
| Anything else — raw `pg`, Kysely, SQLite, Mongo      | ./tanstack-ai-persistence-build-custom-adapter-61b5cbc7.md#source-tanstack-ai-persistence-build-custom-adapter            |

## State persistence has two halves

| Half       | Stores                                          | Survives                         | Typical use                              |
| ---------- | ----------------------------------------------- | -------------------------------- | ---------------------------------------- |
| **Client** | transcript ± resume pointer in browser storage  | reload / tab close (per browser) | SPA restore, offline-first               |
| **Server** | messages, runs, interrupts, metadata in your DB | restart + multi-device           | authoritative history, durable approvals |

They are independent. Use either alone or both.

## Identity: `threadId` and `Scope`

Server stores key on **`threadId`** (same as `chat({ threadId })` /
`ChatMiddlewareContext.threadId` / `Scope.threadId` from `@tanstack/ai`).

- Store methods take bare `threadId` strings for adapter simplicity.
- Multi-user isolation is **your** job: derive `userId` / `tenantId` from
  session server-side; authorize before load/save / `reconstructChat`.
- Never treat a client-supplied thread id alone as ownership — ids are guessable.

## Authoritative-history contract

When both halves run, ownership per turn is decided by request `messages`:

| Client sends             | Meaning                           | On finish                           |
| ------------------------ | --------------------------------- | ----------------------------------- |
| **Non-empty** `messages` | Full transcript (source of truth) | Server **overwrites** stored thread |
| **Empty** `messages`     | Continue from server copy         | Server **loads** stored thread      |

Never post a delta as `messages` — that wipes history down to the delta.

**Client-authoritative:** always send full transcript; browser is truth, server mirrors.
**Server-authoritative:** send empty `messages` (or hydrate via server load); server is truth, multi-device works.

## Recommended production stack

1. **Client:** `persistence: true` — server-authoritative, no client cache.
2. **Server:** `withPersistence(backend)` — messages + runs + interrupts.
3. **Route:** delivery durability if mid-stream reconnect matters.
4. **Optional:** `withLocks(distributedLockStore)` from `@tanstack/ai/locks` when other middleware needs multi-instance coordination (not part of the state bag).

## Minimal end-to-end sketch

**Server**

```ts
import {
  chat,
  chatParamsFromRequest,
  toServerSentEventsResponse,
} from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { withPersistence } from '@tanstack/ai-persistence'
// Your adapter — see ai-persistence/stores.
import { persistence } from './persistence'

export async function POST(request: Request) {
  const params = await chatParamsFromRequest(request)
  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages: params.messages,
    threadId: params.threadId,
    runId: params.runId,
    ...(params.resume ? { resume: params.resume } : {}),
    middleware: [withPersistence(persistence)],
  })
  return toServerSentEventsResponse(stream)
}
```

**Client (server-authoritative)**

```tsx
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'

function Chat({ threadId }: { threadId: string }) {
  const { messages, sendMessage } = useChat({
    threadId,
    connection: fetchServerSentEvents('/api/chat'),
    persistence: true,
  })
  // ...
}
```

With `persistence: true`, the client caches nothing and hydrates the transcript
from the server on mount (thread id is the key). Pair with a server load path
such as `reconstructChat` for the GET.

## Critical rules

1. **Not Vercel AI SDK.** Persistence is `@tanstack/ai-persistence` + middleware, not Vercel `useChat` storage hacks.
2. **`saveThread` is full overwrite**, never append.
3. **`createOrResume` is insert-if-absent** for the same `runId`.
4. **Interrupt `create` is insert-if-absent** — never clobber resolved → pending.
5. **Locks ≠ state.** Import `withLocks` from `@tanstack/ai/locks`. Sandbox resume is a sandbox-package concern — not a `stores` key. `stores` accepts only `messages`, `runs`, `interrupts`, `metadata`.
6. **You own the schema.** No package invents migrations for you.
7. **Run the conformance testkit** against any adapter you write.
8. **Authorize thread access** at the route boundary.

## Cross-references

- **ai-core/chat-experience** (`@tanstack/ai`) — `useChat`, SSE, client `persistence` option overview
- **ai-core/middleware** (`@tanstack/ai`) — middleware hooks; `withPersistence` is a ChatMiddleware
- **Resumable streams docs** — delivery durability only
