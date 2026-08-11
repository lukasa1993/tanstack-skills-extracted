# Deployment and rendering

Deployment and server-component guidance.

<a id="source-tanstack-react-start-server-components"></a>

## Server Components

Source: `tanstack-react-start-server-components`.

## TanStack Start React Server Components

Treat TanStack Start RSCs as fetchable React Flight payloads, not as a framework-owned server tree. Start from data ownership and cache ownership, then choose the smallest RSC primitive that fits.

### When this skill is active

1. Inspect `vite.config.*` for `tanstackStart({ rsc: { enabled: true } })`, `rsc()`, and `viteReact()`.
2. Inspect route files for `loader`, `loaderDeps`, `staleTime`, `ssr`, and `errorComponent`.
3. Inspect server boundaries: `createServerFn`, `createServerOnlyFn`, `.server.*`, and imports from `@tanstack/react-start/server`.
4. Identify the cache owner: Router loader cache, TanStack Query, or HTTP/server cache.
5. Identify the refresh path: `router.invalidate()`, `invalidateQueries`, `refetchQueries`, or GET cache headers.

### Hard invariants

- Route loaders are isomorphic. Do not put DB access, secrets, or Node-only APIs directly in a loader. If the loader itself must use browser APIs, make that route `ssr: false`.
- `renderServerComponent(...)` returns a renderable fragment. It does not support slots.
- `createCompositeComponent(...)` is for server-rendered UI that must accept client-provided `children`, render props, or component props.
- Query-cached RSC values require `structuralSharing: false`.
- Slot payloads are opaque on the server. Do not inspect, map, or clone `props.children`.
- Render-prop and component-slot arguments must stay Flight-serializable.
- Current server function validation API is `.validator(...)`. Older snippets may still show `.validator(...)`; normalize them.
- TanStack custom serialization does not apply inside RSCs yet. Stay inside native Flight-supported values.

### Decide three things immediately

#### 1) Transport / composition primitive

- No client slots needed -> `renderServerComponent`
- Client interactivity must be inserted inside server-rendered markup -> `createCompositeComponent` + `<CompositeComponent src={...} />`
- Need custom Flight streaming, API routes, or non-standard transport -> `renderToReadableStream`, `createFromReadableStream`, `createFromFetch`

#### 2) Cache owner

- Route-shaped data keyed by pathname, params, or search -> Router cache
- Independent key space, background refetch, or non-route ownership -> TanStack Query
- Cross-request reuse on server or CDN -> GET `createServerFn` + response cache headers and/or external server cache

#### 3) Refresh owner

- Router-owned RSC -> `router.invalidate()`
- Query-owned RSC -> `queryClient.invalidateQueries(...)` or `refetchQueries(...)`
- Mixed Router + Query -> invalidate both deliberately; do not assume one refreshes the other

### Pattern chooser

- Simple server fragment in a route loader -> `renderServerComponent`
- Interactive slot inside server markup -> `createCompositeComponent`
- Route component needs browser APIs but loader can still prefetch on the server -> `ssr: 'data-only'`
- Loader itself needs browser APIs -> `ssr: false`
- Route cache key must include search params -> `loaderDeps`
- Query-managed RSC -> `useSuspenseQuery` + SSR `ensureQueryData`
- Multiple independent RSCs -> separate server functions + `Promise.all`
- Multiple RSCs sharing data or invalidating together -> one server function returning many renderables or sources
- Need isolated widget failures or staggered reveal -> return promises from the loader and resolve with `use()` inside Suspense

### Slot choice

- `children`: free-form composition, no server-to-client data flow
- render props: the server must pass serializable data into client-rendered UI
- component props: reusable client slot with a stable typed prop surface
- If you are about to use `Children.map`, `cloneElement`, or inspect `children` on the server, stop and convert it to a render prop

### Review / refactor checklist

