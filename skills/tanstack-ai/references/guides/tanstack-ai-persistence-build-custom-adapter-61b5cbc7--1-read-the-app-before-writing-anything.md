# Build Custom Adapter — 1. Read the app before writing anything

[Guide and prerequisites](./tanstack-ai-persistence-build-custom-adapter-61b5cbc7.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

## 1. Read the app before writing anything

| Find               | Where to look                                                 | What it decides                                        |
| ------------------ | ------------------------------------------------------------- | ------------------------------------------------------ |
| The client         | `src/db.ts`, `src/lib/db.ts`, `src/server/db.ts`              | What the file imports — never construct a second pool  |
| Client lifetime    | module singleton vs per-request factory (`getDb()`, bindings) | `export const chatPersistence` vs `export function`    |
| Migration flow     | `migrations/`, `drizzle/`, `supabase/migrations/`, an ORM CLI | How the DDL gets applied — use theirs, add nothing new |
| Naming conventions | existing tables/collections                                   | Prefix (`chat_*`) so nothing collides                  |
| JSON support       | `jsonb` (Postgres), `json` (MySQL 5.7+), text (SQLite)        | Whether mappers stringify/parse                        |
| Import alias       | `tsconfig.json` `paths`                                       | `@/db`, `~/db`, `#/db`, or a relative path             |
