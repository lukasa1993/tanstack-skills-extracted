# Build Prisma Adapter — Only if you are publishing this as a package

[Guide and prerequisites](./tanstack-ai-persistence-build-prisma-adapter-2687241c.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## Only if you are publishing this as a package

Everything above assumes the file lives in the app. For a reusable npm adapter,
the same store bodies apply, plus:

- **Peer dep** `@prisma/client >=6.7.0`. Ship no datasource, generator,
  connection URL, or prebuilt SQL migration — those stay in the consumer's
  schema.
- **Type the client structurally** (a `PrismaClientLike` shape) and read model
  delegates off it at runtime, so Prisma 6 and 7 clients both satisfy it
  regardless of where they were generated.
- **Ship the models as a raw string asset** plus a CLI
  (`tanstack-ai-prisma-models`) that copies a provider-neutral fragment into the
  consumer's multi-file schema directory. They then run `prisma migrate`.
- **Let consumers rename**: `prismaPersistence(prisma, { models: { messages: 'chatMessage' } })`,
  where map values are the camelCase client accessors. Throw a
  `PrismaModelError` naming every store whose delegate cannot be found. Keep the
  field surface and the composite-id alias fixed; database names and extra
  app-owned fields are theirs.
- Run `runPersistenceConformance` over a temporary SQLite database generated
  from the fragment.
