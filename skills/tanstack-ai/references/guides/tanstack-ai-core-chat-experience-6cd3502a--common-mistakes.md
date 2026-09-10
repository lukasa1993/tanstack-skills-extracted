# Chat Experience — Common Mistakes

[Guide and prerequisites](./tanstack-ai-core-chat-experience-6cd3502a.md) · Published skill · `@tanstack/ai@0.54.0`.

## Common Mistakes

### a. CRITICAL: Using Vercel AI SDK patterns (streamText, generateText)

```typescript
// WRONG
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

const messages = [{ role: 'user' as const, content: 'Hello' }]
const result = streamText({ model: openai('gpt-5.6'), messages })
```

```typescript
// CORRECT
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

const messages = [{ role: 'user' as const, content: 'Hello' }]
const stream = chat({ adapter: openaiText('gpt-5.6'), messages })
```

### b. CRITICAL: Using Vercel createOpenAI() provider pattern

```typescript
// WRONG
import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const messages = [{ role: 'user' as const, content: 'Hello' }]
const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
streamText({ model: openai('gpt-5.6'), messages })
```

```typescript
// CORRECT
import { openaiText } from '@tanstack/ai-openai'
import { chat } from '@tanstack/ai'

const messages = [{ role: 'user' as const, content: 'Hello' }]
chat({ adapter: openaiText('gpt-5.6'), messages })
```

### c. CRITICAL: Using monolithic openai() instead of openaiText()

```typescript ignore
// WRONG — `openai()` is no longer exported from @tanstack/ai-openai
import { openai } from '@tanstack/ai-openai'
chat({ adapter: openai(), model: 'gpt-5.6', messages })
```

```typescript
// CORRECT
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

const messages = [{ role: 'user' as const, content: 'Hello' }]
chat({ adapter: openaiText('gpt-5.6'), messages })
```

The monolithic `openai()` adapter no longer exists. Use tree-shakeable adapters:
`openaiText()`, `openaiImage()`, `openaiSpeech()`, etc.

### d. HIGH: Using toResponseStream instead of toServerSentEventsResponse

```typescript ignore
// WRONG — toResponseStream does not exist
import { toResponseStream } from '@tanstack/ai'
return toResponseStream(stream, { abortController })
```

```typescript
// CORRECT
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

export async function POST(request: Request) {
  const { messages } = await request.json()
  const abortController = new AbortController()
  const stream = chat({
    adapter: openaiText('gpt-5.6'),
    messages,
    abortController,
  })
  return toServerSentEventsResponse(stream, { abortController })
}
```

### e. HIGH: Passing model as separate parameter to chat()

```typescript ignore
// WRONG
chat({ adapter: openaiText(), model: 'gpt-5.6', messages })
```

```typescript
// CORRECT
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

const messages = [{ role: 'user' as const, content: 'Hello' }]
chat({ adapter: openaiText('gpt-5.6'), messages })
```

The model is passed to the adapter factory, not to `chat()`.

### f. HIGH: Passing sampling options at the root of chat()

Sampling options (`temperature`, token limits, `top_p`/`topP`) are **not**
top-level fields on `chat()`. They live inside `modelOptions` using the
provider's native key.

```typescript ignore
// WRONG — temperature/maxTokens are not root options
chat({ adapter, messages, temperature: 0.7, maxTokens: 1000 })

// WRONG — there is no `options` field either
chat({ adapter, messages, options: { temperature: 0.7, maxTokens: 1000 } })
```

```typescript
// CORRECT — inside modelOptions, provider-native keys (OpenAI shown)
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

const messages = [{ role: 'user' as const, content: 'Hello' }]

chat({
  adapter: openaiText('gpt-5.6'),
  messages,
  modelOptions: { temperature: 0.7, max_output_tokens: 1000 },
})
```

