# Ai Code Mode — Setup

[Guide and prerequisites](./tanstack-ai-code-mode-e0b454df.md) · Published skill · `@tanstack/ai-code-mode@0.4.9`.

## Setup

Complete Code Mode setup with Node.js isolate driver:

```typescript
import { chat, toServerSentEventsResponse, toolDefinition } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { createCodeModeTool } from '@tanstack/ai-code-mode'
import { createNodeIsolateDriver } from '@tanstack/ai-isolate-node'
import { z } from 'zod'

// Define a tool that code can call
const fetchWeather = toolDefinition({
  name: 'fetchWeather',
  description: 'Get current weather for a city',
  inputSchema: z.object({ city: z.string() }),
  outputSchema: z.object({ temp: z.number(), condition: z.string() }),
}).server(async ({ city }) => {
  const res = await fetch(`https://api.weather.com/${city}`)
  return res.json()
})

// Create code mode tool with Node isolate
const codeModeTool = createCodeModeTool({
  driver: createNodeIsolateDriver({
    memoryLimit: 128,
    timeout: 30000,
  }),
  tools: [fetchWeather],
})

// Use in chat
export async function POST(request: Request) {
  const { messages } = await request.json()

  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    tools: [codeModeTool],
  })

  return toServerSentEventsResponse(stream)
}
```

The recommended higher-level entry point is `createCodeMode()`, which returns both the tool and a matching system prompt:

```typescript
import { chat, toServerSentEventsResponse, toolDefinition } from '@tanstack/ai'
import { createCodeMode } from '@tanstack/ai-code-mode'
import { createNodeIsolateDriver } from '@tanstack/ai-isolate-node'
import { openaiText } from '@tanstack/ai-openai'
import { z } from 'zod'

const fetchWeather = toolDefinition({
  name: 'fetchWeather',
  description: 'Get current weather for a city',
  inputSchema: z.object({ city: z.string() }),
  outputSchema: z.object({ temp: z.number(), condition: z.string() }),
}).server(async ({ city }) => {
  const res = await fetch(`https://api.weather.com/${city}`)
  return res.json()
})

const { tool, systemPrompt } = createCodeMode({
  driver: createNodeIsolateDriver(),
  tools: [fetchWeather],
  timeout: 30_000,
})

export async function POST(request: Request) {
  const { messages } = await request.json()

  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    systemPrompts: ['You are a helpful assistant.', systemPrompt],
    tools: [tool],
    messages,
  })

  return toServerSentEventsResponse(stream)
}
```

`createCodeMode` calls `createCodeModeTool` and `createCodeModeSystemPrompt` internally. The system prompt includes generated TypeScript type stubs for each tool so the LLM writes correct calls.
