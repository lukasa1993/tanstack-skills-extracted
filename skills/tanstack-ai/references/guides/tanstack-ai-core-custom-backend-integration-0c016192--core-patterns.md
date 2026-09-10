# Custom Backend Integration — Core Patterns

[Guide and prerequisites](./tanstack-ai-core-custom-backend-integration-0c016192.md) · Published skill · `@tanstack/ai@0.54.0`.

## Core Patterns

### 1. Custom SSE Backend with fetchServerSentEvents

Use when your backend speaks SSE (`text/event-stream`) with `data: {json}\n\n`
framing. This is the recommended default.

**Static options:**

```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
import { token, tenantId } from './auth'

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
import { sessionId, getAccessToken } from './auth'

const { messages, sendMessage } = useChat({
  connection: fetchServerSentEvents(
    () => `https://my-api.com/chat?session=${sessionId}`,
    async () => ({
      headers: {
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      body: {
        provider: 'openai',
        model: 'gpt-5.5',
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

// Same signature as globalThis.fetch — wrap it however you need.
const myCustomFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, credentials: 'include' })

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
import { token } from './auth'

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
import { region, refreshToken } from './auth'

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
import type { ConnectConnectionAdapter } from '@tanstack/ai-react'
import type { StreamChunk } from '@tanstack/ai'

const websocketAdapter: ConnectConnectionAdapter = {
  async *connect(messages, data, abortSignal) {
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
import { useChat } from '@tanstack/ai-react'
import type { SubscribeConnectionAdapter } from '@tanstack/ai-react'
import type { StreamChunk } from '@tanstack/ai'

// One socket for the lifetime of the client; every run's chunks arrive on it.
const ws = new WebSocket('wss://my-api.com/chat')
const ready = new Promise<void>((resolve) => {
  ws.addEventListener('open', () => resolve(), { once: true })
})

const pushAdapter: SubscribeConnectionAdapter = {
  async *subscribe(abortSignal) {
    // Long-lived async iterable: yields chunks whenever the server pushes
    // them, until the socket closes or the signal aborts
    const queue: Array<StreamChunk> = []
    let wake: (() => void) | null = null
    let closed = false

    ws.addEventListener('message', (event) => {
      const chunk: StreamChunk = JSON.parse(event.data)
      queue.push(chunk)
      wake?.()
    })
    ws.addEventListener('close', () => {
      closed = true
      wake?.()
    })
    abortSignal?.addEventListener('abort', () => ws.close())

    while (!closed || queue.length > 0) {
      const next = queue.shift()
      if (next !== undefined) {
        yield next
        continue
      }
      await new Promise<void>((r) => {
        wake = r
      })
    }
  },

  async send(messages, data) {
    // Dispatch messages; chunks arrive through subscribe()
    await ready
    ws.send(JSON.stringify({ messages, ...data }))
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
import type { StreamChunk } from '@tanstack/ai'

const directAdapter = stream(async function* (messages, data) {
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
        const chunk: StreamChunk = JSON.parse(line)
        yield chunk
      }
    }
  }
})

const { messages, sendMessage } = useChat({
  connection: directAdapter,
})
```
