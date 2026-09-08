# Chat Experience — Core Patterns: 8. Browser-Refresh Durability (client persistence)

[Guide and prerequisites](./tanstack-ai-core-chat-experience-6cd3502a.md) · Published skill · `@tanstack/ai@0.53.0`.

## Core Patterns: 8. Browser-Refresh Durability (client persistence)


By default a `ChatClient` / `useChat` keeps messages in memory only, so a full
page reload loses the conversation. The optional `persistence` option (a
`ChatClientPersistence` adapter) fixes this from the client side: it stores one
combined record — `{ messages, resume? }` (`ChatPersistedState`) — per chat `id`,
so a reload restores the transcript **and** rehydrates any pending interrupt /
rejoins a run that was still streaming. No manual `initialMessages` + `onFinish`
boilerplate.

Three storage adapters ship from `@tanstack/ai-client`:
`localStoragePersistence` (survives reloads and browser restarts),
`sessionStoragePersistence` (scoped to the tab), and `indexedDBPersistence`
(async, structured-clone storage — no codec needed for `Date`/`Map`/etc.).
Give the chat a stable `threadId` so the reload finds the same record.
Persistence keys on `threadId`; the storage adapters are re-exported from each
framework package, so a single import works:

```typescript
import {
  useChat,
  fetchServerSentEvents,
  localStoragePersistence,
} from '@tanstack/ai-react'

// Defaults to the ChatPersistedState shape and a JSON codec, so no type
// argument or serialize/deserialize is needed. indexedDBPersistence stores via
// structured clone (a Date round-trips exactly).
const persistence = localStoragePersistence()

function Chat() {
  const { messages, sendMessage } = useChat({
    threadId: 'support-chat',
    connection: fetchServerSentEvents('/api/chat'),
    persistence,
  })
  // ...render messages, call sendMessage(text)
}
```

**Keep large transcripts off the client.** `persistence` also accepts `true`
(server-authoritative): the client caches nothing, and on mount it hydrates the
thread from the server by `threadId` (transcript plus a cursor to any run still
generating). An adapter is client-authoritative; `true` leaves history on the
server and needs a connection with a `hydrate` handler plus a server GET
endpoint (`reconstructChat`), since the delivery log only holds one run.

**Mid-stream reload rejoin.** If the run was still streaming when the page
reloaded, the client re-attaches instead of showing a frozen half-reply — but
only when the connection is **resumable**: a delivery-durability-backed route
that records the stream and exposes a GET replay handler (see
`docs/resumable-streams/overview.md` and Pattern 1's `durability` adapter). Given
that, `useChat` finds the persisted in-flight run on load and auto-rejoins it via
`joinRun`, replaying from the server's log so the reply finishes where it left
off. No extra client code beyond the resumable connection.

**Every framework, no extra code.** Durability rides the existing `persistence`
option, so it works identically in `@tanstack/ai-react`, `-solid`, `-vue`,
`-svelte`, `-angular`, and `-preact` — pass `persistence` (and a stable
`threadId`, which is the chat's identity) to the framework's `useChat` /
`createChat` / `injectChat`; nothing is framework-specific.

> **Client vs. server durability.** This is the client (per-browser) half.
> The authoritative, multi-user, server-side copy is the `withPersistence`
> middleware — see ./tanstack-ai-core-middleware-b87affa9.md#source-tanstack-ai-core-middleware. The two are independent; use
> both for instant reload restore plus a durable record of record.
