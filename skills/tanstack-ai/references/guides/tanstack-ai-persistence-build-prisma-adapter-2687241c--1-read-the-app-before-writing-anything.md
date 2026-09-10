# Build Prisma Adapter — 1. Read the app before writing anything

[Guide and prerequisites](./tanstack-ai-persistence-build-prisma-adapter-2687241c.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## 1. Read the app before writing anything

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
