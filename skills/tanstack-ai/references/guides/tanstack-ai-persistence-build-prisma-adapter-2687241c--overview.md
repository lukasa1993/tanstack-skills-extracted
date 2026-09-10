# Build Prisma Adapter — Overview

[Guide and prerequisites](./tanstack-ai-persistence-build-prisma-adapter-2687241c.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

# Prisma Chat Persistence

The deliverable is **one file in the app** — `src/lib/chat-persistence.ts` —
exporting a `ChatPersistence` built from the app's existing `PrismaClient`. Plus
four models added to the app's existing `schema.prisma` and a migration created
with the app's own `prisma migrate`.

Do not create a package, a second client, a datasource block, a generator, or a
hand-written SQL migration. The app has those.

Read the **Store Reference**
(`docs/persistence/store-reference.md`) for the store contracts and
invariants, and **ai-persistence/stores** for the shape rules. Every
store below mirrors the reference in-memory backend in
`@tanstack/ai-persistence` (`memory.ts`); the shared conformance testkit is the
proof.
