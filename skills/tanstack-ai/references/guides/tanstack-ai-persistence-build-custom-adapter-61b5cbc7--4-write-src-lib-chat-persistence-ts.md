# Build Custom Adapter — 4. Write `src/lib/chat-persistence.ts`

[Guide and prerequisites](./tanstack-ai-persistence-build-custom-adapter-61b5cbc7.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## 4. Write `src/lib/chat-persistence.ts`

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
