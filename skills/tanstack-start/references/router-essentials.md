# Router essentials

Bundled Router foundations, navigation, data, authentication, and error guidance required by Start.

<a id="source-tanstack-router-core"></a>

## Router Core

Source: `tanstack-router-core`.

## TanStack Router Core

TanStack Router is a type-safe router for React and Solid with built-in SWR caching, JSON-first search params, file-based route generation, and end-to-end type inference. The core is framework-agnostic; React and Solid bindings layer on top.

> **CRITICAL**: TanStack Router types are FULLY INFERRED. Never cast, never annotate inferred values. This is the #1 AI agent mistake.

> **CRITICAL**: TanStack Router is CLIENT-FIRST. Loaders run on the client by default, NOT server-only like Remix/Next.js. Do not confuse TanStack Router APIs with Next.js or React Router.

Use this entry skill to choose one primary sub-skill. Do not load the full catalog. Load a second sub-skill only when the task crosses a real boundary, such as an authenticated loader that needs both `auth-and-guards` and `data-loading`.

### Sub-Skills

| Task                                               | Sub-Skill                                                                    |
| -------------------------------------------------- | ---------------------------------------------------------------------------- |
| Validate, read, write, transform search params     | [./router-essentials.md#source-tanstack-router-core-search-params](./router-essentials.md#source-tanstack-router-core-search-params)               |
| Dynamic segments, splats, optional params          | [./router-essentials.md#source-tanstack-router-core-path-params](./router-essentials.md#source-tanstack-router-core-path-params)                   |
| Link, useNavigate, preloading, blocking            | [./router-essentials.md#source-tanstack-router-core-navigation](./router-essentials.md#source-tanstack-router-core-navigation)                     |
| Route loaders, SWR caching, context, deferred data | [./router-essentials.md#source-tanstack-router-core-data-loading](./router-essentials.md#source-tanstack-router-core-data-loading)                 |
| Auth guards, RBAC, beforeLoad redirects            | [./router-essentials.md#source-tanstack-router-core-auth-and-guards](./router-essentials.md#source-tanstack-router-core-auth-and-guards)           |
| Automatic and manual code splitting                | [./router-ssr-tooling-adapters.md#source-tanstack-router-core-code-splitting](./router-ssr-tooling-adapters.md#source-tanstack-router-core-code-splitting)             |
| 404 handling, error boundaries, notFound()         | [./router-essentials.md#source-tanstack-router-core-not-found-and-errors](./router-essentials.md#source-tanstack-router-core-not-found-and-errors) |
| Inference, Register, from narrowing, TS perf       | [./router-essentials.md#source-tanstack-router-core-type-safety](./router-essentials.md#source-tanstack-router-core-type-safety)                   |
| Streaming/non-streaming SSR, hydration, head mgmt  | [./router-ssr-tooling-adapters.md#source-tanstack-router-core-ssr](./router-ssr-tooling-adapters.md#source-tanstack-router-core-ssr)                                   |

### Quick Decision Tree

```
Need to add/read/write URL query parameters?
  → router-core/search-params

Need dynamic URL segments like /posts/$postId?
  → router-core/path-params

Need to create links or navigate programmatically?
  → router-core/navigation

Need to fetch data for a route?
  Is it client-side only or client+server?
    → router-core/data-loading
  Using TanStack Query as external cache?
    → compositions/router-query (separate skill)

Need to protect routes behind auth?
  → router-core/auth-and-guards

Need to reduce bundle size per route?
  → router-core/code-splitting

Need custom 404 or error handling?
  → router-core/not-found-and-errors

Having TypeScript issues or performance problems?
  → router-core/type-safety

Need server-side rendering?
  → router-core/ssr
```

### Cross-Cutting Completion Checks

For route refactors:

1. Rename or move the route file; do not hand-edit the generated `createFileRoute` path.
2. Regenerate `routeTree.gen.ts` with the configured Router plugin or CLI.
3. Update links, redirects, `from` narrowing, params, and tests that reference the old route.
4. Run type tests and a production build. A typecheck alone does not prove route generation or bundling works.

For response schema changes:

1. Update the source model and shared validation schema.
2. Update the server function or API serializer so the field exists at runtime.
3. Update loader and component consumers without casts.
4. Assert the actual response payload in a unit or integration test. Typechecking cannot catch a serializer that omits the new field.

### Minimal Working Example

```tsx
// src/routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => <Outlet />,
})
```

```tsx
// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => <h1>Home</h1>,
})
```

```tsx
// src/router.tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })

// REQUIRED for type safety — without this, Link/useNavigate have no autocomplete
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router
```

```tsx
// src/main.tsx
import { RouterProvider } from '@tanstack/react-router'
import router from './router'

function App() {
  return <RouterProvider router={router} />
}
```

### Common Mistakes

#### HIGH: createFileRoute path string must match the file path

The Vite plugin manages the path string in `createFileRoute`. Do not change it manually — it must match the file's location under `src/routes/`:

```tsx
// File: src/routes/posts/$postId.tsx
export const Route = createFileRoute('/posts/$postId')({
  // ✅ matches file path
  component: PostPage,
})

export const Route = createFileRoute('/post/$postId')({
  // ❌ silent mismatch
  component: PostPage,
})
```

The plugin auto-generates this string. If you rename a route file, the plugin updates it. Never edit the path string by hand.

### Version Note

This skill targets `@tanstack/router-core` v1.171.15. Splat routes use `$` (not `*`); the `*` compat alias will be removed in v2.

<a id="source-tanstack-router-core-auth-and-guards"></a>

## Auth And Guards

Source: `tanstack-router-core-auth-and-guards`.

## Auth and Guards

> **This skill covers the routing side of auth.** Route guards are UX and navigation control; the data/API boundary still belongs in the server function, server route, or API endpoint that reads or mutates private data. For the **server-side primitives** — session cookies (`HttpOnly`/`Secure`/`SameSite`), `useSession`-style helpers, OAuth `state` + PKCE, password-reset enumeration defense, CSRF, rate limiting — see [start-core/auth-server-primitives](./middleware-auth.md#source-tanstack-start-client-core-start-core-auth-server-primitives).
>
> **CRITICAL**: A route guard (`beforeLoad`) does NOT protect a `createServerFn` declared on that route. Server functions are API endpoints reachable independently of the route that calls them. See "Route guards do not protect server functions" below.

### Setup

Protect routes with `beforeLoad` + `redirect()` in a pathless layout route (`_authenticated`):

```tsx
// src/routes/_authenticated.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  // component defaults to Outlet — no need to declare it
})
```

Any route file placed under `src/routes/_authenticated/` is automatically protected:

```tsx
// src/routes/_authenticated/dashboard.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardComponent,
})

function DashboardComponent() {
  const { auth } = Route.useRouteContext()
  return <div>Welcome, {auth.user?.username}</div>
}
```

### Core Patterns

#### Router Context for Auth State

Auth state flows into the router via `createRootRouteWithContext` and `RouterProvider`'s `context` prop:

```tsx
// src/routes/__root.tsx
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

interface AuthState {
  isAuthenticated: boolean
  user: { id: string; username: string; email: string } | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

interface MyRouterContext {
  auth: AuthState
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => <Outlet />,
})
```

```tsx
// src/router.tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // placeholder — filled by RouterProvider context prop
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

```tsx
// src/App.tsx
import { RouterProvider } from '@tanstack/react-router'
import { AuthProvider, useAuth } from './auth'
import { router } from './router'

function InnerApp() {
  const auth = useAuth()
  // context prop injects live auth state WITHOUT recreating the router
  return <RouterProvider router={router} context={{ auth }} />
}

function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  )
}
```

The router is created once with a placeholder. `RouterProvider`'s `context` prop injects the live auth state on each render — this avoids recreating the router on auth changes (which would reset caches and rebuild the route tree).

#### Redirect-Based Auth with Redirect-Back

Save the current location in search params so you can redirect back after login:

```tsx
// src/routes/_authenticated.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
})
```

```tsx
// src/routes/login.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'

// Validate redirect target to prevent open redirect attacks
function sanitizeRedirect(url: unknown): string {
  if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//')) {
    return '/'
  }
  return url
}

export const Route = createFileRoute('/login')({
  validateSearch: (search) => ({
    redirect: sanitizeRedirect(search.redirect),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect })
    }
  },
  component: LoginComponent,
})

function LoginComponent() {
  const { auth } = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await auth.login(username, password)
      navigate({ to: search.redirect })
    } catch {
      setError('Invalid credentials')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div>{error}</div>}
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Sign In</button>
    </form>
  )
}
```

#### Non-Redirect Auth (Inline Login)

Instead of redirecting, show a login form in place of the `Outlet`:

```tsx
// src/routes/_authenticated.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { auth } = Route.useRouteContext()

  if (!auth.isAuthenticated) {
    return <LoginForm />
  }

  return <Outlet />
}
```

This keeps the URL unchanged — the user stays on the same page and sees a login form instead of protected content. After authentication, `<Outlet />` renders and child routes appear.

#### RBAC with Roles and Permissions

Extend auth state with role/permission helpers, then check in `beforeLoad`:

```tsx
// src/auth.tsx
interface User {
  id: string
  username: string
  email: string
  roles: string[]
  permissions: string[]
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}
```

Admin-only layout route:

```tsx
// src/routes/_authenticated/_admin.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_admin')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.hasRole('admin')) {
      throw redirect({
        to: '/unauthorized',
        search: { redirect: location.href },
      })
    }
  },
})
```

Multi-role access:

```tsx
// src/routes/_authenticated/_moderator.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_moderator')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.hasAnyRole(['admin', 'moderator'])) {
      throw redirect({
        to: '/unauthorized',
        search: { redirect: location.href },
      })
    }
  },
})
```

Permission-based:

```tsx
// src/routes/_authenticated/_users.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_users')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.hasAnyPermission(['users:read', 'users:write'])) {
      throw redirect({
        to: '/unauthorized',
        search: { redirect: location.href },
      })
    }
  },
})
```

Page-level permission check (nested under an already-role-protected layout):

```tsx
// src/routes/_authenticated/_users/manage.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_users/manage')({
  beforeLoad: ({ context }) => {
    if (!context.auth.hasPermission('users:write')) {
      throw new Error('Write permission required')
    }
  },
  component: UserManagement,
})

