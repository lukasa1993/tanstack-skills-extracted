# Custom Backend Integration — Core Patterns

[Guide and prerequisites](./tanstack-ai-core-custom-backend-integration-0c016192.md) · Published skill · `@tanstack/ai@0.53.0`.

## Core Patterns

### 1. Custom SSE Backend with fetchServerSentEvents

Use when your backend speaks SSE (`text/event-stream`) with `data: {json}\n\n`
framing. This is the recommended default.

**Static options:**

```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'

const { messages, sendMessage } = useChat({
  connection: fetchServerSentEvents('https://my-api.com/chat', {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Id': tenantId,
    },
    credentials: 'include',
  }),
})
```

**Dynamic URL and options (evaluated per request):**

```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'

const { messages, sendMessage } = useChat({
  connection: fetchServerSentEvents(
    () => `https://my-api.com/chat?session=${sessionId}`,
    async () => ({
      headers: {
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      body: {
        provider: 'openai',
        model: 'gpt-4o',
      },
    }),
  ),
})
```

The `body` field in options is merged into the POST request body alongside
`messages` and `data`, so the server receives `{ messages, data, provider, model }`.

**Custom fetch client (for proxies, interceptors, retries):**

```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'

const { messages, sendMessage } = useChat({
  connection: fetchServerSentEvents('/api/chat', {
    fetchClient: myCustomFetch,
  }),
})
```

### 2. Custom NDJSON Backend with fetchHttpStream

Use when your backend sends newline-delimited JSON (`application/x-ndjson`)
instead of SSE. Each line is one JSON-encoded `StreamChunk` followed by `\n`.

```typescript
import { useChat, fetchHttpStream } from '@tanstack/ai-react'

const { messages, sendMessage } = useChat({
  connection: fetchHttpStream('https://my-api.com/chat', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),
})
```

`fetchHttpStream` accepts the same URL and options signatures as
`fetchServerSentEvents` (static or dynamic, sync or async). The only difference
is the parsing: no `data:` prefix stripping, no `[DONE]` sentinel -- just one
JSON object per line.

**Dynamic options work identically:**

```typescript
import { useChat, fetchHttpStream } from '@tanstack/ai-react'

const { messages, sendMessage } = useChat({
  connection: fetchHttpStream(
    () => `/api/chat?region=${region}`,
    async () => ({
      headers: { Authorization: `Bearer ${await refreshToken()}` },
    }),
  ),
})
```

### 3. Fully Custom Connection Adapter

For protocols that don't fit SSE or NDJSON (WebSockets, gRPC-web, custom binary,
server functions), implement the `ConnectionAdapter` interface directly.

There are two mutually exclusive modes:

**ConnectConnectionAdapter (pull-based / async iterable):**

Use when the client initiates a request and consumes the response as a stream.
This is the simpler model and covers most HTTP-based protocols.

```typescript
import { useChat } from '@tanstack/ai-react'
import type { ConnectionAdapter } from '@tanstack/ai-react'
import type { StreamChunk, UIMessage } from '@tanstack/ai'

const websocketAdapter: ConnectionAdapter = {
  async *connect(
    messages: Array<UIMessage>,
    data?: Record<string, any>,
    abortSignal?: AbortSignal,
  ): AsyncGenerator<StreamChunk> {
    const ws = new WebSocket('wss://my-api.com/chat')

    // Wait for connection
    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => resolve()
      ws.onerror = (e) => reject(e)
    })

    // Send messages
    ws.send(JSON.stringify({ messages, ...data }))

    // Create an async queue to bridge WebSocket events to an async iterable
    const queue: Array<StreamChunk> = []
    let resolve: (() => void) | null = null
    let done = false

    ws.onmessage = (event) => {
      const chunk: StreamChunk = JSON.parse(event.data)
      queue.push(chunk)
      resolve?.()
    }

    ws.onclose = () => {
      done = true
      resolve?.()
    }

    ws.onerror = () => {
      done = true
      resolve?.()
    }

    abortSignal?.addEventListener('abort', () => {
      ws.close()
    })

    // Yield chunks as they arrive
    while (!done || queue.length > 0) {
      if (queue.length > 0) {
        yield queue.shift()!
      } else {
        await new Promise<void>((r) => {
          resolve = r
        })
      }
    }
  },
}

function Chat() {
  const { messages, sendMessage } = useChat({
    connection: websocketAdapter,
  })

  // ... render messages
}
```

**SubscribeConnectionAdapter (push-based / separate subscribe + send):**

Use for push-based protocols where the server can send data at any time
(persistent WebSocket connections, MQTT, server push). The `subscribe` method
returns an `AsyncIterable<StreamChunk>` that stays open, and `send` dispatches
messages through it.

```typescript
import type { StreamChunk, UIMessage } from '@tanstack/ai'

// SubscribeConnectionAdapter is exported from @tanstack/ai-client
// (not re-exported by framework packages -- use ConnectionAdapter
//  union type from @tanstack/ai-react for typing)
const pushAdapter = {
  subscribe(abortSignal?: AbortSignal): AsyncIterable<StreamChunk> {
    // Return a long-lived async iterable that yields chunks
    // whenever the server pushes them
    return createPersistentStream(abortSignal)
  },

  async send(
    messages: Array<UIMessage>,
    data?: Record<string, any>,
    abortSignal?: AbortSignal,
  ): Promise<void> {
    // Dispatch messages; chunks arrive through subscribe()
    await persistentConnection.send(JSON.stringify({ messages, ...data }))
  },
}

function Chat() {
  const { messages, sendMessage } = useChat({
    connection: pushAdapter,
  })

  // ... render messages
}
```

The `stream()` helper function (re-exported from `@tanstack/ai-react`) provides
a shorthand for creating a `ConnectConnectionAdapter` from an async generator:

```typescript
import { useChat, stream } from '@tanstack/ai-react'
import type { StreamChunk, UIMessage } from '@tanstack/ai'

const directAdapter = stream(async function* (
  messages: Array<UIMessage>,
  data?: Record<string, any>,
): AsyncGenerator<StreamChunk> {
  const response = await fetch('https://my-api.com/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, ...data }),
  })

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.trim()) {
        yield JSON.parse(line) as StreamChunk
      }
    }
  }
})

const { messages, sendMessage } = useChat({
  connection: directAdapter,
})
```
