# Tool Calling — Core Patterns

[Guide and prerequisites](./tanstack-ai-core-tool-calling-e2b5ca3c.md) · Published skill · `@tanstack/ai@0.53.0`.

## Core Patterns

### Generic middleware interrupts

Use `defineInterrupt()` when middleware needs typed data from the client. This
does not replace `needsApproval`. Tool approval asks whether a tool can run.
Generic interrupts ask for application data at a chat lifecycle boundary.

Define the interrupt once. Register it with both `chat({ interrupts })` and
`useChat({ interrupts })`. Emit it only from `onInterruptBoundary`, then read
the typed result in `onInterruptResolution`.

```typescript
import { defineInterrupt, type ChatMiddleware } from '@tanstack/ai'
import { z } from 'zod'

const reviewPlan = defineInterrupt({
  id: 'review-plan',
  payloadSchema: z.object({ title: z.string() }),
  responseSchema: z.object({ approved: z.boolean() }),
})

const reviewMiddleware: ChatMiddleware<unknown, typeof reviewPlan> = {
  onInterruptBoundary(ctx) {
    if (ctx.phase !== 'beforeTools') return
    return {
      interrupts: [
        reviewPlan.interrupt({
          key: 'release-plan',
          reason: 'review-required',
          message: 'Approve this plan?',
          payload: { title: 'Release plan' },
        }),
      ],
    }
  },
  onInterruptResolution(_ctx, resumedInterrupts) {
    for (const result of resumedInterrupts.for(reviewPlan)) {
      if (result.status === 'resolved' && !result.response.approved) {
        return { toolResume: 'stop' }
      }
    }
  },
}
```

Several middleware can request generic interrupts at one boundary. They share
one AG-UI interrupt batch with tool approvals. A continuation starts only after
the client resolves or cancels every bound item. `stop` is more restrictive than
`cancel`, which is more restrictive than `continue`.

Do not emit raw AG-UI interrupt events from middleware. Use the boundary hook
so the engine creates one terminal event and persistence records the batch.

### Pattern 1: Server-Only Tool

Define with `toolDefinition()`, implement with `.server()`, pass to `chat({ tools })`.
The server executes it automatically. The client never runs code for this tool.

```typescript
import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

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
const stream = chat({
  adapter: openaiText('gpt-5.5'),
  messages,
  tools: [getUserData],
})
```

### Pattern 2: Client-Only Tool

Pass the bare definition (no `.server()`) to `chat({ tools })` so the LLM knows
about it. Pass the `.client()` implementation to `useChat` via `clientTools()`.

```typescript
import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

export const showNotificationDef = toolDefinition({
  name: 'show_notification',
  description: 'Display a toast notification to the user',
  inputSchema: z.object({
    message: z.string(),
    type: z.enum(['success', 'error', 'info']),
  }),
  outputSchema: z.object({ shown: z.boolean() }),
})
```

Server -- pass definition only (no execute function):

```typescript
const stream = chat({
  adapter: openaiText('gpt-5.5'),
  messages,
  tools: [showNotificationDef],
})
```

Client -- pass `.client()` implementation:

```typescript
import {
  useChat,
  fetchServerSentEvents,
  clientTools,
  createChatClientOptions,
} from "@tanstack/ai-react";
import { showNotificationDef } from "@/tools/definitions";
import { useState } from "react";

function ChatPage() {
  const [toast, setToast] = useState<string | null>(null);

  const showNotification = showNotificationDef.client((input) => {
    setToast(input.message);
    setTimeout(() => setToast(null), 3000);
    return { shown: true };
  });

  const { messages, sendMessage } = useChat(
    createChatClientOptions({
      connection: fetchServerSentEvents("/api/chat"),
      tools: clientTools(showNotification),
    })
  );

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}
      {messages.map((msg) => (
        <div key={msg.id}>
          {msg.parts.map((part) =>
            part.type === "text" ? <p>{part.content}</p> : null
          )}
        </div>
      ))}
    </div>
  );
}
```

