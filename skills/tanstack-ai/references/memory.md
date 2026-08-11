# Memory

Memory architecture and memory-provider adapters.

<a id="source-tanstack-ai-memory"></a>

## Tanstack Ai Memory

Source: `tanstack-ai-memory`.

## TanStack AI Memory Middleware

Use this when adding **server-side memory** to a `chat()` call. Everything lives in
`@tanstack/ai-memory`. A memory adapter is a single contract with two verbs — `recall`
and `save` — and the middleware is thin: it recalls into the system prompt before the
model runs and defers `save` after the turn finishes.

### When to reach for it

- A user expects "remember what I told you last time."
- Per-user or per-thread context that must survive across sessions.
- A hosted memory service (mem0, Honcho, Hindsight).

Do NOT use this just to keep recent messages — that's the `messages` array on `chat()`.
Memory is for cross-turn / cross-session recall, not within-turn history.

### Wire it up

```ts
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { memoryMiddleware } from '@tanstack/ai-memory'
import { inMemory } from '@tanstack/ai-memory/in-memory'

const memory = inMemory() // dev/tests only — see the in-memory skill

const stream = chat({
  adapter: openaiText('gpt-5.5'),
  messages,
  context: { session }, // attached by your auth middleware
  middleware: [
    memoryMiddleware({
      adapter: memory,
      // Derive scope server-side from trusted session state.
      scope: (ctx) => {
        const session = getSession(ctx)
        return { threadId: session.threadId, userId: session.userId }
      },
    }),
  ],
})
```

`memoryMiddleware` options: `adapter`, `scope` (static or a function of `ctx`),
`role` (`'recall+save'` default, or `'save-only'`), and `onRecall` / `onSave` telemetry
callbacks.

### The contract

```ts
interface MemoryAdapter {
  id: string
  recall(scope, query): Promise<RecallResult> // { systemPrompt, fragments?, tools?, toolGuidance? }
  save(scope, turn): Promise<Array<SaveReceipt>> // turn = { user, assistant }; extraction lives HERE
  inspect?(scope): Promise<MemorySnapshot> // optional (devtools)
  listFacts?(scope): Promise<Array<MemoryFact>> // optional (devtools)
}
```

- `recall` decides relevance and renders a `systemPrompt`; it may also return `tools` +
  `toolGuidance` to hand the model direct control of memory (hindsight does this).
- `save` owns extraction — turning the raw turn into whatever gets persisted.

### Scope security

`MemoryScope` is an alias of the shared `Scope` type from `@tanstack/ai`:
`{ threadId, userId?, tenantId?, namespace? }`. It is the isolation boundary. **Never
trust a client-supplied `userId`/`threadId`.** Resolve scope server-side from
session/auth and pass the validated session through `chat({ context: { session } })`. If
you accept a thread id from the request body, validate it belongs to the session user
BEFORE using it.

### Adapters

- `inMemory()` / `redis()` — exact match on `threadId` + optional `userId`/`tenantId`
  (`namespace` ignored). Redis index keys include all three segments.
- `hindsight()` — bank `{tenant|_}__{user}__{threadId}`.
- `mem0()` — `user_id` + `run_id` (`threadId`); no `tenantId`.
- `honcho()` — session `{tenant|_}__{threadId}`; peer tenant-prefixed when set.
- Custom — implement `recall`/`save` and run `@tanstack/ai-memory/tests/contract`.

### Failure modes

Memory failures are non-fatal: a throwing `recall` or `save` emits `memory:error` and
the run continues with degraded memory. Streaming is never blocked; a failed save never
fails the turn.

### Devtools

Five events on `aiEventClient` (from `@tanstack/ai-event-client`):
`memory:retrieve:started` / `:completed`, `memory:persist:started` / `:completed`,
`memory:error` (`phase: 'recall' | 'save'`). Payloads carry the adapter id and
fragment/receipt counts, not full memory text. Error events include `scope` only
when it was already resolved; if the resolver threw, `scope` is omitted.

<a id="source-tanstack-ai-memory-hindsight"></a>

## Tanstack Ai Memory Hindsight

Source: `tanstack-ai-memory-hindsight`.

## Hindsight Memory Adapter

Hosted `recall`/`save` adapter backed by Hindsight. Hindsight owns extraction and
ranking server-side, buckets memory into per-conversation "banks"
(`{tenantId|_}__{user}__{threadId}`), and — uniquely — exposes LLM **tools** through `recall` so the
model can retain/recall/reflect directly.

