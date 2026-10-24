# Ai Mcp — MCP Events (experimental)

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@1.0.0`.

## MCP Events (experimental)

Webhook push from an MCP server (SEP-3415). Import the receiver from
`@tanstack/ai-mcp/events`. The client option is `experimental_events`.

```typescript
import { createMCPClient } from '@tanstack/ai-mcp'
import {
  createMCPEventWebhook,
  inMemoryMCPEventStore,
} from '@tanstack/ai-mcp/events'
import { queue } from './queue'

const store = inMemoryMCPEventStore()
const mcp = await createMCPClient({
  transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
  experimental_events: { store },
})
await mcp.experimental_events.subscribe({
  name: 'incident.created',
  delivery: {
    mode: 'webhook',
    url: 'https://app.example.com/api/mcp-events',
  },
})

const webhook = createMCPEventWebhook({
  store,
  onEvent: async ({ event, messageId }) => {
    await queue.send({ messageId, eventId: event.eventId, data: event.data })
  },
})
```

Gotchas:

- Verify the signature on the **raw body**. Re-serializing JSON yields 401.
- Keep the `mcp_event_subscription` query parameter. The receiver routes with it.
- The store is server-only. It holds HMAC secrets.
- The SDK does not auto-renew. Call `refresh({ key })` from a cron over `store.list?.()`.
- Dedupe deliveries on `messageId`. A 503 after `onEvent` succeeded is retried.

Capability check: `extensions["io.modelcontextprotocol/events"]` only.
With `experimental_events` set, HTTP/SSE transports add `Mcp-Name` for
`events/subscribe` and `events/unsubscribe` (Base64 sentinel when the
name is not printable ASCII). A failed subscribe deletes its `pending`
record. Deliveries must send `X-MCP-Subscription-Id`.
