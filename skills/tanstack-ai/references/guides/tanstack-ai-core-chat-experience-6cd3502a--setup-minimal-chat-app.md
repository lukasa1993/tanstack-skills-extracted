# Chat Experience — Setup — Minimal Chat App

[Guide and prerequisites](./tanstack-ai-core-chat-experience-6cd3502a.md) · Published skill · `@tanstack/ai@0.53.0`.

## Setup — Minimal Chat App

### Server: API Route (TanStack Start)

```typescript
// src/routes/api.chat.ts
import { createFileRoute } from '@tanstack/react-router'
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const abortController = new AbortController()
        const body = await request.json()
        const { messages } = body

        const stream = chat({
          adapter: openaiText('gpt-5.5'),
          messages,
          systemPrompts: ['You are a helpful assistant.'],
          abortController,
        })

        return toServerSentEventsResponse(stream, { abortController })
      },
    },
  },
})
```

### Client: React Component

```typescript
// src/routes/index.tsx
import { useState } from 'react'
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
import type { UIMessage } from '@tanstack/ai-react'

function ChatPage() {
  const [input, setInput] = useState('')

  const { messages, sendMessage, isLoading, error, stop } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
  })

  const handleSubmit = () => {
    if (!input.trim()) return
    sendMessage(input.trim())
    setInput('')
  }

  return (
    <div>
      <div>
        {messages.map((message: UIMessage) => (
          <div key={message.id}>
            <strong>{message.role}:</strong>
            {message.parts.map((part, i) => {
              if (part.type === 'text') {
                return <p key={i}>{part.content}</p>
              }
              return null
            })}
          </div>
        ))}
      </div>

      {error && <div>Error: {error.message}</div>}

      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          disabled={isLoading}
          placeholder="Type a message..."
        />
        {isLoading ? (
          <button onClick={stop}>Stop</button>
        ) : (
          <button onClick={handleSubmit} disabled={!input.trim()}>
            Send
          </button>
        )}
      </div>
    </div>
  )
}
```

Vue/Solid/Svelte/Preact have identical patterns with different hook imports
(e.g., `import { useChat } from '@tanstack/ai-solid'`).
