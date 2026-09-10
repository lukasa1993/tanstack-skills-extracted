# Tool Calling — Core Patterns: Pattern 3: Tool with Approval Flow

[Guide and prerequisites](./tanstack-ai-core-tool-calling-e2b5ca3c.md) · Published skill · `@tanstack/ai@0.54.0`.

## Core Patterns: Pattern 3: Tool with Approval Flow


Set `needsApproval: true` in the definition. Execution pauses with
`RUN_FINISHED.outcome.type === 'interrupt'`. The primary client API is bound
`interrupts` + `resolveInterrupt` / `resolveInterrupts` / `cancel`.
`addToolApprovalResponse` and `pendingInterrupts` remain as deprecated
compatibility shims during migration.

```typescript group=email-approval
// tools/email.ts
import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'
import { emailService } from './email-service'

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

```tsx group=email-approval
// app/chat.tsx (registers sendEmailDef so the approval interrupt is typed)
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'

function ChatPage() {
  const { messages, interrupts, sendMessage } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
    tools: [sendEmailDef],
  })

  return (
    <div>
      {interrupts.map((interrupt) => {
        if (interrupt.kind !== 'tool-approval') return null
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
        )
      })}
      {messages.map((msg) => (
        <div key={msg.id}>
          {msg.parts.map((part) =>
            part.type === 'text' ? (
              <p key={part.content}>{part.content}</p>
            ) : null,
          )}
        </div>
      ))}
    </div>
  )
}
```

Batch all pending approvals with `resolveInterrupts` (void — submission is
async; watch `resuming` / `interruptErrors`):

```tsx group=email-approval
function ApproveAllButton() {
  const { resolveInterrupts, resuming } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
    tools: [sendEmailDef],
  })

  // Payloadless tool-approvals only
  const approveAll = () => resolveInterrupts(true)

  // Or per-item:
  const approveEach = () =>
    resolveInterrupts((interrupt) => {
      if (interrupt.kind === 'tool-approval') {
        interrupt.resolveInterrupt(true)
      }
    })

  return (
    <>
      <button disabled={resuming} onClick={approveAll}>
        Approve all
      </button>
      <button disabled={resuming} onClick={approveEach}>
        Approve each
      </button>
    </>
  )
}
```

Migration: `pendingInterrupts` aliases `interrupts`; `addToolApprovalResponse`
forwards to the matching bound approval when present. Prefer the bound methods
above for new code. See `docs/interrupts/`.
