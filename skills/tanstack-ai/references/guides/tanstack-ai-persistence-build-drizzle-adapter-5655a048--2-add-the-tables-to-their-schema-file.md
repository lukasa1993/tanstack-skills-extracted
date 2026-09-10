# Build Drizzle Adapter — 2. Add the tables to their schema file

[Guide and prerequisites](./tanstack-ai-persistence-build-drizzle-adapter-5655a048.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## 2. Add the tables to their schema file

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
