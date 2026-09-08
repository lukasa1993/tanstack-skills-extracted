# Server Functions — Overview

[Guide and prerequisites](./tanstack-start-client-core-start-core-server-functions-49d113b0.md) · Published skill · `@tanstack/start-client-core@1.170.28`.

# Server Functions

Server functions are type-safe RPCs created with `createServerFn`. They run exclusively on the server but can be called from anywhere — loaders, components, hooks, event handlers, or other server functions.

> **CRITICAL**: Server functions are API endpoints. They are reachable independently of whichever route renders the calling UI. **Auth must be enforced inside the handler (or via middleware) for any server function that touches private data.** Route `beforeLoad` is UX, not the data boundary. See [start-core/auth-server-primitives](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874.md#source-tanstack-start-client-core-start-core-auth-server-primitives) for the session/middleware pattern.
> **CRITICAL**: Loaders are ISOMORPHIC — they run on BOTH client and server. Database queries, file system access, and secret API keys MUST go inside `createServerFn`, NOT in loaders directly.
> **CRITICAL**: Do not use `"use server"` directives, `getServerSideProps`, or any Next.js/Remix server patterns. TanStack Start uses `createServerFn` exclusively.