### Setup

```ts
import { memoryMiddleware } from '@tanstack/ai-memory'
import { hindsight } from '@tanstack/ai-memory/hindsight'

const memory = hindsight({ user: currentUserId }) // baseUrl defaults to HINDSIGHT_URL

memoryMiddleware({ adapter: memory, scope })
```

`@vectorize-io/hindsight-client` is an **optional peer dependency**, loaded lazily on
first use — install it where you use `hindsight()`.

### Options

- `user` — durable user id for the bank key (falls back to `scope.userId`).
- `baseUrl` — Hindsight server URL (default `HINDSIGHT_URL` or `http://localhost:8888`).
- `budget` — recall budget: `'low' | 'mid' | 'high'` (default `'mid'`).
- `onToolRetain` / `onToolRecall` — callbacks fired when the model uses the memory tools.

**Scope fields:** bank id is `{tenantId|_}__{user}__{threadId}`. `namespace` is ignored.

### Tools

`recall` returns `hindsight_retain`, `hindsight_recall`, and `hindsight_reflect` in its
`tools` plus a `toolGuidance` block. `memoryMiddleware` merges them into the run so the
model can manage long-term memory itself.

<a id="source-tanstack-ai-memory-honcho"></a>

## Tanstack Ai Memory Honcho

Source: `tanstack-ai-memory-honcho`.

## Honcho Memory Adapter

Hosted `recall`/`save` adapter backed by Honcho. Honcho models memory as peers
exchanging messages in a session; `recall` returns a **synthesized dialectic answer**
over the user peer's representation (so there are no discrete fragments), and `save`
appends the turn's messages to the session.

### Setup

```ts
import { memoryMiddleware } from '@tanstack/ai-memory'
import { honcho } from '@tanstack/ai-memory/honcho'

const memory = honcho({ user: currentUserId }) // baseURL defaults to HONCHO_URL

memoryMiddleware({ adapter: memory, scope })
```

`@honcho-ai/sdk` is an **optional peer dependency**, loaded lazily on first use — install
it where you use `honcho()`.

### Options

- `user` — user peer id (falls back to `scope.userId`, then `'demo-user'`).
- `baseURL` — Honcho server URL (default `HONCHO_URL` or `http://localhost:8001`).
- `workspaceId` — default `HONCHO_APP_NAME` or `'ai-memory'`.
- `apiKey` — default `HONCHO_API_KEY`.
- `assistantId` — assistant peer id (default `'assistant'`).

**Scope fields:** session key = `{tenantId|_}__{threadId}`; peer id is
`{tenantId}__{user}` when `tenantId` is set, otherwise `user` / `scope.userId`.
`namespace` is ignored.

`recall` calls the user peer's dialectic `chat()` and injects the answer as the system
prompt; Honcho exposes no LLM tools.

<a id="source-tanstack-ai-memory-in-memory"></a>

## Tanstack Ai Memory In Memory

Source: `tanstack-ai-memory-in-memory`.

## In-Memory Memory Adapter

Zero-dependency `recall`/`save` adapter backed by a `Map`. Records vanish on process
restart.

### When to use it

- Local development.
- Vitest / Playwright tests.
- Single-process demos where users don't need persistence.

### When NOT to use it

- Production multi-process deployments — every worker has its own `Map`; users get
  inconsistent memory.
- Anything that needs survival across restarts.

For production, use `redis()` (see the `tanstack-ai-memory-redis` skill).

### Setup

```ts
import { memoryMiddleware } from '@tanstack/ai-memory'
import { inMemory } from '@tanstack/ai-memory/in-memory'

const memory = inMemory()

memoryMiddleware({ adapter: memory, scope })
```

### Options

`inMemory(options?)` accepts:

- `topK` (default 6), `minScore` (default 0.15), `kinds` — recall tuning.
- `embedder: { embed(text): Promise<number[]> }` — enable semantic scoring (both
  `recall` and `save` embed through it).
- `extract(turn, scope)` — return derived facts to persist alongside the raw turn
  (e.g. call an LLM to pull out preferences). Without it, `save` stores the raw
  user/assistant messages and `recall` scores them lexically + by recency.
- `render(hits)` — replace the built-in prompt renderer.

### Capacity

The adapter scans every record in a scope per `recall`. Fine up to ~100k records; beyond
that, switch to Redis.

<a id="source-tanstack-ai-memory-mem0"></a>

