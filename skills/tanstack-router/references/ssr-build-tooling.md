# SSR and build tooling

SSR, code splitting, route generation, and build plugins.

<a id="source-tanstack-router-core-code-splitting"></a>

## Code Splitting

Source: `tanstack-router-core-code-splitting`.

## Code Splitting

TanStack Router separates route code into **critical** (required to match and start loading) and **non-critical** (can be lazy-loaded). The bundler plugin can split automatically, or you can split manually with `.lazy.tsx` files.

> **CRITICAL**: Never `export` component functions from route files — exported functions are included in the main bundle and bypass code splitting entirely.

> **CRITICAL**: Use `getRouteApi('/path')` in code-split files, NOT `import { Route } from './route'`. Importing Route defeats code splitting.

### What Stays in the Main Bundle (Critical)

- Path parsing/serialization
- `validateSearch`
- `loader`, `beforeLoad`
- Route context, static data
- Links, scripts, styles

### What Gets Split (Non-Critical)

- `component`
- `errorComponent`
- `pendingComponent`
- `notFoundComponent`

> The `loader` is NOT split by default. It is already async, so splitting it adds a double async cost: fetch the chunk, then execute the loader. Only split the loader if you have a specific reason.

### Setup: Automatic Code Splitting

Enable `autoCodeSplitting: true` in the bundler plugin. This is the recommended approach.

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    // TanStack Router plugin MUST come before the framework plugin
    tanstackRouter({
      autoCodeSplitting: true,
    }),
    react(),
  ],
})
```

With this enabled, route files are automatically transformed. Components are split into separate chunks; loaders stay in the main bundle. No `.lazy.tsx` files needed.

```tsx
// src/routes/posts.tsx — everything in one file, splitting is automatic
import { createFileRoute } from '@tanstack/react-router'
import { fetchPosts } from '../api'

export const Route = createFileRoute('/posts')({
  loader: fetchPosts,
  component: PostsComponent,
})

// NOT exported — this is critical for automatic code splitting to work
function PostsComponent() {
  const posts = Route.useLoaderData()
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

### Manual Splitting with `.lazy.tsx`

If you cannot use automatic code splitting (e.g. CLI-only, no bundler plugin), split manually into two files:

```tsx
// src/routes/posts.tsx — critical route config only
import { createFileRoute } from '@tanstack/react-router'
import { fetchPosts } from '../api'

export const Route = createFileRoute('/posts')({
  loader: fetchPosts,
})
```

```tsx
// src/routes/posts.lazy.tsx — non-critical (lazy-loaded)
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/posts')({
  component: PostsComponent,
})

function PostsComponent() {
  // Use getRouteApi to access typed hooks without importing Route
  return <div>Posts</div>
}
```

`createLazyFileRoute` supports only: `component`, `errorComponent`, `pendingComponent`, `notFoundComponent`.

### Virtual Routes

If splitting leaves the critical route file empty, delete it entirely. A virtual route is auto-generated in `routeTree.gen.ts`:

```tsx
// src/routes/about.lazy.tsx — no about.tsx needed
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/about')({
  component: () => <h1>About Us</h1>,
})
```

### Code-Based Splitting

For code-based (non-file-based) routing, use `createLazyRoute` and the `.lazy()` method:

```tsx
// src/posts.lazy.tsx
import { createLazyRoute } from '@tanstack/react-router'

export const Route = createLazyRoute('/posts')({
  component: PostsComponent,
})

function PostsComponent() {
  return <div>Posts</div>
}
```

```tsx
// src/app.tsx
import { createRoute } from '@tanstack/react-router'

const postsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/posts',
}).lazy(() => import('./posts.lazy').then((d) => d.Route))
```

### Accessing Typed Hooks in Split Files: `getRouteApi`

When your component lives in a separate file, use `getRouteApi` to get typed access to route hooks without importing the Route object:

```tsx
// src/routes/posts.lazy.tsx
import { createLazyFileRoute, getRouteApi } from '@tanstack/react-router'

const routeApi = getRouteApi('/posts')

export const Route = createLazyFileRoute('/posts')({
  component: PostsComponent,
})

function PostsComponent() {
  const posts = routeApi.useLoaderData()
  const { page } = routeApi.useSearch()
  const params = routeApi.useParams()
  const context = routeApi.useRouteContext()
  return <div>Posts page {page}</div>
}
```

`getRouteApi` provides: `useLoaderData`, `useLoaderDeps`, `useMatch`, `useParams`, `useRouteContext`, `useSearch`.

### Per-Route Split Overrides: `codeSplitGroupings`

Override split behavior for a specific route by adding `codeSplitGroupings` directly in the route file:

```tsx
// src/routes/posts.tsx
import { createFileRoute } from '@tanstack/react-router'
import { loadPostsData } from './-heavy-posts-utils'

export const Route = createFileRoute('/posts')({
  // Bundle loader and component together for this route
  codeSplitGroupings: [['loader', 'component']],
  loader: () => loadPostsData(),
  component: PostsComponent,
})

function PostsComponent() {
  const data = Route.useLoaderData()
  return <div>{data.title}</div>
}
```

### Global Split Configuration

#### `defaultBehavior` — Change Default Groupings

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      autoCodeSplitting: true,
      codeSplittingOptions: {
        defaultBehavior: [
          // Bundle all UI components into one chunk
          [
            'component',
            'pendingComponent',
            'errorComponent',
            'notFoundComponent',
          ],
        ],
      },
    }),
  ],
})
```

#### `splitBehavior` — Programmatic Per-Route Logic

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      autoCodeSplitting: true,
      codeSplittingOptions: {
        splitBehavior: ({ routeId }) => {
          if (routeId.startsWith('/posts')) {
            return [['loader', 'component']]
          }
          // All other routes use defaultBehavior
        },
      },
    }),
  ],
})
```

