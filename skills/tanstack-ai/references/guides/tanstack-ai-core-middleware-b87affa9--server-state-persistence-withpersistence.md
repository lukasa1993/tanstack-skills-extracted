# Middleware — Server State Persistence: withPersistence

[Guide and prerequisites](./tanstack-ai-core-middleware-b87affa9.md) · Published skill · `@tanstack/ai@0.53.0`.

## Server State Persistence: withPersistence

`withPersistence(persistence)` (from `@tanstack/ai-persistence`) is a
`ChatMiddleware` that persists **state** for `chat()` — thread messages, run
records (status/timing/usage/errors), and interrupt state — to a backend store.
Add it to the `middleware` array like any other middleware. It never mutates the
chunk stream; replaying a dropped/reloaded _stream_ is a separate transport-layer
concern (see ./tanstack-ai-core-chat-experience-6cd3502a.md#source-tanstack-ai-core-chat-experience resumability, not this middleware).

```typescript
import {
  chat,
  chatParamsFromRequest,
  toServerSentEventsResponse,
} from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { withPersistence, memoryPersistence } from '@tanstack/ai-persistence'

// memoryPersistence() is the in-process reference backend (dev/tests). For a
// durable one, implement the store contracts against your database — see the
// @tanstack/ai-persistence skills.
const persistence = memoryPersistence()

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

### Authoritative-history contract

The middleware treats each request's `messages` as the source of truth for the
thread:

- **Non-empty `messages`** → on a successful finish (and at an interrupt
  boundary) the middleware **overwrites** the entire stored thread with that
  array. Post the **complete** transcript, never just the newest message(s) — a
  delta would replace and destroy the stored history.
- **Empty `messages`** → the middleware **loads** the stored thread and runs the
  turn from the server's copy. This is how you continue a conversation without
  resending history from the client.

### Backends

`@tanstack/ai-persistence` ships **contracts, not a database backend**. It
provides the four store interfaces (`messages`, `runs`, `interrupts`,
`metadata`), the middleware that drives them, `memoryPersistence()` for
dev/tests, and a conformance testkit. For anything durable you implement the
stores against your own database and pass the result to `withPersistence`.

Annotate your factory with a named shape (`ChatPersistence` /
`ChatTranscriptPersistence`) — bare `AIPersistence` is the all-optional bag and
`withPersistence` rejects it.

Locks are separate from state and are **not** a `stores` key: wire a
`LockStore` with `withLocks(lockStore)`.

The `runs` store in that list is typed against `RunStore`, which ships in
`@tanstack/ai` alongside `RunRecord`, `RunStatus`, `TerminalRunStatus`,
`RunError`, `isTerminalRunStatus`, `defineRunStore`, and `InMemoryRunStore`. A
`RunRecord` tracks one run: `runId`, `threadId`, `status`, `startedAt`, plus
optional `finishedAt`, `error`, `usage`, `sandboxKey`, `detachedSince`,
`cancelRequested`, and `driverEpoch`. A backend must round-trip **all** of
them: `cancelRequested` is the durable out-of-band cancel channel
(`requestRunCancel` writes it, `wasCancelRequested` reads it), and
`driverEpoch` is the monotonic fencing token each host bumps when it claims a
run, so a superseded host can discover it lost. Omit either and a durable
sandboxed run loses a mechanism silently — Stop stops reaching a remote
driver, or nothing fences a dead host's writes.
`error` is a structured `RunError` (`{ message: string, code?: string }`), not
a bare string: `message` is the provider's prose, `code` is the stable,
machine-branchable classification a consumer switches on. Only
`createOrResume`, `update`, `get`, and `findActiveRun` are required on a
`RunStore`; `listByThread` and `listReclaimable` are optional, so a backend can
leave either out and callers feature-detect
(`store.listReclaimable?.(opts)`). Shape your own store with
`defineRunStore` for autocomplete without a separate `: RunStore` annotation,
matching `defineLock`; `defineRunStore<const T extends RunStore>(store: T): T`
returns the argument's own type, so an optional method your store implements
stays known-present on the result instead of collapsing to `| undefined`.
`isTerminalRunStatus(status)` is a type predicate narrowing `RunStatus` to
`TerminalRunStatus`, so code inside the guard can pass `status` where a
`TerminalRunStatus` is required without a cast. When a backend omits an
optional `RunStore` method, declare the omission when running the conformance
testkit (`ai-persistence/stores`'s `skipMethods` option) rather than leaving it
undeclared.

### `StreamDurability.snapshot()`

A `StreamDurability` (the event-log backend `memoryStream` / `durableStream`
implement, and what `@tanstack/ai-sandbox`'s run driver resolves per run — its
`RunDeps.durability` / `sandboxRunDriver({ durability })` is a factory
`(runId) => StreamDurability`, because one log is bound to one run) requires a
`snapshot()` method alongside `append`, `read`, and `close`:

```ts
snapshot: () => Promise<Array<{ offset: TOffset; chunk: StreamChunk }>>
```

It returns everything stored for a run right now, in append order, then
resolves. Use it, not `read()`, when a caller needs to inspect a run's stored
prefix and get an answer back: `read()` tails and only resolves once the log
is terminalized with `close()` or the caller aborts, so it never resolves
against a producer that crashed without calling `close()`, and its log stays
open indefinitely. `snapshot()` resolves immediately with what is stored,
including while the log is still open, and resolves to an empty array for a
run with nothing stored yet.

**Full guidance lives in the package's own skills** — start at
`./tanstack-ai-persistence-2fec28cd.md#source-tanstack-ai-persistence`,
which routes to the server, client, stores, locks, and adapter-recipe
(Drizzle / Prisma / Cloudflare) sub-skills.

### Resume reconstruction is the middleware's job (server-authoritative path)

When a thread has pending interrupts, the middleware **records** them and
**gates** new input: a request that carries pending interrupts must include a
`resume` batch that references them, or `onConfig` throws. On a valid resume
batch the middleware also **builds `ChatResumeToolState`** (approvals /
client-tool results) and **clears `config.resume`** so the chat engine skips
its ephemeral reconstruction — that path needs client message history the
persistence flow deliberately omits when the server owns the transcript.
Resumes accepted in `onConfig` are committed (marked resolved/cancelled) only
once the run reaches a successful boundary, so a provider failure between
accepting a resume and finishing leaves the interrupt pending and a retry with
the same resume succeeds.

> A companion `withGenerationPersistence(persistence)` tracks run records for
> non-chat generation activities (image, audio, TTS, video, transcription).

Source: docs/persistence/overview.md
