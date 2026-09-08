# Tanstack Ai Memory Hindsight

<a id="source-tanstack-ai-memory-hindsight"></a>

Published skill · `@tanstack/ai-memory@0.1.10`.

[Topic index](../memory.md) · [Source provenance](../SOURCES.md)

# Hindsight Memory Adapter

Hosted `recall`/`save` adapter backed by Hindsight. Hindsight owns extraction and
ranking server-side, buckets memory into per-conversation "banks"
(`{tenantId|_}__{user}__{threadId}`), and — uniquely — exposes LLM **tools** through `recall` so the
model can retain/recall/reflect directly.

## Setup

```ts
import { memoryMiddleware } from '@tanstack/ai-memory'
import { hindsight } from '@tanstack/ai-memory/hindsight'

const memory = hindsight({ user: currentUserId }) // baseUrl defaults to HINDSIGHT_URL

memoryMiddleware({ adapter: memory, scope })
```

`@vectorize-io/hindsight-client` is an **optional peer dependency**, loaded lazily on
first use — install it where you use `hindsight()`.

## Options

- `user` — durable user id for the bank key (falls back to `scope.userId`).
- `baseUrl` — Hindsight server URL (default `HINDSIGHT_URL` or `http://localhost:8888`).
- `budget` — recall budget: `'low' | 'mid' | 'high'` (default `'mid'`).
- `onToolRetain` / `onToolRecall` — callbacks fired when the model uses the memory tools.

**Scope fields:** bank id is `{tenantId|_}__{user}__{threadId}`. `namespace` is ignored.

## Tools

`recall` returns `hindsight_retain`, `hindsight_recall`, and `hindsight_reflect` in its
`tools` plus a `toolGuidance` block. `memoryMiddleware` merges them into the run so the
model can manage long-term memory itself.
