# Persistence and coordination

Client/server persistence, stores, and locks.

<a id="source-tanstack-ai-core-client-persistence"></a>

## Client Persistence

Source: `tanstack-ai-core-client-persistence`.

## Client Persistence

> Builds on ai-core, and on `ai-core/chat-experience` for `useChat` itself.
>
> **No extra package.** The adapters below ship in the **framework** packages
> (`@tanstack/ai-react` and friends, re-exported from `@tanstack/ai-client`),
> so browser persistence needs nothing installed beyond what a chat UI already
> has. The **server** half is a separate package — see
> `@tanstack/ai-persistence` and its `ai-persistence/server` skill.

A `ChatClient` / `useChat` keeps messages in memory. The `persistence` option
stores one record per `threadId` so a reload can repaint the transcript,
restore a pending interrupt, and rejoin an in-flight run.

Import adapters from the **framework package** (not `@tanstack/ai-client`
unless vanilla JS):

```tsx
import {
  useChat,
  fetchServerSentEvents,
  localStoragePersistence,
  sessionStoragePersistence,
  indexedDBPersistence,
} from '@tanstack/ai-react'
```

### Adapters

| Adapter                       | Survives                   | Notes                                                           |
| ----------------------------- | -------------------------- | --------------------------------------------------------------- |
| `localStoragePersistence()`   | Reloads + browser restarts | Sync hydrate; quota-bound; JSON codec default                   |
| `sessionStoragePersistence()` | Reloads in the same tab    | Cleared when tab/session ends                                   |
| `indexedDBPersistence()`      | Reloads + restarts         | Async open (first paint may be empty briefly); structured clone |

All default to the chat persisted-state shape — no type argument or codec
required for normal use.

### Mode A — cache everything (client-authoritative)

```tsx
function Chat() {
  const { messages, sendMessage } = useChat({
    threadId: 'support-chat', // stable — required
    connection: fetchServerSentEvents('/api/chat'),
    persistence: localStoragePersistence(),
  })
  // ...
}
```

Bare adapter ≡ full transcript + resume pointer. Browser owns history; server
(if any) mirrors when you post non-empty `messages`.

Best for: SPA, offline-first, single device, moderate conversation size.

### Mode B — server-authoritative (`persistence: true`)

```tsx
function Chat({ threadId }: { threadId: string }) {
  const { messages, sendMessage } = useChat({
    threadId,
    connection: fetchServerSentEvents('/api/chat'),
    persistence: true,
  })
  // ...
}
```

Nothing is cached client-side: no transcript, no resume pointer.

On mount, `useChat` hydrates the thread from the **server** by `threadId`
(paint + tail active run). Same path for another device. Pair with server
`withPersistence` + a hydrate route (`reconstructChat` or equivalent).

Best for: large transcripts, multi-device, compliance (no message bodies in
browser storage).

### What a reload restores

1. **Finished run** — transcript from the adapter (mode A) or server (mode B).
2. **Paused on interrupt** — approval UI restored (from the adapter in mode A,
   the server hydrate in mode B).
3. **Still streaming** — needs **delivery durability** on the route
   (`toServerSentEventsResponse(stream, { durability: … })`) so the client can
   `joinRun` and finish the reply. Persistence alone is not enough.

### Stable `threadId` is the identity

Persistence keys on `threadId`. The hooks have **no separate `id` option** — a
chat's identity _is_ its `threadId`. Without a stable one, each load is a new
chat. Generate it server-side or from a route param the user owns; do not
randomize per mount.

### Generation hooks: server-driven only

The generation hooks (`useGenerateImage`, `useGenerateVideo`, `useGeneration`,
`useSummarize`, `useTranscription`, …) take a `persistence` option too, but it is
**boolean only** — there is no storage-adapter mode, and the browser caches
nothing. **The hooks are transparent, mirroring `useChat`:** a reload repaints the
hook's
**normal** fields — `status` (`'idle'` / `'generating'` / `'success'` /
`'error'`), `error`, and `result` — as if the run had just finished. There is
**no** `resumeSnapshot`, `resumeState`, `pendingArtifacts`, or `resultArtifacts`
field. The one extra field is `runId`: the id of the generation job currently
running, or `null` when nothing is in flight. The persisted record holds run
identity, status, error, and result metadata (ids, model, a provider video job
id), **never the generated media bytes**.

The hook return is exactly `generate` / `result` / `isLoading` / `error` /
`status` / `stop` / `reset` / `runId`.

#### Turning it on (`persistence: true`)

```tsx
const image = useGenerateImage({
  threadId, // REQUIRED — the scope the last generation is hydrated under
  connection: fetchServerSentEvents('/api/generate/image'),
  persistence: true,
})
// After a reload: image.status / image.result / image.error are the last
// generation for `threadId`, fetched from the server — nothing was cached.
```

The server half — the same route handles the run and the hydration `GET`:

```ts
import {
  generateImage,
  generationParamsFromRequest,
  toServerSentEventsResponse,
} from '@tanstack/ai'
import { openaiImage } from '@tanstack/ai-openai'
import {
  memoryPersistence,
  reconstructGeneration,
  withGenerationPersistence,
} from '@tanstack/ai-persistence'

// Needs `stores.generationRuns`; `memoryPersistence()` ships one.
const persistence = memoryPersistence()

export async function POST(request: Request) {
  const { input, threadId } = await generationParamsFromRequest(
    'image',
    request,
  )
  if (typeof input.prompt !== 'string') {
    throw new Error('This endpoint accepts text image prompts only.')
  }
  if (threadId === undefined) {
    throw new Error('Generation persistence requires a `threadId`.')
  }

  return toServerSentEventsResponse(
    generateImage({
      adapter: openaiImage('gpt-image-2'),
      prompt: input.prompt,
      // The stable slot this run fills. Required by persistence: the run record
      // is filed under it, and the client hydrates by it on mount.
      threadId,
      stream: true,
      middleware: [withGenerationPersistence(persistence)],
    }),
  )
}

// Mount-time hydration: resolves `?runId=` (preferred) or the latest run linked
// to `?threadId=`, and returns `{ resumeSnapshot, activeRun }`.
export function GET(request: Request) {
  return reconstructGeneration(persistence, request, {
    // Multi-user routes MUST authorize: the ids come from the caller. Derive
    // identity from server-side session state, then check ownership.
    authorize: async (id, req) => {
      // const user = await auth(req)
      // return user != null && (await db.threadOwnedBy(user.id, id))
      void id
      void req
      return true
    },
  })
}
```

