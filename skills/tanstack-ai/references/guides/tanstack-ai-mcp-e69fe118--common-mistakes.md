# Ai Mcp — Common Mistakes

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.3.10`.

## Common Mistakes

### a. HIGH: closing the client before the stream finishes

`chat()` executes tools lazily as the model calls them during streaming.
If you close the MCP client before the response stream is fully consumed,
in-flight tool calls will fail.

Wrong:

```typescript
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { createMCPClient } from '@tanstack/ai-mcp'

export async function POST(request: Request) {
  const { messages } = await request.json()
  const client = await createMCPClient({
    transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
  })
  const tools = await client.tools()
  const stream = chat({ adapter: openaiText('gpt-5.5'), messages, tools })
  await client.close() // closes before the stream runs tools
  return toServerSentEventsResponse(stream)
}
```

This includes `try/finally` around the `return`, and `await using` at function
scope — both close before the returned `Response` body streams.

Correct — close in middleware terminal hooks (exactly one of
`onFinish`/`onAbort`/`onError` fires per run), or consume the stream in scope
before closing:

```typescript
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { createMCPClient } from '@tanstack/ai-mcp'

export async function POST(request: Request) {
  const { messages } = await request.json()
  const client = await createMCPClient({
    transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
  })

  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    tools: await client.tools(),
    middleware: [
      {
        name: 'mcp-close',
        onFinish: () => client.close(),
        onAbort: () => client.close(),
        onError: () => client.close(),
      },
    ],
  })
  return toServerSentEventsResponse(stream)
}
```

### b. HIGH: importing `stdioTransport` from the main entry point

`stdioTransport` is only available from `@tanstack/ai-mcp/stdio`. Importing it
from `@tanstack/ai-mcp` will fail with a module-not-found error and would
bundle Node.js child-process code into edge bundles.

Wrong:

```typescript ignore
import { stdioTransport } from '@tanstack/ai-mcp' // does not exist here
```

Correct:

```typescript
import { stdioTransport } from '@tanstack/ai-mcp/stdio'
```

### c. MEDIUM: using `client.tools([defs])` without matching names

The name field on each `toolDefinition` must exactly match the tool name the MCP
server exposes. Mismatches throw `MCPToolNotFoundError` at call time, not at
type-check time (unless generated types are in use).

### d. MEDIUM: not setting a prefix when multiple servers share tool names

Two different errors can arise depending on where the collision is detected:

- **Within a single `createMCPClients` pool** — calling `pool.tools()` throws
  `DuplicateToolNameError` (from `@tanstack/ai-mcp`) when two servers in that
  pool expose the same name with no prefix to separate them.
- **Across separate `mcp.clients` entries in `chat()`** — `chat()` throws
  `MCPDuplicateToolNameError` (from `@tanstack/ai`) after merging discovered
  tools from all `mcp.clients` entries.

In both cases, the fix is the same: use `createMCPClients` (which auto-prefixes
by config key) or set an explicit `prefix` on each `createMCPClient` call.
