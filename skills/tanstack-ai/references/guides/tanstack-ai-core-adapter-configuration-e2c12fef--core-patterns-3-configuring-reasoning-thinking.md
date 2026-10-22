# Adapter Configuration — Core Patterns: 3. Configuring Reasoning / Thinking

[Guide and prerequisites](./tanstack-ai-core-adapter-configuration-e2c12fef.md) · Published skill · `@tanstack/ai@0.71.0`.

## Core Patterns: 3. Configuring Reasoning / Thinking


Set reasoning/thinking with the `reasoning` option on `chat()`. It is the same on every provider, and the types take only the levels of the selected model:

```typescript
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { geminiText } from '@tanstack/ai-gemini'

const messages = [
  { role: 'user' as const, content: 'Plan a database migration.' },
]

// OpenAI: the level goes out as reasoning.effort, with a summary
const openaiStream = chat({
  adapter: openaiText('gpt-5.2'),
  messages,
  reasoning: { level: 'high', summary: true },
})

// Anthropic: extended thinking with a token budget
const anthropicStream = chat({
  adapter: anthropicText('claude-sonnet-4-6'),
  messages,
  modelOptions: { max_tokens: 16000 },
  reasoning: { level: 'high', budgetTokens: 8000 },
})

// Anthropic: adaptive thinking (Sonnet 5, Fable 5, Opus 4.7+) — the level
// goes out as output_config.effort
const adaptiveStream = chat({
  adapter: anthropicText('claude-sonnet-5'),
  messages,
  modelOptions: { max_tokens: 16000 },
  reasoning: 'high', // 'low' | 'medium' | 'high' | 'xhigh' | 'max'
})

// Gemini: a thinking budget on Gemini 2.5, a thinking level on Gemini 3
const geminiStream = chat({
  adapter: geminiText('gemini-2.5-pro'),
  messages,
  reasoning: { level: 'high', budgetTokens: 4096 },
})
```
