# Build Cloudflare Adapter — 3. Bindings are per-request

[Guide and prerequisites](./tanstack-ai-persistence-build-cloudflare-adapter-64163c5a.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

## 3. Bindings are per-request

This is the one rule that separates Cloudflare from every other backend. A D1
binding does not exist at module scope, so `chat-persistence.ts` **must export a
factory**, not a const:

```ts ignore
import { defineAIPersistence } from '@tanstack/ai-persistence'
import type { ChatPersistence } from '@tanstack/ai-persistence'

/** Call inside a request handler — `env` is not available at module scope. */
export function chatPersistence(d1: D1Database): ChatPersistence {
  return defineAIPersistence({
    stores: {
      messages: createMessageStore(d1),
      runs: createRunStore(d1),
      interrupts: createInterruptStore(d1),
      metadata: createMetadataStore(d1),
    },
  })
}
```

Annotate `ChatPersistence` — bare `AIPersistence` is the all-optional bag and
`withPersistence` rejects it. Building it per request is cheap: the stores hold
no state beyond the binding.
