# Build Cloudflare Adapter — 5. The migration

[Guide and prerequisites](./tanstack-ai-persistence-build-cloudflare-adapter-64163c5a.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## 5. The migration

Write the tables into the app's `migrations/` directory as a new numbered file:

```sql
CREATE TABLE IF NOT EXISTS chat_threads (
  thread_id text PRIMARY KEY NOT NULL,
  messages_json text NOT NULL,
  updated_at integer NOT NULL
);
CREATE TABLE IF NOT EXISTS chat_runs (
  run_id text PRIMARY KEY NOT NULL,
  thread_id text NOT NULL,
  status text NOT NULL,
  started_at integer NOT NULL,
  finished_at integer,
  error text,
  error_code text,
  usage_json text,
  sandbox_key text,
  detached_since integer,
  cancel_requested integer,
  driver_epoch integer
);
CREATE INDEX IF NOT EXISTS chat_runs_thread_status ON chat_runs (thread_id, status);
CREATE INDEX IF NOT EXISTS chat_runs_thread_started ON chat_runs (thread_id, started_at);
-- Powers listReclaimable: status = 'running' AND detached_since <= cutoff.
CREATE INDEX IF NOT EXISTS chat_runs_status_detached ON chat_runs (status, detached_since);
CREATE TABLE IF NOT EXISTS chat_interrupts (
  interrupt_id text PRIMARY KEY NOT NULL,
  run_id text NOT NULL,
  thread_id text NOT NULL,
  status text NOT NULL,
  requested_at integer NOT NULL,
  resolved_at integer,
  payload_json text NOT NULL,
  response_json text
);
CREATE INDEX IF NOT EXISTS chat_interrupts_thread ON chat_interrupts (thread_id, requested_at);
CREATE TABLE IF NOT EXISTS chat_metadata (
  namespace text NOT NULL,
  key text NOT NULL,
  value_json text NOT NULL,
  PRIMARY KEY (namespace, key)
);
```

Apply with `wrangler d1 migrations apply <database-name>` (`--local` first, then
`--remote`). If the app also uses Drizzle, generate this file with
`drizzle-kit generate` instead of hand-writing it — the SQL and the Drizzle
table definitions must agree, so let one of them own the other.