function UserManagement() {
  const { auth } = Route.useRouteContext()
  const canDelete = auth.hasPermission('users:delete')

  return (
    <div>
      <h1>User Management</h1>
      {canDelete && <button>Delete User</button>}
    </div>
  )
}
```

#### Handling Auth Check Failures (isRedirect)

When `beforeLoad` has a try/catch, redirects (which work by throwing) can get swallowed. Use `isRedirect` to re-throw:

```tsx
import { createFileRoute, redirect, isRedirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    try {
      const user = await verifySession(context.auth)
      if (!user) {
        throw redirect({
          to: '/login',
          search: { redirect: location.href },
        })
      }
      return { user }
    } catch (error) {
      if (isRedirect(error)) throw error // re-throw redirect, don't swallow it
      // Actual error — redirect to login
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
})
```

### Common Mistakes

#### CRITICAL: Route guards do not protect server functions

A `beforeLoad` redirect protects the **route's UI**, not the **server functions** declared on it. `createServerFn` produces an RPC endpoint reachable directly with its declared HTTP method regardless of which route renders the calling UI. An attacker doesn't have to load `/_authenticated/orders` — they can call this GET RPC endpoint directly.

```tsx
// WRONG — handler has no auth check; the route guard doesn't help
import { createServerFn } from '@tanstack/react-start'
import { createFileRoute, redirect } from '@tanstack/react-router'

const getMyOrders = createServerFn({ method: 'GET' }).handler(async () => {
  return db.orders.findMany() // ← anyone can hit the RPC
})

export const Route = createFileRoute('/_authenticated/orders')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) throw redirect({ to: '/login' })
  },
  loader: () => getMyOrders(),
})
```

```tsx
// CORRECT — auth enforced on the handler itself, via middleware
import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '~/server/auth-middleware'

const getMyOrders = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return db.orders.findMany({ where: { userId: context.session.userId } })
  })
```

Rule of thumb: every `createServerFn`, server route, or API endpoint that touches user data needs `authMiddleware` (or an equivalent in-handler check). The route guard is for the page experience; the endpoint guard is for the data. See [start-core/auth-server-primitives](./middleware-auth.md#source-tanstack-start-client-core-start-core-auth-server-primitives) for the full session/middleware pattern.

#### CRITICAL: The anonymous destination can still disclose protected data

Protect the entire anonymous response, not only the API call. A public login or unauthorized page still leaks data if its title, copy, search params, or serialized loader state names the protected user, tenant, record, or resource. Test a direct anonymous request and follow redirects. Assert that the handler rejects before reading private data, no protected loader runs, the final HTML and serialized state contain no protected identity, and the redirect contains only a sanitized relative return URL.

#### HIGH: Auth check in component instead of beforeLoad

Component-level auth checks cause a **flash of protected content** before the redirect:

```tsx
// WRONG — protected content renders briefly before redirect
export const Route = createFileRoute('/_authenticated/dashboard')({
  component: () => {
    const auth = useAuth()
    if (!auth.isAuthenticated) return <Navigate to="/login" />
    return <Dashboard />
  },
})

// CORRECT — beforeLoad runs before any rendering
export const Route = createFileRoute('/_authenticated/dashboard')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: Dashboard,
})
```

#### HIGH: Not re-throwing redirects in try/catch

`redirect()` works by throwing. If `beforeLoad` has a try/catch, the redirect gets swallowed:

```tsx
// WRONG — redirect is caught and swallowed
beforeLoad: async ({ context }) => {
  try {
    await validateSession(context.auth)
  } catch (e) {
    console.error(e) // swallows the redirect!
  }
}

// CORRECT — use isRedirect to distinguish intentional redirects from errors
import { isRedirect } from '@tanstack/react-router'

beforeLoad: async ({ context }) => {
  try {
    await validateSession(context.auth)
  } catch (e) {
    if (isRedirect(e)) throw e
    console.error(e)
  }
}
```

#### MEDIUM: Conditionally rendering root route component

The root route always renders regardless of auth state. You cannot conditionally render its component:

```tsx
// WRONG — root route always renders, this doesn't protect anything
export const Route = createRootRoute({
  component: () => {
    if (!isAuthenticated()) return <Login />
    return <Outlet />
  },
})

// CORRECT — use a pathless layout route for auth boundaries
// src/routes/_authenticated.tsx
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
})
```

Place protected routes as children of the `_authenticated` layout route. Public routes (login, home, etc.) live outside it.

### Cross-References

- See also: **./router-essentials.md#source-tanstack-router-core-data-loading** — `beforeLoad` runs before `loader`; auth context flows into loader via route context
- See also: **./middleware-auth.md#source-tanstack-start-client-core-start-core-auth-server-primitives** — server-side session cookies, OAuth state + PKCE, CSRF, password-reset hardening, rate limiting (the server half of authentication)
- See also: **./middleware-auth.md#source-tanstack-start-client-core-start-core-middleware** — `authMiddleware` factory pattern for protecting individual `createServerFn` calls

<a id="source-tanstack-router-core-data-loading"></a>

## Data Loading

Source: `tanstack-router-core-data-loading`.

## Data Loading

### Setup

Basic loader returning data, consumed via `useLoaderData`:

```tsx
// src/routes/posts.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts')({
  loader: () => fetchPosts(),
  component: PostsComponent,
})

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

In code-split components, use `getRouteApi` instead of importing Route:

```tsx
import { getRouteApi } from '@tanstack/react-router'

const routeApi = getRouteApi('/posts')

function PostsComponent() {
  const posts = routeApi.useLoaderData()
  return <ul>{/* ... */}</ul>
}
```

### Route Loading Lifecycle

The router executes this sequence on every URL/history update:

1. **Route Matching** (top-down)
   - `route.params.parse`
   - `route.validateSearch`
2. **Route Pre-Loading** (serial)
   - `route.beforeLoad`
   - `route.onError` → `route.errorComponent`
3. **Route Loading** (parallel)
   - `route.component.preload?`
   - `route.loader`
     - `route.pendingComponent` (optional)
     - `route.component`
   - `route.onError` → `route.errorComponent`

Key: `beforeLoad` runs before `loader`. `beforeLoad` for a parent runs before its children's `beforeLoad`. Throwing in `beforeLoad` prevents all children from loading.

### Core Patterns

#### loaderDeps for Search-Param-Driven Cache Keys

Loaders don't receive search params directly. Use `loaderDeps` to declare which search params affect the cache key:

```tsx
// src/routes/posts.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts')({
  validateSearch: (search) => ({
    offset: Number(search.offset) || 0,
    limit: Number(search.limit) || 10,
  }),
  loaderDeps: ({ search: { offset, limit } }) => ({ offset, limit }),
  loader: ({ deps: { offset, limit } }) => fetchPosts({ offset, limit }),
})
```

When deps change, the route reloads regardless of `staleTime`.

#### SWR Caching Configuration

TanStack Router has built-in Stale-While-Revalidate caching keyed on the route's parsed pathname + `loaderDeps`.

Defaults:

- **`staleTime`: 0** — data is always considered stale, reloads in background on re-match
- **`preloadStaleTime`: 30 seconds** — preloaded data won't be refetched for 30s
- **`gcTime`: 30 minutes** — unused cache entries garbage collected after 30min

```tsx
export const Route = createFileRoute('/posts')({
  loader: () => fetchPosts(),
  staleTime: 10_000, // 10s: data considered fresh for 10 seconds
  gcTime: 5 * 60 * 1000, // 5min: garbage collect after 5 minutes
})
```

Disable SWR caching entirely:

```tsx
export const Route = createFileRoute('/posts')({
  loader: () => fetchPosts(),
  staleTime: Infinity,
})
```

Globally:

```tsx
const router = createRouter({
  routeTree,
  defaultStaleTime: Infinity,
})
```

#### Pending States (pendingComponent / pendingMs / pendingMinMs)

By default, a pending component shows after 1 second (`pendingMs: 1000`) and stays for at least 500ms (`pendingMinMs: 500`) to avoid flash.

```tsx
export const Route = createFileRoute('/posts')({
  loader: () => fetchPosts(),
  pendingMs: 500,
  pendingMinMs: 300,
  pendingComponent: () => <div>Loading posts...</div>,
  component: PostsComponent,
})
```

#### Router Context with createRootRouteWithContext (Factory Pattern)

`createRootRouteWithContext` is a factory that returns a function. You must call it twice — the first call passes the generic type, the second passes route options:

```tsx
// src/routes/__root.tsx
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

interface MyRouterContext {
  auth: { userId: string }
  fetchPosts: () => Promise<Post[]>
}

// NOTE: double call — createRootRouteWithContext<Type>()({...})
export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => <Outlet />,
})
```

Supply the context when creating the router:

```tsx
// src/router.tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

const router = createRouter({
  routeTree,
  context: {
    auth: { userId: '123' },
    fetchPosts,
  },
})
```

Consume in loaders and beforeLoad:

```tsx
// src/routes/posts.tsx
export const Route = createFileRoute('/posts')({
  loader: ({ context: { fetchPosts } }) => fetchPosts(),
})
```

To pass React hook values into the router context, call the hook above `RouterProvider` and inject via the `context` prop:

