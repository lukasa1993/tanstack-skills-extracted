# Ai Code Mode — Core Patterns: 2. Adding Persistent Snippets with codeModeWithSnippets()

[Guide and prerequisites](./tanstack-ai-code-mode-e0b454df.md) · Published skill · `@tanstack/ai-code-mode@0.4.9`.

## Core Patterns: 2. Adding Persistent Snippets with codeModeWithSnippets()


Snippets let the LLM save reusable code snippets. On future requests, relevant snippets are loaded and exposed as callable tools.

```typescript
import {
  chat,
  maxIterations,
  toServerSentEventsResponse,
  toolDefinition,
} from '@tanstack/ai'
import { createNodeIsolateDriver } from '@tanstack/ai-isolate-node'
import {
  codeModeWithSnippets,
  createDefaultTrustStrategy,
} from '@tanstack/ai-code-mode-snippets'
import { createFileSnippetStorage } from '@tanstack/ai-code-mode-snippets/storage'
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

// Trust strategies control how snippets earn trust through executions
// Default (createDefaultTrustStrategy): untrusted -> provisional (10+ runs, >=90%) -> trusted (100+ runs, >=95%)
// Relaxed (createRelaxedTrustStrategy): untrusted -> provisional (3+ runs, >=80%) -> trusted (10+ runs, >=90%)
// Always trusted (createAlwaysTrustedStrategy): immediately trusted (dev/testing)
// Custom (createCustomTrustStrategy): configurable thresholds
const trustStrategy = createDefaultTrustStrategy()

// Storage options: file system (production) or memory (testing)
const storage = createFileSnippetStorage({
  directory: './.snippets',
  trustStrategy,
})

const driver = createNodeIsolateDriver()

export async function POST(request: Request) {
  const { messages } = await request.json()

  // High-level API: automatic LLM-based snippet selection
  const { toolsRegistry, systemPrompt } = await codeModeWithSnippets({
    config: {
      driver,
      tools: [fetchWeather],
      timeout: 60_000,
      memoryLimit: 128,
    },
    adapter: openaiText('gpt-5-mini'), // cheap model for snippet selection
    snippets: {
      storage,
      maxSnippetsInContext: 5,
    },
    messages,
  })

  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    tools: toolsRegistry.getTools(),
    messages,
    systemPrompts: ['You are a helpful assistant.', systemPrompt],
    agentLoopStrategy: maxIterations(15),
  })

  return toServerSentEventsResponse(stream)
}
```

The registry includes: `execute_typescript`, `search_snippets`, `get_snippet`, `register_snippet`, and one tool per selected snippet.

Custom trust strategy example:

```typescript
import { createCustomTrustStrategy } from '@tanstack/ai-code-mode-snippets'

const strategy = createCustomTrustStrategy({
  initialLevel: 'untrusted',
  provisionalThreshold: { executions: 5, successRate: 0.85 },
  trustedThreshold: { executions: 50, successRate: 0.95 },
})
```

Storage implementations:

```typescript
// File storage (production) -- persists snippets as files on disk
import { createFileSnippetStorage } from '@tanstack/ai-code-mode-snippets/storage'
const fileStorage = createFileSnippetStorage({ directory: './.snippets' })

// Memory storage (testing) -- in-memory, lost on restart
import { createMemorySnippetStorage } from '@tanstack/ai-code-mode-snippets/storage'
const memStorage = createMemorySnippetStorage()
```
