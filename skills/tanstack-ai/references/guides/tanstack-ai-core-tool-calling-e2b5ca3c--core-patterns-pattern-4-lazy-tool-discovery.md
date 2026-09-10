# Tool Calling — Core Patterns: Pattern 4: Lazy Tool Discovery

[Guide and prerequisites](./tanstack-ai-core-tool-calling-e2b5ca3c.md) · Published skill · `@tanstack/ai@0.54.0`.

## Core Patterns: Pattern 4: Lazy Tool Discovery


Set `lazy: true` on rarely-needed tools. The LLM sees their names via a synthetic
`__lazy__tool__discovery__` tool and discovers schemas on demand. Saves tokens.

```typescript group=lazy-tools
import {
  toolDefinition,
  chat,
  toServerSentEventsResponse,
  maxIterations,
  type ModelMessage,
} from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { z } from 'zod'
import { db } from './db'

const getProductsDef = toolDefinition({
  name: 'getProducts',
  description: 'List all products',
  inputSchema: z.object({}),
  outputSchema: z.array(
    z.object({ id: z.number(), name: z.string(), price: z.number() }),
  ),
})
const getProducts = getProductsDef.server(async () => db.products.findMany())

const compareProductsDef = toolDefinition({
  name: 'compareProducts',
  description: 'Compare two or more products side by side',
  inputSchema: z.object({ productIds: z.array(z.number()).min(2) }),
  lazy: true, // not sent to LLM upfront
})
const compareProducts = compareProductsDef.server(async ({ productIds }) => {
  return db.products.findMany({ where: { id: { in: productIds } } })
})

export async function POST(request: Request) {
  const { messages } = await request.json()
  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    tools: [getProducts, compareProducts],
    // maxIterations bounds model turns, not tool calls. For tool budgets,
    // use middleware onBeforeToolCall + onShouldContinue (see agentic-cycle docs).
    agentLoopStrategy: maxIterations(20),
  })
  return toServerSentEventsResponse(stream)
}
```

The LLM sees `getProducts` and `__lazy__tool__discovery__` upfront.
To compare, it first calls `__lazy__tool__discovery__({ toolNames: ["compareProducts"] })`,
gets the full schema, then calls `compareProducts` directly.
Once discovered, a tool stays available for the conversation.
When all lazy tools are discovered, the discovery tool is removed automatically.
