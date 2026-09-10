# Server Functions — Common Mistakes

[Guide and prerequisites](./tanstack-start-client-core-start-core-server-functions-49d113b0.md) · Published skill · `@tanstack/start-client-core@1.170.29`.

## Common Mistakes

### 1. CRITICAL: Relying on a route guard to protect a server function

A `beforeLoad` redirect protects the **route's UI**, not the **data endpoint**. `createServerFn` exposes a callable endpoint that an attacker can hit directly — no need to load the route at all. Auth on the endpoint is the security boundary; auth on the route is UX.

```tsx
// WRONG — the route guard doesn't reach the handler
const getMyOrders = createServerFn({ method: 'GET' }).handler(async () => {
  return db.orders.findMany() // ← anyone can call the RPC
})
export const Route = createFileRoute('/_authenticated/orders')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) throw redirect({ to: '/login' })
  },
  loader: () => getMyOrders(),
})

// CORRECT — auth enforced on the handler itself
const getMyOrders = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return db.orders.findMany({ where: { userId: context.session.userId } })
  })
```

Apply `authMiddleware` (or an equivalent in-handler check) to **every** `createServerFn` that needs auth. See [start-core/auth-server-primitives](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874.md#source-tanstack-start-client-core-start-core-auth-server-primitives) for the full session/middleware pattern and [start-core/middleware](./tanstack-start-client-core-start-core-middleware-4735b1c5.md#source-tanstack-start-client-core-start-core-middleware) for composing the factory.

### 2. CRITICAL: Putting server-only code in loaders

```tsx
// WRONG — loader is ISOMORPHIC, runs on BOTH client and server
export const Route = createFileRoute('/posts')({
  loader: async () => {
    const posts = await db.query('SELECT * FROM posts')
    return { posts }
  },
})

// CORRECT — use createServerFn for server-only logic
const getPosts = createServerFn({ method: 'GET' }).handler(async () => {
  const posts = await db.query('SELECT * FROM posts')
  return { posts }
})

export const Route = createFileRoute('/posts')({
  loader: () => getPosts(),
})
```

### 3. CRITICAL: Using Next.js / Remix / React Router DOM patterns

If the file lives at `src/pages/`, `app/layout.tsx`, `_app/`, or imports anything from `react-router-dom` or `next/`, it is wrong-framework code. TanStack Start uses `src/routes/` + `createFileRoute` + `createServerFn`.

```tsx
// WRONG — "use server" is a React directive, not used in TanStack Start
'use server'
export async function getUser() { ... }

// WRONG — getServerSideProps is Next.js Pages Router
export async function getServerSideProps() { ... }

// WRONG — Next.js App Router server component data fetching
export default async function Page() {
  const data = await fetch(...).then(r => r.json())
  return <div>{data}</div>
}

// WRONG — Remix
export async function loader({ request }) { ... }
export async function action({ request }) { ... }

// WRONG — react-router-dom (a different library)
import { Link, useNavigate } from 'react-router-dom'

// CORRECT — TanStack Start
import { createServerFn } from '@tanstack/react-start'
import { Link, useNavigate, createFileRoute } from '@tanstack/react-router'

const getUser = createServerFn({ method: 'GET' })
  .handler(async () => { ... })

export const Route = createFileRoute('/users/$id')({
  loader: ({ params }) => getUser({ data: { id: params.id } }),
  component: UserPage,
})
```

If you see `src/pages/`, `app/layout.tsx`, or `react-router-dom` in agent output, the agent is generating for the wrong framework. Build will fail or routes will conflict at runtime.

### 4. HIGH: Dynamic imports for server functions

```tsx
// WRONG — can cause bundler issues
const { getUser } = await import('~/utils/users.functions')

// CORRECT — static imports are safe, build handles environment shaking
import { getUser } from '~/utils/users.functions'
```

### 5. HIGH: Awaiting server function without calling it

`createServerFn` returns a function — it must be invoked with `()`:

```tsx
// WRONG — getItems is a function, not a Promise
const data = await getItems

// CORRECT — call the function
const data = await getItems()

// With validated input
const data = await getItems({ data: { id: '1' } })
```

### 6. CRITICAL: Caching authenticated responses with `Cache-Control: public`

`Cache-Control: public, max-age=N` tells every CDN, proxy, and shared cache between you and the user that this response can be served to anyone. If the response depends on the session (user, tenant, role), the first user's response gets cached and replayed to the next user — a cross-tenant data leak.

```tsx
// WRONG — auth'd response, public cache, leaks to next user via CDN
const getMyOrders = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await requireSession() // identity-dependent
  setResponseHeaders({ 'Cache-Control': 'public, max-age=300' })
  return db.orders.findMany({ where: { userId: session.userId } })
})

// CORRECT — private + Vary so any cache that does store it keys by identity
const getMyOrders = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await requireSession()
  setResponseHeaders({
    'Cache-Control': 'private, max-age=60',
    Vary: 'Cookie, Authorization',
  })
  return db.orders.findMany({ where: { userId: session.userId } })
})

// ALSO CORRECT — opt out entirely for sensitive data
setResponseHeaders({ 'Cache-Control': 'no-store' })
```

Rule of thumb: if the handler reads a session/cookie/auth header or branches on identity, the response is **not** `public`. Default to `private` (or `no-store` for sensitive data); reach for `public` only on responses that are byte-for-byte identical regardless of who asks. See also [start-core/deployment](./tanstack-start-client-core-start-core-deployment-9cda074c.md#source-tanstack-start-client-core-start-core-deployment) for ISR/Cache-Control on full pages.

### 7. MEDIUM: When to wrap with `useServerFn`

`useServerFn` is **required** when the server function uses `throw redirect()` or `throw notFound()` — the hook wires the throw into the router so the redirect actually navigates. For server functions that just return data (call them directly or via `useMutation`/`useQuery`), the hook is optional.

```tsx
// Plain data — direct call is fine (also fine to pass to useMutation/useQuery)
<button onClick={() => deletePost({ data: { id } })}>Delete</button>
useMutation({ mutationFn: deletePost })

// Throws redirect/notFound — MUST wrap with useServerFn so the router handles the throw
const signupFn = useServerFn(signup) // signup throws redirect on success
<button onClick={() => signupFn({ data: form })}>Sign up</button>
```

If in doubt: wrap with `useServerFn`. It's a no-op for plain-data functions and the safe default when a function might later add a redirect.

### 8. CRITICAL: Self-fetching a relative API URL from a loader

```tsx
// WRONG — this loader also runs during SSR, where a relative URL may fail
export const Route = createFileRoute('/issues')({
  loader: () => fetch('/api/issues').then((response) => response.json()),
})

// CORRECT — call the server function; the client build gets an RPC stub
export const Route = createFileRoute('/issues')({
  loader: () => listIssues(),
})
```

Relative `fetch` is fine in a browser-only event handler. It is not a universal loader data strategy.