```tsx
import { RouterProvider } from '@tanstack/react-router'

function InnerApp() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ auth }} />
}

function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  )
}
```

Route-level context via `beforeLoad`:

```tsx
export const Route = createFileRoute('/posts')({
  beforeLoad: ({ context }) => ({
    fetchPosts: context.fetchPosts,
  }),
  loader: ({ context: { fetchPosts } }) => fetchPosts(),
})
```

Keep the implementation SSR-safe when the router is used by TanStack Start. A relative `fetch('/api/posts')` works in a browser event handler, but Node and many server runtimes require an absolute URL during SSR. For app-internal data in Start, call a server function from the loader:

```tsx
import { createServerFn } from '@tanstack/react-start'

const getPosts = createServerFn({ method: 'GET' }).handler(() => {
  return db.posts.findMany()
})

export const Route = createFileRoute('/posts')({
  loader: () => getPosts(),
})
```

Use a server route plus an origin-derived absolute URL only when the HTTP boundary itself is required. Do not hard-code the production origin.

#### Deferred Data Loading

Return unawaited promises from the loader for non-critical data. Use the `Await` component to render them:

```tsx
import { createFileRoute, Await } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params: { postId } }) => {
    // Slow data — do NOT await
    const slowDataPromise = fetchComments(postId)
    // Fast data — await
    const post = await fetchPost(postId)

    return { post, deferredComments: slowDataPromise }
  },
  component: PostComponent,
})

function PostComponent() {
  const { post, deferredComments } = Route.useLoaderData()

  return (
    <div>
      <h1>{post.title}</h1>
      <Await
        promise={deferredComments}
        fallback={<div>Loading comments...</div>}
      >
        {(comments) => (
          <ul>
            {comments.map((c) => (
              <li key={c.id}>{c.body}</li>
            ))}
          </ul>
        )}
      </Await>
    </div>
  )
}
```

#### Invalidation After Mutations

`router.invalidate()` forces all active route loaders to re-run and marks all cached data as stale:

```tsx
import { useRouter } from '@tanstack/react-router'

function AddPostButton() {
  const router = useRouter()

  const handleAdd = async () => {
    await createPost({ title: 'New post' })
    await router.invalidate({ sync: true })
  }

  return <button onClick={handleAdd}>Add Post</button>
}
```

Use `await router.invalidate({ sync: true })` when the next step requires refreshed loader data.

Treat the mutation and invalidation as one workflow. The mutation must persist before invalidation starts, and the loader must read from the same authoritative store. Verify create, update, and delete through the rendered route, including a fresh reload; local component state can hide a stale loader or non-persistent write.

#### Error Handling

```tsx
import {
  createFileRoute,
  ErrorComponent,
  useRouter,
} from '@tanstack/react-router'

export const Route = createFileRoute('/posts')({
  loader: () => fetchPosts(),
  errorComponent: ({ error, reset }) => {
    const router = useRouter()

    if (error instanceof CustomError) {
      return <div>{error.message}</div>
    }

    return (
      <div>
        <ErrorComponent error={error} />
        <button
          onClick={() => {
            // For loader errors, invalidate to re-run loader + reset boundary
            router.invalidate()
          }}
        >
          Retry
        </button>
      </div>
    )
  },
})
```

#### Loader Parameters

The `loader` function receives:

- `params` — parsed path params
- `deps` — object from `loaderDeps`
- `context` — merged parent + beforeLoad context
- `abortController` — cancelled when route unloads or becomes stale
- `cause` — `'enter'`, `'stay'`, or `'preload'`
- `preload` — `true` during preloading
- `location` — current location object
- `parentMatchPromise` — promise of parent route match
- `route` — the route object itself

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: ({ params: { postId }, abortController }) =>
    fetchPost(postId, { signal: abortController.signal }),
})
```

### Common Mistakes

#### CRITICAL: Assuming loaders only run on the server

TanStack Router is **client-first**. Loaders run on the **client** by default. They also run on the server when using TanStack Start for SSR, but the default mental model is client-side execution.

```tsx
// WRONG — this will crash in the browser
export const Route = createFileRoute('/posts')({
  loader: async () => {
    const fs = await import('fs') // Node.js only!
    return JSON.parse(fs.readFileSync('...')) // fails in browser
  },
})

// CORRECT for an SPA — use a client-safe API helper
export const Route = createFileRoute('/posts')({
  loader: () => fetchPosts(),
})
```

Do NOT put database queries, filesystem access, or server-only code directly in loaders. In TanStack Start, put that work in a server function and call the function from the loader. Do not use a relative `fetch('/api/...')` in an SSR loader.

#### MEDIUM: Not understanding staleTime default is 0

Default `staleTime` is `0`. This means data reloads in the background on every route re-match. This is intentional — it ensures fresh data. But if your data is expensive or static, set `staleTime`:

```tsx
export const Route = createFileRoute('/posts')({
  loader: () => fetchPosts(),
  staleTime: 60_000, // Consider fresh for 1 minute
})
```

#### HIGH: Using reset() instead of router.invalidate() in error components

`reset()` only resets the error boundary UI. It does NOT re-run the loader. For loader errors, use `router.invalidate()` which re-runs loaders and resets the boundary:

```tsx
// WRONG — resets boundary but loader still has stale error
function PostErrorComponent({ error, reset }) {
  return <button onClick={reset}>Retry</button>
}

// CORRECT — re-runs loader and resets the error boundary
function PostErrorComponent({ error }) {
  const router = useRouter()
  return <button onClick={() => router.invalidate()}>Retry</button>
}
```

#### HIGH: Missing double parentheses on createRootRouteWithContext

`createRootRouteWithContext<Type>()` is a factory — it returns a function. Must call twice:

```tsx
// WRONG — missing second call, passes options to the factory
const rootRoute = createRootRouteWithContext<{ auth: AuthState }>({
  component: RootComponent,
})

// CORRECT — factory()({options})
const rootRoute = createRootRouteWithContext<{ auth: AuthState }>()({
  component: RootComponent,
})
```

#### HIGH: Using React hooks in beforeLoad or loader

`beforeLoad` and `loader` are NOT React components. You cannot call hooks inside them. Use router context to inject values from hooks:

```tsx
// WRONG — hooks cannot be called outside React components
export const Route = createFileRoute('/posts')({
  loader: () => {
    const auth = useAuth() // This will crash!
    return fetchPosts(auth.userId)
  },
})

// CORRECT — inject hook values via router context
// In your App component:
function InnerApp() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ auth }} />
}

// In your route:
export const Route = createFileRoute('/posts')({
  loader: ({ context: { auth } }) => fetchPosts(auth.userId),
})
```

#### HIGH: Property order affects TypeScript inference

Router infers types from earlier properties into later ones. Declaring `beforeLoad` after `loader` means context from `beforeLoad` is unknown in the loader:

```tsx
// WRONG — context.user is unknown because beforeLoad declared after loader
export const Route = createFileRoute('/admin')({
  loader: ({ context }) => fetchData(context.user),
  beforeLoad: () => ({ user: getUser() }),
})

// CORRECT — validateSearch → loaderDeps → beforeLoad → loader
export const Route = createFileRoute('/admin')({
  beforeLoad: () => ({ user: getUser() }),
  loader: ({ context }) => fetchData(context.user),
})
```

#### HIGH: Returning entire search object from loaderDeps

```tsx
// WRONG — loader re-runs on ANY search param change
loaderDeps: ({ search }) => search

// CORRECT — only re-run when page changes
loaderDeps: ({ search }) => ({ page: search.page })
```

Returning the whole `search` object means unrelated param changes (e.g., `sortDirection`, `viewMode`) trigger unnecessary reloads because deep equality fails on the entire object.

### Tensions

- **Client-first loaders vs SSR expectations**: Loaders run on the client by default. When using SSR (TanStack Start), they run on both client and server. Browser-only APIs work by default but break under SSR. Server-only APIs (fs, db) break by default but work under Start server functions. See **./router-ssr-tooling-adapters.md#source-tanstack-router-core-ssr**.
- **Built-in SWR cache vs external cache coordination**: Router has built-in caching. When using TanStack Query, set `defaultPreloadStaleTime: 0` to avoid double-caching. See **https://skills.sh/lukasa1993/tanstack-skills-extracted/tanstack-query**.

---

### Cross-References

- See also: **./router-essentials.md#source-tanstack-router-core-search-params** — `loaderDeps` consumes validated search params as cache keys
- See also: **https://skills.sh/lukasa1993/tanstack-skills-extracted/tanstack-query** — for external cache coordination with TanStack Query

<a id="source-tanstack-router-core-navigation"></a>

## Navigation

Source: `tanstack-router-core-navigation`.

## Navigation

### Setup

Basic type-safe `Link` with `to` and `params`:

```tsx
import { Link } from '@tanstack/react-router'

function PostLink({ postId }: { postId: string }) {
  return (
    <Link to="/posts/$postId" params={{ postId }}>
      View Post
    </Link>
  )
}
```

### Core Patterns

#### Link with Active States

```tsx
import { Link } from '@tanstack/react-router'

function NavLink() {
  return (
    <Link
      to="/posts"
      activeProps={{ className: 'font-bold' }}
      inactiveProps={{ className: 'text-gray-500' }}
      activeOptions={{ exact: true }}
    >
      Posts
    </Link>
  )
}
```

The `data-status` attribute is also set to `"active"` on active links for CSS-based styling.

`activeOptions` controls matching behavior:

- `exact` (default `false`) — when `true`, only matches the exact path (not children)
- `includeHash` (default `false`) — include hash in active matching
- `includeSearch` (default `true`) — include search params in active matching

Children can receive `isActive` as a render function:

```tsx
<Link to="/posts">
  {({ isActive }) => <span className={isActive ? 'font-bold' : ''}>Posts</span>}
