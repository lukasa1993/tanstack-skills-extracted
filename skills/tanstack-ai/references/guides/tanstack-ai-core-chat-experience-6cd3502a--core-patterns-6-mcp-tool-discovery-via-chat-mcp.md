# Chat Experience — Core Patterns: 6. MCP Tool Discovery via `chat({ mcp })`

[Guide and prerequisites](./tanstack-ai-core-chat-experience-6cd3502a.md) · Published skill · `@tanstack/ai@0.68.0`.

## Core Patterns: 6. MCP Tool Discovery via `chat({ mcp })`


Pass `mcp` to let `chat()` own discovery **and** lifecycle for one or more MCP
clients. Useful when you want minimal boilerplate and don't need to reuse the
clients across calls.

`createMCPClient` tries spec `2026-07-28` first.
If the server does not support that spec, the client uses the 2025 initialize handshake.

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
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { createMCPClient } from '@tanstack/ai-mcp'

export async function POST(request: Request) {
  const { messages } = await request.json()

  const mcpClient = await createMCPClient({
    transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
  })

  const stream = chat({
    adapter: openaiText('gpt-5.6'),
    messages,
    mcp: {
      clients: [mcpClient],
      connection: 'keep-alive', // chat() won't close it — reuse across requests
    },
  })

  return toServerSentEventsResponse(stream)
  // connection: 'keep-alive' — chat() never closes mcpClient; it stays open for reuse across runs.
}
```

**Host an MCP server.** Import `createMCPServer` from `@tanstack/ai-mcp/server`.
Call `server.fetch(request)` in your HTTP route.

```typescript
import { toolDefinition } from '@tanstack/ai'
import { createMCPServer } from '@tanstack/ai-mcp/server'
import { z } from 'zod'

const getWeather = toolDefinition({
  name: 'get_weather',
  description: 'Current weather for a city',
  inputSchema: z.object({ city: z.string() }),
}).server(async ({ city }) => {
  return { city, temperature: 18, conditions: 'clear' }
})

const server = createMCPServer({
  name: 'weather',
  version: '1.0.0',
  tools: [getWeather],
})

export function handleMcp(request: Request) {
  return server.fetch(request)
}

// Mount handleMcp on GET, POST, and DELETE.
// GET is the spec 2025 stream.
// DELETE closes a spec 2025 session.
```

`serveMCPStdio` from `@tanstack/ai-mcp/server/stdio` serves that server on stdin and stdout.
Write logs with `console.error`.
stdout carries only protocol messages.

```typescript
import { toolDefinition } from '@tanstack/ai'
import { createMCPServer } from '@tanstack/ai-mcp/server'
import { serveMCPStdio } from '@tanstack/ai-mcp/server/stdio'
import { z } from 'zod'

const getWeather = toolDefinition({
  name: 'get_weather',
  description: 'Current weather for a city',
  inputSchema: z.object({ city: z.string() }),
}).server(async ({ city }) => {
  return { city, temperature: 18, conditions: 'clear' }
})

const server = createMCPServer({
  name: 'weather',
  version: '1.0.0',
  tools: [getWeather],
})

serveMCPStdio(server)
```

**MCP input interrupt.** When `chat()` receives an MCP input request, the run outcome is an interrupt.
The stream ends with `RUN_FINISHED`.
The outcome type is `interrupt`.
Read each interrupt whose `reason` is `mcp_input`.
The payload key is `tanstack:interruptPayload`.

`form` means the server asks the user for input.
`sampling` means the server asks for a model result.

```typescript
import { chat, INTERRUPT_PAYLOAD_METADATA_KEY } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { createMCPClient } from '@tanstack/ai-mcp'

const client = await createMCPClient({
  transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
})

try {
  const stream = chat({
    adapter: openaiText('gpt-5.6'),
    messages: [{ role: 'user', content: 'Weather in Paris?' }],
    tools: await client.tools(),
  })

  for await (const chunk of stream) {
    if (chunk.type !== 'RUN_FINISHED') continue
    if (chunk.outcome?.type !== 'interrupt') continue

    for (const item of chunk.outcome.interrupts) {
      if (item.reason !== 'mcp_input') continue
      const payload = item.metadata?.[INTERRUPT_PAYLOAD_METADATA_KEY]
      if (typeof payload !== 'object' || payload === null) continue
      if (!('kind' in payload)) continue
      // payload.kind is 'form' or 'sampling'
    }
  }
} finally {
  await client.close()
}
```

To continue, answer the interrupt:

1. In `useChat`, the item `kind` is `generic`.
2. For a `form`, call `resolveInterrupt` with an object that matches `request.requestedSchema`. A `createMCPServer` server asks for `{ value: string }`.
3. For `sampling`, call `resolveInterrupt` with the reply text.
4. Call `cancel()` to decline.
5. The route passes `parentRunId` and `resume` to `chat()`. The tool runs again with the answer.

```tsx ignore
// `interrupt` is one item from `useChat().interrupts`.
if (interrupt.reason === 'mcp_input' && interrupt.kind === 'generic') {
  interrupt.resolveInterrupt({ value: 'Paris' })
}
```

This works on spec `2026-07-28`. On spec 2025, the server asks the client in the middle of the tool call. `chat()` cannot pause that call, so the tool call fails.