- Is the chosen primitive the smallest one that fits?
- Does the loader own the RSC, or should Query own it?
- Are route cache keys complete (`params` + minimal `loaderDeps`)?
- Is invalidation hitting the real cache owner?
- Are query options using `structuralSharing: false` for any RSC value?
- Are mutations explicit `createServerFn({ method: 'POST' })` calls instead of hidden server actions?
- Are server-only imports kept inside server functions or server-only boundaries?
- Are examples using current names (`renderServerComponent`, `.validator`) instead of stale ones?

### Debug fast

- Setup, exports, or stale docs mismatch -> `docs/current-api-notes.md`
- Composite Component design or slot bug -> `docs/composite-components.md`
- Stale data, refetching, loader keys, Query vs Router ownership, or SSR mode -> `docs/caching-refresh-ssr.md`
- Review, refactor, import leaks, error boundaries, or serialization bugs -> `docs/debugging-review.md`
- Architecture and Next/App Router translation -> `docs/architecture.md`

### Copy-paste patterns

- `examples/01-renderable-route-loader.tsx`
- `examples/02-composite-slots.tsx`
- `examples/03-query-owned-rsc.tsx`
- `examples/04-selective-ssr-data-only.tsx`
- `examples/05-ssr-false-browser-loader.tsx`
- `examples/06-low-level-flight-api-route.tsx`

### Default implementation sequence

1. Keep server-only work inside `createServerFn` or `createServerOnlyFn`
2. Return an RSC from the server function
3. Consume it through the route loader unless Query has a clear ownership advantage
4. Add the smallest cache policy that satisfies freshness requirements
5. Wire invalidation exactly once at the real cache owner
6. Escalate to Composite Components only when the client must fill slots
7. Escalate to low-level Flight APIs only when high-level helpers cannot express the transport

<a id="source-tanstack-start-client-core-start-core-deployment"></a>

## Deployment

Source: `tanstack-start-client-core-start-core-deployment`.

## Deployment and Rendering

TanStack Start deploys to any hosting provider via Vite and Nitro. This skill covers hosting setup, SSR configuration, prerendering, and SEO.

### Hosting Providers

#### Cloudflare Workers

```bash
pnpm add -D @cloudflare/vite-plugin wrangler
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart(),
    viteReact(),
  ],
})
```

```jsonc
// wrangler.jsonc
{
  "name": "my-app",
  "compatibility_date": "2025-09-02",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@tanstack/react-start/server-entry",
}
```

Deploy: `npx wrangler login && pnpm run deploy`