- Nothing is cached client-side. On mount the client hydrates the **last
  generation** for its `threadId` from the server via the connection's
  `hydrateGeneration` handler (the SSE/HTTP adapters issue a `GET` with
  `?threadId=` to the same endpoint URL) and repaints it into the normal fields.
- The server `GET` returns `reconstructGeneration(persistence, request)` from
  `@tanstack/ai-persistence` — it resolves the run by `?runId=` (preferred) or
  the latest run linked to `?threadId=`, and needs `stores.generationRuns`. Pair it with
  `withGenerationPersistence` on the generation route. See
  `ai-core/media-generation` and `ai-persistence`.
- Best for multi-device / compliance (no generation metadata in browser
  storage), exactly like chat's server-authoritative mode.

#### Restoring media: byte storage + `artifactUrl`

`result` comes back with its media only when the **server** persists the bytes
(`stores.artifacts` + `stores.blobs`) AND `withGenerationPersistence` is given an
`artifactUrl` mapper:

```ts
withGenerationPersistence(persistence, {
  artifactUrl: (ref) => `/api/generate/image/artifact?id=${ref.artifactId}`,
})
```

`artifactUrl` stamps a durable app-origin URL onto each persisted ref and
rewrites the live result's media to it, so live and restored results match. The
durable refs travel on `result.artifacts`; on restore the hook rebuilds `result`
from them, so `result.images[i].url` (or a video's `result.url`) serves from your
own origin. `result.artifacts` is the whole artifact surface on the hook.
Without byte storage, a reload restores `status` / `error` and `result` stays
`null`.

Also worth knowing:

- `stop()` marks the record no longer resumable; `reset()` clears the in-memory
  snapshot.
- Nothing auto-runs from a hydrated record — `generate(...)` is always explicit.
- Use `status` / `result` for a finished run; use `runId` to tell that a run was
  still generating when the page closed, and to name it to your own server (to
  cancel or poll the provider job — `stop()` only aborts the local stream).

### Common mistakes

#### HIGH: No `threadId`

Record cannot be found after reload.

#### HIGH: Passing `id` to `useChat`

Removed — `threadId` is the identity. (`ChatClient` still accepts `id` directly
as a lower-level escape hatch for keying storage separately from the wire
thread; the framework hooks do not.)

#### HIGH: `persistence: true` without server history

Empty chat after reload unless the server can reconstruct by `threadId`.

#### MEDIUM: Huge transcripts in `localStorage`

Quota and main-thread cost. Prefer `persistence: true` + server store, or
IndexedDB with care.

#### MEDIUM: Expecting multi-device sync from client storage alone

`localStorage` is per-browser. Use server persistence for multi-device.

### Cross-references

- **ai-persistence/server** (`@tanstack/ai-persistence`) — authoritative server half
- **ai-core/chat-experience** — `useChat`, resumable connections
- Resumable streams docs — mid-stream rejoin

<a id="source-tanstack-ai-core-locks"></a>

## Locks

Source: `tanstack-ai-core-locks`.

## Locks (coordination — not persistence)

> **Dependency note:** This skill builds on ai-core and ai-core/middleware.
> `withLocks` is a ChatMiddleware that provides a capability. Locks are **not**
> part of `AIPersistence.stores` and are **not** composed with
> `composePersistence` — they ship in `@tanstack/ai`, independent of
> `@tanstack/ai-persistence`.

### Why separate?

State stores answer "what is durable chat data?"
Locks answer "who may run this critical section right now?"

`withPersistence` does **not** automatically lock a whole turn. Take a
per-thread (or other) lock yourself when multi-writer races matter.

### Wire locks

```ts
import { withLocks, InMemoryLockStore } from '@tanstack/ai/locks'

middleware: [
  withLocks(new InMemoryLockStore()), // single process
]
```

Alongside persistence — optional, locks do not require it:

```ts
import { withLocks, InMemoryLockStore } from '@tanstack/ai/locks'
import { withPersistence } from '@tanstack/ai-persistence'

middleware: [withPersistence(persistence), withLocks(new InMemoryLockStore())]
```

`withLocks` provides `LocksCapability` for downstream middleware (e.g.
sandbox). Order: usually state first, locks alongside or after depending on
who consumes the capability.

### The contract

```ts
interface LockStore {
  withLock<T>(key: string, fn: (signal: AbortSignal) => Promise<T>): Promise<T>
}
```

`InMemoryLockStore` ships in **`@tanstack/ai/locks`**: a per-key promise chain,
correct **within a single process only**. Multi-instance deployments need a
distributed implementation — you write it. The Cloudflare Durable Object recipe
is in **ai-persistence/build-cloudflare-adapter** (`@tanstack/ai-persistence`).

Type your own store with `defineLock` (autocomplete, no `: LockStore`
annotation), then hand it to `withLocks`. Acquire the key, run `fn`, release when
`fn` settles:

```ts
import { defineLock, withLocks } from '@tanstack/ai/locks'
import { acquire } from './my-lock-backend'

const locks = defineLock({
  async withLock(key, fn) {
    const { release, signal } = await acquire(key)
    try {
      return await fn(signal)
    } finally {
      release()
    }
  },
})

middleware: [withLocks(locks)]
```

### Lease semantics

A good `LockStore`:

- Serializes owners per key,
- Uses **leases** (or equivalent) so a crashed owner cannot block forever,
- Passes an `AbortSignal` into the critical section via `withLock`; when the
  lease is lost, abort so work stops starting external mutations.

Callbacks must honor the signal and pass it to cancellable dependencies.
`InMemoryLockStore` never aborts its signal — within one process, ownership
cannot be lost.

### Capability identity

The `'locks'` capability token lives in `@tanstack/ai/locks`. Capability identity
is by **object reference**, so one shared token means a `withLocks` in the chain
reaches `withSandbox` automatically.

### Common mistakes

#### HIGH: Importing locks from `@tanstack/ai-persistence`

They are not exported there. Use `@tanstack/ai`.

#### HIGH: Putting `locks` on `AIPersistence.stores`

Not supported. `stores` accepts only `messages`, `runs`, `interrupts`,
`metadata` — never `locks`. Use `withLocks`.

#### HIGH: Passing `locks` to `composePersistence` overrides

Same rejection, at the override layer. Locks are not state.

#### HIGH: Passing `'locks'` to the conformance testkit's `skip`

`skip` accepts only chat state store keys. The suite does not cover locks
at all — test lease expiry and abort separately.

#### HIGH: `InMemoryLockStore` across multiple processes

No mutual exclusion between machines — use a distributed lock store.

#### MEDIUM: Ignoring lease abort

Continuing work after losing the lease races other owners.

### Cross-references

- See also: **./tools-outputs-middleware.md#source-tanstack-ai-core-middleware** -- the middleware chain and capability plumbing
- See also: **`@tanstack/ai-persistence` skills** (`./persistence-coordination.md#source-tanstack-ai-persistence` in that package) -- `ai-persistence/server` (state middleware) and `ai-persistence/build-cloudflare-adapter` (Durable Object lock recipe)

<a id="source-tanstack-ai-persistence"></a>

## Ai Persistence

Source: `tanstack-ai-persistence`.

## TanStack AI Persistence

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

### Persistence is a contract, not a database

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

### Sub-skills

| Need to...                                      | Read                                                  |
| ----------------------------------------------- | ----------------------------------------------------- |
| Wire server-side chat history, runs, interrupts | ./persistence-coordination.md#source-tanstack-ai-persistence-server                        |
| Survive reloads in the browser                  | ./persistence-coordination.md#source-tanstack-ai-core-client-persistence in `@tanstack/ai` |
| Implement the store interfaces for your DB      | ./persistence-coordination.md#source-tanstack-ai-persistence-stores                        |
| Multi-instance locks (separate from state)      | ./persistence-coordination.md#source-tanstack-ai-core-locks in `@tanstack/ai`              |

Adding persistence to an app? Pick the recipe that matches what it already
runs — each one writes a single `chat-persistence.ts` against the app's
existing database client and schema:

| The app runs...                                      | Read                                                    |
| ---------------------------------------------------- | ------------------------------------------------------- |
| Drizzle ORM (SQLite / Postgres / MySQL)              | ./persistence-adapters.md#source-tanstack-ai-persistence-build-drizzle-adapter           |
| Prisma                                               | ./persistence-adapters.md#source-tanstack-ai-persistence-build-prisma-adapter            |
| Cloudflare Workers + D1 (± Durable Object locks)     | ./persistence-cloudflare.md#source-tanstack-ai-persistence-build-cloudflare-adapter        |
| Cloudflare Workers + R2/D1 for generated media bytes | ./persistence-cloudflare.md#source-tanstack-ai-persistence-build-cloudflare-artifact-store |
| Anything else — raw `pg`, Kysely, SQLite, Mongo      | ./persistence-adapters.md#source-tanstack-ai-persistence-build-custom-adapter            |

### State persistence has two halves

| Half       | Stores                                          | Survives                         | Typical use                              |
| ---------- | ----------------------------------------------- | -------------------------------- | ---------------------------------------- |
| **Client** | transcript ± resume pointer in browser storage  | reload / tab close (per browser) | SPA restore, offline-first               |
| **Server** | messages, runs, interrupts, metadata in your DB | restart + multi-device           | authoritative history, durable approvals |

They are independent. Use either alone or both.

### Identity: `threadId` and `Scope`

Server stores key on **`threadId`** (same as `chat({ threadId })` /
`ChatMiddlewareContext.threadId` / `Scope.threadId` from `@tanstack/ai`).

- Store methods take bare `threadId` strings for adapter simplicity.
- Multi-user isolation is **your** job: derive `userId` / `tenantId` from
  session server-side; authorize before load/save / `reconstructChat`.
- Never treat a client-supplied thread id alone as ownership — ids are guessable.

### Authoritative-history contract

When both halves run, ownership per turn is decided by request `messages`:

| Client sends             | Meaning                           | On finish                           |
| ------------------------ | --------------------------------- | ----------------------------------- |
| **Non-empty** `messages` | Full transcript (source of truth) | Server **overwrites** stored thread |
| **Empty** `messages`     | Continue from server copy         | Server **loads** stored thread      |

Never post a delta as `messages` — that wipes history down to the delta.

**Client-authoritative:** always send full transcript; browser is truth, server mirrors.
**Server-authoritative:** send empty `messages` (or hydrate via server load); server is truth, multi-device works.

### Recommended production stack

1. **Client:** `persistence: true` — server-authoritative, no client cache.
2. **Server:** `withPersistence(backend)` — messages + runs + interrupts.
3. **Route:** delivery durability if mid-stream reconnect matters.
4. **Optional:** `withLocks(distributedLockStore)` from `@tanstack/ai/locks` when other middleware needs multi-instance coordination (not part of the state bag).

### Minimal end-to-end sketch

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

### Critical rules

1. **Not Vercel AI SDK.** Persistence is `@tanstack/ai-persistence` + middleware, not Vercel `useChat` storage hacks.
2. **`saveThread` is full overwrite**, never append.
3. **`createOrResume` is insert-if-absent** for the same `runId`.
4. **Interrupt `create` is insert-if-absent** — never clobber resolved → pending.
5. **Locks ≠ state.** Import `withLocks` from `@tanstack/ai/locks`. Sandbox resume is a sandbox-package concern — not a `stores` key. `stores` accepts only `messages`, `runs`, `interrupts`, `metadata`.
6. **You own the schema.** No package invents migrations for you.
7. **Run the conformance testkit** against any adapter you write.
8. **Authorize thread access** at the route boundary.

### Cross-references

- **ai-core/chat-experience** (`@tanstack/ai`) — `useChat`, SSE, client `persistence` option overview
- **ai-core/middleware** (`@tanstack/ai`) — middleware hooks; `withPersistence` is a ChatMiddleware
- **Resumable streams docs** — delivery durability only

<a id="source-tanstack-ai-persistence-server"></a>

## Server

Source: `tanstack-ai-persistence-server`.

## Server Chat Persistence

> Builds on **ai-persistence**. Package: `@tanstack/ai-persistence`.

`withPersistence(persistence)` is a `ChatMiddleware` that writes chat **state**
to a backend: messages, runs, interrupts (optional metadata). It does not
mutate the chunk stream and does not replace delivery durability.

### Setup

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

Always pass `threadId` and `runId` from the client (via
`chatParamsFromRequest` / body helpers). Forward `resume` when the client
resolves pending interrupts.

For dev and tests, `memoryPersistence()` from `@tanstack/ai-persistence` is a
drop-in backend that implements all four stores in process.

### What each store does

| Store        | Role                                    | Required?                                 |
| ------------ | --------------------------------------- | ----------------------------------------- |
| `messages`   | Full model-message transcript load/save | **Yes** for `withPersistence`             |
| `runs`       | Run status, timing, usage, errors       | Optional; needed for interrupt durability |
| `interrupts` | Pending/resolved tool approvals & waits | Optional; **requires** `runs`             |
| `metadata`   | App-owned namespaced key/value          | Optional                                  |

Named shapes: `ChatTranscriptPersistence` (floor), `ChatPersistence` (all four).
**Annotate your factory with one of these**, not with bare `AIPersistence` —
the unparameterized type is the all-optional bag, and `withPersistence` rejects
it because `stores.messages` is possibly `undefined`.

### Authoritative-history contract

- **Non-empty `messages`** → finish **overwrites** the stored thread with that
  array. Post the **complete** transcript, never a delta.
- **Empty `messages`** → middleware **loads** the stored thread and continues.

### When state is written

| Moment             | Writes                                                            | Best-effort?                     |
| ------------------ | ----------------------------------------------------------------- | -------------------------------- |
| `onStart`          | Pending turn snapshot (user + history)                            | Yes — failure does not abort     |
| Interrupt boundary | New interrupts, run → `interrupted`, message snapshot             | No                               |
| `onFinish`         | Full transcript **first**, then run → `completed`, commit resumes | No                               |
| Stream (optional)  | Throttled partial assistant text                                  | Yes if `snapshotStreaming: true` |
| `onError`          | Run → `failed`                                                    | Resumes stay pending             |
| `onAbort`          | Run → `aborted` — **but only sometimes** (see below)              | Resumes stay pending             |

```ts
withPersistence(persistence, {
  snapshotStreaming: true,
  snapshotIntervalMs: 1000, // default
})
```

#### `onAbort` writes conditionally, not always

A user pressing Stop and a user closing the tab produce the **identical**
connection close, so `onAbort` can never infer intent from the abort alone.
It writes:

- **`'aborted'`** (terminal, with `finishedAt`) when the abort is an explicit
  cancel — `info.cancelRequested === true`, or a durable cancel request found
  via `wasCancelRequested(runs, runId)` (both from `@tanstack/ai`; paired with
  `requestRunCancel`/`RUN_CANCEL_REASON`) — **or** when the run is not
  detachable at all (no sandbox/journal behind it, so there is nothing to
  reattach to).
- **Nothing** when it is a plain disconnect on a **detachable** run (some
  other middleware, e.g. `@tanstack/ai-sandbox`, has provided
  `DetachableRunCapability` from `@tanstack/ai`). The record deliberately
  stays `'running'` — the agent keeps running and a later attach can take it
  over. (The detaching middleware, not `withPersistence`, is what stamps
  `detachedSince`.)

Chat's `onAbort` and generation's `onAbort` (`withGenerationPersistence`) are
**asymmetric on purpose**: a generation job has no journal and no agent loop
to reattach to, so its `onAbort` always writes `'aborted'` unconditionally.
Do not "fix" that asymmetry by making generation conditional, or chat
unconditional — both are correct for what they wrap.

Never build a client, or a persistence backend, that assumes a disconnect
always finalizes the run — for a detachable run it usually does not, and
inventing a `finishedAt` for a still-`'running'` record breaks takeover.
Use `isTerminalRunStatus(status)` (from `@tanstack/ai-persistence`) to test
whether a status is finished, rather than re-listing
`'completed' | 'failed' | 'aborted'` by hand.

Streaming snapshots default **off** (finish is authoritative). Enable only when
partial-output durability is worth extra writes.

Resumes accepted in `onConfig` commit only at a success boundary (interrupt or
finish). A failed run leaves interrupts pending so the same resume batch can
retry.

### Interrupt / resume flow

1. Middleware records pending interrupts and **gates** new input: if pending
   exist, the request must include a matching `resume` batch or `onConfig`
   throws.
2. On valid resume, middleware builds `resumeToolState` and clears
   `config.resume` so the engine does not double-reconstruct from client
   history (server owns transcript).
3. On success boundary, interrupts are marked resolved/cancelled.

### Hydrate a thread for the client (`reconstructChat`)

Server-authoritative clients load history by `threadId` (often `GET`):

```ts
import { reconstructChat } from '@tanstack/ai-persistence'

export async function GET(request: Request) {
  return reconstructChat(persistence, request, {
    // Multi-user: required in production
    authorize: async (threadId, req) => {
      const userId = await sessionUserId(req)
      return userOwnsThread(userId, threadId)
    },
  })
}
```

Returns `{ messages, activeRun, interrupts }`:

- `messages` — UI messages for paint
- `activeRun` — `{ runId }` if a run is still generating (`runs.findActiveRun`)
- `interrupts` — pending human-in-the-loop state for re-prompt

**Without `authorize`, anyone who guesses `?threadId=` gets the transcript.**

### Generation activities

`withGenerationPersistence(persistence)` tracks run records for non-chat
activities (image, audio, TTS, video, transcription). Do not fake
`threadId = requestId` on chat run stores — use the generation helper.

### Common mistakes

#### CRITICAL: Posting a message delta as `messages`

Wipes the stored thread down to that delta. Always send full history or `[]`.

#### HIGH: Omitting `threadId` / `runId`

Persistence keys and resume need stable ids. Use `chatParamsFromRequest`.

#### HIGH: Interrupts without `runs`

`interrupts` requires `runs`; `withPersistence` throws otherwise.

#### HIGH: Typing a factory as bare `AIPersistence`

`AIPersistence` defaults to the sparse all-optional bag, so `withPersistence`
and `reconstructChat` reject the value. Return `ChatPersistence` (or
`ChatTranscriptPersistence`) instead.

#### MEDIUM: Expecting `withPersistence` to reconnect a dropped stream

That is delivery durability (resumable streams), not state persistence.

### Cross-references

- **ai-persistence** — layers and recommended stack
- **ai-persistence/stores** — implement the store interfaces
- **ai-core/client-persistence** (`@tanstack/ai`) — browser half
- **ai-core/locks** — multi-instance coordination

<a id="source-tanstack-ai-persistence-stores"></a>

## Stores

Source: `tanstack-ai-persistence-stores`.

## Persistence Stores

> Builds on **ai-persistence** and **ai-persistence/server**.

`@tanstack/ai-persistence` ships **contracts**, not a backend for your
database. An adapter is an object with a `stores` map; implement the stores you
need against whatever you already run and hand the result to
`withPersistence`. The core never inspects your tables, so the schema is yours.

Use `memoryPersistence()` for dev and tests. Everything durable is an adapter
you write. This skill is the contract reference; the per-stack recipes that
write a `chat-persistence.ts` into an app are
`ai-persistence/build-{drizzle,prisma,cloudflare,custom}-adapter`, and
a complete `node:sqlite` implementation lives in
`examples/ts-react-chat/src/lib/sqlite-persistence.ts`.

### Choose a shape

```ts
import { defineAIPersistence } from '@tanstack/ai-persistence'
import type { ChatWithInterruptsPersistence } from '@tanstack/ai-persistence'

// Sparse is fine — only implement what you need.
export const persistence: ChatWithInterruptsPersistence = defineAIPersistence({
  stores: {
    messages, // required for withPersistence / reconstructChat
    runs, // required if you have interrupts
    interrupts,
    // metadata optional
  },
})
```

| Shape                           | Contents                                         |
| ------------------------------- | ------------------------------------------------ |
| `ChatTranscriptPersistence`     | `messages` (+ optional runs/interrupts/metadata) |
| `ChatWithInterruptsPersistence` | `messages` + `runs` + `interrupts`               |
| `ChatPersistence`               | all four chat stores                             |

`defineAIPersistence` preserves exact keys and rejects unknown keys at runtime.

**Annotate your factory with a named shape.** Bare `AIPersistence` is the
all-optional sparse bag, so `withPersistence` and `reconstructChat` reject it
(`stores.messages` is possibly `undefined`). This is the single most common
mistake when writing an adapter.

**`stores` accepts exactly four keys** — `messages`, `runs`, `interrupts`,
`metadata`. Anything else (notably `locks` or sandbox instance maps) throws
`Unknown AIPersistence store key` at runtime and fails to type-check. Locks:
**ai-core/locks** / `@tanstack/ai/locks`. Sandbox instance resume:
`@tanstack/ai-sandbox`.

### Contracts and invariants

#### `MessageStore`

```ts
interface MessageStore {
  loadThread(threadId: string): Promise<Array<ModelMessage>>
  saveThread(threadId: string, messages: Array<ModelMessage>): Promise<void>
}
```

- `loadThread` → `[]` for unknown threads (never `null`).
- `saveThread` is a **full overwrite**, not append. A one-message payload wipes history.

#### `RunStore`

`RunStatus`, `TerminalRunStatus`, `RunRecord`, `RunStore`, `defineRunStore`, and
`isTerminalRunStatus` are defined in `@tanstack/ai` and re-exported from
`@tanstack/ai-persistence`. Import those from either; the recipes in this skill
import from `@tanstack/ai-persistence` so an adapter author needs only one
package name.

**`RunError` is the exception — it is NOT re-exported.** Import it from
`@tanstack/ai` directly (`import type { RunError } from '@tanstack/ai'`); the
`@tanstack/ai-persistence` barrel has no such export and the import fails to
resolve.

Four methods are required (`createOrResume` / `update` / `get` /
`findActiveRun`). Two are optional: implement only the ones your backend needs,
and leave the rest off the object entirely (not `undefined`, just absent). A
four-method `RunStore` is a fully valid backend.

`withPersistence` itself calls **none** of the three non-`createOrResume`/`update`
query methods, so leaving both optional ones off costs nothing in the middleware.
Their consumers are elsewhere, and each absence disables exactly one feature:

| method            | consumer                                                  | absent ⇒                                                                 |
| ----------------- | --------------------------------------------------------- | ------------------------------------------------------------------------ |
| `findActiveRun`   | `reconstruct.ts` (`stores.runs?.findActiveRun(threadId)`) | required — cannot be absent; stubbing it to `null` silently kills rejoin |
| `listReclaimable` | `reapDetachedRuns` in `@tanstack/ai-sandbox`              | the store cannot be reaped at all                                        |
| `listByThread`    | application code — nothing in the framework calls it      | nothing framework-side breaks                                            |

Consumers of the two OPTIONAL methods feature-detect with `store.method?.(...)`
and degrade rather than throwing. `findActiveRun` is required, so nothing
feature-detects it.

The conformance testkit does not feature-detect. An optional method that is
missing and not declared in `skipMethods` fails the suite, so an omission is
always a choice you made on purpose rather than a check that quietly did not
run. Declare yours and the suite reports them as skipped with a reason:

```ts
// The shipped sqlite example implements findActiveRun and listReclaimable and
// declares only the one it omits.
runPersistenceConformance('sqlite', () => persistence, {
  skipMethods: ['runs.listByThread'],
})
```

```ts
interface RunStore {
  // Required
  createOrResume(
    input: Pick<RunRecord, 'runId' | 'threadId' | 'startedAt'> & {
      status?: RunStatus
    },
  ): Promise<RunRecord>
  update(
    runId: string,
    patch: Partial<
      Pick<
        RunRecord,
        | 'status'
        | 'finishedAt'
        | 'error'
        | 'usage'
        | 'sandboxKey'
        | 'detachedSince'
        | 'cancelRequested'
        | 'driverEpoch'
      >
    >,
  ): Promise<void>
  get(runId: string): Promise<RunRecord | null>
  findActiveRun(threadId: string): Promise<RunRecord | null>

  // Optional
  listByThread?(threadId: string): Promise<Array<RunRecord>>
  listReclaimable?(opts: {
    now: number
    ttlMs: number
  }): Promise<Array<RunRecord>>
}
```

`RunStatus` is `'running' | 'interrupted' | 'completed' | 'failed' | 'aborted'`.
`'interrupted'` is a human-in-the-loop pause, not terminal: it is what
interrupt-resume continues from, and must never be conflated with `'aborted'`
(an explicit cancellation). `TerminalRunStatus` narrows to
`'completed' | 'failed' | 'aborted'`. `isTerminalRunStatus(status)` is a type
predicate: `(status: RunStatus) => status is TerminalRunStatus`, so calling it
inside a guard narrows `status` to `TerminalRunStatus` for the rest of that
branch, with no cast needed.

`RunRecord.usage` is optional. `withPersistence` sums reported numeric fields
across provider calls for that `runId`, while opaque `providerUsageDetails`
retains the latest reported bag. Known usage is persisted on interruption and
every terminal status.

`RunRecord.error` is a structured `RunError`, not a bare string:

```ts
interface RunError {
  message: string
  code?: string
}
```

`message` is the provider's prose (it changes between model versions and
cannot be branched on); `code` is the stable, machine-branchable
classification a consumer switches over to retry, escalate, or show specific
UI. Store both, and omit `code` from a mapped record when its column is
`null` rather than writing `code: undefined` (`...(row.errorCode != null ? { code: row.errorCode } : {})`).

