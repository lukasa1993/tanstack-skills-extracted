# Adapter Configuration — Core Patterns: 3. Configuring Reasoning / Thinking

[Guide and prerequisites](./tanstack-ai-core-adapter-configuration-e2c12fef.md) · Published skill · `@tanstack/ai@0.53.0`.

## Core Patterns: 3. Configuring Reasoning / Thinking


Different providers expose reasoning/thinking through their `modelOptions`:

```typescript
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { geminiText } from '@tanstack/ai-gemini'

// OpenAI: reasoning with effort and summary
const openaiStream = chat({
  adapter: openaiText('gpt-5.2'),
  messages,
  modelOptions: {
    reasoning: {
      effort: 'high',
      summary: 'auto',
    },
  },
})

// Anthropic: extended thinking with budget_tokens
const anthropicStream = chat({
  adapter: anthropicText('claude-sonnet-4-6'),
  messages,
  modelOptions: {
    max_tokens: 16000,
    thinking: {
      type: 'enabled',
      budget_tokens: 8000, // must be >= 1024 and < max_tokens
    },
  },
})

// Anthropic: adaptive thinking (claude-sonnet-4-6 and newer)
const adaptiveStream = chat({
  adapter: anthropicText('claude-sonnet-4-6'),
  messages,
  modelOptions: {
    max_tokens: 16000,
    thinking: {
      type: 'adaptive',
    },
    effort: 'high', // 'max' | 'high' | 'medium' | 'low'
  },
})

// Gemini: thinking config with budget or level
const geminiStream = chat({
  adapter: geminiText('gemini-2.5-pro'),
  messages,
  modelOptions: {
    thinkingConfig: {
      includeThoughts: true,
      thinkingBudget: 4096,
    },
  },
})
```