#### Precedence Order

1. Per-route `codeSplitGroupings` (highest)
2. `splitBehavior` function
3. `defaultBehavior` option (lowest)

### Common Mistakes

#### 1. HIGH: Exporting component functions prevents code splitting

```tsx
// WRONG — export puts PostsComponent in the main bundle
export function PostsComponent() {
  return <div>Posts</div>
}

// CORRECT — no export, function stays in the split chunk
function PostsComponent() {
  return <div>Posts</div>
}
```

#### 2. MEDIUM: Trying to code-split the root route

`__root.tsx` does not support code splitting. It is always rendered regardless of the current route. Do not create `__root.lazy.tsx`.

#### 3. MEDIUM: Splitting the loader adds double async cost

```tsx
// AVOID unless you have a specific reason
codeSplittingOptions: {
  defaultBehavior: [
    ['loader'], // Fetch chunk THEN execute loader = two network waterfalls
    ['component'],
  ],
}

// PREFERRED — loader stays in main bundle (default behavior)
codeSplittingOptions: {
  defaultBehavior: [
    ['component'],
    ['errorComponent'],
    ['notFoundComponent'],
  ],
}
```

#### 4. HIGH: Importing Route in code-split files for typed hooks

```tsx
// WRONG — importing Route pulls route config into the lazy chunk
import { Route } from './posts.tsx'
const data = Route.useLoaderData()

// CORRECT — getRouteApi gives typed hooks without pulling in the route
import { getRouteApi } from '@tanstack/react-router'
const routeApi = getRouteApi('/posts')
const data = routeApi.useLoaderData()
```

### Cross-References

- **router-core/data-loading** — Loader splitting decisions affect data loading performance. Splitting the loader adds latency before data can be fetched.
- **router-core/type-safety** — `getRouteApi` is the type-safe way to access hooks from split files.

<a id="source-tanstack-router-core-ssr"></a>

## Ssr

Source: `tanstack-router-core-ssr`.

## SSR (Server-Side Rendering)