`defineRunStore<const T extends RunStore>(store: T): T` returns the passed
object's own type, so an optional method your store implements (say,
`listByThread`) stays known-present on the returned value instead of widening
back to `RunStore`'s `| undefined`. You get autocomplete and contract checking
without a separate `: RunStore` annotation, and without a feature-detection
guard on your own return value.

##### The durable-agent-runs fields: `sandboxKey`, `detachedSince`, `cancelRequested`, `driverEpoch`

These four `RunRecord` fields exist for the sandbox/durable-run layer to
reattach a run a client disconnected from, and for out-of-band cancellation.
A `RunStore` you write must round-trip all four through `update` → `get`, even
if your app does not use sandboxes yet — the conformance testkit checks this
unconditionally (it is not behind `skipMethods`, because `update`/`get` are
REQUIRED methods).

- **`sandboxKey`** — compound key identifying the sandbox this run is bound
  to, so a reclaimer can find it to tear down.
- **`detachedSince`** — epoch ms when the last viewer detached; absent while
  someone is attached. Read by `listReclaimable`.
- **`cancelRequested`** — set by an explicit out-of-band cancel (see below),
  distinct from a mere disconnect.
- **`driverEpoch`** — monotonic fencing token, bumped by each host that
  claims the run, so a superseded host can discover it lost by comparing the
  stored value against the one it holds.

