# Chat Experience — Core Patterns: 6. MCP Tool Discovery via `chat({ mcp })`

[Guide and prerequisites](./tanstack-ai-core-chat-experience-6cd3502a.md) · Published skill · `@tanstack/ai@0.53.0`.

## Core Patterns: 6. MCP Tool Discovery via `chat({ mcp })`


Pass `mcp` to let `chat()` own discovery **and** lifecycle for one or more MCP
clients. Useful when you want minimal boilerplate and don't need to reuse the
clients across calls.

```typescript
// Prop shape:
// chat({
//   ...,
//   mcp: {
//     clients: Array<MCPClient | MCPClients>,
//     connection?: 'close' | 'keep-alive',  // default: 'close'
//     lazyTools?: boolean,
//     onDiscoveryError?: (error: unknown, source) => void,
//   }
// })
```

- **`clients`** — one or more `MCPClient` / `MCPClients` instances.
- **`connection`** — `'close'` (default) closes each client when the run ends
  (after the agent loop completes and the stream is drained); with
  `'keep-alive'`, `chat()` never closes the clients — the caller owns their
  lifecycle (keep connections warm across requests).
- **`lazyTools`** — forwarded to `tools({ lazy: true })` so tool schemas are
  sent to the LLM on demand.
- **`onDiscoveryError`** — throw (or re-throw) to fail the entire call fast;
  return normally to skip that source and continue. Omit to rethrow (fail-fast).

**When to use `mcp` vs. the tools spread:**

| Approach                                                | Use when                                                                                        |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `chat({ mcp: { clients: [...] } })`                     | You want discovery + lifecycle managed for you, and don't need fully-typed input/output schemas |
| `tools: [...await client.tools([toolDefinition(...)])]` | You want fully-typed MCP tools with Zod input/output validation                                 |

**Server-side example:**

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { createMCPClient } from '@tanstack/ai-mcp'

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = await request.json()

        const mcpClient = await createMCPClient({
          transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
        })

        const stream = chat({
          adapter: openaiText('gpt-5.5'),
          messages,
          mcp: {
            clients: [mcpClient],
            connection: 'keep-alive', // chat() won't close it — reuse across requests
          },
        })

        return toServerSentEventsResponse(stream)
        // connection: 'keep-alive' — chat() never closes mcpClient; it stays open for reuse across runs.
      },
    },
  },
})
```
