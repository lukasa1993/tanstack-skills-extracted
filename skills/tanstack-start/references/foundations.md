# Foundations

Start architecture and execution model.

<a id="source-tanstack-start-client-core-start-core"></a>

## Start Core

Source: `tanstack-start-client-core-start-core`.

## TanStack Start Core

TanStack Start is a full-stack React framework built on TanStack Router and Vite. It adds SSR, streaming, server functions (type-safe RPCs), middleware, server routes, and universal deployment.

> **CRITICAL**: All code in TanStack Start is ISOMORPHIC by default — it runs in BOTH server and client environments. Loaders run on both server AND client. To run code exclusively on the server, use `createServerFn`. This is the #1 AI agent mistake.
> **CRITICAL**: TanStack Start is NOT Next.js. Do not generate `getServerSideProps`, `"use server"` directives, `app/layout.tsx`, or any Next.js/Remix patterns. Use `createServerFn` for server-only code.
> **CRITICAL**: Types are FULLY INFERRED. Never cast, never annotate inferred values.

Use this entry skill to pick one primary workflow. Do not load every Start sub-skill. Add another only when the implementation crosses that boundary; for example, a protected mutation needs `server-functions` plus `auth-server-primitives`, while a public REST endpoint needs `server-routes` alone.

### Sub-Skills

| Task                                             | Sub-Skill                                                                       |
| ------------------------------------------------ | ------------------------------------------------------------------------------- |
| Type-safe RPCs, data fetching, mutations         | [./server-runtime.md#source-tanstack-start-client-core-start-core-server-functions](./server-runtime.md#source-tanstack-start-client-core-start-core-server-functions)             |
| Request/function middleware, context, auth       | [./middleware-auth.md#source-tanstack-start-client-core-start-core-middleware](./middleware-auth.md#source-tanstack-start-client-core-start-core-middleware)                         |
| Server-side auth: sessions, cookies, OAuth, CSRF | [./middleware-auth.md#source-tanstack-start-client-core-start-core-auth-server-primitives](./middleware-auth.md#source-tanstack-start-client-core-start-core-auth-server-primitives) |
| Isomorphic execution, environment boundaries     | [./foundations.md#source-tanstack-start-client-core-start-core-execution-model](./foundations.md#source-tanstack-start-client-core-start-core-execution-model)               |
| REST API endpoints alongside app routes          | [./server-runtime.md#source-tanstack-start-client-core-start-core-server-routes](./server-runtime.md#source-tanstack-start-client-core-start-core-server-routes)                   |
| Hosting, SSR modes, prerendering, SEO            | [./deployment-rendering.md#source-tanstack-start-client-core-start-core-deployment](./deployment-rendering.md#source-tanstack-start-client-core-start-core-deployment)                         |

### Quick Decision Tree

```text
Need to run code exclusively on the server (DB, secrets)?
  → start-core/server-functions

Need auth checks, logging, or shared logic across server functions?
  → start-core/middleware

Need to add login, sessions, OAuth, CSRF, password reset?
  → start-core/auth-server-primitives

Need to understand where code runs (server vs client)?
  → start-core/execution-model

Need a REST API endpoint (GET/POST/PUT/DELETE)?
  → start-core/server-routes

Need to deploy, configure SSR, or prerender?
  → start-core/deployment
```

### Full-Stack Delivery Workflow

For application data loaded by a Start route:

1. Put database, filesystem, secrets, and persistence code behind `createServerFn`.
2. Call the server function directly from the route loader. Do not self-fetch a relative `/api/...` URL from an SSR loader.
3. Validate every input and enforce auth in the server function or middleware. `beforeLoad` only protects route UX.
4. After a mutation resolves, invalidate the router or the external query cache and await the refresh when the UI must be current before continuing.
5. For schema changes, update storage, validation, handler serialization, loader, and UI. Assert the actual runtime payload; typechecking alone cannot detect an omitted serialized field.

Use a server route when the raw HTTP contract is the product: webhooks, third-party clients, feeds, file responses, or a public REST API. When the Start UI and a server route share data, call one server-side service from both instead of making the SSR loader fetch its own API route.

Before finishing, test the initial SSR request, client navigation, mutation followed by refresh, and a direct anonymous request to every protected endpoint.

### Project Setup

#### 1. Install Dependencies

```bash
npm i @tanstack/react-start @tanstack/react-router react react-dom
npm i -D vite @vitejs/plugin-react typescript
```

#### 2. Configure Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // MUST come before react()
    tanstackStart(),
    viteReact(),
  ],
})
```

#### 3. Create Router Factory

```tsx
// src/router.tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
  })

  return router
}
```

#### 4. Create Root Route with Document Shell

```tsx
// src/routes/__root.tsx
import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My App' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <html>
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