## Tanstack Ai Memory Mem0

Source: `tanstack-ai-memory-mem0`.

## mem0 Memory Adapter

Hosted `recall`/`save` adapter backed by a mem0 server. mem0 owns extraction and ranking
server-side. Talks to the server over plain HTTP — **no SDK peer dependency**.

### Setup

```ts
import { memoryMiddleware } from '@tanstack/ai-memory'
import { mem0 } from '@tanstack/ai-memory/mem0'

const memory = mem0({ user: currentUserId }) // baseUrl defaults to MEM0_URL

memoryMiddleware({ adapter: memory, scope })
```

Requires a running mem0 server (self-hosted or hosted). Point it via `baseUrl` (or
`MEM0_URL`); pass `apiKey` (or `MEM0_ADMIN_API_KEY`) when secured.

### Options

- `user` — mem0 `user_id` (falls back to `scope.userId`, then `'demo-user'`).
- `baseUrl` — mem0 server URL (default `MEM0_URL` or `http://localhost:8000`).
- `apiKey` — bearer token (default `MEM0_ADMIN_API_KEY`).
- `rerank` (default `true`), `threshold` (default `0.1`) — search tuning.

**Scope fields:** requests send `user_id` and `run_id` (`scope.threadId`). `tenantId`
and `namespace` are not sent — encode multi-tenant isolation into `user` if needed.

`save` posts the `{ user, assistant }` turn to `/memories`; `recall` queries `/search`
and renders the results into the system prompt. mem0 exposes no LLM tools.

<a id="source-tanstack-ai-memory-redis"></a>

## Tanstack Ai Memory Redis

Source: `tanstack-ai-memory-redis`.

## Redis Memory Adapter

Production-grade `recall`/`save` adapter backed by plain Redis (no vector index
required). Ranks client-side (lexical + optional cosine + recency + importance).

### Setup

Bring your own Redis client. `ioredis` wires in directly; `redis` (node-redis v4+) needs
a small wrapper.

#### Option A: `ioredis`

```ts
import Redis from 'ioredis'
import { memoryMiddleware } from '@tanstack/ai-memory'
import { redis } from '@tanstack/ai-memory/redis'

const client = new Redis(process.env.REDIS_URL)
const memory = redis({ redis: client, prefix: 'myapp:memory' })

memoryMiddleware({ adapter: memory, scope })
```

#### Option B: `redis` (node-redis v4+)

```ts
import { createClient } from 'redis'
import { memoryMiddleware } from '@tanstack/ai-memory'
import { redis, fromNodeRedis } from '@tanstack/ai-memory/redis'

const client = createClient({ url: process.env.REDIS_URL })
await client.connect()

const memory = redis({
  redis: fromNodeRedis(client),
  prefix: 'myapp:memory',
})

memoryMiddleware({ adapter: memory, scope })
```

node-redis exposes a camelCase API (`sAdd`, `mGet`); `fromNodeRedis` translates it
to the lowercase `RedisLike` shape. Passing a raw node-redis client without the wrapper
throws `client.sadd is not a function`.

`redis()` accepts the same `topK` / `minScore` / `kinds` / `embedder` / `extract` options
as `inMemory()`.

### Storage model

```text
{prefix}:record:{id}                                          -> JSON record
{prefix}:index:{tenantId or _}:{userId or _}:{threadId}       -> Set<id>
```

`save` writes the record and adds it to the scope's index set; `recall` loads the set,
scores, and renders. Scope values are escaped (`:`, `\`, and `_`) so a delimiter or the
unset placeholder inside a dim can't collide two scopes.

**Hard cut:** there is no dual-read of older index layouts. If you previously wrote under
a different shape (e.g. without `tenantId`), reindex or wipe — old keys are orphaned.

Always pass the same `tenantId`/`userId`/`threadId` on write and read: missing optional
dims become `_`, so omit ≠ "match any".

### Ranking limits

Ranking is client-side: `recall` loads every record for the scope into Node and scores
it. Fine up to ~10k records per scope. Beyond that, write a vector-index-aware adapter
against the same `recall`/`save` contract.

### Troubleshooting

- **Records not visible across processes:** ensure every process uses the same
  `REDIS_URL` and `prefix`.
- **Malformed JSON rows:** a row whose JSON won't parse is skipped on read and **left in
  place** (never deleted) — the signal is a one-time `console.warn` per bad id. Fix or
  delete the offending `{prefix}:record:{id}` key to remediate.
