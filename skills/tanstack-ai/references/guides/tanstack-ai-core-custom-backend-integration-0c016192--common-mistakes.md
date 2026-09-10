# Custom Backend Integration — Common Mistakes

[Guide and prerequisites](./tanstack-ai-core-custom-backend-integration-0c016192.md) · Published skill · `@tanstack/ai@0.54.0`.

## Common Mistakes

### a. HIGH: Providing both connect and subscribe+send in connection adapter

The `ConnectionAdapter` interface has two mutually exclusive modes. Providing
both throws at runtime.

```typescript
import type {
  ConnectConnectionAdapter,
  ConnectionAdapter,
  SubscribeConnectionAdapter,
} from '@tanstack/ai-react'
import { channel } from './channel'

// WRONG -- type-checks (ConnectionAdapter is a union) but throws at runtime:
// "Connection adapter must provide either connect or both subscribe and
// send, not both modes"
const adapter: ConnectionAdapter = {
  async *connect(messages) {
    /* ... */
  },
  subscribe(signal) {
    return channel.chunks(signal)
  },
  async send(messages) {
    await channel.send(messages)
  },
}

// CORRECT -- pick one mode
// Option A: ConnectConnectionAdapter (pull-based)
const pullAdapter: ConnectConnectionAdapter = {
  async *connect(messages, data, abortSignal) {
    // ... yield StreamChunks
  },
}

// Option B: SubscribeConnectionAdapter (push-based)
const pushAdapter: SubscribeConnectionAdapter = {
  subscribe(abortSignal) {
    return channel.chunks(abortSignal)
  },
  async send(messages, data, abortSignal) {
    await channel.send({ messages, ...data }, abortSignal)
  },
}
```

Source: `ai-client/src/connection-adapters.ts` line 116

### b. MEDIUM: SSE browser connection limits

Browsers limit SSE connections to 6-8 per domain (the HTTP/1.1 connection
limit). Multiple chat sessions on the same page, or multiple tabs to the
same origin, can exhaust this limit. New connections queue indefinitely until
an existing one closes.

Mitigations:

- Use HTTP/2 (multiplexes streams over a single TCP connection; no per-domain limit)
- Use `fetchHttpStream` instead of `fetchServerSentEvents` (each request is a
  standard POST, not a long-lived EventSource)
- Close idle connections when not actively streaming
- Use a single persistent WebSocket via `SubscribeConnectionAdapter` instead of
  per-request SSE connections

Source: `docs/chat/connection-adapters.md`

### c. MEDIUM: HTTP stream without implementing reconnection

SSE has built-in browser auto-reconnection via the `EventSource` API. HTTP
stream (NDJSON via `fetchHttpStream`) does not -- if the connection drops
mid-stream, the partial response is silently lost with no automatic retry.

If your application needs resilience to transient network errors with HTTP
streaming, implement retry logic in your connection adapter:

```typescript
import { useChat } from '@tanstack/ai-react'
import type { ConnectConnectionAdapter } from '@tanstack/ai-react'
import type { StreamChunk } from '@tanstack/ai'

const resilientAdapter: ConnectConnectionAdapter = {
  async *connect(messages, data, abortSignal) {
    const maxRetries = 3
    let attempt = 0

    while (attempt < maxRetries) {
      try {
        const response = await fetch('https://my-api.com/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, ...data }),
          signal: abortSignal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

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

        return // Stream completed successfully
      } catch (err) {
        if (abortSignal?.aborted) throw err
        attempt++
        if (attempt >= maxRetries) throw err
        // Exponential backoff
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt))
      }
    }
  },
}

const { messages, sendMessage } = useChat({
  connection: resilientAdapter,
})
```

Note: `fetchServerSentEvents` in TanStack AI uses `fetch()` under the hood (not
the browser `EventSource` API), so it also does not auto-reconnect. The SSE
auto-reconnection advantage only applies when using the native `EventSource` API
directly.

Source: `docs/protocol/http-stream-protocol.md`
