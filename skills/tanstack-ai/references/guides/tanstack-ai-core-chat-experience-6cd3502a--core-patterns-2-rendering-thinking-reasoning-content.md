# Chat Experience — Core Patterns: 2. Rendering Thinking/Reasoning Content

[Guide and prerequisites](./tanstack-ai-core-chat-experience-6cd3502a.md) · Published skill · `@tanstack/ai@0.53.0`.

## Core Patterns: 2. Rendering Thinking/Reasoning Content


Models with extended thinking (Claude, Gemini) emit `ThinkingPart` in the message parts array.

```typescript
import type { UIMessage } from '@tanstack/ai-react'

function MessageRenderer({ message }: { message: UIMessage }) {
  return (
    <div>
      {message.parts.map((part, i) => {
        if (part.type === 'thinking') {
          const isComplete = message.parts
            .slice(i + 1)
            .some((p) => p.type === 'text')
          return (
            <details key={i} open={!isComplete}>
              <summary>{isComplete ? 'Thought process' : 'Thinking...'}</summary>
              <pre>{part.content}</pre>
            </details>
          )
        }

        if (part.type === 'text' && part.content) {
          return <p key={i}>{part.content}</p>
        }

        if (part.type === 'tool-call') {
          return (
            <div key={part.id}>
              Tool call: {part.name} ({part.state})
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
```

Server-side, enable thinking via `modelOptions` on the adapter:

```typescript
import { geminiText } from '@tanstack/ai-gemini'

const stream = chat({
  adapter: geminiText('gemini-2.5-flash'),
  messages,
  modelOptions: {
    thinkingConfig: {
      includeThoughts: true,
      thinkingBudget: 100,
    },
  },
})
```
