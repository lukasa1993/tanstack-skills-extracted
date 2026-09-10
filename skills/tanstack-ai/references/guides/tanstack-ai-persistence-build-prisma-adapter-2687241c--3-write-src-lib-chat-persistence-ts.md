# Build Prisma Adapter — 3. Write `src/lib/chat-persistence.ts`

[Guide and prerequisites](./tanstack-ai-persistence-build-prisma-adapter-2687241c.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## 3. Write `src/lib/chat-persistence.ts`

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