#### 5. Create Index Route with Server Function

```tsx
// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const getGreeting = createServerFn({ method: 'GET' }).handler(async () => {
  return { message: 'Hello from the server!' }
})

export const Route = createFileRoute('/')({
  loader: () => getGreeting(),
  component: HomePage,
})

function HomePage() {
  const data = Route.useLoaderData()
  return <h1>{data.message}</h1>
}
```

### Common Mistakes

#### 1. CRITICAL: React plugin before Start plugin in Vite config

```ts
// WRONG — route generation and server function compilation fail
plugins: [react(), tanstackStart()]

// CORRECT — Start plugin must come first
plugins: [tanstackStart(), react()]
```

#### 2. HIGH: Enabling verbatimModuleSyntax in tsconfig

`verbatimModuleSyntax` causes server bundles to leak into client bundles. Keep it disabled.

#### 3. HIGH: Missing Scripts component in root route

The `<Scripts />` component must be rendered in the `<body>` of the root route. Without it, client-side JavaScript does not load and hydration fails.

```tsx
// WRONG — no Scripts
function RootComponent() {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  )
}

// CORRECT — Scripts in body
function RootComponent() {
  return (
    <html>
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

### Version Note

This skill targets `@tanstack/start-client-core` v1.170.14.

<a id="source-tanstack-start-client-core-start-core-execution-model"></a>

## Execution Model

Source: `tanstack-start-client-core-start-core-execution-model`.

## Execution Model

Understanding where code runs is fundamental to TanStack Start. This skill covers the isomorphic execution model and how to control environment boundaries.

> **CRITICAL**: ALL code in TanStack Start is isomorphic by default — it runs in BOTH server and client bundles. Route loaders run on BOTH server (during SSR) AND client (during navigation). Server-only operations MUST use `createServerFn`.
> **CRITICAL**: Module-level `process.env` access is wrong on **two** axes — security (values leak into the client bundle) AND runtime correctness (on Cloudflare Workers and other edge runtimes, env is injected per-request, so module-level reads evaluate to `undefined` even on the server). Read env inside `.handler()` or another per-request function, never at module scope.
> **CRITICAL**: `VITE_` prefixed environment variables are exposed to the client bundle. Server secrets must NOT have the `VITE_` prefix.
> **CRITICAL**: Relative URLs belong to browser-only code. An isomorphic loader also runs during SSR, where `fetch('/api/...')` may have no base URL. Call a server function from the loader, or keep the fetch inside an explicit environment boundary.

### Execution Control APIs

| API                                         | Use Case                    | Client Behavior           | Server Behavior       |
| ------------------------------------------- | --------------------------- | ------------------------- | --------------------- |
| `createServerFn()`                          | RPC calls, data mutations   | Network request to server | Direct execution      |
| `createServerOnlyFn(fn)`                    | Utility functions           | Throws error              | Direct execution      |
| `createClientOnlyFn(fn)`                    | Browser utilities           | Direct execution          | Throws error          |
| `createIsomorphicFn()`                      | Different impl per env      | Uses `.client()` impl     | Uses `.server()` impl |
| `<ClientOnly>`                              | Browser-only components     | Renders children          | Renders fallback      |
| `useHydrated()`                             | Hydration-dependent logic   | `true` after hydration    | `false`               |
| `import '@tanstack/<fw>-start/server-only'` | Mark whole file server-only | Import denied             | Allowed               |
| `import '@tanstack/<fw>-start/client-only'` | Mark whole file client-only | Allowed                   | Import denied         |

### Server-Only Execution

#### createServerFn (RPC pattern)

The primary way to run server-only code. On the client, calls become fetch requests:

```tsx
// Use @tanstack/<framework>-start for your framework (react, solid, vue)
import { createServerFn } from '@tanstack/react-start'

