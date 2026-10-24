# Ai Persistence — Sub-skills

[Guide and prerequisites](./tanstack-ai-persistence-2fec28cd.md) · Published skill · `@tanstack/ai-persistence@1.0.0`.

## Sub-skills

| Need to...                                      | Read                                                  |
| ----------------------------------------------- | ----------------------------------------------------- |
| Wire server-side chat history, runs, interrupts | ./tanstack-ai-persistence-server-3b558cfc.md#source-tanstack-ai-persistence-server                        |
| Survive reloads in the browser                  | ./tanstack-ai-core-client-persistence-9ee3012c.md#source-tanstack-ai-core-client-persistence in `@tanstack/ai` |
| Implement the store interfaces for your DB      | ./tanstack-ai-persistence-stores-e6061122.md#source-tanstack-ai-persistence-stores                        |
| Multi-instance locks (separate from state)      | ./tanstack-ai-core-locks-b6cb9694.md#source-tanstack-ai-core-locks in `@tanstack/ai`              |

Adding persistence to an app? Pick the recipe that matches what it already
runs — each one writes a single `chat-persistence.ts` against the app's
existing database client and schema:

| The app runs...                                      | Read                                                    |
| ---------------------------------------------------- | ------------------------------------------------------- |
| Drizzle ORM (SQLite / Postgres / MySQL)              | ./tanstack-ai-persistence-build-drizzle-adapter-5655a048.md#source-tanstack-ai-persistence-build-drizzle-adapter           |
| Prisma                                               | ./tanstack-ai-persistence-build-prisma-adapter-2687241c.md#source-tanstack-ai-persistence-build-prisma-adapter            |
| Cloudflare Workers + D1 (± Durable Object locks)     | ./tanstack-ai-persistence-build-cloudflare-adapter-64163c5a.md#source-tanstack-ai-persistence-build-cloudflare-adapter        |
| Cloudflare Workers + R2/D1 for generated media bytes | ./tanstack-ai-persistence-build-cloudflare-artifact-store-60c47cfe.md#source-tanstack-ai-persistence-build-cloudflare-artifact-store |
| Anything else — raw `pg`, Kysely, SQLite, Mongo      | ./tanstack-ai-persistence-build-custom-adapter-61b5cbc7.md#source-tanstack-ai-persistence-build-custom-adapter            |
