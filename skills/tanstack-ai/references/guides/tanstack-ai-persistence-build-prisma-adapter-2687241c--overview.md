# Build Prisma Adapter — Overview

[Guide and prerequisites](./tanstack-ai-persistence-build-prisma-adapter-2687241c.md) · Published skill · `@tanstack/ai-persistence@1.0.1`.

# Prisma Chat Persistence

The deliverable is **one file in the app** — `src/lib/chat-persistence.ts` —
exporting a `ChatPersistence` built from the app's existing `PrismaClient`. Plus
four models added to the app's existing `schema.prisma` and a migration created
with the app's own `prisma migrate`.

Do not create a package, a second client, a datasource block, a generator, or a
hand-written SQL migration. The app has those.

**Always write all four models and all four stores: thread, run, interrupt,
metadata.** The docs call `interrupts` and `metadata` optional for a
hand-rolled adapter; this recipe is not that case. `withPersistence` needs
all four to type-check as `ChatPersistence`, and the conformance suite fails
without them. Do not stop at a thread table and a run table.

Read the **Store Reference**
(`docs/persistence/store-reference.md`) for the store contracts and
invariants, and **ai-persistence/stores** for the shape rules. Every
store below mirrors the reference in-memory backend in
`@tanstack/ai-persistence` (`memory.ts`); the shared conformance testkit is the
proof.
