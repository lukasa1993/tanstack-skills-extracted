# Ssr — Overview

[Guide and prerequisites](./tanstack-router-core-ssr-e95e1bf1.md) · Published skill · `@tanstack/router-core@1.171.29`.

# SSR (Server-Side Rendering)

> **WARNING**: SSR APIs are experimental. They share internal implementations with TanStack Start and may change. **TanStack Start is the recommended way to do SSR in production** — use manual SSR setup only when integrating with an existing server.

> **CRITICAL**: TanStack Router is CLIENT-FIRST. Loaders run on the client by default. With SSR enabled, loaders run on BOTH client AND server. They are NOT server-only like Remix/Next.js loaders. See [router-core/data-loading](./tanstack-router-core-data-loading-9f5ce056.md#source-tanstack-router-core-data-loading).

> **CRITICAL**: Do not generate Next.js patterns (`getServerSideProps`, App Router, server components) or Remix patterns (server-only loader exports). TanStack Router has its own SSR API.
