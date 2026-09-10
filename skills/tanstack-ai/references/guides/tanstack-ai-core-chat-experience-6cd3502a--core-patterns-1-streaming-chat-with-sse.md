# Chat Experience — Core Patterns: 1. Streaming Chat with SSE

[Guide and prerequisites](./tanstack-ai-core-chat-experience-6cd3502a.md) · Published skill · `@tanstack/ai@0.54.0`.

## Core Patterns: 1. Streaming Chat with SSE


Server returns a streaming SSE Response; client parses it automatically.

**Server:**

```typescript
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { anthropicText } from '@tanstack/ai-anthropic'

export async function POST(request: Request) {
  const { messages } = await request.json()
  const abortController = new AbortController()

  const stream = chat({
    adapter: anthropicText('claude-opus-5'),
    messages,
    modelOptions: {
      temperature: 0.7,
      max_tokens: 2000, // Anthropic-native key
    },
    systemPrompts: ['You are a helpful assistant.'],
    abortController,
  })

  return toServerSentEventsResponse(stream, { abortController })
}
```

To make the SSE response resumable (reconnect after a drop/refresh without
re-running the provider), pass a delivery-durability adapter:
`toServerSentEventsResponse(stream, { durability: { adapter: memoryStream(request) } })`
(`memoryStream` from `@tanstack/ai` is process-local, for dev/tests) or
`durableStream(request, { server })` from `@tanstack/ai-durable-stream`
(Durable Streams protocol, production). Each SSE event gets an opaque
adapter-owned `id:`; `fetchServerSentEvents` auto-reconnects with
`Last-Event-ID` and exposes `joinRun(runId)` to replay a run from the start.
See `docs/resumable-streams/overview.md`.

**Client:**

```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'

const { messages, sendMessage, isLoading, error, stop, status } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
  body: { provider: 'anthropic', model: 'claude-opus-5' },
  onFinish: (message) => {
    console.log('Response complete:', message.id)
  },
  onError: (err) => {
    console.error('Stream error:', err)
  },
})
```

The `body` field is merged into the POST request body alongside `messages`,
letting the server read `data.provider`, `data.model`, etc.

The `status` field tracks the chat lifecycle: `'ready'` | `'submitted'` | `'streaming'` | `'error'`.
