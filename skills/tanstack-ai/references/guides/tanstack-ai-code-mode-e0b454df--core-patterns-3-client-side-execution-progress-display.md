# Ai Code Mode — Core Patterns: 3. Client-Side Execution Progress Display

[Guide and prerequisites](./tanstack-ai-code-mode-e0b454df.md) · Published skill · `@tanstack/ai-code-mode@0.4.9`.

## Core Patterns: 3. Client-Side Execution Progress Display


Code Mode emits custom events during sandbox execution. Handle them in `useChat` via `onCustomEvent`.

Events emitted:

| Event                         | When                                 | Key fields                       |
| ----------------------------- | ------------------------------------ | -------------------------------- |
| `code_mode:execution_started` | Sandbox begins                       | `timestamp`, `codeLength`        |
| `code_mode:console`           | Each console.log/error/warn/info     | `level`, `message`, `timestamp`  |
| `code_mode:external_call`     | Before an external\_\* function runs | `function`, `args`, `timestamp`  |
| `code_mode:external_result`   | After successful external\_\* call   | `function`, `result`, `duration` |
| `code_mode:external_error`    | When external\_\* call fails         | `function`, `error`, `duration`  |

```tsx
import { useCallback, useRef, useState } from 'react'
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'

interface VMEvent {
  id: string
  eventType: string
  data: unknown
  timestamp: number
}

export function CodeModeChat() {
  const [toolCallEvents, setToolCallEvents] = useState<
    Map<string, Array<VMEvent>>
  >(new Map())
  const eventIdCounter = useRef(0)

  const handleCustomEvent = useCallback(
    (eventType: string, data: unknown, context: { toolCallId?: string }) => {
      const { toolCallId } = context
      if (!toolCallId) return

      const event: VMEvent = {
        id: `event-${eventIdCounter.current++}`,
        eventType,
        data,
        timestamp: Date.now(),
      }

      setToolCallEvents((prev) => {
        const next = new Map(prev)
        const events = next.get(toolCallId) || []
        next.set(toolCallId, [...events, event])
        return next
      })
    },
    [],
  )

  const { messages, sendMessage, isLoading } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
    onCustomEvent: handleCustomEvent,
  })

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          {message.parts.map((part, index) => {
            if (part.type === 'text') {
              return <p key={index}>{part.content}</p>
            }
            if (
              part.type === 'tool-call' &&
              part.name === 'execute_typescript'
            ) {
              const events = toolCallEvents.get(part.id) || []
              return (
                <div key={part.id}>
                  <pre>{JSON.parse(part.arguments)?.typescriptCode}</pre>
                  {events.map((evt) => (
                    <div key={evt.id}>
                      {evt.eventType}: {JSON.stringify(evt.data)}
                    </div>
                  ))}
                  {part.output && (
                    <pre>{JSON.stringify(part.output, null, 2)}</pre>
                  )}
                </div>
              )
            }
            return null
          })}
        </div>
      ))}
    </div>
  )
}
```

The `onCustomEvent` callback signature is identical across all framework integrations (`@tanstack/ai-react`, `@tanstack/ai-solid`, `@tanstack/ai-vue`, `@tanstack/ai-svelte`):

```typescript
type OnCustomEvent = (
  eventType: string,
  data: unknown,
  context: { toolCallId?: string },
) => void
```

Snippet-specific events (when using `codeModeWithSnippets`):

| Event                      | When                 | Key fields                      |
| -------------------------- | -------------------- | ------------------------------- |
| `code_mode:snippet_call`   | Snippet tool invoked | `snippet`, `input`, `timestamp` |
| `code_mode:snippet_result` | Snippet completed    | `snippet`, `result`, `duration` |
| `code_mode:snippet_error`  | Snippet failed       | `snippet`, `error`, `duration`  |
| `snippet:registered`       | New snippet saved    | `id`, `name`, `description`     |
