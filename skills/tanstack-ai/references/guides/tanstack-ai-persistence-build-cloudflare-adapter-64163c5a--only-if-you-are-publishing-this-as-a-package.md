# Build Cloudflare Adapter — Only if you are publishing this as a package

[Guide and prerequisites](./tanstack-ai-persistence-build-cloudflare-adapter-64163c5a.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

## Only if you are publishing this as a package

For a reusable npm adapter rather than a file in the app: peer-dep
`@cloudflare/workers-types >=4.x`, and prepend
`/// <reference types="@cloudflare/workers-types" />` to the generated
`index.d.ts` so consumers get the D1/DurableObject types. Emit the table SQL
into the consumer's `migrations/` directory rather than shipping a runner, and
if you offer both raw-D1 and Drizzle paths, guard with a test that the emitted
SQL and the Drizzle tables describe the same schema.