const fetchUser = createServerFn().handler(async () => {
  const secret = process.env.API_SECRET // safe — server only
  return await db.users.find()
})

// Client calls this via network request
const user = await fetchUser()
```

#### createServerOnlyFn (throws on client)

For utility functions that must never run on client:

```tsx
// Use @tanstack/<framework>-start for your framework (react, solid, vue)
import { createServerOnlyFn } from '@tanstack/react-start'

const getSecret = createServerOnlyFn(() => process.env.DATABASE_URL)

// Server: returns the value
// Client: THROWS an error
```

### Client-Only Execution

#### createClientOnlyFn

```tsx
// Use @tanstack/<framework>-start for your framework (react, solid, vue)
import { createClientOnlyFn } from '@tanstack/react-start'

const saveToStorage = createClientOnlyFn((key: string, value: string) => {
  localStorage.setItem(key, value)
})
```

#### ClientOnly Component

```tsx
// Use @tanstack/<framework>-router for your framework (react, solid, vue)
import { ClientOnly } from '@tanstack/react-router'

function Analytics() {
  return (
    <ClientOnly fallback={null}>
      <GoogleAnalyticsScript />
    </ClientOnly>
  )
}
```

#### useHydrated Hook

```tsx
// Use @tanstack/<framework>-router for your framework (react, solid, vue)
import { useHydrated } from '@tanstack/react-router'

function TimeZoneDisplay() {
  const hydrated = useHydrated()
  const timeZone = hydrated
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'UTC'

  return <div>Your timezone: {timeZone}</div>
}
```

Behavior: SSR → `false`, first client render → `false`, after hydration → `true` (stays `true`).

### Environment-Specific Implementations

```tsx
// Use @tanstack/<framework>-start for your framework (react, solid, vue)
import { createIsomorphicFn } from '@tanstack/react-start'

const getDeviceInfo = createIsomorphicFn()
  .server(() => ({ type: 'server', platform: process.platform }))
  .client(() => ({ type: 'client', userAgent: navigator.userAgent }))
```

### Import Protection: File Markers

> Experimental.

The `.server.*` and `.client.*` filename suffixes (e.g. `db.server.ts`) opt a file into Start's import protection — it can't be imported from the wrong environment. When you can't or don't want to rename the file, add a side-effect import at the top of the file to apply the same protection by marker:

```ts
// src/lib/secrets.ts (filename can't be *.server.ts)
import '@tanstack/react-start/server-only'
// (or @tanstack/solid-start/server-only, @tanstack/vue-start/server-only)

export function getApiKey() {
  return process.env.API_KEY
}
```

```ts
// src/lib/storage.ts
import '@tanstack/react-start/client-only'
// (or @tanstack/solid-start/client-only, @tanstack/vue-start/client-only)

export function savePreferences(prefs: Record<string, string>) {
  localStorage.setItem('prefs', JSON.stringify(prefs))
}
```

Rules:

- Both markers in the same file is an error.
- Type-only imports are ignored (they erase to nothing at runtime).
- Default behavior is `error` in production builds and `mock` in dev. The mock returns a recursive Proxy so dev keeps running while you fix the import graph.

Pick the right tool:

- File should never run on the wrong side **and** has no client API → `*.server.ts` filename or `import '@tanstack/<fw>-start/server-only'`.
- One symbol needs to behave differently per environment → `createIsomorphicFn().client(...).server(...)`.
- One function should error if called from the wrong side → `createServerOnlyFn` / `createClientOnlyFn`.
- Component renders only after hydration → `<ClientOnly>` or `useHydrated()`.

### Environment Variables

#### Server-Side (inside createServerFn)

Access any variable via `process.env`:

```tsx
const connectDb = createServerFn().handler(async () => {
  const url = process.env.DATABASE_URL // no prefix needed
  return createConnection(url)
})
```

#### Client-Side (components)

Only `VITE_` prefixed variables are available:

```tsx
// Framework-specific component type (React.ReactNode, JSX.Element, etc.)
function ApiProvider({ children }: { children: React.ReactNode }) {
  const apiUrl = import.meta.env.VITE_API_URL // available
  // import.meta.env.DATABASE_URL → undefined (security)
  return (
    <ApiContext.Provider value={{ apiUrl }}>{children}</ApiContext.Provider>
  )
}
```

#### Runtime Client Variables

If you need server-side variables on the client without `VITE_` prefix, pass them through a server function:

```tsx
const getRuntimeVar = createServerFn({ method: 'GET' }).handler(() => {
  return process.env.MY_RUNTIME_VAR
})