> **WARNING**: SSR APIs are experimental. They share internal implementations with TanStack Start and may change. **TanStack Start is the recommended way to do SSR in production** — use manual SSR setup only when integrating with an existing server.

> **CRITICAL**: TanStack Router is CLIENT-FIRST. Loaders run on the client by default. With SSR enabled, loaders run on BOTH client AND server. They are NOT server-only like Remix/Next.js loaders. See [router-core/data-loading](./data-auth-errors.md#source-tanstack-router-core-data-loading).

> **CRITICAL**: Do not generate Next.js patterns (`getServerSideProps`, App Router, server components) or Remix patterns (server-only loader exports). TanStack Router has its own SSR API.

### Concepts

There are two SSR flavors:

- **Non-streaming**: Full page rendered on server, sent as one HTML response, then hydrated on client.
- **Streaming**: Critical first paint sent immediately; remaining content streamed incrementally as it resolves.

Key behaviors:

- Memory history is used automatically on the server (no `window`).
- Loader data is automatically dehydrated on the server and hydrated on the client.
- Data serialization supports `Date`, `Error`, `FormData`, and `undefined` out of the box.

### Setup: Shared Router Factory

The router must be created identically on server and client. Export a factory function from a shared file:

```tsx
// src/router.tsx
import { createRouter as createTanstackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function createRouter() {
  return createTanstackRouter({ routeTree })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
```

### Non-Streaming SSR

#### Server Entry (using `defaultRenderHandler`)

```tsx
// src/entry-server.tsx
import {
  createRequestHandler,
  defaultRenderHandler,
} from '@tanstack/react-router/ssr/server'
import { createRouter } from './router'

export async function render({ request }: { request: Request }) {
  const handler = createRequestHandler({ request, createRouter })
  return await handler(defaultRenderHandler)
}
```

#### Server Entry (using `renderRouterToString` for custom wrappers)

```tsx
// src/entry-server.tsx
import {
  createRequestHandler,
  renderRouterToString,
  RouterServer,
} from '@tanstack/react-router/ssr/server'
import { createRouter } from './router'

export function render({ request }: { request: Request }) {
  const handler = createRequestHandler({ request, createRouter })

  return handler(({ responseHeaders, router }) =>
    renderRouterToString({
      responseHeaders,
      router,
      children: <RouterServer router={router} />,
    }),
  )
}
```

#### Client Entry

```tsx
// src/entry-client.tsx
import { hydrateRoot } from 'react-dom/client'
import { RouterClient } from '@tanstack/react-router/ssr/client'
import { createRouter } from './router'

const router = createRouter()

hydrateRoot(document, <RouterClient router={router} />)
```

### Streaming SSR

#### Server Entry (using `defaultStreamHandler`)

```tsx
// src/entry-server.tsx
import {
  createRequestHandler,
  defaultStreamHandler,
} from '@tanstack/react-router/ssr/server'
import { createRouter } from './router'

export async function render({ request }: { request: Request }) {
  const handler = createRequestHandler({ request, createRouter })
  return await handler(defaultStreamHandler)
}
```

#### Server Entry (using `renderRouterToStream` for custom wrappers)

```tsx
// src/entry-server.tsx
import {
  createRequestHandler,
  renderRouterToStream,
  RouterServer,
} from '@tanstack/react-router/ssr/server'
import { createRouter } from './router'

export function render({ request }: { request: Request }) {
  const handler = createRequestHandler({ request, createRouter })

  return handler(({ request, responseHeaders, router }) =>
    renderRouterToStream({
      request,
      responseHeaders,
      router,
      children: <RouterServer router={router} />,
    }),
  )
}
```

Streaming is automatic — deferred data (unawaited promises from loaders) and streamed markup just work when using `defaultStreamHandler` or `renderRouterToStream`.

### Document Head Management

Use the `head` route option to manage `<title>`, `<meta>`, `<link>`, and `<style>` tags. Render `<HeadContent />` in `<head>` and `<Scripts />` in `<body>`.

#### Root Route with Head

```tsx
// src/routes/__root.tsx
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'UTF-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { title: 'My App' },
    ],
    links: [{ rel: 'icon', href: '/favicon.ico' }],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}
```

#### Per-Route Head (Nested Deduplication)

Child route `title` and `meta` tags override parent tags with the same `name`/`property`:

```tsx
// src/routes/posts/$postId.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const post = await fetchPost(params.postId)
    return { post }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData.post.title },
      { name: 'description', content: loaderData.post.excerpt },
    ],
  }),
  component: PostPage,
})

function PostPage() {
  const { post } = Route.useLoaderData()
  return <article>{post.content}</article>
}
```

#### SPA Head (No Full HTML Control)

For SPAs without server-rendered HTML, render `<HeadContent />` at the top of the component tree:

```tsx
import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router'

const rootRoute = createRootRoute({
  head: () => ({
    meta: [{ title: 'My SPA' }],
  }),
  component: () => (
    <>
      <HeadContent />
      <Outlet />
    </>
  ),
})
```

### Body Scripts

Use `scripts` (separate from `head.scripts`) to inject scripts into `<body>` before the app entry point:

```tsx
export const Route = createRootRoute({
  scripts: () => [{ children: 'console.log("runs before hydration")' }],
})
```

The `<Scripts />` component renders these. Place it at the end of `<body>`.

### ScriptOnce for Pre-Hydration Scripts

`ScriptOnce` renders a `<script>` during SSR that executes immediately and self-removes. On client navigation, it does nothing (no duplicate execution).

```tsx
import { ScriptOnce } from '@tanstack/react-router'

const themeScript = `(function() {
  try {
    const theme = localStorage.getItem('theme') || 'auto';
    const resolved = theme === 'auto'
      ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.classList.add(resolved);
  } catch (e) {}
})();`

function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScriptOnce children={themeScript} />
      {children}
    </>
  )
}
```

If the script modifies the DOM (e.g., adds a class to `<html>`), use `suppressHydrationWarning` on the element:

```tsx
<html lang="en" suppressHydrationWarning>
```

### Express Integration Example

`createRequestHandler` expects a Web API `Request` and returns a Web API `Response`. For Express, convert between formats:

```tsx
// src/entry-server.tsx
import { pipeline } from 'node:stream/promises'
import {
  RouterServer,
  createRequestHandler,
  renderRouterToString,
} from '@tanstack/react-router/ssr/server'
import { createRouter } from './router'
import type express from 'express'

export async function render({
  req,
  res,
}: {
  req: express.Request
  res: express.Response
}) {
  const protocol = req.get('x-forwarded-proto') ?? req.protocol
  const host = req.get('x-forwarded-host') ?? req.get('host')
  const url = new URL(req.originalUrl || req.url, `${protocol}://${host}`).href

  const request = new Request(url, {
    method: req.method,
    headers: (() => {
      const headers = new Headers()
      for (const [key, value] of Object.entries(req.headers)) {
        headers.set(key, value as any)
      }
      return headers
    })(),
  })

  const handler = createRequestHandler({ request, createRouter })

  const response = await handler(({ responseHeaders, router }) =>
    renderRouterToString({
      responseHeaders,
      router,
      children: <RouterServer router={router} />,
    }),
  )

  res.status(response.status)
  response.headers.forEach((value, name) => {
    res.setHeader(name, value)
  })

  return pipeline(response.body as any, res)
}
```

### Common Mistakes

#### 1. HIGH: Using browser APIs in loaders without environment check

Loaders run on BOTH client and server with SSR. Browser-only APIs (`window`, `document`, `localStorage`) throw on the server.

```tsx
// WRONG — crashes on server
loader: async () => {
  const token = localStorage.getItem('token')
  return fetchData(token)
}

