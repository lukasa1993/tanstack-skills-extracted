# Ai Mcp — `chat({ mcp })` — discovery + lifecycle in one prop

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.3.10`.

## `chat({ mcp })` — discovery + lifecycle in one prop

Rather than calling `client.tools()` and `client.close()` yourself, pass the
`mcp` option to `chat()` and let it manage the full lifecycle.

```typescript
// ChatMCPOptions shape:
// mcp: {
//   clients: Array<MCPClient | MCPClients>,
//   connection?: 'close' | 'keep-alive',  // default: 'close'
//   lazyTools?: boolean,
//   onDiscoveryError?: (error: unknown, source) => void,
// }
```

**Behavior:**

- `chat()` calls `.tools()` on every entry in `clients` at run start and merges
  all results into the tool list.
- `lazyTools: true` is forwarded to `tools({ lazy: true })`.
- `connection: 'close'` (default) — each client is closed when the run ends
  (after the agent loop completes and the stream is drained). With
  `'keep-alive'`, `chat()` never closes the clients — the caller owns their
  lifecycle (keep connections warm across requests).
- `onDiscoveryError`: throw (or re-throw) to abort the entire call; return
  normally to skip that source and continue. Omitting the handler re-throws
  (fail-fast).

**When to use `mcp` vs. the tools spread:**

| Approach                                                | Use when                                                                  |
| ------------------------------------------------------- | ------------------------------------------------------------------------- |
| `chat({ mcp: { clients: [...] } })`                     | Convenience: discovery + lifecycle handled for you; untyped args are fine |
| `tools: [...await client.tools([toolDefinition(...)])]` | Fully-typed args/results via Zod schemas (`toolDefinition` mode)          |

**Server-side example:**

```typescript
// Any framework route handler that receives a Request works (TanStack Start,
// Next.js, Hono, ...).
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { createMCPClient } from '@tanstack/ai-mcp'

// Created once at module scope; connection: 'keep-alive' below keeps it warm
// across requests.
const mcpClient = await createMCPClient({
  transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
})

export async function POST(request: Request) {
  const { messages } = await request.json()

  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    mcp: {
      clients: [mcpClient],
      connection: 'keep-alive', // chat() won't close it — reuse across requests
      onDiscoveryError: (err, source) => {
        console.warn('MCP discovery failed for source, skipping:', err)
        // returning skips this source; throw to fail the whole call fast
      },
    },
  })

  return toServerSentEventsResponse(stream)
  // connection: 'keep-alive' — chat() never closes mcpClient; it stays warm for the next request.
}
```

You can also pass an `MCPClients` pool directly:

```typescript
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { createMCPClients } from '@tanstack/ai-mcp'

const pool = await createMCPClients({
  github: { transport: { type: 'http', url: 'https://mcp.github.com/mcp' } },
  linear: { transport: { type: 'http', url: 'https://mcp.linear.app/mcp' } },
})

export async function POST(request: Request) {
  const { messages } = await request.json()

  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    mcp: { clients: [pool], connection: 'keep-alive' },
  })

  return toServerSentEventsResponse(stream)
}
```