export const Route = createFileRoute('/')({
  loader: async () => {
    const foo = await getRuntimeVar()
    return { foo }
  },
  component: () => {
    const { foo } = Route.useLoaderData()
    return <div>{foo}</div>
  },
})
```

#### Type Safety for Environment Variables

```tsx
// src/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly DATABASE_URL: string
      readonly JWT_SECRET: string
    }
  }
}

export {}
```

### Common Mistakes

#### 1. CRITICAL: Assuming loaders are server-only

```tsx
// WRONG — loader runs on BOTH server and client
export const Route = createFileRoute('/dashboard')({
  loader: async () => {
    const secret = process.env.API_SECRET // LEAKED to client
    return fetch(`https://api.example.com/data`, {
      headers: { Authorization: secret },
    })
  },
})

// CORRECT — use createServerFn
const getData = createServerFn({ method: 'GET' }).handler(async () => {
  const secret = process.env.API_SECRET
  return fetch(`https://api.example.com/data`, {
    headers: { Authorization: secret },
  })
})

export const Route = createFileRoute('/dashboard')({
  loader: () => getData(),
})
```

#### 2. CRITICAL: Reading process.env at module scope

Module-level `process.env` reads are wrong for **two** reasons, not one:

1. **Security:** the value can be inlined into the client bundle, leaking secrets.
2. **Runtime correctness (edge runtimes):** Cloudflare Workers and other edge SSR runtimes inject env at request time. Module-level code runs at module load, before the env exists, so the read evaluates to `undefined` even on the server. The bug only surfaces at deploy time.

```tsx
// WRONG — leaks to client AND is undefined on Workers
const apiKey = process.env.SECRET_KEY
export function fetchData() {
  /* uses apiKey, which is undefined under Worker SSR */
}

// CORRECT — read per-request, inside the handler
const fetchData = createServerFn({ method: 'GET' }).handler(async () => {
  const apiKey = process.env.SECRET_KEY
  return fetch(url, { headers: { Authorization: apiKey } })
})
```

The same rule applies to middleware `.server()` callbacks, server-route handlers, and any function that runs per request — read env there, not at the top of the file.

#### 3. CRITICAL: Using VITE\_ prefix for server secrets

```bash
# WRONG — exposed to client bundle
VITE_SECRET_API_KEY=sk_live_xxx

# CORRECT — no prefix for server secrets
SECRET_API_KEY=sk_live_xxx

# CORRECT — VITE_ only for public client values
VITE_APP_NAME=My App
```

#### 4. HIGH: Hydration mismatches

```tsx
// WRONG — different content server vs client
function CurrentTime() {
  return <div>{new Date().toLocaleString()}</div>
}

// CORRECT — consistent rendering
function CurrentTime() {
  const [time, setTime] = useState<string>()
  useEffect(() => {
    setTime(new Date().toLocaleString())
  }, [])
  return <div>{time || 'Loading...'}</div>
}
```

### Architecture Decision Framework

**Server-Only** (`createServerFn` / `createServerOnlyFn`):

- Sensitive data (env vars, secrets)
- Database connections, file system
- External API keys

**Client-Only** (`createClientOnlyFn` / `<ClientOnly>`):

- DOM manipulation, browser APIs
- localStorage, geolocation
- Analytics/tracking

**Isomorphic** (default / `createIsomorphicFn`):

- Data formatting, business logic
- Shared utilities
- Route loaders (they're isomorphic by nature)

### Cross-References

- [start-core/server-functions](./server-runtime.md#source-tanstack-start-client-core-start-core-server-functions) — the primary server boundary
- [start-core/deployment](./deployment-rendering.md#source-tanstack-start-client-core-start-core-deployment) — deployment target affects execution