// CORRECT — guard with environment check
loader: async () => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return fetchData(token)
}
```

#### 2. MEDIUM: Using hash fragments for server-rendered content

Hash fragments (`#section`) are never sent to the server. Conditional rendering based on hash causes hydration mismatches.

```tsx
// WRONG — server has no hash, client does → mismatch
component: () => {
  const hash = window.location.hash
  return hash === '#admin' ? <AdminPanel /> : <UserPanel />
}

// CORRECT — use search params for server-visible state
validateSearch: z.object({ view: fallback(z.enum(['admin', 'user']), 'user') }),
component: () => {
  const { view } = Route.useSearch()
  return view === 'admin' ? <AdminPanel /> : <UserPanel />
}
```

#### 3. CRITICAL: Generating Next.js, Remix, or React Router DOM patterns

TanStack Router does NOT use `getServerSideProps`, `getStaticProps`, App Router `page.tsx`, Remix-style server-only `loader` exports, or anything from `react-router-dom`.

##### Wrong file structures

```text
WRONG (Next.js Pages Router):
  src/pages/index.tsx
  src/pages/_app.tsx
  src/pages/posts/[id].tsx

WRONG (Next.js App Router):
  app/layout.tsx
  app/page.tsx
  app/posts/[id]/page.tsx

WRONG (Next.js custom App):
  _app/index.tsx
  pages/_app.tsx, pages/_document.tsx

CORRECT (TanStack Router file-based routing):
  src/routes/__root.tsx
  src/routes/index.tsx
  src/routes/posts/$postId.tsx
```

