# Adapter Configuration — Setup

[Guide and prerequisites](./tanstack-ai-core-adapter-configuration-e2c12fef.md) · Published skill · `@tanstack/ai@0.53.0`.

## Setup

Create an adapter and use it with `chat()`:

```typescript
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

const stream = chat({
  adapter: openaiText('gpt-5.2'),
  messages,
  modelOptions: {
    temperature: 0.7,
    max_output_tokens: 1000,
  },
})

return toServerSentEventsResponse(stream)
```

The adapter factory function takes the model name as a string literal and an
optional config object (API key, base URL, etc.). The model name is passed
into the factory, not into `chat()`.

Sampling options (`temperature`, token limits, `top_p`/`topP`, etc.) live
inside `modelOptions` using each provider's native key — they are **not**
top-level options on `chat()`. See the per-provider table in
[Configuring Sampling](./tanstack-ai-core-adapter-configuration-e2c12fef.md#5-configuring-sampling) below.
