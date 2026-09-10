# Ai Mcp — Prompts

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.3.10`.

## Prompts

```typescript
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { createMCPClient, mcpPromptToMessages } from '@tanstack/ai-mcp'

const client = await createMCPClient({
  transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
})

// List prompts the server exposes.
const prompts = await client.prompts()

// Get a prompt (with optional arguments).
const prompt = await client.getPrompt('review_code', { language: 'TypeScript' })

// Convert to TanStack ModelMessage[] for use in chat().
const messages = mcpPromptToMessages(prompt)
// messages: ModelMessage[]  (role: 'user' | 'assistant')

const stream = chat({
  adapter: openaiText('gpt-5.5'),
  messages: [...messages, { role: 'user', content: 'Review src/index.ts.' }],
})
```
