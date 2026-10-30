# Build Custom Adapter — 4. Write `src/lib/chat-persistence.ts`

[Guide and prerequisites](./tanstack-ai-persistence-build-custom-adapter-61b5cbc7.md) · Published skill · `@tanstack/ai-persistence@1.0.1`.

## 4. Write `src/lib/chat-persistence.ts`

Four factories and one assembly. Postgres via `pg` shown here; the shape is the
same for any driver.

<!-- fence: custom-chat-persistence -->

```ts
import { defineAIPersistence } from '@tanstack/ai-persistence'
import type { QueryResultRow } from 'pg'
import type { Pool } from 'pg'
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

import { pool } from '@/db'

type SqlParam = string | number | boolean | null

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

function epochMs(value: string | number): number {
  return typeof value === 'number' ? value : Number(value)
}

// `pg` parses jsonb into a value, so a JSON string is already a string.
// A text column still holds JSON source (`{`, `[`, or a quoted string).
// Re-encode a decoded string before parsing: JSON.parse("left") throws.
function readJson<T>(value: T | string): T {
  if (typeof value !== 'string') return value
  const first = value.trimStart()[0]
  const source =
    first === '{' || first === '[' || first === '"'
      ? value
      : JSON.stringify(value)
  return JSON.parse(source)
}

interface ThreadRow extends QueryResultRow {
  messages_json: Array<ModelMessage> | string
}

interface RunRow extends QueryResultRow {
  run_id: string
  thread_id: string
  status: string
  started_at: string | number
  finished_at: string | number | null
  error: string | null
  error_code: string | null
  usage_json: TokenUsage | string | null
  sandbox_key: string | null
  detached_since: string | number | null
  cancel_requested: boolean | null
  driver_epoch: number | null
  parent_run_id: string | null
  subagent_run_id: string | null
  name: string | null
}

interface InterruptRow extends QueryResultRow {
  interrupt_id: string
  run_id: string
  thread_id: string
  status: string
  requested_at: string | number
  resolved_at: string | number | null
  payload_json: Record<string, unknown> | string
  response_json: unknown
}

interface MetadataRow extends QueryResultRow {
  value_json: unknown
}

async function rowsOf<T extends QueryResultRow>(
  db: Pool,
  sql: string,
  params: Array<SqlParam> = [],
): Promise<Array<T>> {
  const result = await db.query<T>(sql, params)
  return result.rows
}

function mapRun(row: RunRow): RunRecord {
  return {
    runId: row.run_id,
    threadId: row.thread_id,
    status: toRunStatus(row.status),
    startedAt: epochMs(row.started_at),
    ...(row.finished_at != null
      ? { finishedAt: epochMs(row.finished_at) }
      : {}),
    ...(row.error != null
      ? {
          error: {
            message: row.error,
            ...(row.error_code != null ? { code: row.error_code } : {}),
          },
        }
      : {}),
    ...(row.usage_json != null ? { usage: readJson(row.usage_json) } : {}),
    ...(row.sandbox_key != null ? { sandboxKey: row.sandbox_key } : {}),
    ...(row.detached_since != null
      ? { detachedSince: epochMs(row.detached_since) }
      : {}),
    ...(row.cancel_requested != null
      ? { cancelRequested: row.cancel_requested }
      : {}),
    ...(row.driver_epoch != null ? { driverEpoch: row.driver_epoch } : {}),
    ...(row.parent_run_id != null ? { parentRunId: row.parent_run_id } : {}),
    ...(row.subagent_run_id != null
      ? { subagentRunId: row.subagent_run_id }
      : {}),
    ...(row.name != null ? { name: row.name } : {}),
  }
}

function mapInterrupt(row: InterruptRow): InterruptRecord {
  return {
    interruptId: row.interrupt_id,
    runId: row.run_id,
    threadId: row.thread_id,
    status: toInterruptStatus(row.status),
    requestedAt: epochMs(row.requested_at),
    payload: readJson(row.payload_json),
    ...(row.resolved_at != null
      ? { resolvedAt: epochMs(row.resolved_at) }
      : {}),
    ...(row.response_json != null
      ? { response: readJson(row.response_json) }
      : {}),
  }
}

function createMessageStore(db: Pool): MessageStore {
  return {
    async loadThread(threadId) {
      const rows = await rowsOf<ThreadRow>(
        db,
        'SELECT messages_json FROM chat_threads WHERE thread_id = $1',
        [threadId],
      )
      const row = rows[0]
      // Unknown thread is [], never null.
      return row ? readJson(row.messages_json) : []
    },
    // Full overwrite — `messages` is the complete authoritative transcript.
    async saveThread(threadId, messages) {
      await db.query(
        `INSERT INTO chat_threads (thread_id, messages_json, updated_at)
         VALUES ($1, $2::jsonb, $3)
         ON CONFLICT (thread_id) DO UPDATE
         SET messages_json = EXCLUDED.messages_json,
             updated_at = EXCLUDED.updated_at`,
        [threadId, JSON.stringify(messages), Date.now()],
      )
    },
  }
}

function createRunStore(db: Pool): RunStore {
  async function get(runId: string) {
    const rows = await rowsOf<RunRow>(
      db,
      'SELECT * FROM chat_runs WHERE run_id = $1',
      [runId],
    )
    const row = rows[0]
    return row ? mapRun(row) : null
  }

  return {
    get,
    // Idempotent: an existing runId is returned untouched.
    async createOrResume(input) {
      const { runId, threadId, startedAt, status } = input
      const existing = await get(runId)
      if (existing) return existing

      await db.query(
        `INSERT INTO chat_runs (
           run_id, thread_id, status, started_at,
           parent_run_id, subagent_run_id, name
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (run_id) DO NOTHING`,
        [
          runId,
          threadId,
          status ?? 'running',
          startedAt,
          input.parentRunId ?? null,
          input.subagentRunId ?? null,
          input.name ?? null,
        ],
      )
      // Re-read: a concurrent createOrResume may have won the race, and that
      // row is the authoritative one.
      const stored = await get(runId)
      return (
        stored ?? {
          runId,
          threadId,
          status: status ?? 'running',
          startedAt,
          ...(input.parentRunId !== undefined
            ? { parentRunId: input.parentRunId }
            : {}),
          ...(input.subagentRunId !== undefined
            ? { subagentRunId: input.subagentRunId }
            : {}),
          ...(input.name !== undefined ? { name: input.name } : {}),
        }
      )
    },
    // Patching an unknown runId is a no-op: never throws, never inserts.
    async update(runId, patch) {
      const sets: Array<string> = []
      const params: Array<SqlParam> = []
      const set = (column: string, value: SqlParam, cast?: 'jsonb') => {
        params.push(value)
        const ref = cast ? `$${params.length}::${cast}` : `$${params.length}`
        sets.push(`${column} = ${ref}`)
      }
      if (patch.status !== undefined) set('status', patch.status)
      if (patch.finishedAt !== undefined) set('finished_at', patch.finishedAt)
      // Both columns move together, so a later code-less failure cannot
      // leave a stale error_code from an earlier one behind.
      if (patch.error !== undefined) {
        set('error', patch.error.message)
        set('error_code', patch.error.code ?? null)
      }
      if (patch.usage !== undefined) {
        set('usage_json', JSON.stringify(patch.usage), 'jsonb')
      }
      // The four durable-run fields use `'field' in patch`, NOT
      // `!== undefined`: a reattach clears `detachedSince` by passing it
      // explicitly as `undefined`, and that must still write NULL.
      if ('sandboxKey' in patch) set('sandbox_key', patch.sandboxKey ?? null)
      if ('detachedSince' in patch) {
        set('detached_since', patch.detachedSince ?? null)
      }
      if ('cancelRequested' in patch) {
        set('cancel_requested', patch.cancelRequested ?? null)
      }
      if ('driverEpoch' in patch) set('driver_epoch', patch.driverEpoch ?? null)
      if (sets.length === 0) return

      params.push(runId)
      await db.query(
        `UPDATE chat_runs SET ${sets.join(', ')} WHERE run_id = $${params.length}`,
        params,
      )
    },
    async findActiveRun(threadId) {
      const rows = await rowsOf<RunRow>(
        db,
        `SELECT * FROM chat_runs
         WHERE thread_id = $1 AND status = 'running'
         ORDER BY started_at DESC
         LIMIT 1`,
        [threadId],
      )
      const row = rows[0]
      return row ? mapRun(row) : null
    },
    async listByThread(threadId) {
      const rows = await rowsOf<RunRow>(
        db,
        `SELECT * FROM chat_runs
         WHERE thread_id = $1
         ORDER BY started_at ASC`,
        [threadId],
      )
      return rows.map(mapRun)
    },
    async listByParentRun(parentRunId) {
      const rows = await rowsOf<RunRow>(
        db,
        `SELECT * FROM chat_runs
         WHERE parent_run_id = $1
         ORDER BY started_at ASC`,
        [parentRunId],
      )
      return rows.map(mapRun)
    },
    async listReclaimable({ now, ttlMs }) {
      const rows = await rowsOf<RunRow>(
        db,
        `SELECT * FROM chat_runs
         WHERE status = 'running'
           AND detached_since IS NOT NULL
           AND detached_since <= $1`,
        [now - ttlMs],
      )
      return rows.map(mapRun)
    },
  }
}

function createInterruptStore(db: Pool): InterruptStore {
  const listWhere = async (clause: string, params: Array<SqlParam>) => {
    const rows = await rowsOf<InterruptRow>(
      db,
      `SELECT * FROM chat_interrupts
       WHERE ${clause}
       ORDER BY requested_at ASC`,
      params,
    )
    return rows.map(mapInterrupt)
  }

  return {
    // Insert-if-absent: a duplicate create must never clobber a resolved
    // interrupt back to pending.
    async create(record) {
      await db.query(
        `INSERT INTO chat_interrupts (
           interrupt_id, run_id, thread_id, status, requested_at,
           payload_json, response_json
         ) VALUES ($1, $2, $3, 'pending', $4, $5::jsonb, $6::jsonb)
         ON CONFLICT (interrupt_id) DO NOTHING`,
        [
          record.interruptId,
          record.runId,
          record.threadId,
          record.requestedAt,
          JSON.stringify(record.payload),
          record.response === undefined
            ? null
            : JSON.stringify(record.response),
        ],
      )
    },
    async resolve(interruptId, response) {
      if (response !== undefined) {
        await db.query(
          `UPDATE chat_interrupts
           SET status = 'resolved', resolved_at = $2, response_json = $3::jsonb
           WHERE interrupt_id = $1`,
          [interruptId, Date.now(), JSON.stringify(response)],
        )
        return
      }
      await db.query(
        `UPDATE chat_interrupts
         SET status = 'resolved', resolved_at = $2
         WHERE interrupt_id = $1`,
        [interruptId, Date.now()],
      )
    },
    async cancel(interruptId) {
      await db.query(
        `UPDATE chat_interrupts
         SET status = 'cancelled', resolved_at = $2
         WHERE interrupt_id = $1`,
        [interruptId, Date.now()],
      )
    },
    async get(interruptId) {
      const rows = await rowsOf<InterruptRow>(
        db,
        'SELECT * FROM chat_interrupts WHERE interrupt_id = $1',
        [interruptId],
      )
      const row = rows[0]
      return row ? mapInterrupt(row) : null
    },
    list: (threadId) => listWhere('thread_id = $1', [threadId]),
    listPending: (threadId) =>
      listWhere(`thread_id = $1 AND status = 'pending'`, [threadId]),
    listByRun: (runId) => listWhere('run_id = $1', [runId]),
    listPendingByRun: (runId) =>
      listWhere(`run_id = $1 AND status = 'pending'`, [runId]),
  }
}

function createMetadataStore(db: Pool): MetadataStore {
  return {
    async get(namespace, key) {
      const rows = await rowsOf<MetadataRow>(
        db,
        `SELECT value_json FROM chat_metadata
         WHERE namespace = $1 AND key = $2`,
        [namespace, key],
      )
      const row = rows[0]
      return row ? readJson(row.value_json) : null
    },
    async set(namespace, key, value) {
      // JSON.stringify(undefined) is undefined, which a NOT NULL column rejects
      // with an opaque driver error. Fail clearly instead.
      if (value == null) {
        throw new TypeError(
          `Cannot store ${value} for (${namespace}, ${key}) — use delete() to clear metadata.`,
        )
      }
      await db.query(
        `INSERT INTO chat_metadata (namespace, key, value_json)
         VALUES ($1, $2, $3::jsonb)
         ON CONFLICT (namespace, key) DO UPDATE
         SET value_json = EXCLUDED.value_json`,
        [namespace, key, JSON.stringify(value)],
      )
    },
    async delete(namespace, key) {
      await db.query(
        'DELETE FROM chat_metadata WHERE namespace = $1 AND key = $2',
        [namespace, key],
      )
    },
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
