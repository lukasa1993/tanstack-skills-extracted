# Adapter Configuration — Core Patterns: 5. Configuring Sampling

[Guide and prerequisites](./tanstack-ai-core-adapter-configuration-e2c12fef.md) · Published skill · `@tanstack/ai@0.54.0`.

## Core Patterns: 5. Configuring Sampling


Sampling controls (`temperature`, token limits, nucleus sampling) are passed
inside `modelOptions` using each provider's **native** key. They are not
top-level fields on `chat()`/`ai()`/`generate()`.

```typescript
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { geminiText } from '@tanstack/ai-gemini'
import { ollamaText } from '@tanstack/ai-ollama'

const messages = [{ role: 'user' as const, content: 'Hello' }]

// OpenAI — native keys
chat({
  adapter: openaiText('gpt-5.2'),
  messages,
  modelOptions: { temperature: 0.7, top_p: 0.9, max_output_tokens: 1000 },
})

// Anthropic
chat({
  adapter: anthropicText('claude-sonnet-4-6'),
  messages,
  modelOptions: { temperature: 0.7, top_p: 0.9, max_tokens: 1000 },
})

// Gemini — camelCase
chat({
  adapter: geminiText('gemini-2.5-pro'),
  messages,
  modelOptions: { temperature: 0.7, topP: 0.9, maxOutputTokens: 1000 },
})

// Ollama — NESTED under modelOptions.options
// (use the `family:tag` id — a bare `llama3.3` falls back to untyped options)
chat({
  adapter: ollamaText('llama3.3:latest'),
  messages,
  modelOptions: {
    options: { temperature: 0.7, top_p: 0.9, num_predict: 1000 },
  },
})
```

Per-provider sampling keys (all live inside `modelOptions`):

| Provider          | Temperature   | Nucleus | Max output tokens                         |
| ----------------- | ------------- | ------- | ----------------------------------------- |
| OpenAI            | `temperature` | `top_p` | `max_output_tokens`                       |
| Anthropic         | `temperature` | `top_p` | `max_tokens`                              |
| Gemini            | `temperature` | `topP`  | `maxOutputTokens`                         |
| Grok (xAI)        | `temperature` | `top_p` | `max_output_tokens`                       |
| Groq              | `temperature` | `top_p` | `max_completion_tokens`                   |
| OpenRouter (chat) | `temperature` | `topP`  | `maxCompletionTokens`                     |
| Ollama            | `temperature` | `top_p` | `num_predict` (nested in `options`)       |
| BytePlus          | `temperature` | `top_p` | `max_tokens` (or `max_completion_tokens`) |

`temperature` is the one key every provider names identically; token limits and
some sampling options use provider-native names. Ollama nests all sampling under
`modelOptions.options`.

> **Anthropic `max_tokens` default:** Anthropic's API _requires_ `max_tokens`,
> so the adapter always sends one. When you omit `modelOptions.max_tokens`, it
> defaults to the selected model's full output ceiling (its `max_output_tokens`
> from model metadata — e.g. 64K for Sonnet, 128K for Opus), not a low constant.
> `max_tokens` is a ceiling, not a reservation (billing is per token generated),
> so leaving it unset is the right default for codegen / agentic / long-form
> output and avoids silent `stop_reason: "max_tokens"` truncation. Set it only to
> cap output below the model ceiling. Other providers treat token limits as
> optional and don't apply this flooring.