##### Wrong imports

```tsx
// WRONG — react-router-dom is a different library
import {
  Link,
  useNavigate,
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom'

// WRONG — Next.js Link/router
import Link from 'next/link'
import { useRouter } from 'next/router' // Pages Router
import { useRouter } from 'next/navigation' // App Router

// CORRECT — everything routing-related lives in @tanstack/react-router
import {
  Link,
  useNavigate,
  useRouter,
  useLocation,
  redirect,
} from '@tanstack/react-router'
```

##### Wrong loader/data-fetching patterns

```tsx
// WRONG — Next.js Pages Router
export async function getServerSideProps() {
  return { props: { data: await fetchData() } }
}

// WRONG — Remix
export async function loader({ request }: LoaderFunctionArgs) {
  return json({ data: await fetchData() })
}

// CORRECT — TanStack Router
export const Route = createFileRoute('/data')({
  loader: async () => {
    const data = await fetchData()
    return { data }
  },
  component: DataPage,
})

function DataPage() {
  const { data } = Route.useLoaderData()
  return <div>{data}</div>
}
```

If you see `src/pages/`, `app/layout.tsx`, `react-router-dom`, or any of the above in agent output, the agent is generating for the wrong framework. The build will either fail or produce duplicate `/` routes that conflict at runtime.

### Tension: Client-First Loaders vs SSR

TanStack Router loaders are client-first by design. When SSR is enabled, they run in both environments. This means:

- Browser APIs work by default (client-only) but break under SSR
- Database access does NOT belong in loaders (unlike Remix/Next) — use API routes
- For server-only data logic with SSR, use TanStack Start's server functions

See [router-core/data-loading](./data-auth-errors.md#source-tanstack-router-core-data-loading) for loader fundamentals.

### Cross-References

- [router-core/data-loading](./data-auth-errors.md#source-tanstack-router-core-data-loading) — SSR changes where loaders execute
- [compositions/router-query](https://skills.sh/lukasa1993/tanstack-skills-extracted/tanstack-query) — SSR dehydration/hydration with TanStack Query

<a id="source-tanstack-router-plugin"></a>

## Router Plugin

Source: `tanstack-router-plugin`.

## Router Plugin (`@tanstack/router-plugin`)

Bundler plugin that powers TanStack Router's file-based routing and automatic code splitting. Works with Vite, Webpack, Rspack, and esbuild via unplugin.

> **CRITICAL**: The router plugin MUST come before the framework plugin (React, Solid, Vue) in the Vite config. Wrong order causes route generation and code splitting to fail silently.

### Install

```bash
npm install -D @tanstack/router-plugin
```

### Bundler Setup

#### Vite (most common)

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    // MUST come before react()
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
  ],
})
```

#### Webpack

```ts
// webpack.config.js
const { tanstackRouter } = require('@tanstack/router-plugin/webpack')

