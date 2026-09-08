# Build Cloudflare Artifact Store — 2. ArtifactStore backed by D1

[Guide and prerequisites](./tanstack-ai-persistence-build-cloudflare-artifact-store-60c47cfe.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

## 2. ArtifactStore backed by D1

`ArtifactRecord` is `{ artifactId, runId, threadId, blobKey?, name, mimeType, size,
sourceUrl?, createdAt }` (`createdAt` epoch ms). One flat table is keyed by
`artifact_id`. It has run and thread ordered indexes for `list` and
`listForThread`.

```sql
CREATE TABLE IF NOT EXISTS generation_artifacts (
  artifact_id  text PRIMARY KEY NOT NULL,
  run_id       text NOT NULL,
  thread_id    text NOT NULL,
  blob_key     text,
  name         text NOT NULL,
  mime_type    text NOT NULL,
  size         integer NOT NULL,
  source_url   text,
  created_at   integer NOT NULL
);
CREATE INDEX IF NOT EXISTS generation_artifacts_run_order
  ON generation_artifacts (run_id, created_at, artifact_id);
CREATE INDEX IF NOT EXISTS generation_artifacts_thread_order
  ON generation_artifacts (thread_id, created_at, artifact_id);
```

```ts ignore
import { defineArtifactStore } from '@tanstack/ai-persistence'
import type { ArtifactRecord } from '@tanstack/ai-persistence'

interface ArtifactRow {
  artifact_id: string
  run_id: string
  thread_id: string
  blob_key: string | null
  name: string
  mime_type: string
  size: number
  source_url: string | null
  created_at: number
}

function fromRow(row: ArtifactRow): ArtifactRecord {
  return {
    artifactId: row.artifact_id,
    runId: row.run_id,
    threadId: row.thread_id,
    ...(row.blob_key != null ? { blobKey: row.blob_key } : {}),
    name: row.name,
    mimeType: row.mime_type,
    size: row.size,
    ...(row.source_url != null ? { sourceUrl: row.source_url } : {}),
    createdAt: row.created_at,
  }
}

export function d1ArtifactStore(db: D1Database) {
  return defineArtifactStore({
    async save(record) {
      // Insert or overwrite (artifact ids are unique).
      await db
        .prepare(
          `INSERT INTO generation_artifacts
             (artifact_id, run_id, thread_id, blob_key, name, mime_type, size, source_url, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(artifact_id) DO UPDATE SET
             run_id = excluded.run_id, thread_id = excluded.thread_id,
             blob_key = excluded.blob_key, name = excluded.name,
             mime_type = excluded.mime_type, size = excluded.size,
             source_url = excluded.source_url, created_at = excluded.created_at`,
        )
        .bind(
          record.artifactId,
          record.runId,
          record.threadId,
          record.blobKey ?? null,
          record.name,
          record.mimeType,
          record.size,
          record.sourceUrl ?? null,
          record.createdAt,
        )
        .run()
    },

    async get(artifactId) {
      const row = await db
        .prepare(`SELECT * FROM generation_artifacts WHERE artifact_id = ?`)
        .bind(artifactId)
        .first<ArtifactRow>()
      return row ? fromRow(row) : null
    },

    async list(runId) {
      const { results } = await db
        .prepare(
          `SELECT * FROM generation_artifacts WHERE run_id = ? ORDER BY created_at ASC, artifact_id ASC`,
        )
        .bind(runId)
        .all<ArtifactRow>()
      return results.map(fromRow)
    },

    async listForThread(threadId) {
      const { results } = await db
        .prepare(
          `SELECT * FROM generation_artifacts
           WHERE thread_id = ?
           ORDER BY created_at ASC, artifact_id ASC`,
        )
        .bind(threadId)
        .all<ArtifactRow>()
      return results.map(fromRow)
    },

    async delete(artifactId) {
      await db
        .prepare(`DELETE FROM generation_artifacts WHERE artifact_id = ?`)
        .bind(artifactId)
        .run()
    },

    async deleteForRun(runId) {
      await db
        .prepare(`DELETE FROM generation_artifacts WHERE run_id = ?`)
        .bind(runId)
        .run()
    },
  })
}
```

Omitting `source_url` / `blob_key` from the record when the column is `NULL`
keeps records comparing cleanly against the reference in-memory store. Persist
`blob_key` verbatim: a `storageKey` mapper can put the bytes anywhere, so a
reader cannot recompute the path — `resolveArtifactBlobKey(record)` falls back
to the default convention only for rows written before the column existed.
Cloudflare KV is not an equivalent ArtifactStore backend. The required ordering
and indexed reads need a transactional indexed database. Use D1 or another
transactional indexed database for artifact metadata. Store the bytes in R2.
