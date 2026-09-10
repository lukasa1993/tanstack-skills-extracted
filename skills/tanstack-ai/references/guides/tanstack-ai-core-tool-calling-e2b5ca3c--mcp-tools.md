# Tool Calling — MCP Tools

[Guide and prerequisites](./tanstack-ai-core-tool-calling-e2b5ca3c.md) · Published skill · `@tanstack/ai@0.54.0`.

## MCP Tools

`@tanstack/ai-mcp` lets a server-side `chat()` call discover and invoke tools
hosted on any MCP server (Streamable HTTP, SSE, or stdio).

**MCP tools and UI resources:** When an MCP tool result carries a `ui://`
resource URI (via `_meta.ui.resourceUri`), TanStack AI surfaces it as a
`UIResourcePart` on the assistant `UIMessage` in the client message list.
`UIResourcePart` is a presentational-only part — it never enters model input.
See the `@tanstack/ai-mcp` skill for the full MCP Apps API
(`createMcpAppCallHandler`, `createMcpAppBridge`, `MCPAppResource`).

### Basic usage — auto-discovery

```typescript
// api/chat/route.ts
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { createMCPClient } from '@tanstack/ai-mcp'

export async function POST(request: Request) {
  const { messages } = await request.json()

  // 1. Connect to the MCP server.
  const mcp = await createMCPClient({
    transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
  })

  // 2. Discover all tools from the server (returns ServerTool[]).
  const mcpTools = await mcp.tools()

  // 3. Spread them into chat() — they work exactly like hand-written tools.
  // Caller owns the lifecycle — chat() never closes the client. Tools run
  // while the response streams, so close in a middleware terminal hook
  // (a try/finally around the return would close before tools execute).
  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    tools: [...mcpTools],
    middleware: [
      {
        name: 'mcp-close',
        onFinish: () => mcp.close(),
        onAbort: () => mcp.close(),
        onError: () => mcp.close(),
      },
    ],
  })
  return toServerSentEventsResponse(stream)
}
```

### Typed path — pass toolDefinition instances

Pass bare `toolDefinition()` instances (no `.server()`) to `client.tools([...])`.
The MCP client supplies a `callTool` proxy as the execute function, while
input/output validation and types come from the definitions' Zod schemas.

```typescript
import { chat, toolDefinition } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { createMCPClient } from '@tanstack/ai-mcp'
import { z } from 'zod'

const getWeather = toolDefinition({
  name: 'get_weather',
  description: 'Current weather for a city',
  inputSchema: z.object({ city: z.string() }),
  outputSchema: z.object({ temperature: z.number(), conditions: z.string() }),
})

const mcp = await createMCPClient({
  transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
})

// Returns ServerTool[] typed to the definitions' input/output schemas.
// Throws MCPToolNotFoundError if the server does not expose a tool with that name.
const tools = await mcp.tools([getWeather])

const messages = [{ role: 'user' as const, content: 'Weather in Paris?' }]
const stream = chat({ adapter: openaiText('gpt-5.5'), messages, tools })
```

### Multiple servers with `createMCPClients`

```typescript
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { createMCPClients } from '@tanstack/ai-mcp'

// Each key becomes the default prefix for that server's tools.
await using pool = await createMCPClients({
  github: { transport: { type: 'http', url: 'https://mcp.github.com/mcp' } },
  linear: { transport: { type: 'http', url: 'https://mcp.linear.app/mcp' } },
})

// Tools auto-prefixed: 'github_search_repos', 'linear_create_issue', etc.
const tools = await pool.tools()

const messages = [{ role: 'user' as const, content: 'Open an issue for #42' }]
const stream = chat({ adapter: openaiText('gpt-5.5'), messages, tools })
```

Use `pool.clients.<name>` for typed per-server access (resources, prompts, typed
`tools([defs])` overload).

### `ToolExecutionContext.abortSignal` — cancelling long-running tools

Every server tool's execute function now receives `abortSignal` in its context.
When the chat run aborts (e.g. the client disconnects or calls the run's
`abortController`), the signal fires and any in-flight `callTool` call is
cancelled automatically.

You can also forward it from your own server tools:

```typescript
import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

const fetchReportDef = toolDefinition({
  name: 'fetch_report',
  description: 'Fetch a report from the slow reporting API',
  inputSchema: z.object({ reportId: z.string() }),
})

const fetchReport = fetchReportDef.server(async ({ reportId }, ctx) => {
  // Forward to fetch, a DB query, or an MCP callTool call.
  const response = await fetch(`https://slow.api/reports/${reportId}`, {
    signal: ctx?.abortSignal,
  })
  return response.json()
})
```

MCP tools wire this automatically — `makeMcpExecute` passes `ctx?.abortSignal`
as the `signal` option to `client.callTool(...)`, so MCP server calls cancel
with the chat run without any extra code.

### stdio transport (Node-only)

```typescript
import { createMCPClient } from '@tanstack/ai-mcp'
import { stdioTransport } from '@tanstack/ai-mcp/stdio'

const mcp = await createMCPClient({
  transport: stdioTransport({ command: 'npx', args: ['-y', 'my-mcp-server'] }),
})
```

Import `stdioTransport` from the `/stdio` subpath only — it contains Node.js
`child_process` imports and must not be bundled for edge runtimes.

### `chat({ mcp })` — discovery + lifecycle in one prop

Instead of manually calling `client.tools()` and managing `close()`, pass an
`mcp` object and let `chat()` handle discovery and lifecycle.

```typescript
// Prop shape (ChatMCPOptions):
// mcp: {
//   clients: Array<MCPClient | MCPClients>,
//   connection?: 'close' | 'keep-alive',  // default: 'close'
//   lazyTools?: boolean,
//   onDiscoveryError?: (error: unknown, source) => void,
// }
```

- At run start, `chat()` calls `.tools()` on every entry in `clients` and merges
  the results — identical to spreading `await client.tools()` into `tools: [...]`.
- `lazyTools: true` is forwarded to `tools({ lazy: true })`.
- `onDiscoveryError`: throw to fail-fast; return to skip that source.
- `connection: 'close'` (default) closes each client when the run ends (after
  the agent loop completes and the stream is drained). With `'keep-alive'`,
  `chat()` never closes the clients — the caller owns their lifecycle (keep
  connections warm across requests).

**When to use `mcp` vs. the tools spread:**

| Approach                                                | Use when                                                                          |
| ------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `chat({ mcp: { clients: [...] } })`                     | Convenience: discovery + lifecycle in one place; untyped tool args are acceptable |
| `tools: [...await client.tools([toolDefinition(...)])]` | Fully-typed tool args/results via Zod schemas                                     |

**Example:**

```typescript
// api/chat/route.ts
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { createMCPClient } from '@tanstack/ai-mcp'

export async function POST(request: Request) {
  const { messages } = await request.json()

  const mcpClient = await createMCPClient({
    transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
  })

  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    mcp: {
      clients: [mcpClient],
      connection: 'keep-alive',
      onDiscoveryError: (err) => {
        console.warn('MCP discovery failed, skipping source:', err)
        // returning (not throwing) skips this source and continues
      },
    },
  })

  return toServerSentEventsResponse(stream)
}
```
