# Adapter Configuration — Core Patterns: 2. Runtime Adapter Switching

[Guide and prerequisites](./tanstack-ai-core-adapter-configuration-e2c12fef.md) · Published skill · `@tanstack/ai@0.54.0`.

## Core Patterns: 2. Runtime Adapter Switching


Use an adapter factory map to switch providers dynamically based on user
input or configuration:

```typescript
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import type { ModelMessage } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { geminiText } from '@tanstack/ai-gemini'

// Define a map of provider+model to adapter factory calls
const adapters = {
  'openai/gpt-5.2': () => openaiText('gpt-5.2'),
  'anthropic/claude-sonnet-4-6': () => anthropicText('claude-sonnet-4-6'),
  'gemini/gemini-2.5-pro': () => geminiText('gemini-2.5-pro'),
}

function isKnownProviderModel(key: string): key is keyof typeof adapters {
  return key in adapters
}

export function handleChat(
  providerModel: string,
  messages: Array<ModelMessage>,
) {
  if (!isKnownProviderModel(providerModel)) {
    throw new Error(`Unknown provider/model: ${providerModel}`)
  }

  const stream = chat({
    adapter: adapters[providerModel](),
    messages,
  })

  return toServerSentEventsResponse(stream)
}
```