`temperature` works on most models (Claude 5 models reject sampling
parameters; see ./tanstack-ai-core-adapter-configuration-e2c12fef.md#source-tanstack-ai-core-adapter-configuration). Token limits use provider-native
keys (`max_output_tokens` for OpenAI, `max_tokens` for Anthropic/Grok,
`maxOutputTokens` for Gemini, `max_completion_tokens` for Groq,
`maxCompletionTokens` for OpenRouter, and `num_predict` nested under
`modelOptions.options` for Ollama). See ./tanstack-ai-core-adapter-configuration-e2c12fef.md#source-tanstack-ai-core-adapter-configuration.

### g. HIGH: Using providerOptions instead of modelOptions

```typescript ignore
// WRONG
chat({
  adapter,
  messages,
  providerOptions: { text: { format: { type: 'json_object' } } },
})
```

```typescript
// CORRECT — provider-native option under modelOptions (OpenAI Responses shown)
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

const messages = [{ role: 'user' as const, content: 'Hello' }]

chat({
  adapter: openaiText('gpt-5.6'),
  messages,
  modelOptions: { text: { format: { type: 'json_object' } } },
})
```

### h. HIGH: Implementing custom SSE stream instead of using toServerSentEventsResponse

```typescript
// WRONG
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

export async function POST(request: Request) {
  const { messages } = await request.json()
  const stream = chat({ adapter: openaiText('gpt-5.6'), messages })

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      for await (const chunk of stream) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })
  return new Response(readable, {
    headers: { 'Content-Type': 'text/event-stream' },
  })
}
```

```typescript
// CORRECT
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

export async function POST(request: Request) {
  const { messages } = await request.json()
  const abortController = new AbortController()
  const stream = chat({
    adapter: openaiText('gpt-5.6'),
    messages,
    abortController,
  })
  return toServerSentEventsResponse(stream, { abortController })
}
```

`toServerSentEventsResponse` handles SSE formatting, abort signals,
error events (RUN_ERROR), and correct headers automatically.

### i. HIGH: Implementing custom onEnd/onFinish callbacks instead of middleware

```typescript ignore
// WRONG — chat() has no onEnd/onFinish option
chat({
  adapter,
  messages,
  onEnd: (result) => {
    trackAnalytics(result)
  },
})
```

```typescript
// CORRECT
import { chat } from '@tanstack/ai'
import type { ChatMiddleware } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { trackAnalytics, trackTokens } from './analytics'

const analytics: ChatMiddleware = {
  name: 'analytics',
  onFinish(ctx, info) {
    trackAnalytics({ reason: info.finishReason, iterations: ctx.iteration })
  },
  onUsage(ctx, usage) {
    trackTokens(usage.totalTokens)
  },
}

const messages = [{ role: 'user' as const, content: 'Hello' }]
chat({ adapter: openaiText('gpt-5.6'), messages, middleware: [analytics] })
```

`chat()` has no `onEnd`/`onFinish` option. Use `middleware` for lifecycle events.
See also: ./tanstack-ai-core-middleware-b87affa9.md#source-tanstack-ai-core-middleware.

### j. HIGH: Importing from @tanstack/ai-client instead of framework package

```typescript
// WRONG
import { fetchServerSentEvents } from '@tanstack/ai-client'
import { useChat } from '@tanstack/ai-react'
```

```typescript
// CORRECT
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
```

Framework packages re-export everything needed from `@tanstack/ai-client`.
Import from `@tanstack/ai-client` only in vanilla JS (no framework).

### k. MEDIUM: Not handling RUN_ERROR events in streaming context

Streaming errors arrive as `RUN_ERROR` events in the stream, not as thrown
exceptions. The `useChat` hook surfaces these via the `error` state and
`onError` callback. If you consume the stream manually (without `useChat`),
check for `RUN_ERROR` chunks:

```typescript
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

const messages = [{ role: 'user' as const, content: 'Hello' }]
const stream = chat({ adapter: openaiText('gpt-5.6'), messages })

for await (const chunk of stream) {
  if (chunk.type === 'RUN_ERROR') {
    console.error('Stream error:', chunk.message)
    break
  }
  if (chunk.type === 'TEXT_MESSAGE_CONTENT') {
    process.stdout.write(chunk.delta)
  }
}
```

If not handled, the UI appears to hang with no feedback.
