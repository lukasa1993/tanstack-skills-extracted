# Build Drizzle Adapter — Overview

[Guide and prerequisites](./tanstack-ai-persistence-build-drizzle-adapter-5655a048.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

# Drizzle Chat Persistence

The deliverable is **one file in the app** — `src/lib/chat-persistence.ts` —
exporting a `ChatPersistence` built from the app's existing Drizzle `db`. Plus
four tables added to the app's existing schema file and a migration generated
through the app's existing `drizzle-kit` setup.

Do not create a package, a second `db` instance, a migration runner, or a
`drizzle.config.ts`. The app has those.

Read the **Store Reference**
(`docs/persistence/store-reference.md`) for the store contracts and
invariants, and **ai-persistence/stores** for the shape rules. Every
store below mirrors the reference in-memory backend in
`@tanstack/ai-persistence` (`memory.ts`); the shared conformance testkit is the
proof.
