# Build Custom Adapter — Overview

[Guide and prerequisites](./tanstack-ai-persistence-build-custom-adapter-61b5cbc7.md) · Published skill · `@tanstack/ai-persistence@1.0.1`.

# Custom Chat Persistence

The deliverable is **one file in the app** — `src/lib/chat-persistence.ts` —
exporting a `ChatPersistence` built from the database client the app already
has. Plus whatever DDL that database needs, added through the app's existing
migration flow.

Do not create a package, a second client, or a migration runner.

**Always write all four tables (or collections) and all four stores: thread, run, interrupt,
metadata.** The docs call `interrupts` and `metadata` optional for a
hand-rolled adapter; this recipe is not that case. `withPersistence` needs
all four to type-check as `ChatPersistence`, and the conformance suite fails
without them. Do not stop at a thread table and a run table.

**Route first.** If the app already runs one of these, stop and use that skill —
it has the driver-specific code:

| App runs                  | Use                                     |
| ------------------------- | --------------------------------------- |
| Drizzle ORM (any dialect) | ai-persistence/build-drizzle-adapter    |
| Prisma                    | ai-persistence/build-prisma-adapter     |
| Cloudflare Workers + D1   | ai-persistence/build-cloudflare-adapter |

Everything else lands here. The full contracts and their invariants are in
**ai-persistence/stores** and `docs/persistence/store-reference.md`; the
complete worked `node:sqlite` walkthrough is
`docs/persistence/build-your-own-chat-adapter.md` and
`examples/ts-react-chat/src/lib/sqlite-persistence.ts`.