</Link>
```

#### Relative Navigation with `from`

Without `from`, navigation resolves from root `/`. To use relative paths like `..`, provide `from`:

```tsx
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  component: PostComponent,
})

function PostComponent() {
  return (
    <div>
      {/* Relative to current route */}
      <Link from={Route.fullPath} to="..">
        Back to Posts
      </Link>

      {/* "." reloads the current route */}
      <Link from={Route.fullPath} to=".">
        Reload
      </Link>
    </div>
  )
}
```

#### useNavigate for Programmatic Navigation

Use `useNavigate` only for side-effect-driven navigation (e.g., after a form submission). For anything the user clicks, prefer `Link`.

```tsx
import { useNavigate } from '@tanstack/react-router'

function CreatePostForm() {
  const navigate = useNavigate({ from: '/posts' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch('/api/posts', { method: 'POST', body: '...' })
    const { id: postId } = await response.json()

    if (response.ok) {
      navigate({ to: '/posts/$postId', params: { postId } })
    }
  }

  return <form onSubmit={handleSubmit}>{/* ... */}</form>
}
```

The `Navigate` component performs an immediate client-side navigation on mount:

```tsx
import { Navigate } from '@tanstack/react-router'

function LegacyRedirect() {
  return <Navigate to="/posts/$postId" params={{ postId: 'my-first-post' }} />
}
```

`router.navigate` is available anywhere you have the router instance, including outside of React.

#### Preloading

Strategies: `intent` (hover/touchstart), `viewport` (intersection observer), `render` (on mount).

Set globally:

```tsx
import { createRouter } from '@tanstack/react-router'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadDelay: 50, // ms, default is 50
})
```

Or per-link:

```tsx
<Link
  to="/posts/$postId"
  params={{ postId }}
  preload="intent"
  preloadDelay={100}
>
  View Post
</Link>
```

Preloaded data stays fresh for 30 seconds by default (`defaultPreloadStaleTime: 30_000`). During that window it won't be refetched. When using an external cache like TanStack Query, set `defaultPreloadStaleTime: 0` to let the external library control freshness.

Manual preloading via the router instance:

```tsx
import { useRouter } from '@tanstack/react-router'

function Component() {
  const router = useRouter()

  useEffect(() => {
    router.preloadRoute({ to: '/posts/$postId', params: { postId: '1' } })
  }, [router])

  return <div />
}
```

#### Navigation Blocking

Use `useBlocker` to prevent navigation when a form has unsaved changes:

```tsx
import { useBlocker } from '@tanstack/react-router'
import { useState } from 'react'

function EditForm() {
  const [formIsDirty, setFormIsDirty] = useState(false)

  useBlocker({
    shouldBlockFn: () => {
      if (!formIsDirty) return false
      const shouldLeave = confirm('Are you sure you want to leave?')
      return !shouldLeave
    },
  })

  return <form>{/* ... */}</form>
}
```

With custom UI using `withResolver`:

```tsx
import { useBlocker } from '@tanstack/react-router'
import { useState } from 'react'

function EditForm() {
  const [formIsDirty, setFormIsDirty] = useState(false)

  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => formIsDirty,
    withResolver: true,
  })

  return (
    <>
      <form>{/* ... */}</form>
      {status === 'blocked' && (
        <div>
          <p>Are you sure you want to leave?</p>
          <button onClick={proceed}>Yes</button>
          <button onClick={reset}>No</button>
        </div>
      )}
    </>
  )
}
```

Control `beforeunload` separately:

```tsx
useBlocker({
  shouldBlockFn: () => formIsDirty,
  enableBeforeUnload: formIsDirty,
})
```

#### linkOptions for Reusable Navigation Options

`linkOptions` provides eager type-checking on navigation options objects, so errors surface at definition, not at spread-site:

```tsx
import {
  linkOptions,
  Link,
  useNavigate,
  redirect,
} from '@tanstack/react-router'

const dashboardLinkOptions = linkOptions({
  to: '/dashboard',
  search: { search: '' },
})

// Use anywhere: Link, navigate, redirect
function Nav() {
  const navigate = useNavigate()

  return (
    <div>
      <Link {...dashboardLinkOptions}>Dashboard</Link>
      <button onClick={() => navigate(dashboardLinkOptions)}>Go</button>
    </div>
  )
}

// Also works in an array for navigation bars
const navOptions = linkOptions([
  { to: '/dashboard', label: 'Summary', activeOptions: { exact: true } },
  { to: '/dashboard/invoices', label: 'Invoices' },
  { to: '/dashboard/users', label: 'Users' },
])

function NavBar() {
  return (
    <nav>
      {navOptions.map((option) => (
        <Link
          {...option}
          key={option.to}
          activeProps={{ className: 'font-bold' }}
        >
          {option.label}
        </Link>
      ))}
    </nav>
  )
}
```

#### createLink for Custom Components

Wraps any component with TanStack Router's type-safe navigation:

```tsx
import * as React from 'react'
import { createLink, LinkComponent } from '@tanstack/react-router'

interface BasicLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

const BasicLinkComponent = React.forwardRef<HTMLAnchorElement, BasicLinkProps>(
  (props, ref) => {
    return <a ref={ref} {...props} className="block px-3 py-2 text-blue-700" />
  },
)

const CreatedLinkComponent = createLink(BasicLinkComponent)

export const CustomLink: LinkComponent<typeof BasicLinkComponent> = (props) => {
  return <CreatedLinkComponent preload="intent" {...props} />
}
```

Usage retains full type safety:

```tsx
<CustomLink to="/dashboard/invoices/$invoiceId" params={{ invoiceId: 0 }} />
```

#### Scroll Restoration

Enable globally on the router:

```tsx
const router = createRouter({
  routeTree,
  scrollRestoration: true,
})
```

For nested scrollable areas:

```tsx
const router = createRouter({
  routeTree,
  scrollRestoration: true,
  scrollToTopSelectors: ['#main-scrollable-area'],
})
```

Custom cache keys:

```tsx
const router = createRouter({
  routeTree,
  scrollRestoration: true,
  getScrollRestorationKey: (location) => location.pathname,
})
```

Prevent scroll reset for a specific navigation:

```tsx
<Link to="/posts" resetScroll={false}>
  Posts
</Link>
```

#### MatchRoute for Pending UI

```tsx
import { Link, MatchRoute } from '@tanstack/react-router'

function Nav() {
  return (
    <Link to="/users">
      Users
      <MatchRoute to="/users" pending>
        <Spinner />
      </MatchRoute>
    </Link>
  )
}
```

### Common Mistakes

#### CRITICAL: Interpolating params into the `to` string

```tsx
// WRONG — breaks type safety and param encoding
<Link to={`/posts/${postId}`}>Post</Link>

// CORRECT — use the params option
<Link to="/posts/$postId" params={{ postId }}>Post</Link>
```

Dynamic segments are declared with `$` in the route path. Always pass them via `params`. This applies to `Link`, `useNavigate`, `Navigate`, and `router.navigate`.

#### MEDIUM: Using useNavigate for clickable elements

```tsx
// WRONG — no href, no cmd+click, no preloading, no accessibility
function BadNav() {
  const navigate = useNavigate()
  return <button onClick={() => navigate({ to: '/posts' })}>Posts</button>
}

// CORRECT — real <a> tag with href, accessible, preloadable
function GoodNav() {
  return <Link to="/posts">Posts</Link>
}
```

Use `useNavigate` only for programmatic side-effect navigation (after form submit, async action, etc).

#### HIGH: Not providing `from` for relative navigation

```tsx
// WRONG — without from, ".." resolves from root
<Link to="..">Back</Link>

// CORRECT — provide from for relative resolution
<Link from={Route.fullPath} to="..">Back</Link>
```

Without `from`, only absolute paths are autocompleted and type-safe. Relative paths like `..` resolve from root instead of the current route.

#### HIGH: Using search as object instead of function loses existing params

```tsx
// WRONG — replaces ALL search params with just { page: 2 }
<Link to="." search={{ page: 2 }}>Page 2</Link>

// CORRECT — preserves existing search params, updates page
<Link to="." search={(prev) => ({ ...prev, page: 2 })}>Page 2</Link>
```

When you pass `search` as a plain object, it replaces all search params. Use the function form to spread previous params and selectively update.

---

### Cross-References

- See also: **./router-essentials.md#source-tanstack-router-core-search-params** — Link `search` prop interacts with search param validation
- See also: **./router-essentials.md#source-tanstack-router-core-type-safety** — `from` narrowing improves type inference on Link

<a id="source-tanstack-router-core-not-found-and-errors"></a>

## Not Found And Errors

Source: `tanstack-router-core-not-found-and-errors`.

## Not Found and Errors

TanStack Router handles two categories of "not found": unmatched URL paths (automatic) and missing resources like a post that doesn't exist (manual via `notFound()`). Error boundaries are configured per-route via `errorComponent`.

> **CRITICAL**: Do NOT use the deprecated `NotFoundRoute`. When present, `notFound()` and `notFoundComponent` will NOT work. Remove it and use `notFoundComponent` instead.
> **CRITICAL**: `useLoaderData` may be undefined inside `notFoundComponent`. Use `useParams`, `useSearch`, or `useRouteContext` instead.

### Not Found Handling

#### Global 404: `notFoundComponent` on Root Route

```tsx
// src/routes/__root.tsx
import { createRootRoute, Outlet, Link } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => {
    return (
      <div>
        <h1>404 — Page Not Found</h1>
        <Link to="/">Go Home</Link>
      </div>
    )
  },
})
```

#### Router-Wide Default: `defaultNotFoundComponent`

```tsx
// src/router.tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => {
    return (
      <div>
        <p>Not found!</p>
        <Link to="/">Go home</Link>
      </div>
    )
  },
})
```

#### Per-Route 404: Missing Resources with `notFound()`

Throw `notFound()` in `loader` or `beforeLoad` when a resource doesn't exist. It works like `redirect()` — throw it to trigger the not-found boundary.

```tsx
// src/routes/posts.$postId.tsx
import { createFileRoute, notFound } from '@tanstack/react-router'
import { getPost } from '../api'

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params: { postId } }) => {
    const post = await getPost(postId)
    if (!post) throw notFound()
    return { post }
  },
  component: PostComponent,
  notFoundComponent: ({ data }) => {
    const { postId } = Route.useParams()
    return <p>Post "{postId}" not found</p>
  },
})

