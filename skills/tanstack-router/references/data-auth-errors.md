# Data, authentication, and errors

Data loading, guards, not-found, and error boundaries.

<a id="source-tanstack-router-core-auth-and-guards"></a>

## Auth And Guards

Source: `tanstack-router-core-auth-and-guards`.

## Auth and Guards

> **This skill covers the routing side of auth.** Route guards are UX and navigation control; the data/API boundary still belongs in the server function, server route, or API endpoint that reads or mutates private data. For the **server-side primitives** — session cookies (`HttpOnly`/`Secure`/`SameSite`), `useSession`-style helpers, OAuth `state` + PKCE, password-reset enumeration defense, CSRF, rate limiting — see [start-core/auth-server-primitives](https://skills.sh/lukasa1993/tanstack-skills-extracted/tanstack-start).
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

Rule of thumb: every `createServerFn`, server route, or API endpoint that touches user data needs `authMiddleware` (or an equivalent in-handler check). The route guard is for the page experience; the endpoint guard is for the data. See [start-core/auth-server-primitives](https://skills.sh/lukasa1993/tanstack-skills-extracted/tanstack-start) for the full session/middleware pattern.

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

- See also: **./data-auth-errors.md#source-tanstack-router-core-data-loading** — `beforeLoad` runs before `loader`; auth context flows into loader via route context
- See also: **https://skills.sh/lukasa1993/tanstack-skills-extracted/tanstack-start** — server-side session cookies, OAuth state + PKCE, CSRF, password-reset hardening, rate limiting (the server half of authentication)
- See also: **https://skills.sh/lukasa1993/tanstack-skills-extracted/tanstack-start** — `authMiddleware` factory pattern for protecting individual `createServerFn` calls

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

- **Client-first loaders vs SSR expectations**: Loaders run on the client by default. When using SSR (TanStack Start), they run on both client and server. Browser-only APIs work by default but break under SSR. Server-only APIs (fs, db) break by default but work under Start server functions. See **./ssr-build-tooling.md#source-tanstack-router-core-ssr**.
- **Built-in SWR cache vs external cache coordination**: Router has built-in caching. When using TanStack Query, set `defaultPreloadStaleTime: 0` to avoid double-caching. See **https://skills.sh/lukasa1993/tanstack-skills-extracted/tanstack-query**.

---

### Cross-References

- See also: **./urls-navigation.md#source-tanstack-router-core-search-params** — `loaderDeps` consumes validated search params as cache keys
- See also: **https://skills.sh/lukasa1993/tanstack-skills-extracted/tanstack-query** — for external cache coordination with TanStack Query

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