### Pattern 3: Tool with Approval Flow

Set `needsApproval: true` in the definition. Execution pauses with
`RUN_FINISHED.outcome.type === 'interrupt'`. The primary client API is bound
`interrupts` + `resolveInterrupt` / `resolveInterrupts` / `cancel`.
`addToolApprovalResponse` and `pendingInterrupts` remain as deprecated
compatibility shims during migration.

```typescript
import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

export const sendEmailDef = toolDefinition({
  name: 'send_email',
  description: 'Send an email to a recipient',
  inputSchema: z.object({
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
  }),
  outputSchema: z.object({ success: z.boolean(), messageId: z.string() }),
  needsApproval: true,
})

export const sendEmail = sendEmailDef.server(async ({ to, subject, body }) => {
  const result = await emailService.send({ to, subject, body })
  return { success: true, messageId: result.id }
})
```

Server route must forward `resume` / `parentRunId` (via `chatParamsFromRequest`
or equivalent). Client -- render bound interrupts:

```typescript
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";

function ChatPage() {
  const { messages, interrupts, sendMessage } = useChat({
    connection: fetchServerSentEvents("/api/chat"),
  });

  return (
    <div>
      {interrupts.map((interrupt) => {
        if (interrupt.kind !== "tool-approval") return null;
        return (
          <div key={interrupt.id}>
            <p>Approve "{interrupt.toolName}"?</p>
            <pre>{JSON.stringify(interrupt.originalArgs, null, 2)}</pre>
            <button onClick={() => interrupt.resolveInterrupt(true)}>
              Approve
            </button>
            <button onClick={() => interrupt.resolveInterrupt(false)}>
              Deny
            </button>
            <button onClick={() => interrupt.cancel()}>Cancel</button>
          </div>
        );
      })}
      {messages.map((msg) => (
        <div key={msg.id}>
          {msg.parts.map((part) =>
            part.type === "text" ? <p key={part.content}>{part.content}</p> : null
          )}
        </div>
      ))}
    </div>
  );
}
```

Batch all pending approvals with `resolveInterrupts` (void — submission is
async; watch `resuming` / `interruptErrors`):

```typescript
// Payloadless tool-approvals only
resolveInterrupts(true)

// Or per-item:
resolveInterrupts((interrupt) => {
  if (interrupt.kind === 'tool-approval') {
    interrupt.resolveInterrupt(true)
  }
})
```

Migration: `pendingInterrupts` aliases `interrupts`; `addToolApprovalResponse`
forwards to the matching bound approval when present. Prefer the bound methods
above for new code. See `docs/interrupts/`.

### Pattern 4: Lazy Tool Discovery

Set `lazy: true` on rarely-needed tools. The LLM sees their names via a synthetic
`__lazy__tool__discovery__` tool and discovers schemas on demand. Saves tokens.

```typescript
import {
  toolDefinition,
  chat,
  toServerSentEventsResponse,
  maxIterations,
} from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { z } from 'zod'

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

### Tuning the lazy catalog with `lazyToolsConfig`

By default the discovery-tool catalog lists only bare names (`'none'`). Pass
`lazyToolsConfig` to `chat()` to include more context:

```typescript
const stream = chat({
  adapter: openaiText('gpt-5.5'),
  messages,
  tools: [getProducts, compareProducts],
  agentLoopStrategy: maxIterations(20),
  lazyToolsConfig: { includeDescription: 'first-sentence' },
})
```

`includeDescription` values:

| Value              | Catalog entry                                                                            | When to use                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `'none'` (default) | `compareProducts`                                                                        | Smallest prompt; model discovers by name                                           |
| `'first-sentence'` | `compareProducts — Compare two or more products side by side.`                           | Helps the model decide whether to discover without extra tokens                    |
| `'full'`           | `compareProducts — Compare two or more products side by side. Accepts productIds array.` | Use when descriptions are short or the model needs full context to route correctly |

The post-discovery payload always returns the full description and schema regardless of this setting.