module.exports = {
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
  ],
}
```

#### Rspack

```ts
// rspack.config.js
const { tanstackRouter } = require('@tanstack/router-plugin/rspack')

module.exports = {
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
  ],
}
```

#### esbuild

```ts
import { tanstackRouter } from '@tanstack/router-plugin/esbuild'
import esbuild from 'esbuild'

esbuild.build({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
  ],
})
```

### Configuration Options

#### Core Options

| Option                  | Type                          | Default                    | Description                                |
| ----------------------- | ----------------------------- | -------------------------- | ------------------------------------------ |
| `target`                | `'react' \| 'solid' \| 'vue'` | `'react'`                  | Target framework                           |
| `routesDirectory`       | `string`                      | `'./src/routes'`           | Directory containing route files           |
| `generatedRouteTree`    | `string`                      | `'./src/routeTree.gen.ts'` | Path for generated route tree              |
| `autoCodeSplitting`     | `boolean`                     | `undefined`                | Enable automatic code splitting            |
| `enableRouteGeneration` | `boolean`                     | `true`                     | Set to `false` to disable route generation |

#### File Convention Options

| Option                   | Type                                                    | Default     | Description                          |
| ------------------------ | ------------------------------------------------------- | ----------- | ------------------------------------ |
| `routeFilePrefix`        | `string`                                                | `undefined` | Prefix filter for route files        |
| `routeFileIgnorePrefix`  | `string`                                                | `'-'`       | Prefix to exclude files from routing |
| `routeFileIgnorePattern` | `string`                                                | `undefined` | Pattern to exclude from routing      |
| `indexToken`             | `string \| RegExp \| { regex: string; flags?: string }` | `'index'`   | Token identifying index routes       |
| `routeToken`             | `string \| RegExp \| { regex: string; flags?: string }` | `'route'`   | Token identifying route config files |

#### Code Splitting Options

```ts
tanstackRouter({
  target: 'react',
  autoCodeSplitting: true,
  codeSplittingOptions: {
    // Default groupings for all routes
    defaultBehavior: [['component'], ['errorComponent'], ['notFoundComponent']],

    // Per-route custom splitting
    splitBehavior: ({ routeId }) => {
      if (routeId === '/dashboard') {
        // Keep loader and component together for dashboard
        return [['loader', 'component'], ['errorComponent']]
      }
      // Return undefined to use defaultBehavior
    },
  },
})
```

#### Output Options

| Option                      | Type                   | Default    | Description                      |
| --------------------------- | ---------------------- | ---------- | -------------------------------- |
| `quoteStyle`                | `'single' \| 'double'` | `'single'` | Quote style in generated code    |
| `semicolons`                | `boolean`              | `false`    | Use semicolons in generated code |
| `disableTypes`              | `boolean`              | `false`    | Disable TypeScript types         |
| `disableLogging`            | `boolean`              | `false`    | Suppress plugin logs             |
| `addExtensions`             | `boolean \| string`    | `false`    | Add file extensions to imports   |
| `enableRouteTreeFormatting` | `boolean`              | `true`     | Format generated route tree      |

#### Virtual Route Config

```ts
import { routes } from './routes'

