# Adapter Configuration — Core Patterns: 2. Runtime Adapter Switching

[Guide and prerequisites](./tanstack-ai-core-adapter-configuration-e2c12fef.md) · Published skill · `@tanstack/ai@0.53.0`.

## Core Patterns: 2. Runtime Adapter Switching


Use an adapter factory map to switch providers dynamically based on user
input or configuration:

```typescript
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import type { TextAdapter } from '@tanstack/ai/adapters'
import { openaiText } from '@tanstack/ai-openai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { geminiText } from '@tanstack/ai-gemini'

// Define a map of provider+model to adapter factory calls
const adapters: Record<string, () => TextAdapter> = {
  'openai/gpt-5.2': () => openaiText('gpt-5.2'),
  'anthropic/claude-sonnet-4-6': () => anthropicText('claude-sonnet-4-6'),
  'gemini/gemini-2.5-pro': () => geminiText('gemini-2.5-pro'),
}

export function handleChat(providerModel: string, messages: Array<any>) {
  const createAdapter = adapters[providerModel]
  if (!createAdapter) {
    throw new Error(`Unknown provider/model: ${providerModel}`)
  }

  const stream = chat({
    adapter: createAdapter(),
    messages,
  })

  return toServerSentEventsResponse(stream)
}
```
