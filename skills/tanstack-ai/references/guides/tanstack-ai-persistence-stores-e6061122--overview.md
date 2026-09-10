# Stores — Overview

[Guide and prerequisites](./tanstack-ai-persistence-stores-e6061122.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

# Persistence Stores

> Builds on **ai-persistence** and **ai-persistence/server**.

`@tanstack/ai-persistence` ships **contracts**, not a backend for your
database. An adapter is an object with a `stores` map; implement the stores you
need against whatever you already run and hand the result to
`withPersistence`. The core never inspects your tables, so the schema is yours.

Use `memoryPersistence()` for dev and tests. Everything durable is an adapter
you write. This skill is the contract reference; the per-stack recipes that
write a `chat-persistence.ts` into an app are
`ai-persistence/build-{drizzle,prisma,cloudflare,custom}-adapter`, and
a complete `node:sqlite` implementation lives in
`examples/ts-react-chat/src/lib/sqlite-persistence.ts`.
