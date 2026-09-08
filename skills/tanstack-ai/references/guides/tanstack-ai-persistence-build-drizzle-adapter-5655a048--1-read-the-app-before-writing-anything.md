# Build Drizzle Adapter — 1. Read the app before writing anything

[Guide and prerequisites](./tanstack-ai-persistence-build-drizzle-adapter-5655a048.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

## 1. Read the app before writing anything

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
