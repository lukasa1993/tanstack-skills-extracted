# Adapter Configuration — Core Patterns: 6. OpenAI-Compatible Providers

[Guide and prerequisites](./tanstack-ai-core-adapter-configuration-e2c12fef.md) · Published skill · `@tanstack/ai@0.53.0`.

## Core Patterns: 6. OpenAI-Compatible Providers


Any provider that implements the OpenAI **Chat Completions** API (DeepSeek,
Moonshot/Kimi, Together, Fireworks, Cerebras, Qwen/DashScope, Perplexity,
NVIDIA NIM, LM Studio, etc.) can be used through the generic
`openaiCompatible` factory from `@tanstack/ai-openai/compatible` — no
dedicated package required.

```typescript
import { openaiCompatible } from '@tanstack/ai-openai/compatible'
import { createModel } from '@tanstack/ai'

// Provider-factory: configure baseURL + apiKey + models ONCE,
// then select a model per call (the model arg is a type-safe union).
const deepseek = openaiCompatible({
  name: 'deepseek', // optional label for devtools/errors (default 'openai-compatible')
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY!,
  models: [
    'deepseek-chat', // bare string → optimistic defaults: text/image in, streaming, tools, structured output
    createModel('deepseek-reasoner', {
      // rich def → precise per-model capabilities
      input: ['text'],
      features: ['reasoning', 'structured_outputs'],
    }),
  ],
})

chat({ adapter: deepseek('deepseek-chat'), messages })
chat({ adapter: deepseek('deepseek-reasoner'), messages })
```

`config` also accepts any OpenAI SDK `ClientOptions` (notably `defaultHeaders`
and `defaultQuery`) for providers that need extra auth headers or query params.

For a single model, use the one-shot helper:

```typescript
import { openaiCompatibleText } from '@tanstack/ai-openai/compatible'

chat({
  adapter: openaiCompatibleText('deepseek-chat', {
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY!,
  }),
  messages,
})
```

Pass `api: 'responses'` to target the OpenAI **Responses** API instead of Chat
Completions (only for the rare compatible provider that implements it, e.g.
Azure OpenAI); the default is `'chat-completions'`, which is what nearly all
compatible providers speak.

> Verify the provider's current `baseURL` and model ids against its live docs —
> they drift. See `docs/adapters/openai-compatible.md` for the full provider table.