tanstackRouter({
  target: 'react',
  virtualRouteConfig: routes, // or './routes.ts'
})
```

### How It Works

The composed plugin assembles up to 3 sub-plugins:

1. **Route Generator** (always) — Watches route files and generates `routeTree.gen.ts`
2. **Code Splitter** (when `autoCodeSplitting: true`) — Splits route files into lazy-loaded chunks using virtual modules
3. **HMR** (dev mode, when code splitter is off) — Hot-reloads route changes without full refresh

### Route Refactor Workflow

When moving, renaming, adding, or deleting file routes:

1. Change the source files under `routesDirectory`. Keep the exported route identifier named `Route`.
2. Let the bundler plugin regenerate the tree, or run `pnpm exec tsr generate` when the project uses the CLI.
3. Inspect the generated diff for the expected route IDs, parents, paths, and imports. Never repair `routeTree.gen.ts` by hand.
4. Update links, redirects, `from` narrowing, params, preload calls, and tests that reference the old route.
5. Run route-generation tests, type tests, and a production build. A passing editor typecheck does not prove the plugin generated or split the new route correctly.

Commit `routeTree.gen.ts`; it is generated source used by the application at runtime.

### Individual Plugin Exports

For advanced use, each sub-plugin is exported separately from the Vite entry:

```ts
import {
  tanstackRouter, // Composed (default)
  tanstackRouterGenerator, // Generator only
  tanStackRouterCodeSplitter, // Code splitter only
} from '@tanstack/router-plugin/vite'
```

### Common Mistakes

#### 1. CRITICAL: Wrong plugin order in Vite config

The router plugin must come before the framework plugin. Otherwise, route generation and code splitting fail silently.

```ts
// WRONG — react() before tanstackRouter()
plugins: [react(), tanstackRouter({ target: 'react' })]

// CORRECT — tanstackRouter() first
plugins: [tanstackRouter({ target: 'react' }), react()]
```

#### 2. HIGH: Missing target option for non-React frameworks

The `target` defaults to `'react'`. For Solid or Vue, you must set it explicitly.

```ts
// WRONG for Solid — generates React imports
tanstackRouter({ autoCodeSplitting: true })

// CORRECT for Solid
tanstackRouter({ target: 'solid', autoCodeSplitting: true })
```

#### 3. MEDIUM: Confusing autoCodeSplitting with manual lazy routes

When `autoCodeSplitting` is enabled, the plugin handles splitting automatically. You do NOT need manual `createLazyRoute` or `lazyRouteComponent` calls — the plugin transforms your route files at build time.

```tsx
// WRONG — manual lazy loading with autoCodeSplitting enabled
const LazyAbout = lazyRouteComponent(() => import('./about'))

// CORRECT — just write normal route files, plugin handles splitting
// src/routes/about.tsx
export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return <h1>About</h1>
}
```

#### 4. HIGH: Editing the generated route tree

Changes to `routeTree.gen.ts` are overwritten and can leave source routes, generated types, and runtime routing out of sync. Fix route filenames or plugin configuration, regenerate, and verify the generated diff instead.

### Cross-References

- [router-core/code-splitting](./ssr-build-tooling.md#source-tanstack-router-core-code-splitting) — manual code splitting concepts
- [virtual-file-routes](./ssr-build-tooling.md#source-tanstack-virtual-file-routes) — programmatic route trees

<a id="source-tanstack-virtual-file-routes"></a>

## Virtual File Routes

Source: `tanstack-virtual-file-routes`.

## Virtual File Routes (`@tanstack/virtual-file-routes`)

Build route trees programmatically instead of relying on filesystem conventions. Useful when you want explicit control over route structure, need to mix virtual and physical routes, or want to define route subtrees within file-based routing directories.

> **CRITICAL**: Types are FULLY INFERRED. Never cast, never annotate inferred values.

### Install

```bash
npm install @tanstack/virtual-file-routes
```

### API Reference

#### `rootRoute(file, children?)`

Creates the root of a virtual route tree.

```ts
import { rootRoute, index, route } from '@tanstack/virtual-file-routes'

const routes = rootRoute('root.tsx', [
  index('index.tsx'),
  route('/about', 'about.tsx'),
])
```

#### `index(file)`

Creates an index route — the default rendered when the parent path matches exactly.

```ts
import { index } from '@tanstack/virtual-file-routes'

index('home.tsx')
```

#### `route(path, ...)`

Creates a route node. Three call signatures:

```ts
import { route, index } from '@tanstack/virtual-file-routes'

// Leaf route: path + file
route('/about', 'about.tsx')