function PostComponent() {
  const { post } = Route.useLoaderData()
  return <h1>{post.title}</h1>
}
```

#### Targeting a Specific Route with `notFound({ routeId })`

You can force a specific parent route to handle the not-found error:

```tsx
// src/routes/_layout/posts.$postId.tsx
import { createFileRoute, notFound } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/posts/$postId')({
  loader: async ({ params: { postId } }) => {
    const post = await getPost(postId)
    if (!post) throw notFound({ routeId: '/_layout' })
    return { post }
  },
})
```

#### Targeting Root Route with `rootRouteId`

```tsx
import { createFileRoute, notFound, rootRouteId } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params: { postId } }) => {
    const post = await getPost(postId)
    if (!post) throw notFound({ routeId: rootRouteId })
    return { post }
  },
})
```

### `notFoundMode`: Fuzzy vs Root

#### `fuzzy` (default)

The router finds the nearest parent route with children and a `notFoundComponent`. Preserves as much parent layout as possible.

Given routes: `__root__` → `posts` → `$postId`, accessing `/posts/1/edit`:

- `<Root>` renders
- `<Posts>` renders
- `<Posts.notFoundComponent>` renders (nearest parent with children + notFoundComponent)

#### `root`

All not-found errors go to the root route's `notFoundComponent`, regardless of matching:

```tsx
const router = createRouter({
  routeTree,
  notFoundMode: 'root',
})
```

### Error Handling

#### `errorComponent` Per Route

`errorComponent` receives `error`, `info`, and `reset` props. For loader errors, use `router.invalidate()` to re-run the loader — it automatically resets the error boundary.

```tsx
// src/routes/posts.$postId.tsx
import { createFileRoute, useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params: { postId } }) => {
    const res = await fetch(`/api/posts/${postId}`)
    if (!res.ok) throw new Error('Failed to load post')
    return res.json()
  },
  component: PostComponent,
  errorComponent: PostErrorComponent,
})

function PostErrorComponent({
  error,
}: {
  error: Error
  info: { componentStack: string }
  reset: () => void
}) {
  const router = useRouter()

  return (
    <div>
      <p>Error: {error.message}</p>
      <button
        onClick={() => {
          // Invalidate re-runs the loader and resets the error boundary
          router.invalidate()
        }}
      >
        Retry
      </button>
    </div>
  )
}

function PostComponent() {
  const data = Route.useLoaderData()
  return <h1>{data.title}</h1>
}
```

#### Router-Wide Default Error Component

```tsx
const router = createRouter({
  routeTree,
  defaultErrorComponent: ({ error }) => {
    const router = useRouter()
    return (
      <div>
        <p>Something went wrong: {error.message}</p>
        <button
          onClick={() => {
            router.invalidate()
          }}
        >
          Retry
        </button>
      </div>
    )
  },
})
```

### Data in `notFoundComponent`

`notFoundComponent` cannot reliably use `useLoaderData` because the loader may not have completed. Safe hooks:

```tsx
notFoundComponent: ({ data }) => {
  // SAFE — always available:
  const params = Route.useParams()
  const search = Route.useSearch()
  const context = Route.useRouteContext()

  // UNSAFE — may be undefined:
  // const loaderData = Route.useLoaderData()

  return <p>Item {params.id} not found</p>
}
```

To forward partial data, use the `data` option on `notFound()`:

```tsx
loader: async ({ params }) => {
  const partialData = await getPartialData(params.id)
  if (!partialData.fullResource) {
    throw notFound({ data: { name: partialData.name } })
  }
  return partialData
},
notFoundComponent: ({ data }) => {
  // data is typed as unknown — validate it
  const info = data as { name: string } | undefined
  return <p>{info?.name ?? 'Resource'} not found</p>
},
```

### Route Masking

Route masking shows a different URL in the browser bar than the actual route being rendered. Masking data is stored in `location.state` and is lost when the URL is shared or opened in a new tab.

#### Imperative Masking on `<Link>`

```tsx
import { Link } from '@tanstack/react-router'

function PhotoGrid({ photoId }: { photoId: string }) {
  return (
    <Link
      to="/photos/$photoId/modal"
      params={{ photoId }}
      mask={{
        to: '/photos/$photoId',
        params: { photoId },
      }}
    >
      Open Photo
    </Link>
  )
}
```

#### Imperative Masking with `useNavigate`

```tsx
import { useNavigate } from '@tanstack/react-router'

function OpenPhotoButton({ photoId }: { photoId: string }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() =>
        navigate({
          to: '/photos/$photoId/modal',
          params: { photoId },
          mask: {
            to: '/photos/$photoId',
            params: { photoId },
          },
        })
      }
    >
      Open Photo
    </button>
  )
}
```

#### Declarative Masking with `createRouteMask`

```tsx
import { createRouter, createRouteMask } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

const photoModalMask = createRouteMask({
  routeTree,
  from: '/photos/$photoId/modal',
  to: '/photos/$photoId',
  params: (prev) => ({ photoId: prev.photoId }),
})

const router = createRouter({
  routeTree,
  routeMasks: [photoModalMask],
})
```

#### Unmasking on Reload

By default, masks survive local page reloads. To unmask on reload:

```tsx
// Per-mask
const mask = createRouteMask({
  routeTree,
  from: '/photos/$photoId/modal',
  to: '/photos/$photoId',
  params: (prev) => ({ photoId: prev.photoId }),
  unmaskOnReload: true,
})

// Per-link
<Link
  to="/photos/$photoId/modal"
  params={{ photoId }}
  mask={{ to: '/photos/$photoId', params: { photoId } }}
  unmaskOnReload
>
  Open Photo
</Link>

// Router-wide default
const router = createRouter({
  routeTree,
  unmaskOnReload: true,
})
```

### Common Mistakes

#### 1. HIGH: Using deprecated `NotFoundRoute`

```tsx
// WRONG — NotFoundRoute blocks notFound() and notFoundComponent from working
import { NotFoundRoute } from '@tanstack/react-router'
const notFoundRoute = new NotFoundRoute({ component: () => <p>404</p> })
const router = createRouter({ routeTree, notFoundRoute })

// CORRECT — use notFoundComponent on root route
export const Route = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => <p>404</p>,
})
```

#### 2. MEDIUM: Expecting `useLoaderData` in `notFoundComponent`

```tsx
// WRONG — loader may not have completed
notFoundComponent: () => {
  const data = Route.useLoaderData() // may be undefined!
  return <p>{data.title} not found</p>
}

// CORRECT — use safe hooks
notFoundComponent: () => {
  const { postId } = Route.useParams()
  return <p>Post {postId} not found</p>
}
```

#### 3. MEDIUM: Leaf routes cannot handle not-found errors

Only routes with children (and therefore an `<Outlet>`) can render `notFoundComponent`. Leaf routes (routes without children) will never catch not-found errors — the error bubbles up to the nearest parent with children.

```tsx
// This route has NO children — notFoundComponent here will not catch
// unmatched child paths (there are no child paths to unmatch)
export const Route = createFileRoute('/posts/$postId')({
  // notFoundComponent here only works for notFound() thrown in THIS route's loader
  // It does NOT catch path-based not-founds
  notFoundComponent: () => <p>Not found</p>,
})
```

#### 4. MEDIUM: Expecting masked URLs to survive sharing

Masking data lives in `location.state` (browser history). When a masked URL is copied, shared, or opened in a new tab, the masking data is lost. The browser navigates to the visible (masked) URL directly.

#### 5. HIGH (cross-skill): Using `reset()` alone instead of `router.invalidate()`

```tsx
// WRONG — reset() clears the error boundary but does NOT re-run the loader
function ErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return <button onClick={reset}>Retry</button>
}

// CORRECT — invalidate re-runs loaders and resets the error boundary
function ErrorFallback({ error }: { error: Error; reset: () => void }) {
  const router = useRouter()
  return (
    <button
      onClick={() => {
        router.invalidate()
      }}
    >
      Retry
    </button>
  )
}
```

### Cross-References

- **router-core/data-loading** — `notFound()` thrown in loaders interacts with error boundaries and loader data availability. `errorComponent` retry requires `router.invalidate()`.
- **router-core/type-safety** — `notFoundComponent` data is typed as `unknown`; validate before use.

<a id="source-tanstack-router-core-path-params"></a>

## Path Params

Source: `tanstack-router-core-path-params`.

## Path Params

Path params capture dynamic URL segments into named variables. They are defined with a `$` prefix in the route path.

> **CRITICAL**: Never interpolate params into the `to` string. Always use the `params` prop. This is the most common agent mistake for path params.

> **CRITICAL**: Types are fully inferred. Never annotate the return of `useParams()`.

### Dynamic Segments

A segment prefixed with `$` captures text until the next `/`.

```tsx
// src/routes/posts.$postId.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    // params.postId is string — fully inferred, do not annotate
    return fetchPost(params.postId)
  },
  component: PostComponent,
})

