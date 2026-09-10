# Tool Calling — Core Patterns: Pattern 1: Server-Only Tool

[Guide and prerequisites](./tanstack-ai-core-tool-calling-e2b5ca3c.md) · Published skill · `@tanstack/ai@0.54.0`.

## Core Patterns: Pattern 1: Server-Only Tool


Define with `toolDefinition()`, implement with `.server()`, pass to `chat({ tools })`.
The server executes it automatically. The client never runs code for this tool.

```typescript
import { chat, toolDefinition, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { z } from 'zod'
import { db } from './db'

const getUserDataDef = toolDefinition({
  name: 'get_user_data',
  description: 'Look up user by ID',
  inputSchema: z.object({
    userId: z.string().meta({ description: "The user's ID" }),
  }),
  outputSchema: z.object({ name: z.string(), email: z.string() }),
})

const getUserData = getUserDataDef.server(async ({ userId }) => {
  const user = await db.users.findUnique({ where: { id: userId } })
  return { name: user.name, email: user.email }
})

// In your route handler:
export async function POST(request: Request) {
  const { messages } = await request.json()
  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    tools: [getUserData],
  })
  return toServerSentEventsResponse(stream)
}
```
