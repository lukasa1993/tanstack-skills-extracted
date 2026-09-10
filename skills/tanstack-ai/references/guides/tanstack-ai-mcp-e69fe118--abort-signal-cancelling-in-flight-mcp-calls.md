# Ai Mcp — Abort signal — cancelling in-flight MCP calls

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.3.10`.

## Abort signal — cancelling in-flight MCP calls

MCP tool calls are automatically cancelled when the chat run's `AbortController`
fires (e.g. client disconnect, server abort). The `abortSignal` is threaded
through `ToolExecutionContext` into every `callTool` call with no extra code.

You can also read it in a hand-written server tool that wraps an MCP call:

```typescript
import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

const fetchData = toolDefinition({
  name: 'fetch_data',
  description: 'Fetch a record from a slow upstream API',
  inputSchema: z.object({ id: z.string() }),
})

const myTool = fetchData.server(async (args, ctx) => {
  // Forward to any async work that accepts an AbortSignal.
  const result = await fetch(`https://slow.api/data/${args.id}`, {
    signal: ctx?.abortSignal,
  })
  return result.json()
})
```