function PostComponent() {
  const { postId } = Route.useParams()
  const data = Route.useLoaderData()
  return (
    <h1>
      Post {postId}: {data.title}
    </h1>
  )
}
```

Multiple dynamic segments work across path levels:

```tsx
// src/routes/teams.$teamId.members.$memberId.tsx
export const Route = createFileRoute('/teams/$teamId/members/$memberId')({
  component: MemberComponent,
})

function MemberComponent() {
  const { teamId, memberId } = Route.useParams()
  return (
    <div>
      Team {teamId}, Member {memberId}
    </div>
  )
}
```

### Splat / Catch-All Routes

A route with a path ending in `$` (bare dollar sign) captures everything after it. The value is available under the `_splat` key.

```tsx
// src/routes/files.$.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/files/$')({
  component: FileViewer,
})

function FileViewer() {
  const { _splat } = Route.useParams()
  // URL: /files/documents/report.pdf → _splat = "documents/report.pdf"
  return <div>File path: {_splat}</div>
}
```

### Optional Params

Optional params use `{-$paramName}` syntax. The segment may or may not be present. When absent, the value is `undefined`.

```tsx
// src/routes/posts.{-$category}.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/{-$category}')({
  component: PostsComponent,
})

function PostsComponent() {
  const { category } = Route.useParams()
  // URL: /posts → category is undefined
  // URL: /posts/tech → category is "tech"
  return <div>{category ? `Posts in ${category}` : 'All Posts'}</div>
}
```

Multiple optional params:

```tsx
// Matches: /posts, /posts/tech, /posts/tech/hello-world
export const Route = createFileRoute('/posts/{-$category}/{-$slug}')({
  component: PostComponent,
})
```

#### i18n with Optional Locale

```tsx
// src/routes/{-$locale}/about.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/{-$locale}/about')({
  component: AboutComponent,
})

function AboutComponent() {
  const { locale } = Route.useParams()
  const currentLocale = locale || 'en'
  return <h1>{currentLocale === 'fr' ? 'À Propos' : 'About Us'}</h1>
}
// Matches: /about, /en/about, /fr/about
```

### Prefix and Suffix Patterns

Curly braces `{}` around `$paramName` allow text before or after the dynamic part within a single segment.

#### Prefix

```tsx
// src/routes/posts/post-{$postId}.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/post-{$postId}')({
  component: PostComponent,
})

function PostComponent() {
  const { postId } = Route.useParams()
  // URL: /posts/post-123 → postId = "123"
  return <div>Post ID: {postId}</div>
}
```

#### Suffix

```tsx
// src/routes/files/{$fileName}[.]txt.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/files/{$fileName}.txt')({
  component: FileComponent,
})

function FileComponent() {
  const { fileName } = Route.useParams()
  // URL: /files/readme.txt → fileName = "readme"
  return <div>File: {fileName}.txt</div>
}
```

#### Combined Prefix + Suffix

```tsx
// URL: /users/user-456.json → userId = "456"
export const Route = createFileRoute('/users/user-{$userId}.json')({
  component: UserComponent,
})

function UserComponent() {
  const { userId } = Route.useParams()
  return <div>User: {userId}</div>
}
```

### Navigating with Path Params

#### Object Form

```tsx
import { Link } from '@tanstack/react-router'

function PostLink({ postId }: { postId: string }) {
  return (
    <Link to="/posts/$postId" params={{ postId }}>
      View Post
    </Link>
  )
}
```

#### Function Form (Preserves Other Params)

```tsx
function PostLink({ postId }: { postId: string }) {
  return (
    <Link to="/posts/$postId" params={(prev) => ({ ...prev, postId })}>
      View Post
    </Link>
  )
}
```

#### Programmatic Navigation

```tsx
import { useNavigate } from '@tanstack/react-router'

function GoToPost({ postId }: { postId: string }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => {
        navigate({ to: '/posts/$postId', params: { postId } })
      }}
    >
      Go to Post
    </button>
  )
}
```

#### Navigating with Optional Params

```tsx
// Include the optional param
<Link to="/posts/{-$category}" params={{ category: 'tech' }}>
  Tech Posts
</Link>

// Omit the optional param (renders /posts)
<Link to="/posts/{-$category}" params={{ category: undefined }}>
  All Posts
</Link>
```

### Reading Params Outside Route Components

#### `useParams` with `from`

```tsx
import { useParams } from '@tanstack/react-router'

function PostHeader() {
  const { postId } = useParams({ from: '/posts/$postId' })
  return <h2>Post {postId}</h2>
}
```

#### `useParams` with `strict: false`

```tsx
function GenericBreadcrumb() {
  const params = useParams({ strict: false })
  // params is a union of all possible route params
  return <span>{params.postId ?? 'Home'}</span>
}
```

### Params in Loaders and `beforeLoad`

```tsx
export const Route = createFileRoute('/posts/$postId')({
  beforeLoad: async ({ params }) => {
    // params.postId available here
    const canView = await checkPermission(params.postId)
    if (!canView) throw redirect({ to: '/unauthorized' })
  },
  loader: async ({ params }) => {
    return fetchPost(params.postId)
  },
})
```

### Allowed Characters

By default, params are encoded with `encodeURIComponent`. Allow extra characters via router config:

```tsx
import { createRouter } from '@tanstack/react-router'

const router = createRouter({
  routeTree,
  pathParamsAllowedCharacters: ['@', '+'],
})
```

Allowed characters: `;`, `:`, `@`, `&`, `=`, `+`, `$`, `,`.

### Common Mistakes

#### 1. CRITICAL (cross-skill): Interpolating path params into `to` string

```tsx
// WRONG — breaks type safety and param encoding
<Link to={`/posts/${postId}`}>Post</Link>

// CORRECT — use params prop
<Link to="/posts/$postId" params={{ postId }}>Post</Link>
```

#### 2. MEDIUM: Using `*` for splat routes instead of `$`

TanStack Router uses `$` for splat routes. The captured value is under `_splat`, not `*`.

```tsx
// WRONG (React Router / other frameworks)
// <Route path="/files/*" />

// CORRECT (TanStack Router)
// File: src/routes/files.$.tsx
export const Route = createFileRoute('/files/$')({
  component: () => {
    const { _splat } = Route.useParams()
    return <div>{_splat}</div>
  },
})
```

> Note: `*` works in v1 for backwards compatibility but will be removed in v2. Always use `_splat`.

#### 3. MEDIUM: Using curly braces for basic dynamic segments

Curly braces are ONLY for prefix/suffix patterns and optional params. Basic dynamic segments use bare `$`.

```tsx
// WRONG — braces not needed for basic params
createFileRoute('/posts/{$postId}')

// CORRECT — bare $ for basic dynamic segments
createFileRoute('/posts/$postId')

// CORRECT — braces for prefix pattern
createFileRoute('/posts/post-{$postId}')

// CORRECT — braces for optional param
createFileRoute('/posts/{-$category}')
```

#### 4. Params are always strings

Path params are always parsed as strings. If you need a number, parse in the loader or component:

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const id = parseInt(params.postId, 10)
    if (isNaN(id)) throw notFound()
    return fetchPost(id)
  },
})
```

You can also use `params.parse` and `params.stringify` on the route for bidirectional transformation:

```tsx
export const Route = createFileRoute('/posts/$postId')({
  params: {
    parse: (raw) => ({ postId: parseInt(raw.postId, 10) }),
    stringify: (parsed) => ({ postId: String(parsed.postId) }),
  },
  loader: async ({ params }) => {
    // params.postId is now number
    return fetchPost(params.postId)
  },
})
```

<a id="source-tanstack-router-core-search-params"></a>

## Search Params

Source: `tanstack-router-core-search-params`.

## Search Params

TanStack Router treats search params as JSON-first application state. They are automatically parsed from the URL into structured objects (numbers, booleans, arrays, nested objects) and validated via `validateSearch` on each route.

> **CRITICAL**: When using `zodValidator()` and Zod v3, use `fallback()` from `@tanstack/zod-adapter`, NOT zod's `.catch()`. Using `.catch()` with the zod adapter makes the output type `unknown`, destroying type safety. This does not apply to Valibot or ArkType (which use their own fallback mechanisms). It also does not apply to Zod v4, which should use `.catch()` and not use the `zodValidator()`.
> **CRITICAL**: Types are fully inferred. Never annotate the return of `useSearch()`.

### Setup: Zod Adapter (Recommended)

```bash
npm install zod @tanstack/zod-adapter
```

```tsx
// src/routes/products.tsx
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const productSearchSchema = z.object({
  page: z.number().default(1).catch(1),
  filter: z.string().default(''),
  sort: z.enum(['newest', 'oldest', 'price']).default('newest').catch('newest'),
})

export const Route = createFileRoute('/products')({
  validateSearch: productSearchSchema,
  component: ProductsPage,
})

function ProductsPage() {
  // page: number, filter: string, sort: 'newest' | 'oldest' | 'price'
  // ALL INFERRED — do not annotate
  const { page, filter, sort } = Route.useSearch()

  return (
    <div>
      <p>
        Page {page}, filter: {filter}, sort: {sort}
      </p>
    </div>
  )
}
```

### Reading Search Params

#### In Route Components: `Route.useSearch()`

```tsx
function ProductsPage() {
  const { page, sort } = Route.useSearch()
  return <div>Page {page}</div>
}
```

#### In Code-Split Components: `getRouteApi()`

```tsx
import { getRouteApi } from '@tanstack/react-router'

const routeApi = getRouteApi('/products')

function ProductFilters() {
  const { sort } = routeApi.useSearch()
  return <select value={sort}>{/* options */}</select>
}
```

#### From Any Component: `useSearch({ from })`

