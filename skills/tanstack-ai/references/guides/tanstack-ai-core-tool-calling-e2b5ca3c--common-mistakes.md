# Tool Calling — Common Mistakes

[Guide and prerequisites](./tanstack-ai-core-tool-calling-e2b5ca3c.md) · Published skill · `@tanstack/ai@0.54.0`.

## Common Mistakes

### a. HIGH: Not passing tool definitions to both server and client

Server tools need `chat({ tools })`. Client tools need their definition in
`chat({ tools })` AND their `.client()` in `useChat({ tools: clientTools(...) })`.

Wrong -- tool only on server, client cannot execute:

```tsx group=tool-wiring
import { chat, toolDefinition } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
import { clientTools } from '@tanstack/ai-client'
import { z } from 'zod'

const myToolDef = toolDefinition({
  name: 'my_tool',
  description: 'Example client-executed tool',
  inputSchema: z.object({ id: z.string() }),
  outputSchema: z.object({ success: z.boolean() }),
})
const adapter = openaiText('gpt-5.5')
const messages = [{ role: 'user' as const, content: 'Run my tool' }]

// server
chat({ adapter, messages, tools: [myToolDef] })
// client
function ChatServerOnly() {
  useChat({ connection: fetchServerSentEvents('/api/chat') }) // no tools
  return null
}
```

Wrong -- tool only on client, LLM does not know about it:

```tsx group=tool-wiring
// server
chat({ adapter, messages }) // no tools
// client
function ChatClientOnly() {
  useChat({
    connection: fetchServerSentEvents('/api/chat'),
    tools: clientTools(myToolDef.client(() => ({ success: true }))),
  })
  return null
}
```

Correct:

```tsx group=tool-wiring
// server
chat({ adapter, messages, tools: [myToolDef] })
// client
function ChatWired() {
  useChat({
    connection: fetchServerSentEvents('/api/chat'),
    tools: clientTools(
      myToolDef.client((input) => ({ success: input.id !== '' })),
    ),
  })
  return null
}
```

Source: docs/tools/tools.md