// Branch route: path + file + children
route('/dashboard', 'dashboard.tsx', [
  index('dashboard-index.tsx'),
  route('/settings', 'settings.tsx'),
])

// Path prefix only (no file): groups children under a URL segment
route('/api', [route('/users', 'users.tsx'), route('/posts', 'posts.tsx')])
```

#### `layout(file, children)` or `layout(id, file, children)`

Creates a pathless layout route — wraps children without adding a URL segment.

```ts
import { layout, route, index } from '@tanstack/virtual-file-routes'

// ID derived from filename
layout('authLayout.tsx', [
  route('/dashboard', 'dashboard.tsx'),
  route('/settings', 'settings.tsx'),
])

// Explicit ID
layout('admin-layout', 'adminLayout.tsx', [route('/admin', 'admin.tsx')])
```

#### `physical(pathPrefix, directory)` or `physical(directory)`

Mounts a directory of file-based routes at a URL prefix. Uses TanStack Router's standard file-based routing conventions within that directory.

```ts
import { physical } from '@tanstack/virtual-file-routes'

// Mount posts/ directory under /posts
physical('/posts', 'posts')

// Merge features/ directory at the current level
physical('features')
```

#### `defineVirtualSubtreeConfig(config)`

Type helper for `__virtual.ts` files inside file-based routing directories. Identity function that provides type inference.

```ts
// src/routes/admin/__virtual.ts
import {
  defineVirtualSubtreeConfig,
  index,
  route,
} from '@tanstack/virtual-file-routes'

export default defineVirtualSubtreeConfig([
  index('home.tsx'),
  route('$id', 'details.tsx'),
])
```

### Integration with Router Plugin

Pass the virtual route config to the TanStack Router plugin:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { routes } from './routes'

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react', // or 'solid', 'vue'
      virtualRouteConfig: routes,
    }),
    // Add your framework's Vite plugin here
  ],
})
```

Or reference a file path:

```ts
tanstackRouter({
  target: 'react',
  virtualRouteConfig: './routes.ts',
})
```

### Full Example

```ts
// routes.ts
import {
  rootRoute,
  route,
  index,
  layout,
  physical,
} from '@tanstack/virtual-file-routes'

export const routes = rootRoute('root.tsx', [
  index('index.tsx'),

  layout('authLayout.tsx', [
    route('/dashboard', 'app/dashboard.tsx', [
      index('app/dashboard-index.tsx'),
      route('/invoices', 'app/dashboard-invoices.tsx', [
        index('app/invoices-index.tsx'),
        route('$id', 'app/invoice-detail.tsx'),
      ]),
    ]),
  ]),

  // Mount file-based routing from posts/ directory
  physical('/posts', 'posts'),
])
```

### Common Mistakes

#### 1. HIGH: Forgetting that file paths are relative to routesDirectory

File paths in `rootRoute`, `index`, `route`, and `layout` are relative to the `routesDirectory` configured in the router plugin (default: `./src/routes`). Do not use absolute paths or paths relative to the project root.

```ts
// WRONG — absolute path
route('/about', '/src/routes/about.tsx')

// CORRECT — relative to routesDirectory
route('/about', 'about.tsx')
```

#### 2. MEDIUM: Using physical() without matching directory structure

The directory passed to `physical()` must exist inside `routesDirectory` and follow TanStack Router's file-based routing conventions.

```ts
// WRONG — directory doesn't exist or wrong location
physical('/blog', 'src/blog')

// CORRECT — relative to routesDirectory
physical('/blog', 'blog')
// Expects: src/routes/blog/ (with route files inside)
```

#### 3. MEDIUM: Confusing layout() with route()

`layout()` creates a pathless wrapper — it does NOT add a URL segment. Use `route()` for URL segments.

```ts
// This does NOT create a /dashboard URL
layout('dashboardLayout.tsx', [route('/dashboard', 'dashboard.tsx')])

// The URL is /dashboard, and dashboardLayout.tsx wraps it
```
