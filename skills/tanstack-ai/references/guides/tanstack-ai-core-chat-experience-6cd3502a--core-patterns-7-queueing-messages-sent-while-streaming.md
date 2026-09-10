# Chat Experience — Core Patterns: 7. Queueing Messages Sent While Streaming

[Guide and prerequisites](./tanstack-ai-core-chat-experience-6cd3502a.md) · Published skill · `@tanstack/ai@0.54.0`.

## Core Patterns: 7. Queueing Messages Sent While Streaming


By default, a `sendMessage` call that arrives while a stream is in flight is
**queued** and sent automatically once the run settles **successfully** —
this is a behavior change: such sends used to be silently dropped. Configure
it with the `queue` option on `useChat`:

```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'

const { messages, queue, sendMessage, cancelQueued, isLoading } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
  queue: { whenBusy: 'queue', drain: 'fifo', maxSize: 5, onOverflow: 'reject' },
})
```

- **`whenBusy`** — `'queue'` (default) holds the message until a successful
  settle; `'drop'` ignores the send (never appears in `queue`/`messages`);
  `'interrupt'` aborts the current stream and sends immediately (unlike
  `stop()`, does **not** flush already-queued items — they drain after the
  interrupting send **succeeds**).
- **`drain`** — `'fifo'` (default) sends queued items one at a time in
  order; `'batch'` merges everything queued into a single send once the
  run settles successfully.
- **`maxSize`** / **`onOverflow`** — cap the queue length; `'reject'`
  (default) silently ignores overflow sends (does not throw),
  `'drop-oldest'` evicts the oldest queued item to make room.

The top-level `queue` option also accepts a plain `WhenBusy` string
shorthand (e.g. `queue: 'interrupt'`) or a `QueueStrategy` function for
per-send action control. Strategy form always drains FIFO. Actions use
the `WhenBusy` type.

**Drain vs flush:** queued messages auto-send only after a **successful**
settle. They are **discarded** on stream error/abort of the active
generation, `stop()`, `clear()`, `unsubscribe()`, and `reload()`.
`interrupt` does not flush.

`queue: Array<QueuedMessage>` (`{ id, content, createdAt }`) is separate
from `messages` — render pending sends distinctly and cancel with
`cancelQueued(id)`:

```tsx
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'

function QueuedMessages() {
  const { queue, cancelQueued } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
  })

  return (
    <div>
      {queue.map((q) => (
        <div key={q.id}>
          {typeof q.content === 'string' ? q.content : '[attachment]'}
          <button onClick={() => cancelQueued(q.id)}>Cancel</button>
        </div>
      ))}
    </div>
  )
}
```

Override the configured policy for a single send with the second argument
to `sendMessage`:

```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'

const { sendMessage } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
})

sendMessage('Never mind, do this instead', { whenBusy: 'interrupt' })
```
