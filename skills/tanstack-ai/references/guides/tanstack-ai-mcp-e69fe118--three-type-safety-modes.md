# Ai Mcp — Three type-safety modes

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.3.10`.

## Three type-safety modes

### Mode 1 — Auto-discovery (no types needed)

`client.tools()` lists every tool the server exposes. Args are typed `unknown`
at compile time but the tool's JSON Schema is forwarded to the LLM.

```typescript
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { createMCPClient } from '@tanstack/ai-mcp'

const client = await createMCPClient({
  transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
})

const tools = await client.tools()
// tools: McpServerTool[]  (args unknown)

const stream = chat({
  adapter: openaiText('gpt-5.5'),
  messages: [{ role: 'user', content: 'What is the weather in Paris?' }],
  tools,
})
```

Use `{ lazy: true }` to defer schema sending via the existing `LazyToolManager`:

```typescript
import { createMCPClient } from '@tanstack/ai-mcp'

const client = await createMCPClient({
  transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
})

const tools = await client.tools({ lazy: true })
```

### Mode 2 — Typed via `toolDefinition` instances

Pass bare `toolDefinition()` instances (no `.server()` call) to `client.tools([...])`.
The MCP client binds a `callTool` proxy as the execute function while
input/output validation and TypeScript types come from the definitions' Zod schemas.
Only the named tools are returned (allowlist = the definitions' `name`s).
Throws `MCPToolNotFoundError` if the server does not expose a tool with that name.

```typescript
import { toolDefinition } from '@tanstack/ai'
import { createMCPClient } from '@tanstack/ai-mcp'
import { z } from 'zod'

const getWeatherDef = toolDefinition({
  name: 'get_weather',
  description: 'Current weather for a city',
  inputSchema: z.object({ city: z.string() }),
  outputSchema: z.object({ temperature: z.number(), conditions: z.string() }),
})

const client = await createMCPClient({
  transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
})

// Returns MappedServerTools<typeof defs> — fully typed per definition.
const tools = await client.tools([getWeatherDef])
```

### Mode 3 — Generated types (via `generate` CLI)

Run `npx @tanstack/ai-mcp generate` to introspect live servers and emit a
`ServerDescriptor` interface per server. Pass the generated interface as the
generic to `createMCPClient<WeatherServer>(...)` to narrow discovered tool
names to the server's literals (args stay untyped — use Mode 2 for typed args).

See the "Codegen CLI" section below for details.
