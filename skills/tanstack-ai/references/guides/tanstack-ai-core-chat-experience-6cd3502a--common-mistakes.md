# Chat Experience — Common Mistakes

[Guide and prerequisites](./tanstack-ai-core-chat-experience-6cd3502a.md) · Published skill · `@tanstack/ai@0.53.0`.

## Common Mistakes

### a. CRITICAL: Using Vercel AI SDK patterns (streamText, generateText)

```typescript
// WRONG
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
const result = streamText({ model: openai('gpt-5.5'), messages })

// CORRECT
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
const stream = chat({ adapter: openaiText('gpt-5.5'), messages })
```

### b. CRITICAL: Using Vercel createOpenAI() provider pattern

```typescript
// WRONG
import { createOpenAI } from '@ai-sdk/openai'
const openai = createOpenAI({ apiKey })
streamText({ model: openai('gpt-5.5'), messages })

// CORRECT
import { openaiText } from '@tanstack/ai-openai'
import { chat } from '@tanstack/ai'
chat({ adapter: openaiText('gpt-5.5'), messages })
```

### c. CRITICAL: Using monolithic openai() instead of openaiText()

```typescript
// WRONG
import { openai } from '@tanstack/ai-openai'
chat({ adapter: openai(), model: 'gpt-5.5', messages })

// CORRECT
import { openaiText } from '@tanstack/ai-openai'
chat({ adapter: openaiText('gpt-5.5'), messages })
```

The monolithic `openai()` adapter is deprecated. Use tree-shakeable adapters:
`openaiText()`, `openaiImage()`, `openaiSpeech()`, etc.

### d. HIGH: Using toResponseStream instead of toServerSentEventsResponse

```typescript
// WRONG
import { toResponseStream } from '@tanstack/ai'
return toResponseStream(stream, { abortController })

// CORRECT
import { toServerSentEventsResponse } from '@tanstack/ai'
return toServerSentEventsResponse(stream, { abortController })
```

### e. HIGH: Passing model as separate parameter to chat()

```typescript
// WRONG
chat({ adapter: openaiText(), model: 'gpt-5.5', messages })

// CORRECT
chat({ adapter: openaiText('gpt-5.5'), messages })
```

The model is passed to the adapter factory, not to `chat()`.

### f. HIGH: Passing sampling options at the root of chat()

Sampling options (`temperature`, token limits, `top_p`/`topP`) are **not**
top-level fields on `chat()`. They live inside `modelOptions` using the
provider's native key.

```typescript
// WRONG — temperature/maxTokens are not root options
chat({ adapter, messages, temperature: 0.7, maxTokens: 1000 })

// WRONG — there is no `options` field either
chat({ adapter, messages, options: { temperature: 0.7, maxTokens: 1000 } })

// CORRECT — inside modelOptions, provider-native keys (OpenAI shown)
chat({
  adapter,
  messages,
  modelOptions: { temperature: 0.7, max_output_tokens: 1000 },
})
```

`temperature` is universal across providers; token limits use provider-native
keys (`max_output_tokens` for OpenAI, `max_tokens` for Anthropic/Grok,
`maxOutputTokens` for Gemini, `max_completion_tokens` for Groq,
`maxCompletionTokens` for OpenRouter, and `num_predict` nested under
`modelOptions.options` for Ollama). See ./tanstack-ai-core-adapter-configuration-e2c12fef.md#source-tanstack-ai-core-adapter-configuration.

### g. HIGH: Using providerOptions instead of modelOptions

```typescript
// WRONG
chat({
  adapter,
  messages,
  providerOptions: { responseFormat: { type: 'json_object' } },
})

// CORRECT
chat({
  adapter,
  messages,
  modelOptions: { responseFormat: { type: 'json_object' } },
})
```

### h. HIGH: Implementing custom SSE stream instead of using toServerSentEventsResponse

```typescript
// WRONG
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

// CORRECT
import { toServerSentEventsResponse } from '@tanstack/ai'
return toServerSentEventsResponse(stream, { abortController })
```

`toServerSentEventsResponse` handles SSE formatting, abort signals,
error events (RUN_ERROR), and correct headers automatically.

### i. HIGH: Implementing custom onEnd/onFinish callbacks instead of middleware

```typescript
// WRONG
chat({
  adapter,
  messages,
  onEnd: (result) => {
    trackAnalytics(result)
  },
})

// CORRECT
import type { ChatMiddleware } from '@tanstack/ai'

const analytics: ChatMiddleware = {
  name: 'analytics',
  onFinish(ctx, info) {
    trackAnalytics({ reason: info.finishReason, iterations: ctx.iteration })
  },
  onUsage(ctx, usage) {
    trackTokens(usage.totalTokens)
  },
}

chat({ adapter, messages, middleware: [analytics] })
```

`chat()` has no `onEnd`/`onFinish` option. Use `middleware` for lifecycle events.
See also: ./tanstack-ai-core-middleware-b87affa9.md#source-tanstack-ai-core-middleware.

### j. HIGH: Importing from @tanstack/ai-client instead of framework package

```typescript
// WRONG
import { fetchServerSentEvents } from '@tanstack/ai-client'
import { useChat } from '@tanstack/ai-react'

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
for await (const chunk of stream) {
  if (chunk.type === 'RUN_ERROR') {
    console.error('Stream error:', chunk.error.message)
    break
  }
  if (chunk.type === 'TEXT_MESSAGE_CONTENT') {
    process.stdout.write(chunk.delta)
  }
}
```

If not handled, the UI appears to hang with no feedback.
