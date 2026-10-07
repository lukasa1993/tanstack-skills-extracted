# Ai Mcp — MCP input request

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.8.0`.

## MCP input request

When `chat()` receives an MCP input request, the run outcome is an interrupt.
The stream ends with `RUN_FINISHED`.
The outcome type is `interrupt`.
The stream does not emit `RUN_ERROR` for this pause.

Read each interrupt whose `reason` is `mcp_input`.
The payload key is `tanstack:interruptPayload`.
`form` means the server asks the user for input.
`sampling` means the server asks for a model result.
The interrupt id is `mcp_input_` plus the tool call id.

```typescript
import { chat, INTERRUPT_PAYLOAD_METADATA_KEY } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { createMCPClient } from '@tanstack/ai-mcp'

const client = await createMCPClient({
  transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
})

try {
  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages: [{ role: 'user', content: 'What is the weather in Paris?' }],
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
      // payload.request is the MCP input body
    }
  }
} finally {
  await client.close()
}
```

The interrupt has a generic binding.
In `useChat`, the item `kind` is `generic`.
Call `resolveInterrupt(answer)` or `cancel()` on the item.
For a `form`, the answer is an object that matches `request.requestedSchema`.
A `createMCPServer` server asks for `{ value: string }`.
For `sampling`, the answer is the reply text or a full `CreateMessageResult`.
The route must pass `parentRunId` and `resume` to `chat()`.
The next run calls the tool again, and the tool reads `ctx.inputResponse`.
On spec 2026, the MCP client sends that answer with `inputResponses` and the server `requestState`.
On spec 2025, the tool call fails, because `chat()` cannot pause that call.
