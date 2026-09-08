# Custom Backend Integration — Setup

[Guide and prerequisites](./tanstack-ai-core-custom-backend-integration-0c016192.md) · Published skill · `@tanstack/ai@0.53.0`.

## Setup

Connect `useChat` to a custom SSE backend with auth headers:

```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'

function Chat() {
  const { messages, sendMessage, isLoading } = useChat({
    connection: fetchServerSentEvents('https://my-api.com/chat', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  })

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>
          <strong>{msg.role}:</strong>
          {msg.parts.map((part, i) => {
            if (part.type === 'text') {
              return <p key={i}>{part.content}</p>
            }
            return null
          })}
        </div>
      ))}
      <button onClick={() => sendMessage('Hello')}>Send</button>
    </div>
  )
}
```

Both `fetchServerSentEvents` and `fetchHttpStream` accept a static URL string
or a function returning a string (evaluated per request), and a static options
object or a sync/async function returning options (also evaluated per request).
This allows dynamic auth tokens and URLs without re-creating the adapter.
