# Tool Calling — Core Patterns: Pattern 2: Client-Only Tool

[Guide and prerequisites](./tanstack-ai-core-tool-calling-e2b5ca3c.md) · Published skill · `@tanstack/ai@0.54.0`.

## Core Patterns: Pattern 2: Client-Only Tool


Pass the bare definition (no `.server()`) to `chat({ tools })` so the LLM knows
about it. Pass the `.client()` implementation to `useChat` via `clientTools()`.

```typescript group=notification-tool
// tools/definitions.ts
import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

export const showNotificationDef = toolDefinition({
  name: 'show_notification',
  description: 'Display a toast notification to the user',
  inputSchema: z.object({
    message: z.string(),
    type: z.enum(['success', 'error', 'info']),
  }),
  outputSchema: z.object({ shown: z.boolean() }),
})
```

Server -- pass definition only (no execute function):

```typescript group=notification-tool
// api/chat/route.ts (uses showNotificationDef from tools/definitions.ts)
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

export async function POST(request: Request) {
  const { messages } = await request.json()
  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    tools: [showNotificationDef],
  })
  return toServerSentEventsResponse(stream)
}
```

Client -- pass `.client()` implementation:

```tsx group=notification-tool
// app/chat.tsx (uses showNotificationDef from tools/definitions.ts)
import {
  useChat,
  fetchServerSentEvents,
  createChatClientOptions,
} from '@tanstack/ai-react'
import { clientTools } from '@tanstack/ai-client'
import { useState } from 'react'

function ChatPage() {
  const [toast, setToast] = useState<string | null>(null)

  const showNotification = showNotificationDef.client((input) => {
    setToast(input.message)
    setTimeout(() => setToast(null), 3000)
    return { shown: true }
  })

  const { messages, sendMessage } = useChat(
    createChatClientOptions({
      connection: fetchServerSentEvents('/api/chat'),
      tools: clientTools(showNotification),
    }),
  )

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}
      {messages.map((msg) => (
        <div key={msg.id}>
          {msg.parts.map((part) =>
            part.type === 'text' ? <p>{part.content}</p> : null,
          )}
        </div>
      ))}
    </div>
  )
}
```