```tsx
import { useSearch } from '@tanstack/react-router'

function SortIndicator() {
  const { sort } = useSearch({ from: '/products' })
  return <span>Sorted by: {sort}</span>
}
```

#### Loose Access: `useSearch({ strict: false })`

```tsx
function GenericPaginator() {
  const search = useSearch({ strict: false })
  // search.page is number | undefined (union of all routes)
  return <span>Page: {search.page ?? 1}</span>
}
```

### Writing Search Params

#### Link with Function Form (Preserves Existing Params)

```tsx
import { Link } from '@tanstack/react-router'

function Pagination() {
  return (
    <Link
      from="/products"
      search={(prev) => ({ ...prev, page: prev.page + 1 })}
    >
      Next Page
    </Link>
  )
}
```

#### Link with Object Form (Replaces All Params)

```tsx
<Link to="/products" search={{ page: 1, filter: '', sort: 'newest' }}>
  Reset
</Link>
```

#### Programmatic: `useNavigate()`

```tsx
import { useNavigate } from '@tanstack/react-router'

function SortDropdown() {
  const navigate = useNavigate({ from: '/products' })

  return (
    <select
      onChange={(e) => {
        navigate({
          search: (prev) => ({ ...prev, sort: e.target.value, page: 1 }),
        })
      }}
    >
      <option value="newest">Newest</option>
      <option value="price">Price</option>
    </select>
  )
}
```

### Search Param Inheritance

Parent route search params are automatically merged into child routes:

```tsx
// src/routes/shop.tsx — parent defines shared params
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const shopSearchSchema = z.object({
  currency: z.enum(['USD', 'EUR']).default('USD').catch('USD'),
})

export const Route = createFileRoute('/shop')({
  validateSearch: shopSearchSchema,
})
```

```tsx
// src/routes/shop/products.tsx — child inherits currency
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/shop/products')({
  component: ShopProducts,
})

function ShopProducts() {
  // currency is available here from parent — fully typed
  const { currency } = Route.useSearch()
  return <div>Currency: {currency}</div>
}
```

### Search Middlewares

#### `retainSearchParams` — Keep Params Across Navigation

```tsx
import { createRootRoute, retainSearchParams } from '@tanstack/react-router'
import { z } from 'zod'

const rootSearchSchema = z.object({
  debug: z.boolean().optional(),
})

export const Route = createRootRoute({
  validateSearch: rootSearchSchema,
  search: {
    middlewares: [retainSearchParams(['debug'])],
  },
})
```

#### `stripSearchParams` — Remove Default Values from URL

```tsx
import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { z } from 'zod'

const defaults = { sort: 'newest', page: 1 }

const searchSchema = z.object({
  sort: z.string().default(defaults.sort),
  page: z.number().default(defaults.page),
})

export const Route = createFileRoute('/items')({
  validateSearch: searchSchema,
  search: {
    middlewares: [stripSearchParams(defaults)],
  },
})
```

#### Chaining Middlewares

```tsx
export const Route = createFileRoute('/search')({
  validateSearch: z.object({
    retainMe: z.string().optional(),
    arrayWithDefaults: z.string().array().default(['foo', 'bar']),
    required: z.string(),
  }),
  search: {
    middlewares: [
      retainSearchParams(['retainMe']),
      stripSearchParams({ arrayWithDefaults: ['foo', 'bar'] }),
    ],
  },
})
```

### Custom Serialization

Override the default JSON serialization at the router level:

```tsx
import {
  createRouter,
  parseSearchWith,
  stringifySearchWith,
} from '@tanstack/react-router'

const router = createRouter({
  routeTree,
  // Example: use JSURL2 for compact, human-readable URLs
  parseSearch: parseSearchWith(parse),
  stringifySearch: stringifySearchWith(stringify),
})
```

### Using Search Params in Loaders via `loaderDeps`

```tsx
export const Route = createFileRoute('/products')({
  validateSearch: productSearchSchema,
  // Pick ONLY the params the loader needs — not the entire search object
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ deps }) => {
    return fetchProducts({ page: deps.page })
  },
})
```

### Common Mistakes

#### 1. HIGH: Using zod v3's `.catch()` with `zodValidator()` instead of adapter `fallback()`

```tsx
// WRONG — .catch() with zodValidator makes the type unknown
const schema = z.object({ page: z.number().catch(1) })
validateSearch: zodValidator(schema) // page is typed as unknown!

// CORRECT — fallback() preserves the inferred type
import { fallback } from '@tanstack/zod-adapter'
const schema = z.object({ page: fallback(z.number(), 1) })
```

**Important:** This only applies when using Zod v3, not when using Zod v4. For v4, using `.catch()` is correct.

#### 2. HIGH: Returning entire search object from `loaderDeps`

```tsx
// WRONG — loader re-runs on ANY search param change
loaderDeps: ({ search }) => search

// CORRECT — loader only re-runs when page changes
loaderDeps: ({ search }) => ({ page: search.page })
```

#### 3. HIGH: Passing Date objects in search params

```tsx
// WRONG — Date does not serialize correctly to JSON in URLs
<Link search={{ startDate: new Date() }}>

// CORRECT — convert to ISO string
<Link search={{ startDate: new Date().toISOString() }}>
```

#### 4. MEDIUM: Parent route missing `validateSearch` blocks inheritance

```tsx
// WRONG — child cannot access shared params
export const Route = createRootRoute({
  component: RootComponent,
  // no validateSearch!
})

// CORRECT — parent must define validateSearch for children to inherit
export const Route = createRootRoute({
  validateSearch: globalSearchSchema,
  component: RootComponent,
})
```

#### 5. HIGH (cross-skill): Using search as object instead of function loses params

```tsx
// WRONG — replaces ALL search params, losing any existing ones
<Link to="." search={{ page: 2 }}>Page 2</Link>

// CORRECT — preserves existing params, updates only page
<Link to="." search={(prev) => ({ ...prev, page: 2 })}>Page 2</Link>
```

### References

- [Validation Patterns Reference](./assets/tanstack-router-core-search-params/references/validation-patterns.md) — comprehensive patterns for all validation libraries

<a id="source-tanstack-router-core-type-safety"></a>

## Type Safety

Source: `tanstack-router-core-type-safety`.

## Type Safety

TanStack Router is FULLY type-inferred. Params, search params, context, and loader data all flow through the route tree automatically. The **#1 AI agent mistake** is adding type annotations, casts, or generic parameters to values that are already inferred.

> **CRITICAL**: NEVER use `as Type`, explicit generic params, `satisfies` on hook returns, or type annotations on inferred values. Every cast masks real type errors and breaks the inference chain.
> **CRITICAL**: Do NOT confuse TanStack Router with Next.js or React Router. There is no `getServerSideProps`, no `useSearchParams()`, no `useLoaderData()` from `react-router-dom`.

### The ONE Required Type Annotation: Register

Without this, top-level exports like `Link`, `useNavigate`, `useSearch` have no type safety.

```tsx
// src/router.tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })

// THIS IS REQUIRED — the single type registration for the entire app
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router
```

After registration, every `Link`, `useNavigate`, `useSearch`, `useParams` across the app is fully typed.

### Types Flow Automatically

#### Route Hooks — No Annotation Needed

```tsx
// src/routes/posts.$postId.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  validateSearch: (search: Record<string, unknown>) => ({
    page: Number(search.page ?? 1),
  }),
  loader: async ({ params }) => {
    // params.postId is already typed as string — do not annotate
    const post = await fetchPost(params.postId)
    return { post }
  },
  component: PostComponent,
})

function PostComponent() {
  // ALL of these are fully inferred — do NOT add type annotations
  const { postId } = Route.useParams()
  //      ^? string

  const { page } = Route.useSearch()
  //      ^? number

  const { post } = Route.useLoaderData()
  //      ^? { id: string; title: string; body: string }

  return (
    <div>
      <h1>{post.title}</h1>
      <p>Page {page}</p>
    </div>
  )
}
```

#### Context Flows Through the Tree

```tsx
// src/routes/__root.tsx
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

interface RouterContext {
  auth: { userId: string; role: 'admin' | 'user' } | null
}

// Note: createRootRouteWithContext is a FACTORY — call it TWICE: ()()
export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
})
```

```tsx
// src/routes/dashboard.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    // context.auth is already typed as { userId: string; role: 'admin' | 'user' } | null
    // NO annotation needed
    if (!context.auth) throw redirect({ to: '/login' })
    return { user: context.auth }
  },
  loader: ({ context }) => {
    // context.user is typed as { userId: string; role: 'admin' | 'user' }
    // This was added by beforeLoad above — fully inferred
    return fetchDashboard(context.user.userId)
  },
  component: DashboardComponent,
})

function DashboardComponent() {
  const data = Route.useLoaderData()
  const { user } = Route.useRouteContext()
  return <h1>Welcome {user.userId}</h1>
}
```

### Narrowing with `from`

Without `from`, hooks return a union of ALL routes' types — slow for TypeScript and imprecise.

#### On Hooks

```tsx
import { useSearch, useParams, useNavigate } from '@tanstack/react-router'

function PostSidebar() {
  // WRONG — search is a union of ALL routes' search params
  const search = useSearch()

  // CORRECT — search is narrowed to /posts/$postId's search params
  const search = useSearch({ from: '/posts/$postId' })
  //    ^? { page: number }

  // CORRECT — params narrowed to this route
  const { postId } = useParams({ from: '/posts/$postId' })

  // CORRECT — navigate narrowed for relative paths
  const navigate = useNavigate({ from: '/posts/$postId' })
}
```

#### On `Link`

```tsx
import { Link } from '@tanstack/react-router'

// WRONG — search resolves to union of ALL routes' search params, slow TS check
<Link to=".." search={{ page: 0 }} />

// CORRECT — narrowed, fast TS check
<Link from="/posts/$postId" to=".." search={{ page: 0 }} />

// Also correct — Route.fullPath in route components
<Link from={Route.fullPath} to=".." search={{ page: 0 }} />
```

