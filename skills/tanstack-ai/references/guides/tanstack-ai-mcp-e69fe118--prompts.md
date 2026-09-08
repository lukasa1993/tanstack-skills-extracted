# Ai Mcp — Prompts

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.3.9`.

## Prompts

```typescript
// List prompts the server exposes.
const prompts = await client.prompts()

// Get a prompt (with optional arguments).
const prompt = await client.getPrompt('review_code', { language: 'TypeScript' })

// Convert to TanStack ModelMessage[] for use in chat().
import { mcpPromptToMessages } from '@tanstack/ai-mcp'

const messages = mcpPromptToMessages(prompt)
// messages: ModelMessage[]  (role: 'user' | 'assistant')

const stream = chat({
  adapter: openaiText('gpt-5.5'),
  messages: [...messages, ...userMessages],
})
```