> **Worker env is per-request.** Cloudflare Workers inject env vars at request time. `process.env.X` at module scope evaluates to `undefined` even on the server. The Cloudflare-canonical way to read env (including from module scope) is the `cloudflare:workers` env binding:
>
> ```ts
> import { env } from 'cloudflare:workers'
> const apiHost = env.API_HOST
> ```
>
> Or read `process.env.X` per-request inside `.handler()` / middleware `.server()`. See [Cloudflare's environment-variables docs](https://developers.cloudflare.com/workers/configuration/environment-variables/) and [start-core/execution-model](./foundations.md#source-tanstack-start-client-core-start-core-execution-model).

#### Netlify

```bash
pnpm add -D @netlify/vite-plugin-tanstack-start
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [tanstackStart(), netlify(), viteReact()],
})
```

Deploy: `npx netlify deploy`

#### Nitro (Vercel, Railway, Node.js, Docker)

```bash
npm install nitro@npm:nitro-nightly@latest
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [tanstackStart(), nitro(), viteReact()],
})
```

Build and start: `npm run build && node .output/server/index.mjs`

#### Bun

Bun deployment requires React 19. For React 18, use Node.js deployment.

```ts
// vite.config.ts — add bun preset to nitro
plugins: [tanstackStart(), nitro({ preset: 'bun' }), viteReact()]
```

### Selective SSR

Control SSR per route with the `ssr` property.

#### `ssr: true` (default)

Runs `beforeLoad` and `loader` on server, renders component on server:

```tsx
export const Route = createFileRoute('/posts/$postId')({
  ssr: true, // default
  loader: () => fetchPost(), // runs on server during SSR
  component: PostPage, // rendered on server
})
```

#### `ssr: false`

Disables server execution of `beforeLoad`/`loader` and server rendering:

```tsx
export const Route = createFileRoute('/dashboard')({
  ssr: false,
  loader: () => fetchDashboard(), // runs on client only
  component: DashboardPage, // rendered on client only
})
```

#### `ssr: 'data-only'`

Runs `beforeLoad`/`loader` on server but renders component on client only:

```tsx
export const Route = createFileRoute('/canvas')({
  ssr: 'data-only',
  loader: () => fetchCanvasData(), // runs on server
  component: CanvasPage, // rendered on client only
})
```

#### Functional Form

Decide SSR at runtime based on params/search:

```tsx
export const Route = createFileRoute('/docs/$docType/$docId')({
  ssr: ({ params }) => {
    if (params.status === 'success' && params.value.docType === 'sheet') {
      return false
    }
  },
})
```

#### SSR Inheritance

Children inherit parent SSR config and can only be MORE restrictive:

- `true` → `data-only` or `false` (allowed)
- `false` → `true` (NOT allowed — parent `false` wins)

#### Default SSR

Change the default for all routes in `src/start.ts`:

```tsx
import { createStart } from '@tanstack/react-start'

export const startInstance = createStart(() => ({
  defaultSsr: false,
}))
```

### Static Prerendering

Generate static HTML at build time:

```ts
// vite.config.ts
tanstackStart({
  prerender: {
    enabled: true,
    crawlLinks: true,
    concurrency: 14,
    failOnError: true,
  },
})
```

Static routes are auto-discovered. Dynamic routes (e.g. `/users/$userId`) require `crawlLinks` or explicit `pages` config.

### SEO and Head Management

#### Basic Meta Tags

```tsx
export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'My App - Home' },
      { name: 'description', content: 'Welcome to My App' },
    ],
  }),
})
```

#### Dynamic Meta from Loader Data

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => fetchPost(params.postId),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData.title },
      { name: 'description', content: loaderData.excerpt },
      { property: 'og:title', content: loaderData.title },
      { property: 'og:image', content: loaderData.coverImage },
    ],
  }),
})
```

#### Structured Data (JSON-LD)

```tsx
head: ({ loaderData }) => ({
  scripts: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: loaderData.title,
      }),
    },
  ],
})
```

#### Dynamic Sitemap via Server Route

```ts
// src/routes/sitemap[.]xml.ts
export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const posts = await fetchAllPosts()
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${posts.map((p) => `<url><loc>https://myapp.com/posts/${p.id}</loc></url>`).join('')}
</urlset>`
        return new Response(sitemap, {
          headers: { 'Content-Type': 'application/xml' },
        })
      },
    },
  },
})
```

### Common Mistakes

#### 1. HIGH: Missing nodejs_compat flag for Cloudflare Workers

```jsonc
// WRONG — Node.js APIs fail at runtime
{ "compatibility_flags": [] }

// CORRECT
{ "compatibility_flags": ["nodejs_compat"] }
```

#### 2. MEDIUM: Bun deployment with React 18

Bun-specific deployment only works with React 19. Use Node.js deployment for React 18.

#### 3. MEDIUM: Child route loosening parent SSR config

```tsx
// Parent sets ssr: false
// WRONG — child cannot upgrade to ssr: true
const parentRoute = createFileRoute('/dashboard')({ ssr: false })
const childRoute = createFileRoute('/dashboard/stats')({
  ssr: true, // IGNORED — parent false wins
})

// CORRECT — children can only be MORE restrictive
const parentRoute = createFileRoute('/dashboard')({ ssr: 'data-only' })
const childRoute = createFileRoute('/dashboard/stats')({
  ssr: false, // OK — more restrictive than parent
})
```

### Cross-References

- [start-core/server-routes](./server-runtime.md#source-tanstack-start-client-core-start-core-server-routes) — API endpoints for sitemaps, robots.txt
- [start-core/execution-model](./foundations.md#source-tanstack-start-client-core-start-core-execution-model) — SSR affects where code runs