**Fresh-run reads must be `undefined`, not a coerced falsy default.** A
backend that reads a `NULL`/absent column back as `cancelRequested: false` or
`driverEpoch: 0` is claiming knowledge it does not have ("explicitly not
cancelled") — that is a different fact from "never set". Omit the field from
the mapped record instead
(`...(row.cancel_requested != null ? { cancelRequested: row.cancel_requested !== 0 } : {})`).

**`update` must use `'field' in patch`, not `patch.field !== undefined`, for
these four.** A caller clears `detachedSince` on reattach by passing it
explicitly as `undefined` — `store.update(runId, { detachedSince: undefined })`
— and that must write `NULL`, not be filtered out of the write. Checking
`!== undefined` cannot tell "clear this field" apart from "I didn't mention
this field", so it silently drops the clear and the run looks permanently
detached to the reaper forever after. `'detachedSince' in patch` is `true` for
an explicit `undefined` and `false` when the caller omitted the key entirely —
that is the distinction you need. The same applies to `cancelRequested`
(`false` is a real, meaningful value, not "unset") and to `sandboxKey` /
`driverEpoch`. See `examples/ts-react-chat/src/lib/sqlite-persistence.ts` for
a worked implementation of exactly this pattern.

##### Out-of-band cancellation

Cancel intent is **never inferred from a disconnect** — a user pressing Stop
and a user closing the tab produce an identical connection close, so the two
are indistinguishable from the abort alone. `@tanstack/ai` exports the actual
primitives:

- **`requestRunCancel`** — records durable cancel intent (writes
  `cancelRequested: true` through a `RunStore`), for a run being driven on a
  host other than the one handling the cancel request.
- **`wasCancelRequested`** — reads that intent back.
- **`RUN_CANCEL_REASON`** — the well-known abort reason string used for the
  in-process case (the same host aborting its own signal), paired with
  `isCancelRequestedReason` to check for it.

A `RunStore` you write does not call these directly — they operate on your
store through `update`/`get` — but `cancelRequested` must round-trip
faithfully (previous section) for the durable path to work at all.

- **`createOrResume`** (required): if `runId` exists, return it **unchanged**,
  including its stored `usage`, and ignore the passed `threadId` / `startedAt` /
  `status`. Resuming a run does not reset `startedAt` or overwrite its current
  status. Idempotent retries and double-submit depend on this. `status` defaults
  to `'running'` on first creation.
- **`update`** (required): missing `runId` is a **no-op** (do not throw, do not
  insert).
- **`get`** (required): current record, or `null` when unknown.
- **`listByThread`** (optional): every run for `threadId`, ascending by
  `startedAt`. Only needed to render a thread's past agent activity.
- **`listReclaimable`** (optional): runs where `status === 'running'` AND
  `detachedSince` is set AND `detachedSince <= now - ttlMs`. The cutoff is
  inclusive: a run detached exactly at the cutoff qualifies. This is a query, not
  automatic behavior — the consumer is `reapDetachedRuns` from
  `@tanstack/ai-sandbox`, which the application schedules itself (cron, queue,
  `alarm()`, `waitUntil`), so returning this list has no side effect until that
  sweep runs. `detachedSince` is written for you by `withSandbox`'s detach path
  (alongside `sandboxKey`) and cleared by the takeover path; drop either field and
  nothing can reclaim the sandbox. `cancelRequested` is written by
  `requestRunCancel` and read by `wasCancelRequested`, and the reaper's expiry
  path goes through `requestRunCancel` to stop a run past its TTL.
- **`findActiveRun`** (**required**): the most recent `'running'` run for
  `threadId` (max `startedAt`), or `null` if none is active. Enables reconnect
  from a stable thread id without a client-held run id. Stub it out and
  reconnect silently stops working — `null` is also the correct answer for an
  idle thread, so nothing can detect the difference. It was optional for exactly
  one release cycle and cost precisely that, which is why it is required now.

Capability tiers belong at the STORE level (omit `runs` entirely and declare
`ChatTranscriptStores`), not the method level — never ship a `RunStore` with a
stubbed method. The two list queries above are the only method-level options,
and each must be declared via `skipMethods` when absent.

#### `InterruptStore`

```ts
interface InterruptStore {
  create(record: Omit<InterruptRecord, 'status' | 'resolvedAt'>): Promise<void>
  resolve(interruptId: string, response?: unknown): Promise<void>
  cancel(interruptId: string): Promise<void>
  get(interruptId: string): Promise<InterruptRecord | null>
  list(threadId: string): Promise<Array<InterruptRecord>>
  listPending(threadId: string): Promise<Array<InterruptRecord>>
  listByRun(runId: string): Promise<Array<InterruptRecord>>
  listPendingByRun(runId: string): Promise<Array<InterruptRecord>>
}
```

- `create` always births `'pending'`; **insert-if-absent** on `interruptId`
  (never clobber resolved back to pending).
- All `list*` ordered by `requestedAt` ascending.
- Requires a `runs` store when used with chat persistence.

#### `MetadataStore`

```ts
interface MetadataStore {
  get(namespace: string, key: string): Promise<unknown | null>
  set(namespace: string, key: string, value: unknown): Promise<void>
  delete(namespace: string, key: string): Promise<void>
}
```

- The first argument is an **app-defined namespace string**, not the `Scope`
  identity type — despite SQL backends conventionally naming the column
  `scope`.
- Identity is **two fields** `(namespace, key)` — do not join with `:`
  (`('a:b','c')` and `('a','b:c')` must stay distinct).
- Stored `null` is type-indistinguishable from absence; wrap if you must
  persist real null (`{ value: null }`).
- SQL backends usually reject nullish `set` (NOT NULL JSON columns) with a
  clear `TypeError` — match that or document your semantics.

### Timestamp convention

Store _records_ (`RunRecord`, `InterruptRecord`) speak **epoch milliseconds**
(`number`). Wire/result references that leave the persistence layer speak
**ISO-8601 strings**; the middleware converts at the boundary. Do not mix the
two on one field.

### Minimal message store example

Type each store with its `define*Store` helper (`defineMessageStore`,
`defineRunStore`, `defineInterruptStore`, `defineMetadataStore`): pass the object
literal and get autocomplete + contract checking inline, with no `: MessageStore`
annotation. The result composes into `defineAIPersistence` with exact presence.

```ts
import { defineMessageStore } from '@tanstack/ai-persistence'
import type { ModelMessage } from '@tanstack/ai'

const threads = new Map<string, Array<ModelMessage>>()

export const messages = defineMessageStore({
  async loadThread(threadId) {
    return [...(threads.get(threadId) ?? [])]
  },
  async saveThread(threadId, next) {
    threads.set(threadId, [...next])
  },
})
```

For durable DBs, preserve the same semantics with upserts / full-row replace.

### Adopt part of it

You rarely need all four stores in the same system. Implement the ones you own
and fill the rest from another base with `composePersistence`:

```ts
import { composePersistence, memoryPersistence } from '@tanstack/ai-persistence'
import { messages, runs } from './my-postgres-stores'

export const persistence = composePersistence(memoryPersistence(), {
  overrides: { messages, runs },
})
```

Only listed keys move; others stay on the base. Pass `false` to drop a store.
There is **no cross-store transaction** — if `messages` lives in Postgres and
`interrupts` in Redis, a write touching both is two writes. The store
invariants (idempotent `createOrResume`, insert-if-absent `create`) are exactly
what make those retries safe.

`composePersistence` accepts the four state keys. Locks and sandbox instance
maps are not composable here.

### Map onto an existing schema

- **Your column names, your types.** Name columns anything; use `jsonb`,
  `timestamptz`, whatever — convert in the row mapper. The record shape the
  methods return is fixed; how you store it is not.
- **Extra columns are fine.** Add `user_id`, audit columns, a tenant id. Keep
  them nullable or defaulted so the store's inserts still succeed. The stores
  never read or write columns they do not know about.
- **Omit absent optionals** in row mappers (`...(row.error != null ? { error: row.error } : {})`)
  so records compare cleanly.

### Authorization

Store methods take bare `threadId`s. **Authorize at the route** before
`loadThread` / `saveThread` / `reconstructChat({ authorize })`. Derive user
identity from session, not the client body alone.

### Conformance tests (required)

```ts
import { runPersistenceConformance } from '@tanstack/ai-persistence/testkit'
import { myPersistence } from '../src/persistence'

runPersistenceConformance('my-backend', () => myPersistence())

// Declare intentional omissions. The suite covers all seven stores, so a
// chat-only backend skips the generation half:
// runPersistenceConformance('chat-only', () => p, {
//   skip: ['generationRuns', 'artifacts', 'blobs'],
// })
// `skip` never accepts 'locks' — locks are not a store.

// Declare an intentionally-unimplemented OPTIONAL RunStore method with
// skipMethods, so vitest reports it as a real SKIPPED case:
// runPersistenceConformance('my-backend', () => myPersistence(), {
//   skipMethods: ['runs.listByThread', 'runs.listReclaimable'],
// })
```

The testkit is the compatibility gate: round-trips, rich message shapes,
empty-thread `[]`, `createOrResume` idempotency, interrupt insert-if-absent,
list ordering, composite-key non-aliasing. A missing store that is not listed
in `skip` fails loudly.

`skip` accepts only `'messages' | 'runs' | 'interrupts' | 'metadata'`. **Do not
pass `'locks'`** — it is not a state store and the suite does not cover it.

**`skipMethods` (declare-or-fail for optional `RunStore` methods).** A backend
that omits an OPTIONAL `RunStore` method (`listByThread`, `listReclaimable` —
`findActiveRun` is required and cannot be declared away) must declare it in
`skipMethods` as `'runs.<method>'`, e.g.
`skipMethods: ['runs.listByThread', 'runs.listReclaimable']`. An omitted
method that is NOT declared throws with an actionable message instead of
silently reporting a pass; a declared one is reported as a SKIPPED vitest
case, never as a pass. A case that did not run must never be
indistinguishable from one that did. See
`examples/ts-react-chat/src/lib/sqlite-persistence.test.ts` for a worked
example: it declares `skipMethods: ['runs.listByThread']` only, keeping both
`findActiveRun` and `listReclaimable` under test.

Reference implementation: `memoryPersistence()` in `@tanstack/ai-persistence`.

### Common mistakes

#### CRITICAL: Append-only `saveThread`

Breaks the authoritative-history contract.

#### CRITICAL: `createOrResume` overwriting existing runs

Breaks safe resume / double-submit.

#### CRITICAL: Interrupt `create` upserting to pending

Can resurrect a resolved approval.

#### HIGH: Returning bare `AIPersistence` from the factory

`withPersistence` rejects it. Annotate a named shape.

#### HIGH: `list*` without stable `requestedAt` order

Middleware and tests assume ascending order.

#### HIGH: Skipping the testkit

Silent semantic drift shows up as stuck approvals or wiped history in prod.

#### HIGH: `listReclaimable` cutoff off by one

The cutoff is inclusive (`detachedSince <= now - ttlMs`). Using a strict `<`
drops runs detached exactly at the boundary.

#### HIGH: Treating `listReclaimable` as automatic reclamation

It is a query a caller runs, not something the package acts on by itself.
Nothing reaps a returned run for you.

### Cross-references

- **ai-persistence/server** — when middleware calls each store
- **ai-persistence/build-drizzle-adapter** / **-prisma-** / **-cloudflare-** / **-custom-** — per-stack recipes
- **ai-core/locks** — not a state store
