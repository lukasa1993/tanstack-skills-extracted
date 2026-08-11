# Database persistence adapters

Custom, Drizzle, and Prisma persistence adapters.

<a id="source-tanstack-ai-persistence-build-custom-adapter"></a>

## Build Custom Adapter

Source: `tanstack-ai-persistence-build-custom-adapter`.

## Custom Chat Persistence

The deliverable is **one file in the app** — `src/lib/chat-persistence.ts` —
exporting a `ChatPersistence` built from the database client the app already
has. Plus whatever DDL that database needs, added through the app's existing
migration flow.

Do not create a package, a second client, or a migration runner.

**Route first.** If the app already runs one of these, stop and use that skill —
it has the driver-specific code:

| App runs                  | Use                                     |
| ------------------------- | --------------------------------------- |
| Drizzle ORM (any dialect) | ai-persistence/build-drizzle-adapter    |
| Prisma                    | ai-persistence/build-prisma-adapter     |
| Cloudflare Workers + D1   | ai-persistence/build-cloudflare-adapter |

Everything else lands here. The full contracts and their invariants are in
**ai-persistence/stores** and `docs/persistence/store-reference.md`; the
complete worked `node:sqlite` walkthrough is
`docs/persistence/build-your-own-chat-adapter.md` and
`examples/ts-react-chat/src/lib/sqlite-persistence.ts`.

### 1. Read the app before writing anything

| Find               | Where to look                                                 | What it decides                                        |
| ------------------ | ------------------------------------------------------------- | ------------------------------------------------------ |
| The client         | `src/db.ts`, `src/lib/db.ts`, `src/server/db.ts`              | What the file imports — never construct a second pool  |
| Client lifetime    | module singleton vs per-request factory (`getDb()`, bindings) | `export const chatPersistence` vs `export function`    |
| Migration flow     | `migrations/`, `drizzle/`, `supabase/migrations/`, an ORM CLI | How the DDL gets applied — use theirs, add nothing new |
| Naming conventions | existing tables/collections                                   | Prefix (`chat_*`) so nothing collides                  |
| JSON support       | `jsonb` (Postgres), `json` (MySQL 5.7+), text (SQLite)        | Whether mappers stringify/parse                        |
| Import alias       | `tsconfig.json` `paths`                                       | `@/db`, `~/db`, `#/db`, or a relative path             |

### 2. Shape the storage

Four logical records. Whatever the engine, keep these keys — the store methods
look records up by exactly these:

| Record    | Key                | Fields                                                                                                                                    |
| --------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| thread    | `threadId`         | `messages` (array, full transcript)                                                                                                       |
| run       | `runId`            | `threadId`, `status`, `startedAt`, `finishedAt?`, `error?`, `usage?`, `sandboxKey?`, `detachedSince?`, `cancelRequested?`, `driverEpoch?` |
| interrupt | `interruptId`      | `runId`, `threadId`, `status`, `requestedAt`, `resolvedAt?`, `payload`, `response?`                                                       |
| metadata  | `(namespace, key)` | `value`                                                                                                                                   |

- Timestamps are **epoch milliseconds** (`number`) in records. Store them
  however the engine prefers and convert in the mapper.
- `(namespace, key)` is a **composite** key. Never join with a separator —
  `('a:b','c')` and `('a','b:c')` must stay distinct records, and the
  conformance suite checks it.
- Index `runs(threadId, status)`, `runs(threadId, startedAt)`, and
  `interrupts(threadId, requestedAt)` for the listing paths. If the backend
  implements `listReclaimable`, also index `runs(status, detachedSince)`; that
  is the query it runs.
- `run.error` is a structured `RunError` (`{ message: string, code?: string }`),
  not a bare string. `message` is the provider's prose; `code` is the stable,
  machine-branchable classification an operator filters and groups by. In a
  SQL-backed table, store it as two columns (`error`, `error_code`) rather than
  one JSON blob, moved together in `update` so a later code-less failure can
  never leave a stale `code` from an earlier one behind. `run.status` is one of
  `'running' | 'interrupted' | 'completed' | 'failed' | 'aborted'`;
  `'interrupted'` is a pause, not terminal, and only
  `'completed' | 'failed' | 'aborted'` are terminal.
- Extra app-owned columns are fine (a `userId`, audit columns) as long as they
  are nullable or defaulted. The stores never read columns they do not know
  about.

### 3. The invariants

Getting one of these wrong is the usual source of stuck approvals and wiped
history. They are engine-independent:

1. **`saveThread` is a full overwrite**, never an append. The argument is the
   complete authoritative transcript.
2. **`loadThread` returns `[]`** for an unknown thread, never `null`.
3. **`createOrResume` is insert-if-absent** — an existing `runId` comes back
   _unchanged_, ignoring the new field values. Resume and double-submit depend
   on it. After a racy insert, re-read rather than trusting your own write.
4. **`runs.update` on an unknown id is a silent no-op** — it must not throw and
   must not insert. (Drivers that throw on zero rows affected need the
   `updateMany`-style call, not the `update`-one-or-throw call.)
5. **`runs.update` distinguishes "field omitted" from "field explicitly
   cleared" for the durable-run fields** (`sandboxKey`, `detachedSince`,
   `cancelRequested`, `driverEpoch`). A reattach clears `detachedSince` by
   passing it explicitly as `undefined` — `update(runId, { detachedSince: undefined })`
   — and that must write `NULL`, not be silently dropped. Check
   `'detachedSince' in patch`, never `patch.detachedSince !== undefined`; the
   latter cannot tell a clear from an omission and leaves every reattached run
   looking permanently detached to the reaper. Same rule for
   `cancelRequested` (`false` is a real value, not "unset") and for
   `sandboxKey` / `driverEpoch`. See
   `examples/ts-react-chat/src/lib/sqlite-persistence.ts` for the pattern.
6. **`interrupts.create` is insert-if-absent** — never clobber a resolved
   interrupt back to pending. Every `list*` is ordered by `requestedAt`
   ascending.
7. **`runs.listReclaimable` uses an inclusive cutoff** (if implemented):
   `status === 'running' AND detachedSince <= now - ttlMs`. It is a query, not
   automatic reclamation: `reapDetachedRuns` from `@tanstack/ai-sandbox` is the
   sweep that consumes it, and the application schedules that sweep. A store
   without this method cannot be reaped. `runs.findActiveRun` is required;
   `runs.listByThread` / `runs.listReclaimable` are optional: implement only
   what the app needs and leave the rest off the object.

Row mappers omit absent optionals
(`...(row.sandbox_key != null ? { sandboxKey: row.sandbox_key } : {})`) so
records compare cleanly against the reference in-memory backend. For a
two-column `error`/`error_code` layout, the mapper is
`...(row.error != null ? { error: { message: row.error, ...(row.error_code != null ? { code: row.error_code } : {}) } } : {})`.

