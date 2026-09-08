# Data Loading — Tensions

[Guide and prerequisites](./tanstack-router-core-data-loading-9f5ce056.md) · Published skill · `@tanstack/router-core@1.171.28`.

## Tensions

- **Client-first loaders vs SSR expectations**: Loaders run on the client by default. When using SSR (TanStack Start), they run on both client and server. Browser-only APIs work by default but break under SSR. Server-only APIs (fs, db) break by default but work under Start server functions. See **./tanstack-router-core-ssr-e95e1bf1.md#source-tanstack-router-core-ssr**.
- **Built-in SWR cache vs external cache coordination**: Router has built-in caching. When using TanStack Query, set `defaultPreloadStaleTime: 0` to avoid double-caching. See **https://skills.sh/lukasa1993/tanstack-skills-extracted/tanstack-query**.

---