### Shared Components: `strict: false`

When a component is used across multiple routes, use `strict: false` instead of `from`:

```tsx
import { useSearch } from '@tanstack/react-router'

function GlobalSearch() {
  // Returns union of all routes' search params — no runtime error if route doesn't match
  const search = useSearch({ strict: false })
  return <span>Query: {search.q ?? ''}</span>
}
```

### Code-Split Files: `getRouteApi`

Use `getRouteApi` instead of importing `Route` to avoid pulling route config into the lazy chunk:

```tsx
// src/routes/posts.lazy.tsx
import { createLazyFileRoute, getRouteApi } from '@tanstack/react-router'

const routeApi = getRouteApi('/posts')

export const Route = createLazyFileRoute('/posts')({
  component: PostsComponent,
})

function PostsComponent() {
  const data = routeApi.useLoaderData()
  const { page } = routeApi.useSearch()
  return <div>Page {page}</div>
}
```

### TypeScript Performance

#### Use Object Syntax for `addChildren` in Large Route Trees

```tsx
// SLOWER — tuple syntax
const routeTree = rootRoute.addChildren([
  postsRoute.addChildren([postRoute, postsIndexRoute]),
  indexRoute,
])

// FASTER — object syntax (TS checks objects faster than large tuples)
const routeTree = rootRoute.addChildren({
  postsRoute: postsRoute.addChildren({ postRoute, postsIndexRoute }),
  indexRoute,
})
```

With file-based routing the route tree is generated, so this is handled for you.

#### Avoid Returning Unused Inferred Types from Loaders

When using external caches like TanStack Query, don't let the router infer complex return types you never consume:

```tsx
// SLOWER — TS infers the full ensureQueryData return type into the route tree
export const Route = createFileRoute('/posts/$postId')({
  loader: ({ context: { queryClient }, params: { postId } }) =>
    queryClient.ensureQueryData(postQueryOptions(postId)),
  component: PostComponent,
})

// FASTER — void return, inference stays out of the route tree
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ context: { queryClient }, params: { postId } }) => {
    await queryClient.ensureQueryData(postQueryOptions(postId))
  },
  component: PostComponent,
})
```

#### `as const satisfies` for Link Option Objects

Never use `LinkProps` as a variable type — it's an enormous union:

```tsx
import type { LinkProps, RegisteredRouter } from '@tanstack/react-router'

// WRONG — LinkProps is a massive union, extremely slow TS check
const wrongProps: LinkProps = { to: '/posts' }

// CORRECT — infer a precise type, validate against LinkProps
const goodProps = { to: '/posts' } as const satisfies LinkProps

// EVEN BETTER — narrow LinkProps with generic params
const narrowedProps = {
  to: '/posts',
} as const satisfies LinkProps<RegisteredRouter, string, '/posts'>
```

#### Type-Safe Link Option Arrays

```tsx
import type { LinkProps } from '@tanstack/react-router'

export const navLinks = [
  { to: '/posts' },
  { to: '/posts/$postId', params: { postId: '1' } },
] as const satisfies ReadonlyArray<LinkProps>

// Use the precise inferred type, not LinkProps directly
export type NavLink = (typeof navLinks)[number]
```

### Type Utilities for Generic Components

#### `ValidateLinkOptions` — Type-Safe Link Props in Custom Components

```tsx
import {
  Link,
  type RegisteredRouter,
  type ValidateLinkOptions,
} from '@tanstack/react-router'

interface NavItemProps<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> {
  label: string
  linkOptions: ValidateLinkOptions<TRouter, TOptions>
}

export function NavItem<TRouter extends RegisteredRouter, TOptions>(
  props: NavItemProps<TRouter, TOptions>,
): React.ReactNode
export function NavItem(props: NavItemProps): React.ReactNode {
  return (
    <li>
      <Link {...props.linkOptions}>{props.label}</Link>
    </li>
  )
}

// Usage — fully type-safe
<NavItem label="Posts" linkOptions={{ to: '/posts' }} />
<NavItem label="Post" linkOptions={{ to: '/posts/$postId', params: { postId: '1' } }} />
```

#### `ValidateNavigateOptions` and `ValidateRedirectOptions`

Same pattern as `ValidateLinkOptions` above, for `useNavigate` and `redirect`. Declare a generic public overload plus a non-generic implementation signature so the call site stays narrowed and the body works without casts:

```tsx
import {
  useNavigate,
  type RegisteredRouter,
  type ValidateNavigateOptions,
} from '@tanstack/react-router'

export function useDelayedNavigate<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
>(
  options: ValidateNavigateOptions<TRouter, TOptions>,
  delayMs: number,
): () => void
export function useDelayedNavigate(
  options: ValidateNavigateOptions,
  delayMs: number,
) {
  const navigate = useNavigate()
  return () => {
    setTimeout(() => navigate(options), delayMs)
  }
}
```

`ValidateRedirectOptions` works identically — declare a generic overload accepting `ValidateRedirectOptions<TRouter, TOptions>` and an impl signature accepting `ValidateRedirectOptions`, then call `redirect(options)` in the body.

#### Render Props for Maximum Performance

Instead of accepting `LinkProps`, invert control so `Link` is narrowed at the call site:

```tsx
function Card(props: { title: string; renderLink: () => React.ReactNode }) {
  return (
    <div>
      <h2>{props.title}</h2>
      {props.renderLink()}
    </div>
  )
}

// Link narrowed to exactly /posts — no union check
;<Card title="All Posts" renderLink={() => <Link to="/posts">View</Link>} />
```

### Render Optimizations

#### Fine-Grained Selectors with `select`

```tsx
function PostTitle() {
  // Only re-renders when page changes, not when other search params change
  const page = Route.useSearch({ select: ({ page }) => page })
  return <span>Page {page}</span>
}
```

#### Structural Sharing

Preserve referential identity across re-renders for search params:

```tsx
const router = createRouter({
  routeTree,
  defaultStructuralSharing: true, // Enable globally
})

// Or per-hook
const result = Route.useSearch({
  select: (search) => ({ foo: search.foo, label: `Page ${search.foo}` }),
  structuralSharing: true,
})
```

Structural sharing only works with JSON-compatible data. TypeScript will error if you return class instances with `structuralSharing: true`.

### Common Mistakes

#### 1. CRITICAL: Adding type annotations or casts to inferred values

```tsx
// WRONG — casting masks real type errors
const search = useSearch({ from: '/posts' }) as { page: number }

// WRONG — unnecessary annotation
const params: { postId: string } = useParams({ from: '/posts/$postId' })

// WRONG — generic param on hook
const data = useLoaderData<{ posts: Post[] }>({ from: '/posts' })

// CORRECT — let inference work
const search = useSearch({ from: '/posts' })
const params = useParams({ from: '/posts/$postId' })
const data = useLoaderData({ from: '/posts' })
```

#### 2. HIGH: Using un-narrowed `LinkProps` type

```tsx
// WRONG — LinkProps is a massive union, causes severe TS slowdown
const myProps: LinkProps = { to: '/posts' }

// CORRECT — use as const satisfies for precise inference
const myProps = { to: '/posts' } as const satisfies LinkProps
```

#### 3. HIGH: Not narrowing `Link`/`useNavigate` with `from`

```tsx
// WRONG — search is a union of ALL routes, TS check grows with route count
<Link to=".." search={{ page: 0 }} />

// CORRECT — narrowed, fast check
<Link from={Route.fullPath} to=".." search={{ page: 0 }} />
```

#### 4. CRITICAL (cross-skill): Missing router type registration

```tsx
// WRONG — Link/useNavigate have no autocomplete, all paths are untyped strings
const router = createRouter({ routeTree })
// (no declare module)

// CORRECT — always register
const router = createRouter({ routeTree })
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

#### 5. CRITICAL (cross-skill): Wrong-framework imports and file structure

Wrong-framework code looks plausible (it's React) but breaks the build or produces conflicting `/` routes at runtime.

```tsx
// WRONG — react-router-dom and next/* are different libraries
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

// CORRECT — all routing exports come from @tanstack/react-router
import {
  Link,
  Outlet,
  useNavigate,
  useRouter,
  useLocation,
  useParams,
  redirect,
} from '@tanstack/react-router'
```

```tsx
// WRONG file structures + APIs:
//   src/pages/*.tsx with getServerSideProps / getStaticProps  (Next.js Pages Router)
//   app/layout.tsx + app/page.tsx                              (Next.js App Router)
//   _app/index.tsx, pages/_app.tsx, pages/_document.tsx        (Next.js custom App)
//   loader/action exports                                       (Remix)

// CORRECT — TanStack file-based routing at src/routes/*.tsx
export const Route = createFileRoute('/posts')({
  loader: async () => { ... },
  validateSearch: zodValidator(schema),
  component: PostsComponent,
})
const search = Route.useSearch()
```

If a build error mentions `react-router-dom`, `next/`, `pages/_app`, or duplicate `/` routes, fix the import — don't paper over with type assertions.

#### 6. CRITICAL: Treating typecheck as proof of runtime schema propagation

Types can say a field exists while a database projection, API serializer, or server function omits it. When adding or renaming a field, trace the value through storage, validation, handler output, loader data, and rendered UI. Do not cast the response to the desired type.
Add a runtime assertion against the real handler or serialized response, such as `expect(await getOrder({ data: { id } })).toMatchObject({ totalCents: 2599 })`.
Then run the route-level test and production build. The type test remains necessary, but it is not the runtime contract test.

See also: router-core (Register setup), router-core/navigation (from narrowing), router-core/code-splitting (getRouteApi).