### 4. Write `src/lib/chat-persistence.ts`

Four factories and one assembly. Postgres via `pg` shown here; the shape is the
same for any driver.

```ts ignore
import { defineAIPersistence } from '@tanstack/ai-persistence'
import type { Pool } from 'pg'
import type {
  ChatPersistence,
  MessageStore,
  RunStore,
} from '@tanstack/ai-persistence'

import { pool } from '@/db'

function createMessageStore(db: Pool): MessageStore {
  return {
    async loadThread(threadId) {
      const { rows } = await db.query(
        'SELECT messages_json FROM chat_threads WHERE thread_id = $1',
        [threadId],
      )
      return rows[0]?.messages_json ?? []
    },
    // Full overwrite — `messages` is the complete authoritative transcript.
    async saveThread(threadId, messages) {
      await db.query(
        `INSERT INTO chat_threads (thread_id, messages_json, updated_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (thread_id)
         DO UPDATE SET messages_json = EXCLUDED.messages_json,
                       updated_at = EXCLUDED.updated_at`,
        [threadId, JSON.stringify(messages), Date.now()],
      )
    },
  }
}

function createRunStore(db: Pool): RunStore {
  async function get(runId: string) {
    const { rows } = await db.query(
      'SELECT * FROM chat_runs WHERE run_id = $1',
      [runId],
    )
    return rows[0] ? mapRun(rows[0]) : null
  }

  return {
    get,
    // Idempotent: an existing runId is returned untouched.
    async createOrResume({ runId, threadId, startedAt, status }) {
      const existing = await get(runId)
      if (existing) return existing

      await db.query(
        `INSERT INTO chat_runs (run_id, thread_id, status, started_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (run_id) DO NOTHING`,
        [runId, threadId, status ?? 'running', startedAt],
      )
      // Re-read: a concurrent createOrResume may have won the race, and that
      // row is the authoritative one.
      const stored = await get(runId)
      return (
        stored ?? { runId, threadId, status: status ?? 'running', startedAt }
      )
    },
    // ... update (no-op on unknown id; sandboxKey/detachedSince/
    // cancelRequested/driverEpoch are checked with `'field' in patch`, not
    // `patch.field !== undefined`, so an explicit `undefined` (a clear) still
    // writes NULL instead of being silently dropped — status/finishedAt/usage
    // can use the simpler `!== undefined` check since they are never
    // explicitly cleared; writes patch.error as two columns,
    // error = patch.error.message and error_code = patch.error.code ?? null,
    // together in the same call),
    // findActiveRun (latest 'running', required), listByThread (ascending
    // by startedAt, optional), listReclaimable (status = 'running' AND
    // detachedSince <= now - ttlMs, inclusive cutoff, optional)
  }
}

/** The four chat state stores backed by the app's database. */
export const chatPersistence: ChatPersistence = defineAIPersistence({
  stores: {
    messages: createMessageStore(pool),
    runs: createRunStore(pool),
    interrupts: createInterruptStore(pool),
    metadata: createMetadataStore(pool),
  },
})
```

Annotate `ChatPersistence` — bare `AIPersistence` is the all-optional bag and
`withPersistence` rejects it. There is no `locks` store: `stores` accepts only
`messages`, `runs`, `interrupts`, `metadata`, and anything else throws
`Unknown AIPersistence store key`. Coordination is wired separately with
`withLocks` (see **ai-core/locks**).

If the client is per-request (Workers bindings, request-scoped transactions),
export a `chatPersistence()` factory instead of a const and call it inside the
handler.

### Engine notes

**Postgres (`pg`, `postgres.js`, Neon, Supabase)** — `jsonb` columns round-trip
objects, so skip the `JSON.stringify` on read paths (`pg` parses `jsonb` for
you; check what the driver returns before assuming). `bigint` columns come back
as strings in `pg` — use `bigint` with an explicit `Number()` in the mapper, or
store epoch ms in a `double precision`/`bigint` and convert once. Composite key
is `PRIMARY KEY (namespace, key)`.

**Kysely** — define the four tables in the app's `Database` interface, then the
stores are `db.insertInto('chat_runs').values(...).onConflict((oc) => oc.column('run_id').doNothing())`
and `.executeTakeFirst()`. `updateTable(...).execute()` is already a no-op on
zero matches, so invariant 4 comes free.

**node:sqlite / better-sqlite3** — the complete implementation is in the guide
and in `examples/ts-react-chat/src/lib/sqlite-persistence.ts`. Prepared
statements at factory scope, `INSERT ... ON CONFLICT`, JSON as `text`, epoch ms
as `integer`. Wrap sync calls in `async` methods; the contracts are promise-based.

**MongoDB** — one collection per record type, `_id` set to the natural key
(`threadId`, `runId`, `interruptId`). For `metadata`, use `_id: { namespace, key }`
— a compound `_id` subdocument, or a unique index on `{ namespace, key }` — never
a delimiter-joined string. Invariant: `('a:b','c')` and `('a','b:c')` must stay
distinct records, and the conformance suite checks it.
`createOrResume` is `updateOne({ _id }, { $setOnInsert: doc }, { upsert: true })`
then a `findOne` — `$setOnInsert` is the insert-if-absent primitive. Guard the
`E11000` duplicate-key race and re-read. `list*` need `.sort({ requestedAt: 1 })`.

**Redis / Upstash** — workable for `metadata` and excellent for `LockStore`, but
think before putting `interrupts` there: the listings need ordered secondary
indexes you have to maintain by hand (a sorted set per thread and per run,
scored by `requestedAt`). A common split is Postgres for `messages`/`runs`/
`interrupts` and Redis for locks; compose them with `composePersistence`.

**Anything else** — you only need the seven invariants above. The core never
inspects your storage.

### Adopt part of it

You rarely need all four stores at once. Implement what you own and fill the
rest from another base:

```ts ignore
import { composePersistence, memoryPersistence } from '@tanstack/ai-persistence'
import { messages, runs } from './my-stores'

export const chatPersistence = composePersistence(memoryPersistence(), {
  overrides: { messages, runs },
})
```

Only listed keys move. There is **no cross-store transaction** — if `messages`
lives in Postgres and `interrupts` in Redis, a write touching both is two
writes. The idempotency invariants are exactly what make those retries safe.

### Wire it into the chat route

```ts ignore
import {
  chat,
  chatParamsFromRequest,
  toServerSentEventsResponse,
} from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { withPersistence } from '@tanstack/ai-persistence'
import { chatPersistence } from '@/lib/chat-persistence'

export async function POST(request: Request) {
  const params = await chatParamsFromRequest(request)
  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages: params.messages,
    threadId: params.threadId,
    runId: params.runId,
    ...(params.resume ? { resume: params.resume } : {}),
    middleware: [withPersistence(chatPersistence)],
  })
  return toServerSentEventsResponse(stream)
}
```

`threadId` is a bare string to the stores. **Authorize thread access at the
route** — derive the user from the session, never trust a client-supplied id.

### Verify (required)

This matters more here than anywhere else: there is no reference driver to
compare against, so the testkit is the only thing standing between a subtle
idempotency bug and stuck approvals in production.

```ts ignore
import { runPersistenceConformance } from '@tanstack/ai-persistence/testkit'
import { chatPersistence } from '../src/lib/chat-persistence'

runPersistenceConformance('app-custom', () => chatPersistence, {
  skip: ['generationRuns', 'artifacts', 'blobs'],
})
```

Point it at a throwaway database and reset between runs. The suite covers all
seven stores, so declare every intentional omission — a chat adapter skips the
generation half above, and adds e.g. `'metadata'` if it drops that too. `skip`
never accepts `'locks'`, which is not a store.

If your recipe leaves an optional `runs` method (`listByThread`/
`listReclaimable`) unimplemented, declare it separately with `skipMethods`, e.g.
`{ skipMethods: ['runs.listByThread'] }`. An omitted method that is not declared
fails the suite instead of silently passing. `findActiveRun` is **not** in that
set — it is required, so there is nothing to declare.

<a id="source-tanstack-ai-persistence-build-drizzle-adapter"></a>

## Build Drizzle Adapter

Source: `tanstack-ai-persistence-build-drizzle-adapter`.

## Drizzle Chat Persistence

The deliverable is **one file in the app** — `src/lib/chat-persistence.ts` —
exporting a `ChatPersistence` built from the app's existing Drizzle `db`. Plus
four tables added to the app's existing schema file and a migration generated
through the app's existing `drizzle-kit` setup.

Do not create a package, a second `db` instance, a migration runner, or a
`drizzle.config.ts`. The app has those.

Read the **Store Reference**
(`docs/persistence/store-reference.md`) for the store contracts and
invariants, and **ai-persistence/stores** for the shape rules. Every
store below mirrors the reference in-memory backend in
`@tanstack/ai-persistence` (`memory.ts`); the shared conformance testkit is the
proof.

### 1. Read the app before writing anything

| Find               | Where to look                                                       | What it decides                                             |
| ------------------ | ------------------------------------------------------------------- | ----------------------------------------------------------- |
| Dialect            | `drizzle.config.ts` `dialect:`, or the `drizzle-orm/*-core` import  | `sqlite-core` vs `pg-core` vs `mysql-core` column builders  |
| Schema file(s)     | `drizzle.config.ts` `schema:` glob                                  | Where the four tables go — append, never start a new file   |
| The `db` handle    | `src/db/index.ts`, `src/db.ts`, `src/server/db.ts`                  | Module singleton (`export const db`) vs factory (`getDb()`) |
| Migration flow     | `drizzle.config.ts` `out:`, the `migrations/` or `drizzle/` journal | Which generate/apply commands to tell the user to run       |
| Naming conventions | Existing tables in the schema file                                  | Table prefix, var casing, `snake_case` column names         |
| Import alias       | `tsconfig.json` `paths`                                             | `@/db`, `~/db`, `#/db/index`, or a relative path            |

Match what is already there. If their tables are `chat_*`-prefixed and their
vars are camelCase, so are yours. If they already have a `messages` table for
something else, prefix — the store code reads database names off the table
objects, so any name works.

**Never invent a migration path.** Add the tables to their schema file, then
have them run their own commands (`npx drizzle-kit generate` then
`migrate`/`push`, or `wrangler d1 migrations apply` for D1). A parallel
migration table behind their back is how schemas drift.

### 2. Add the tables to their schema file

SQLite. JSON payloads use `text({ mode: 'json' })` so Drizzle round-trips
objects for you; timestamps are `integer` epoch ms.

```ts ignore
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core'
import type { ModelMessage, TokenUsage } from '@tanstack/ai'
import type { InterruptRecord, RunStatus } from '@tanstack/ai-persistence'

export const chatThreads = sqliteTable('chat_threads', {
  threadId: text('thread_id').primaryKey(),
  messagesJson: text('messages_json', { mode: 'json' })
    .$type<Array<ModelMessage>>()
    .notNull(),
  updatedAt: integer('updated_at').notNull(),
})

export const chatRuns = sqliteTable(
  'chat_runs',
  {
    runId: text('run_id').primaryKey(),
    threadId: text('thread_id').notNull(),
    status: text('status').$type<RunStatus>().notNull(),
    startedAt: integer('started_at').notNull(),
    finishedAt: integer('finished_at'),
    error: text('error'),
    errorCode: text('error_code'),
    usageJson: text('usage_json', { mode: 'json' }).$type<TokenUsage>(),
    sandboxKey: text('sandbox_key'),
    detachedSince: integer('detached_since'),
    cancelRequested: integer('cancel_requested', { mode: 'boolean' }),
    driverEpoch: integer('driver_epoch'),
  },
  (table) => [
    // Powers listReclaimable: status = 'running' AND detachedSince <= cutoff.
    index('chat_runs_status_detached').on(table.status, table.detachedSince),
    // Powers listByThread and findActiveRun.
    index('chat_runs_thread_started').on(table.threadId, table.startedAt),
  ],
)

export const chatInterrupts = sqliteTable('chat_interrupts', {
  interruptId: text('interrupt_id').primaryKey(),
  runId: text('run_id').notNull(),
  threadId: text('thread_id').notNull(),
  status: text('status').$type<InterruptRecord['status']>().notNull(),
  requestedAt: integer('requested_at').notNull(),
  resolvedAt: integer('resolved_at'),
  payloadJson: text('payload_json', { mode: 'json' })
    .$type<Record<string, unknown>>()
    .notNull(),
  responseJson: text('response_json', { mode: 'json' }).$type<unknown>(),
})

export const chatMetadata = sqliteTable(
  'chat_metadata',
  {
    namespace: text('namespace').notNull(),
    key: text('key').notNull(),
    valueJson: text('value_json', { mode: 'json' }).$type<unknown>().notNull(),
  },
  (table) => [primaryKey({ columns: [table.namespace, table.key] })],
)
```

`updatedAt` on threads is an app-owned extra, not part of any contract — the
stores never read columns they do not know about, so add `userId`, tenant ids,
or audit columns the same way (nullable or defaulted so inserts still succeed).
The `namespace` column is the `MetadataStore` first argument; the stock SQL in
the guide calls the same column `scope`.

`RunRecord.error` is a structured `RunError` (`{ message: string, code?: string }`),
so it gets two columns rather than one JSON blob: `error` for the provider's
prose and `errorCode` for the stable classification an operator filters and
groups by. `error` and `errorCode` always move together in `update`, so a
later code-less failure can never leave a stale `code` from an earlier one
behind.

**Postgres** (`drizzle-orm/pg-core`): `jsonb()` for the JSON payloads,
`bigint({ mode: 'number' })` for epoch-ms timestamps (including
`detachedSince`), `integer()` for `driverEpoch`, `boolean()` for
`cancelRequested`, `text()` elsewhere, composite `primaryKey` on
`(namespace, key)` unchanged. **MySQL**
(`drizzle-orm/mysql-core`): `json()`, `bigint({ mode: 'number' })`,
`boolean()` for `cancelRequested`, and `varchar(..., { length: 255 })` for the
primary-key columns. The store bodies below are identical across all three,
only `onConflictDoUpdate` becomes `onDuplicateKeyUpdate` on MySQL, and the
`(status, detachedSince)` / `(threadId, startedAt)` indexes carry over as is.

### 3. Write `src/lib/chat-persistence.ts`

The whole file. Idempotency is the entire game — the comments below mark the
rules the conformance suite checks.

```ts ignore
import { and, asc, desc, eq, isNotNull, lte } from 'drizzle-orm'
import { defineAIPersistence } from '@tanstack/ai-persistence'
import type { SQL } from 'drizzle-orm'
import type {
  ChatPersistence,
  InterruptRecord,
  InterruptStore,
  MessageStore,
  MetadataStore,
  RunRecord,
  RunStore,
} from '@tanstack/ai-persistence'

import { db } from '@/db'
import {
  chatInterrupts,
  chatMetadata,
  chatRuns,
  chatThreads,
} from '@/db/schema'

type Db = typeof db

// Records omit absent optionals so they compare cleanly against the reference
// in-memory backend.
function mapRun(row: typeof chatRuns.$inferSelect): RunRecord {
  return {
    runId: row.runId,
    threadId: row.threadId,
    status: row.status,
    startedAt: row.startedAt,
    ...(row.finishedAt != null ? { finishedAt: row.finishedAt } : {}),
    ...(row.error != null
      ? {
          error: {
            message: row.error,
            ...(row.errorCode != null ? { code: row.errorCode } : {}),
          },
        }
      : {}),
    ...(row.usageJson != null ? { usage: row.usageJson } : {}),
    ...(row.sandboxKey != null ? { sandboxKey: row.sandboxKey } : {}),
    ...(row.detachedSince != null ? { detachedSince: row.detachedSince } : {}),
    ...(row.cancelRequested != null
      ? { cancelRequested: row.cancelRequested }
      : {}),
    ...(row.driverEpoch != null ? { driverEpoch: row.driverEpoch } : {}),
  }
}

function mapInterrupt(
  row: typeof chatInterrupts.$inferSelect,
): InterruptRecord {
  return {
    interruptId: row.interruptId,
    runId: row.runId,
    threadId: row.threadId,
    status: row.status,
    requestedAt: row.requestedAt,
    payload: row.payloadJson,
    ...(row.resolvedAt != null ? { resolvedAt: row.resolvedAt } : {}),
    ...(row.responseJson != null ? { response: row.responseJson } : {}),
  }
}

function createMessageStore(db: Db): MessageStore {
  return {
    async loadThread(threadId) {
      const rows = await db
        .select({ messagesJson: chatThreads.messagesJson })
        .from(chatThreads)
        .where(eq(chatThreads.threadId, threadId))
        .limit(1)
      // Unknown thread is [], never null.
      return rows[0]?.messagesJson ?? []
    },
    // Full overwrite — `messages` is the complete authoritative transcript.
    async saveThread(threadId, messages) {
      const updatedAt = Date.now()
      await db
        .insert(chatThreads)
        .values({ threadId, messagesJson: messages, updatedAt })
        .onConflictDoUpdate({
          target: chatThreads.threadId,
          set: { messagesJson: messages, updatedAt },
        })
    },
  }
}

function createRunStore(db: Db): RunStore {
  async function get(runId: string) {
    const rows = await db
      .select()
      .from(chatRuns)
      .where(eq(chatRuns.runId, runId))
      .limit(1)
    return rows[0] ? mapRun(rows[0]) : null
  }

  return {
    get,
    // Idempotent: an existing runId is returned untouched so resume and
    // double-submit are safe.
    async createOrResume({ runId, threadId, startedAt, status }) {
      const existing = await get(runId)
      if (existing) return existing

      await db
        .insert(chatRuns)
        .values({ runId, threadId, status: status ?? 'running', startedAt })
        .onConflictDoNothing({ target: chatRuns.runId })

      // Re-read rather than trusting the insert: a concurrent createOrResume
      // may have won the race, and that row is the authoritative one.
      const stored = await get(runId)
      return (
        stored ?? { runId, threadId, status: status ?? 'running', startedAt }
      )
    },
    // Patching an unknown runId is a no-op: never throws, never inserts.
    async update(runId, patch) {
      const set: Partial<typeof chatRuns.$inferInsert> = {}
      if (patch.status !== undefined) set.status = patch.status
      if (patch.finishedAt !== undefined) set.finishedAt = patch.finishedAt
      // Both columns move together, so a later code-less failure cannot
      // leave a stale errorCode from an earlier one behind.
      if (patch.error !== undefined) {
        set.error = patch.error.message
        set.errorCode = patch.error.code ?? null
      }
      if (patch.usage !== undefined) set.usageJson = patch.usage
      // The four durable-run fields use `'field' in patch`, NOT
      // `!== undefined`: a reattach clears `detachedSince` by passing it
      // explicitly as `undefined`, and that must still write NULL. Checking
      // `!== undefined` cannot distinguish "clear this" from "didn't mention
      // this", so it would silently drop the clear and leave the run looking
      // permanently detached to the reaper. Same reasoning applies to
      // `cancelRequested` (`false` is a meaningful value, not "unset").
      if ('sandboxKey' in patch) set.sandboxKey = patch.sandboxKey ?? null
      if ('detachedSince' in patch)
        set.detachedSince = patch.detachedSince ?? null
      if ('cancelRequested' in patch)
        set.cancelRequested = patch.cancelRequested ?? null
      if ('driverEpoch' in patch) set.driverEpoch = patch.driverEpoch ?? null
      if (Object.keys(set).length === 0) return

      await db.update(chatRuns).set(set).where(eq(chatRuns.runId, runId))
    },
    // Optional in the contract; enables reconnect without a client-held run id.
    async findActiveRun(threadId) {
      const rows = await db
        .select()
        .from(chatRuns)
        .where(
          and(eq(chatRuns.threadId, threadId), eq(chatRuns.status, 'running')),
        )
        .orderBy(desc(chatRuns.startedAt))
        .limit(1)
      return rows[0] ? mapRun(rows[0]) : null
    },
    // Optional; every run for the thread, ascending by startedAt. Uses the
    // (threadId, startedAt) index.
    async listByThread(threadId) {
      const rows = await db
        .select()
        .from(chatRuns)
        .where(eq(chatRuns.threadId, threadId))
        .orderBy(asc(chatRuns.startedAt))
      return rows.map(mapRun)
    },
    // Optional; still-running runs detached at or before the cutoff. Uses the
    // (status, detachedSince) index. The cutoff is inclusive.
    async listReclaimable({ now, ttlMs }) {
      const cutoff = now - ttlMs
      const rows = await db
        .select()
        .from(chatRuns)
        .where(
          and(
            eq(chatRuns.status, 'running'),
            isNotNull(chatRuns.detachedSince),
            lte(chatRuns.detachedSince, cutoff),
          ),
        )
      return rows.map(mapRun)
    },
  }
}

function createInterruptStore(db: Db): InterruptStore {
  // Every listing is ordered by requestedAt ascending.
  const listWhere = async (where: SQL | undefined) => {
    const rows = await db
      .select()
      .from(chatInterrupts)
      .where(where)
      .orderBy(asc(chatInterrupts.requestedAt))
    return rows.map(mapInterrupt)
  }

  return {
    // Insert-if-absent: a duplicate create must never clobber a resolved
    // interrupt back to pending.
    async create(record) {
      await db
        .insert(chatInterrupts)
        .values({
          interruptId: record.interruptId,
          runId: record.runId,
          threadId: record.threadId,
          status: 'pending',
          requestedAt: record.requestedAt,
          payloadJson: record.payload,
          ...(record.response !== undefined
            ? { responseJson: record.response }
            : {}),
        })
        .onConflictDoNothing({ target: chatInterrupts.interruptId })
    },
    async resolve(interruptId, response) {
      await db
        .update(chatInterrupts)
        .set({
          status: 'resolved',
          resolvedAt: Date.now(),
          ...(response !== undefined ? { responseJson: response } : {}),
        })
        .where(eq(chatInterrupts.interruptId, interruptId))
    },
    async cancel(interruptId) {
      await db
        .update(chatInterrupts)
        .set({ status: 'cancelled', resolvedAt: Date.now() })
        .where(eq(chatInterrupts.interruptId, interruptId))
    },
    async get(interruptId) {
      const rows = await db
        .select()
        .from(chatInterrupts)
        .where(eq(chatInterrupts.interruptId, interruptId))
        .limit(1)
      return rows[0] ? mapInterrupt(rows[0]) : null
    },
    list: (threadId) => listWhere(eq(chatInterrupts.threadId, threadId)),
    listPending: (threadId) =>
      listWhere(
        and(
          eq(chatInterrupts.threadId, threadId),
          eq(chatInterrupts.status, 'pending'),
        ),
      ),
    listByRun: (runId) => listWhere(eq(chatInterrupts.runId, runId)),
    listPendingByRun: (runId) =>
      listWhere(
        and(
          eq(chatInterrupts.runId, runId),
          eq(chatInterrupts.status, 'pending'),
        ),
      ),
  }
}

function createMetadataStore(db: Db): MetadataStore {
  return {
    async get(namespace, key) {
      const rows = await db
        .select({ valueJson: chatMetadata.valueJson })
        .from(chatMetadata)
        .where(
          and(eq(chatMetadata.namespace, namespace), eq(chatMetadata.key, key)),
        )
        .limit(1)
      return rows[0]?.valueJson ?? null
    },
    async set(namespace, key, value) {
      // A JSON-mode column binds JS null as SQL NULL, which the NOT NULL
      // column rejects with an opaque driver error. Fail clearly instead.
      if (value == null) {
        throw new TypeError(
          `Cannot store ${value} for (${namespace}, ${key}) — use delete() to clear metadata.`,
        )
      }
      await db
        .insert(chatMetadata)
        .values({ namespace, key, valueJson: value })
        .onConflictDoUpdate({
          target: [chatMetadata.namespace, chatMetadata.key],
          set: { valueJson: value },
        })
    },
    async delete(namespace, key) {
      await db
        .delete(chatMetadata)
        .where(
          and(eq(chatMetadata.namespace, namespace), eq(chatMetadata.key, key)),
        )
    },
  }
}

/** The four chat state stores backed by the app's Drizzle database. */
export const chatPersistence: ChatPersistence = defineAIPersistence({
  stores: {
    messages: createMessageStore(db),
    runs: createRunStore(db),
    interrupts: createInterruptStore(db),
    metadata: createMetadataStore(db),
  },
})
```

Annotate `ChatPersistence` — bare `AIPersistence` is the all-optional bag and
`withPersistence` rejects it. There is no `locks` store: `stores` accepts only
those four keys, and coordination is wired separately with `withLocks` (see
**ai-core/locks**).

#### If `db` is per-request

Workers/D1 and any request-scoped client cannot read a binding at module scope.
Export a factory instead, and call it inside the handler:

```ts ignore
type Db = ReturnType<typeof getDb>

export function chatPersistence(): ChatPersistence {
  const db = getDb()
  return defineAIPersistence({
    stores: {
      messages: createMessageStore(db),
      runs: createRunStore(db),
      interrupts: createInterruptStore(db),
      metadata: createMetadataStore(db),
    },
  })
}
```

The store factories are unchanged — only the export flips from a const to a
function. For D1 specifically, see
**ai-persistence/build-cloudflare-adapter**.

### 4. Wire it into the chat route

```ts ignore
import {
  chat,
  chatParamsFromRequest,
  toServerSentEventsResponse,
} from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { withPersistence } from '@tanstack/ai-persistence'
import { chatPersistence } from '@/lib/chat-persistence'

export async function POST(request: Request) {
  const params = await chatParamsFromRequest(request)
  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages: params.messages,
    threadId: params.threadId,
    runId: params.runId,
    ...(params.resume ? { resume: params.resume } : {}),
    middleware: [withPersistence(chatPersistence)],
  })
  return toServerSentEventsResponse(stream)
}
```

`threadId` is a bare string to the stores. **Authorize thread access at the
route** — derive the user from the session, never trust a client-supplied id.

### 5. Verify

```ts ignore
import { runPersistenceConformance } from '@tanstack/ai-persistence/testkit'
import { chatPersistence } from '../src/lib/chat-persistence'

runPersistenceConformance('app-drizzle', () => chatPersistence, {
  skip: ['generationRuns', 'artifacts', 'blobs'],
})
```

Point it at a throwaway database (`:memory:` SQLite, a scratch schema, PGlite)
that has the migration applied, and reset between runs. The suite covers all
seven stores, so a chat adapter declares the generation half it omits; drop the
`skip` once you add those tables. `skip` never accepts `'locks'`, which is not a
store.

If your recipe leaves an optional `runs` method
(`listByThread`/`listReclaimable`) unimplemented, declare it
with `skipMethods`, e.g. `{ skipMethods: ['runs.listByThread'] }`. An
omitted method that is not declared fails the suite instead of silently
passing.

### Only if you are publishing this as a package

Everything above assumes the file lives in the app. If instead you are shipping
a reusable `drizzle` adapter to npm, the same store bodies apply, plus:

- **Peer deps** `@tanstack/ai`, `@tanstack/ai-persistence`, `drizzle-orm >=0.44.0`;
  dev dep `drizzle-kit`. Keep the module root free of Node built-ins so it is
  edge-safe, and put any `node:sqlite` convenience factory behind a `/sqlite`
  subpath.
- **Type `db` structurally** so a consumer's client is assignable:
  `Pick<BaseSQLiteDatabase<'sync' | 'async', unknown>, 'select' | 'insert' | 'update' | 'delete'>`.
- **Multi-dialect**: take a `provider: 'sqlite' | 'pg'` option, declare
  overloads so `db` and `schema` must agree, and add a runtime dialect check so
  a mismatched pair fails at construction rather than on first query.
- **BYO schema**: accept `drizzlePersistence(db, { schema })`, validate the
  tables/columns exist at construction, and pin the required column shapes with
  a compile-time contract type.
- **Never bundle SQL migrations or a runner.** Either re-export the stock tables
  from a `/sqlite-schema` subpath so the consumer's `drizzle-kit` picks them up,
  or emit an owned starter schema file with a small CLI. An opt-in
  `ensureTables(db)` issuing `CREATE TABLE IF NOT EXISTS` is fine for local dev,
  kept clearly separate from their journal. Pick one DDL owner per database.
- Run `runPersistenceConformance` once per dialect.

<a id="source-tanstack-ai-persistence-build-prisma-adapter"></a>

## Build Prisma Adapter

Source: `tanstack-ai-persistence-build-prisma-adapter`.

## Prisma Chat Persistence

The deliverable is **one file in the app** — `src/lib/chat-persistence.ts` —
exporting a `ChatPersistence` built from the app's existing `PrismaClient`. Plus
four models added to the app's existing `schema.prisma` and a migration created
with the app's own `prisma migrate`.

Do not create a package, a second client, a datasource block, a generator, or a
hand-written SQL migration. The app has those.

Read the **Store Reference**
(`docs/persistence/store-reference.md`) for the store contracts and
invariants, and **ai-persistence/stores** for the shape rules. Every
store below mirrors the reference in-memory backend in
`@tanstack/ai-persistence` (`memory.ts`); the shared conformance testkit is the
proof.

### 1. Read the app before writing anything

| Find                 | Where to look                                                                  | What it decides                                                 |
| -------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Schema location      | `prisma/schema.prisma`, or a multi-file `prisma/schema/` dir                   | Append to the existing file, or add one new `.prisma` file      |
| Provider             | the `datasource` block                                                         | Whether `Json` is available; nothing else changes               |
| Client singleton     | `src/lib/prisma.ts`, `src/db.ts`, `globalThis` dev cache                       | What `chat-persistence.ts` imports — never `new PrismaClient()` |
| Generated client     | the `generator client` block (`output`, `prisma-client-js` vs `prisma-client`) | Where `ChatRun`/`ChatInterrupt` row types come from             |
| Existing model names | the schema                                                                     | Whether `Message`/`Run` are taken — prefix if so                |
| Migration flow       | `prisma/migrations/`, or `db push` in scripts                                  | `prisma migrate dev` vs `prisma db push`                        |

Prisma 6 and 7 both work: the delegate query API (`findUnique`, `upsert`,
`update`, `findMany`, `delete`) is unchanged, so it does not matter which
client the app generated.

**Never invent a migration path.** Add the models, then have the user run their
own `npx prisma migrate dev --name chat-persistence` (or `db push`) and
`prisma generate`.

### 2. Add the models to their schema

IDs are `String`, timestamps are `BigInt` (portable epoch ms — `Int` overflows
in 2038, `DateTime` forces a conversion at every boundary), JSON payloads are
`String`. Use `@map`/`@@map` to match the app's database naming.

```prisma
model ChatThread {
  threadId     String @id @map("thread_id")
  messagesJson String @map("messages_json")
  updatedAt    BigInt @map("updated_at")

  @@map("chat_threads")
}

model ChatRun {
  runId           String  @id @map("run_id")
  threadId        String  @map("thread_id")
  status          String
  startedAt       BigInt  @map("started_at")
  finishedAt      BigInt? @map("finished_at")
  error           String?
  errorCode       String? @map("error_code")
  usageJson       String? @map("usage_json")
  sandboxKey      String? @map("sandbox_key")
  detachedSince   BigInt? @map("detached_since")
  cancelRequested Boolean? @map("cancel_requested")
  driverEpoch     Int?     @map("driver_epoch")

  @@index([threadId, status])
  @@index([threadId, startedAt])
  // Powers listReclaimable: status = 'running' AND detachedSince <= cutoff.
  @@index([status, detachedSince])
  @@map("chat_runs")
}

model ChatInterrupt {
  interruptId  String  @id @map("interrupt_id")
  runId        String  @map("run_id")
  threadId     String  @map("thread_id")
  status       String
  requestedAt  BigInt  @map("requested_at")
  resolvedAt   BigInt? @map("resolved_at")
  payloadJson  String  @map("payload_json")
  responseJson String? @map("response_json")

  @@index([threadId, requestedAt])
  @@map("chat_interrupts")
}

model ChatMetadata {
  namespace String
  key       String
  valueJson String @map("value_json")

  @@id([namespace, key])
  @@map("chat_metadata")
}
```

Rename models freely to fit the app — the store code below is the only thing
that references them. Extra app-owned fields (a `userId`, audit columns) are
fine as long as they are optional or defaulted, so the stores' creates still
succeed. `namespace` is the `MetadataStore` first argument; the stock SQL in
the guide calls the same column `scope`.

`RunRecord.error` is a structured `RunError` (`{ message: string, code?: string }`),
so it gets two columns rather than one JSON blob: `error` for the provider's
prose and `errorCode` for the stable classification an operator filters and
groups by. `error` and `errorCode` always move together in `update`, so a
later code-less failure can never leave a stale `code` from an earlier one
behind.

On **Postgres or MySQL** you can switch the `*Json` fields to Prisma's `Json`
type and drop the `JSON.stringify`/`parse` in the mappers below. Keep `String`
if the app targets SQLite or if it is multi-provider.

### 3. Write `src/lib/chat-persistence.ts`

Two conversions the SQL backends do not need: `BigInt` timestamps in and out,
and JSON as strings. Everything else is the shared invariant set.

```ts ignore
import { defineAIPersistence } from '@tanstack/ai-persistence'
import type {
  ChatInterrupt,
  ChatRun,
  Prisma,
  PrismaClient,
} from '@prisma/client'
import type { ModelMessage, TokenUsage } from '@tanstack/ai'
import type {
  ChatPersistence,
  InterruptRecord,
  InterruptStatus,
  InterruptStore,
  MessageStore,
  MetadataStore,
  RunRecord,
  RunStatus,
  RunStore,
} from '@tanstack/ai-persistence'

import { prisma } from '@/lib/prisma'

// Trusts the shape the stores themselves wrote — nothing else writes these
// columns.
function parseJson<T>(raw: string): T {
  return JSON.parse(raw)
}

const RUN_STATUSES: ReadonlyArray<RunStatus> = [
  'running',
  'interrupted',
  'completed',
  'failed',
  'aborted',
]
const INTERRUPT_STATUSES: ReadonlyArray<InterruptStatus> = [
  'pending',
  'resolved',
  'cancelled',
]

// The column is a plain String, so narrow instead of trusting it.
function toRunStatus(value: string): RunStatus {
  const status = RUN_STATUSES.find((candidate) => candidate === value)
  if (!status) throw new Error(`Unknown run status: ${value}`)
  return status
}

function toInterruptStatus(value: string): InterruptStatus {
  const status = INTERRUPT_STATUSES.find((candidate) => candidate === value)
  if (!status) throw new Error(`Unknown interrupt status: ${value}`)
  return status
}

// Records omit absent optionals so they compare cleanly against the reference
// in-memory backend.
function mapRun(row: ChatRun): RunRecord {
  return {
    runId: row.runId,
    threadId: row.threadId,
    status: toRunStatus(row.status),
    startedAt: Number(row.startedAt),
    ...(row.finishedAt != null ? { finishedAt: Number(row.finishedAt) } : {}),
    ...(row.error != null
      ? {
          error: {
            message: row.error,
            ...(row.errorCode != null ? { code: row.errorCode } : {}),
          },
        }
      : {}),
    ...(row.usageJson != null
      ? { usage: parseJson<TokenUsage>(row.usageJson) }
      : {}),
    ...(row.sandboxKey != null ? { sandboxKey: row.sandboxKey } : {}),
    ...(row.detachedSince != null
      ? { detachedSince: Number(row.detachedSince) }
      : {}),
    ...(row.cancelRequested != null
      ? { cancelRequested: row.cancelRequested }
      : {}),
    ...(row.driverEpoch != null ? { driverEpoch: row.driverEpoch } : {}),
  }
}

function mapInterrupt(row: ChatInterrupt): InterruptRecord {
  return {
    interruptId: row.interruptId,
    runId: row.runId,
    threadId: row.threadId,
    status: toInterruptStatus(row.status),
    requestedAt: Number(row.requestedAt),
    payload: parseJson<Record<string, unknown>>(row.payloadJson),
    ...(row.resolvedAt != null ? { resolvedAt: Number(row.resolvedAt) } : {}),
    ...(row.responseJson != null
      ? { response: parseJson<unknown>(row.responseJson) }
      : {}),
  }
}

function createMessageStore(db: PrismaClient): MessageStore {
  return {
    async loadThread(threadId) {
      const row = await db.chatThread.findUnique({ where: { threadId } })
      // Unknown thread is [], never null.
      return row ? parseJson<Array<ModelMessage>>(row.messagesJson) : []
    },
    // Full overwrite — `messages` is the complete authoritative transcript.
    async saveThread(threadId, messages) {
      const messagesJson = JSON.stringify(messages)
      const updatedAt = BigInt(Date.now())
      await db.chatThread.upsert({
        where: { threadId },
        create: { threadId, messagesJson, updatedAt },
        update: { messagesJson, updatedAt },
      })
    },
  }
}

function createRunStore(db: PrismaClient): RunStore {
  return {
    async get(runId) {
      const row = await db.chatRun.findUnique({ where: { runId } })
      return row ? mapRun(row) : null
    },
    // An empty `update` is Prisma's ON CONFLICT DO NOTHING: an existing runId
    // comes back untouched, so resume and double-submit are safe.
    async createOrResume({ runId, threadId, startedAt, status }) {
      const row = await db.chatRun.upsert({
        where: { runId },
        create: {
          runId,
          threadId,
          status: status ?? 'running',
          startedAt: BigInt(startedAt),
        },
        update: {},
      })
      return mapRun(row)
    },
    // Patching an unknown runId is a no-op: never throws, never inserts.
    async update(runId, patch) {
      const data: Prisma.ChatRunUpdateManyMutationInput = {}
      if (patch.status !== undefined) data.status = patch.status
      if (patch.finishedAt !== undefined) {
        data.finishedAt = BigInt(patch.finishedAt)
      }
      // Both columns move together, so a later code-less failure cannot
      // leave a stale errorCode from an earlier one behind.
      if (patch.error !== undefined) {
        data.error = patch.error.message
        data.errorCode = patch.error.code ?? null
      }
      if (patch.usage !== undefined)
        data.usageJson = JSON.stringify(patch.usage)
      // The four durable-run fields use `'field' in patch`, NOT
      // `!== undefined`: a reattach clears `detachedSince` by passing it
      // explicitly as `undefined`, and that must still write NULL, not be
      // silently dropped from the update. Checking `!== undefined` cannot
      // tell "clear this" from "didn't mention this", and would leave every
      // reattached run looking permanently detached to the reaper. Same
      // reasoning for `cancelRequested` (`false` is a meaningful value).
      if ('sandboxKey' in patch) data.sandboxKey = patch.sandboxKey ?? null
      if ('detachedSince' in patch) {
        data.detachedSince =
          patch.detachedSince === undefined ? null : BigInt(patch.detachedSince)
      }
      if ('cancelRequested' in patch)
        data.cancelRequested = patch.cancelRequested ?? null
      if ('driverEpoch' in patch) data.driverEpoch = patch.driverEpoch ?? null
      if (Object.keys(data).length === 0) return

      await db.chatRun.updateMany({ where: { runId }, data })
    },
    // Optional in the contract; enables reconnect without a client-held run id.
    async findActiveRun(threadId) {
      const row = await db.chatRun.findFirst({
        where: { threadId, status: 'running' },
        orderBy: { startedAt: 'desc' },
      })
      return row ? mapRun(row) : null
    },
    // Optional; every run for the thread, ascending by startedAt. Uses the
    // (threadId, startedAt) index.
    async listByThread(threadId) {
      const rows = await db.chatRun.findMany({
        where: { threadId },
        orderBy: { startedAt: 'asc' },
      })
      return rows.map(mapRun)
    },
    // Optional; still-running runs detached at or before the cutoff. Uses
    // the (status, detachedSince) index. The cutoff is inclusive.
    async listReclaimable({ now, ttlMs }) {
      const cutoff = BigInt(now - ttlMs)
      const rows = await db.chatRun.findMany({
        where: {
          status: 'running',
          detachedSince: { not: null, lte: cutoff },
        },
      })
      return rows.map(mapRun)
    },
  }
}

function createInterruptStore(db: PrismaClient): InterruptStore {
  // Every listing is ordered by requestedAt ascending.
  const listWhere = async (where: Prisma.ChatInterruptWhereInput) => {
    const rows = await db.chatInterrupt.findMany({
      where,
      orderBy: { requestedAt: 'asc' },
    })
    return rows.map(mapInterrupt)
  }

  return {
    // Insert-if-absent: a duplicate create must never clobber a resolved
    // interrupt back to pending.
    async create(record) {
      await db.chatInterrupt.upsert({
        where: { interruptId: record.interruptId },
        create: {
          interruptId: record.interruptId,
          runId: record.runId,
          threadId: record.threadId,
          status: 'pending',
          requestedAt: BigInt(record.requestedAt),
          payloadJson: JSON.stringify(record.payload),
          ...(record.response !== undefined
            ? { responseJson: JSON.stringify(record.response) }
            : {}),
        },
        update: {},
      })
    },
    async resolve(interruptId, response) {
      await db.chatInterrupt.updateMany({
        where: { interruptId },
        data: {
          status: 'resolved',
          resolvedAt: BigInt(Date.now()),
          ...(response !== undefined
            ? { responseJson: JSON.stringify(response) }
            : {}),
        },
      })
    },
    async cancel(interruptId) {
      await db.chatInterrupt.updateMany({
        where: { interruptId },
        data: { status: 'cancelled', resolvedAt: BigInt(Date.now()) },
      })
    },
    async get(interruptId) {
      const row = await db.chatInterrupt.findUnique({ where: { interruptId } })
      return row ? mapInterrupt(row) : null
    },
    list: (threadId) => listWhere({ threadId }),
    listPending: (threadId) => listWhere({ threadId, status: 'pending' }),
    listByRun: (runId) => listWhere({ runId }),
    listPendingByRun: (runId) => listWhere({ runId, status: 'pending' }),
  }
}

function createMetadataStore(db: PrismaClient): MetadataStore {
  return {
    async get(namespace, key) {
      const row = await db.chatMetadata.findUnique({
        where: { namespace_key: { namespace, key } },
      })
      return row ? parseJson<unknown>(row.valueJson) : null
    },
    async set(namespace, key, value) {
      // JSON.stringify(undefined) is undefined, which Prisma rejects against a
      // required column with an opaque error. Fail clearly instead.
      if (value == null) {
        throw new TypeError(
          `Cannot store ${value} for (${namespace}, ${key}) — use delete() to clear metadata.`,
        )
      }
      const valueJson = JSON.stringify(value)
      await db.chatMetadata.upsert({
        where: { namespace_key: { namespace, key } },
        create: { namespace, key, valueJson },
        update: { valueJson },
      })
    },
    async delete(namespace, key) {
      await db.chatMetadata.deleteMany({ where: { namespace, key } })
    },
  }
}

/** The four chat state stores backed by the app's Prisma client. */
export const chatPersistence: ChatPersistence = defineAIPersistence({
  stores: {
    messages: createMessageStore(prisma),
    runs: createRunStore(prisma),
    interrupts: createInterruptStore(prisma),
    metadata: createMetadataStore(prisma),
  },
})
```

Notes that bite:

- **`updateMany`, not `update`, for patches.** `update` throws
  `P2025` on a missing row; the contract says a patch to an unknown id is a
  silent no-op.
- **`namespace_key`** is Prisma's generated alias for the `@@id([namespace, key])`
  composite. If you rename the fields, the alias name changes with them.
- Annotate `ChatPersistence` — bare `AIPersistence` is the all-optional bag and
  `withPersistence` rejects it. There is no `locks` store: `stores` accepts only
  those four keys, and coordination is wired separately with `withLocks` (see
  **ai-core/locks**).
- If the app renamed the models, the delegate accessors are **camelCase**
  (`prisma.chatThread` for `model ChatThread`), and the row types imported from
  the client are PascalCase.

### 5. Verify

```ts ignore
import { runPersistenceConformance } from '@tanstack/ai-persistence/testkit'
import { chatPersistence } from '../src/lib/chat-persistence'

runPersistenceConformance('app-prisma', () => chatPersistence, {
  skip: ['generationRuns', 'artifacts', 'blobs'],
})
```

Point the client at a throwaway database with the migration applied (a scratch
SQLite file is enough) and reset it between runs. All four state stores are
provided; the suite also covers the three generation stores, so declare those as
skipped until you add them. `skip` never accepts `'locks'`, which is not a
store.

If your recipe leaves an optional `runs` method
(`listByThread`/`listReclaimable`) unimplemented, declare it
with `skipMethods`, e.g. `{ skipMethods: ['runs.listByThread'] }`. An
omitted method that is not declared fails the suite instead of silently
passing.

### Only if you are publishing this as a package

Everything above assumes the file lives in the app. For a reusable npm adapter,
the same store bodies apply, plus:

- **Peer dep** `@prisma/client >=6.7.0`. Ship no datasource, generator,
  connection URL, or prebuilt SQL migration — those stay in the consumer's
  schema.
- **Type the client structurally** (a `PrismaClientLike` shape) and read model
  delegates off it at runtime, so Prisma 6 and 7 clients both satisfy it
  regardless of where they were generated.
- **Ship the models as a raw string asset** plus a CLI
  (`tanstack-ai-prisma-models`) that copies a provider-neutral fragment into the
  consumer's multi-file schema directory. They then run `prisma migrate`.
- **Let consumers rename**: `prismaPersistence(prisma, { models: { messages: 'chatMessage' } })`,
  where map values are the camelCase client accessors. Throw a
  `PrismaModelError` naming every store whose delegate cannot be found. Keep the
  field surface and the composite-id alias fixed; database names and extra
  app-owned fields are theirs.
- Run `runPersistenceConformance` over a temporary SQLite database generated
  from the fragment.
