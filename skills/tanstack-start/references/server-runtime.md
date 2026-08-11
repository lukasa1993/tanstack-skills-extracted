# Server runtime

Server functions, server routes, and server runtime behavior.

<a id="source-tanstack-start-client-core-start-core-server-functions"></a>

## Server Functions

Source: `tanstack-start-client-core-start-core-server-functions`.

## Server Functions

Server functions are type-safe RPCs created with `createServerFn`. They run exclusively on the server but can be called from anywhere — loaders, components, hooks, event handlers, or other server functions.

> **CRITICAL**: Server functions are API endpoints. They are reachable independently of whichever route renders the calling UI. **Auth must be enforced inside the handler (or via middleware) for any server function that touches private data.** Route `beforeLoad` is UX, not the data boundary. See [start-core/auth-server-primitives](./middleware-auth.md#source-tanstack-start-client-core-start-core-auth-server-primitives) for the session/middleware pattern.
> **CRITICAL**: Loaders are ISOMORPHIC — they run on BOTH client and server. Database queries, file system access, and secret API keys MUST go inside `createServerFn`, NOT in loaders directly.
> **CRITICAL**: Do not use `"use server"` directives, `getServerSideProps`, or any Next.js/Remix server patterns. TanStack Start uses `createServerFn` exclusively.

### Basic Usage

```tsx
import { createServerFn } from '@tanstack/react-start'

// GET (default)
const getData = createServerFn().handler(async () => {
  return { message: 'Hello from server!' }
})

// POST
const saveData = createServerFn({ method: 'POST' }).handler(async () => {
  return { success: true }
})
```

### Calling from Loaders

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const getPosts = createServerFn({ method: 'GET' }).handler(async () => {
  const posts = await db.query('SELECT * FROM posts')
  return { posts }
})

export const Route = createFileRoute('/posts')({
  loader: () => getPosts(),
  component: PostList,
})

function PostList() {
  const { posts } = Route.useLoaderData()
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  )
}
```

### Calling from Components

Use the `useServerFn` hook to call server functions from event handlers:

```tsx
import { useServerFn } from '@tanstack/react-start'

const deletePost = createServerFn({ method: 'POST' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await db.delete('posts').where({ id: data.id })
    return { success: true }
  })

function DeleteButton({ postId }: { postId: string }) {
  const deletePostFn = useServerFn(deletePost)

  return (
    <button onClick={() => deletePostFn({ data: { id: postId } })}>
      Delete
    </button>
  )
}
```

### Cache-Coherent Mutations

Keep reads and writes behind server functions that use the same authoritative store. Await the write, then invalidate the route cache so its loader reads the persisted result:

```tsx
const listIssues = createServerFn({ method: 'GET' }).handler(() => {
  return db.issues.findMany()
})

const createIssue = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (
      typeof data !== 'object' ||
      data === null ||
      !('title' in data) ||
      typeof data.title !== 'string' ||
      data.title.trim().length === 0
    ) {
      throw new Error('Title is required')
    }
    return { title: data.title.trim() }
  })
  .handler(async ({ data }) => {
    return db.issues.create({ data })
  })

export const Route = createFileRoute('/issues')({
  loader: () => listIssues(),
  component: IssuesPage,
})

function IssuesPage() {
  const router = useRouter()
  const createIssueFn = useServerFn(createIssue)

  const handleCreate = async (title: string) => {
    await createIssueFn({ data: { title } })
    await router.invalidate({ sync: true })
  }

  // render Route.useLoaderData() and call handleCreate from the form
}
```

Do not update only local component state after a persistent mutation. Verify the rendered list after create, update, delete, and a fresh page load.

### Input Validation

#### Basic Validator

```tsx
const greetUser = createServerFn({ method: 'GET' })
  .validator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    return `Hello, ${data.name}!`
  })

await greetUser({ data: { name: 'John' } })
```

#### Zod Validator

```tsx
import { z } from 'zod'

const createUser = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().min(1),
      age: z.number().min(0),
    }),
  )
  .handler(async ({ data }) => {
    return `Created user: ${data.name}, age ${data.age}`
  })
```

Input validation does not validate output serialization. When a response schema changes, update the database selection, service return value, server-function result, loader consumer, and UI. Add a runtime test that calls the handler or HTTP boundary and asserts the new field in the returned payload.

#### FormData

```tsx
const submitForm = createServerFn({ method: 'POST' })
  .validator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error('Expected FormData')
    }
    return {
      name: data.get('name')?.toString() || '',
      email: data.get('email')?.toString() || '',
    }
  })
  .handler(async ({ data }) => {
    return { success: true }
  })
```

### Error Handling

#### Errors

```tsx
const riskyFunction = createServerFn().handler(async () => {
  throw new Error('Something went wrong!')
})

try {
  await riskyFunction()
} catch (error) {
  console.log(error.message) // "Something went wrong!"
}
```

#### Redirects

```tsx
import { redirect } from '@tanstack/react-router'

const requireAuth = createServerFn().handler(async () => {
  const user = await getCurrentUser()
  if (!user) {
    throw redirect({ to: '/login' })
  }
  return user
})
```

#### Not Found

```tsx
import { notFound } from '@tanstack/react-router'

const getPost = createServerFn()
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const post = await db.findPost(data.id)
    if (!post) {
      throw notFound()
    }
    return post
  })
```

### Server Context Utilities

Access request/response details inside server function handlers:

```tsx
import { createServerFn } from '@tanstack/react-start'
import {
  getRequest,
  getRequestHeader,
  setResponseHeaders,
  setResponseStatus,
} from '@tanstack/react-start/server'

// Public, non-personalized data — safe to cache shared across users.
const getPublicData = createServerFn({ method: 'GET' }).handler(async () => {
  setResponseHeaders({
    // 'public' is correct ONLY when the response does not depend on identity.
    // For anything tied to a session/user/tenant, use 'private' or 'no-store'.
    'Cache-Control': 'public, max-age=300',
  })
  setResponseStatus(200)
  return fetchPublicData()
})

// Authenticated data — must NOT be 'public'.
const getMyData = createServerFn({ method: 'GET' }).handler(async () => {
  const authHeader = getRequestHeader('Authorization')
  // ... auth check ...

  setResponseHeaders({
    // 'private' = only the user-agent may cache. Vary by Cookie/Authorization
    // so any intermediary that does cache keys by identity, not URL alone.
    'Cache-Control': 'private, max-age=60',
    Vary: 'Cookie, Authorization',
  })
  return fetchPersonalizedData()
})
```

Available utilities:

- `getRequest()` — full Request object
- `getRequestHeader(name)` — single request header
- `setResponseHeader(name, value)` — single response header
- `setResponseHeaders(headers)` — multiple response headers
- `setResponseStatus(code)` — HTTP status code

### File Organization

```text
src/utils/
├── users.functions.ts   # createServerFn wrappers (safe to import anywhere)
├── users.server.ts      # Server-only helpers (DB queries, internal logic)
└── schemas.ts           # Shared validation schemas (client-safe)
```

```tsx
// users.server.ts — server-only helpers
import { db } from '~/db'

export async function findUserById(id: string) {
  return db.query.users.findFirst({ where: eq(users.id, id) })
}
```

```tsx
// users.functions.ts — server functions
import { createServerFn } from '@tanstack/react-start'
import { findUserById } from './users.server'

export const getUser = createServerFn({ method: 'GET' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return findUserById(data.id)
  })
```

Static imports of server functions are safe — the build replaces implementations with RPC stubs in client bundles.

### Common Mistakes

#### 1. CRITICAL: Relying on a route guard to protect a server function

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

Apply `authMiddleware` (or an equivalent in-handler check) to **every** `createServerFn` that needs auth. See [start-core/auth-server-primitives](./middleware-auth.md#source-tanstack-start-client-core-start-core-auth-server-primitives) for the full session/middleware pattern and [start-core/middleware](./middleware-auth.md#source-tanstack-start-client-core-start-core-middleware) for composing the factory.

#### 2. CRITICAL: Putting server-only code in loaders

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

#### 3. CRITICAL: Using Next.js / Remix / React Router DOM patterns

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

#### 4. HIGH: Dynamic imports for server functions

```tsx
// WRONG — can cause bundler issues
const { getUser } = await import('~/utils/users.functions')

// CORRECT — static imports are safe, build handles environment shaking
import { getUser } from '~/utils/users.functions'
```

#### 5. HIGH: Awaiting server function without calling it

`createServerFn` returns a function — it must be invoked with `()`:

```tsx
// WRONG — getItems is a function, not a Promise
const data = await getItems

// CORRECT — call the function
const data = await getItems()

// With validated input
const data = await getItems({ data: { id: '1' } })
```

#### 6. CRITICAL: Caching authenticated responses with `Cache-Control: public`

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

Rule of thumb: if the handler reads a session/cookie/auth header or branches on identity, the response is **not** `public`. Default to `private` (or `no-store` for sensitive data); reach for `public` only on responses that are byte-for-byte identical regardless of who asks. See also [start-core/deployment](./deployment-rendering.md#source-tanstack-start-client-core-start-core-deployment) for ISR/Cache-Control on full pages.

#### 7. MEDIUM: When to wrap with `useServerFn`

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

#### 8. CRITICAL: Self-fetching a relative API URL from a loader

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

### Cross-References

- [start-core/execution-model](./foundations.md#source-tanstack-start-client-core-start-core-execution-model) — understanding where code runs
- [start-core/middleware](./middleware-auth.md#source-tanstack-start-client-core-start-core-middleware) — composing server functions with middleware
- [start-core/auth-server-primitives](./middleware-auth.md#source-tanstack-start-client-core-start-core-auth-server-primitives) — sessions, cookies, OAuth, CSRF, rate limiting (the server-side half of auth; `getCurrentUser`/`useSession`-style helpers belong here, not at module scope)
- [router-core/auth-and-guards](./router-essentials.md#source-tanstack-router-core-auth-and-guards) — routing-side UX guards; data auth belongs in the server function, server route, or API endpoint handler/middleware

<a id="source-tanstack-start-client-core-start-core-server-routes"></a>

## Server Routes

Source: `tanstack-start-client-core-start-core-server-routes`.

## Server Routes

Server routes are API endpoints defined alongside app routes in the `src/routes` directory. They use the `server` property on `createFileRoute` and handle raw HTTP requests.

Use server routes when callers need an HTTP contract. For data used only by the Start application, prefer a server function and call it directly from the loader. A route loader runs during SSR and client navigation, so `fetch('/api/...')` is not a portable loader pattern.

### Basic Server Route

```ts
// src/routes/api/hello.ts
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return new Response('Hello, World!')
      },
    },
  },
})
```

### Combining Server Route and App Route

The same file can define both a server route and a UI route:

```tsx
// src/routes/hello.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/hello')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json()
        return Response.json({ message: `Hello, ${body.name}!` })
      },
    },
  },
  component: HelloComponent,
})

function HelloComponent() {
  const [reply, setReply] = useState('')
  return (
    <button
      onClick={() => {
        fetch('/hello', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Tanner' }),
        })
          .then((res) => res.json())
          .then((data) => setReply(data.message))
      }}
    >
      Say Hello {reply && `- ${reply}`}
    </button>
  )
}
```

The relative `fetch('/hello')` above is safe because it runs only in a browser click handler.

### Sharing Data with a Start Route

Do not make the SSR loader call its own server route. Put the business operation in a server-only service, then expose it through both boundaries when both are required:

```tsx
// src/server/issues.server.ts
export function listIssues() {
  return db.issues.findMany()
}

// src/routes/api/issues.ts
export const Route = createFileRoute('/api/issues')({
  server: {
    handlers: {
      GET: async () => Response.json(await listIssues()),
    },
  },
})

// src/routes/issues.tsx
const getIssues = createServerFn({ method: 'GET' }).handler(() => {
  return listIssues()
})

export const Route = createFileRoute('/issues')({
  loader: () => getIssues(),
})
```

This keeps SSR independent of URL resolution and keeps one source of business logic.

### File Route Conventions

Server routes follow TanStack Router file-based routing conventions:

| File                        | Route                         |
| --------------------------- | ----------------------------- |
| `routes/users.ts`           | `/users`                      |
| `routes/users/$id.ts`       | `/users/$id`                  |
| `routes/users/$id/posts.ts` | `/users/$id/posts`            |
| `routes/api/file/$.ts`      | `/api/file/$` (splat)         |
| `routes/my-script[.]js.ts`  | `/my-script.js` (escaped dot) |

### Unique Route Paths

Each route can only have a single handler file. These would conflict:

- `routes/users.ts`
- `routes/users.index.ts`
- `routes/users/index.ts`

### Handler Context

Each handler receives:

- `request` — the incoming [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) object
- `params` — dynamic path parameters
- `context` — context from middleware
- `pathname` — the matched pathname
- `next` — call to fall through to SSR (returns a `Response`)

### Dynamic Path Params

```ts
// routes/users/$id.ts
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/users/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        return new Response(`User ID: ${params.id}`)
      },
    },
  },
})
```

### Splat/Wildcard Params

```ts
// routes/file/$.ts
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/file/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        return new Response(`File: ${params._splat}`)
      },
    },
  },
})
```

### Request Body Handling

```ts
export const Route = createFileRoute('/api/users')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json()
        return Response.json({ created: body.name })
      },
    },
  },
})
```

Other body methods: `request.text()`, `request.formData()`.

### JSON Responses

```ts
// Using Response.json helper
handlers: {
  GET: async () => {
    return Response.json({ message: 'Hello!' })
  },
}
```

### Status Codes and Headers

```ts
handlers: {
  GET: async ({ params }) => {
    const user = await findUser(params.id)
    if (!user) {
      return new Response('Not found', { status: 404 })
    }
    return Response.json(user)
  },
}
```

```ts
handlers: {
  GET: async () => {
    return new Response('Hello', {
      headers: { 'Content-Type': 'text/plain' },
    })
  },
}
```

### Middleware on Server Routes

#### All handlers

```tsx
export const Route = createFileRoute('/api/admin')({
  server: {
    middleware: [authMiddleware, loggerMiddleware],
    handlers: {
      GET: async ({ context }) => Response.json(context.user),
      POST: async ({ request, context }) => {
        /* ... */
      },
    },
  },
})
```

#### Specific handlers with createHandlers

```tsx
export const Route = createFileRoute('/api/data')({
  server: {
    handlers: ({ createHandlers }) =>
      createHandlers({
        GET: async () => Response.json({ public: true }),
        POST: {
          middleware: [authMiddleware],
          handler: async ({ context }) => {
            return Response.json({ user: context.session.user })
          },
        },
      }),
  },
})
```

#### Combined route-level and handler-specific

```tsx
export const Route = createFileRoute('/api/posts')({
  server: {
    middleware: [authMiddleware], // runs first for all
    handlers: ({ createHandlers }) =>
      createHandlers({
        GET: async () => Response.json([]),
        POST: {
          middleware: [validationMiddleware], // runs after auth, POST only
          handler: async ({ request }) => {
            const body = await request.json()
            return Response.json({ created: true })
          },
        },
      }),
  },
})
```

### Common Mistakes

#### 1. CRITICAL: Protecting the page but not the server route

Every handler that reads or writes private data must authenticate and authorize the request through route middleware, handler middleware, or an in-handler check. A router `beforeLoad` redirect does not protect `/api/...`. Test the handler directly without cookies and assert that no private payload is returned.

#### 2. MEDIUM: Duplicate route paths

```text
# WRONG — both resolve to /users, causes error
routes/users.ts
routes/users/index.ts

# CORRECT — pick one
routes/users.ts
```

#### 3. MEDIUM: Forgetting to await request body methods

```ts
// WRONG — body is a Promise, not the actual data
const body = request.json()

// CORRECT — await the promise
const body = await request.json()
```

#### 4. HIGH: Trusting TypeScript as response-schema validation

Validate request input and test the serialized `Response` output. A typed service can still be projected or serialized without a newly added field. For schema changes, assert `await response.json()` at the server-route boundary.

### Cross-References

- [start-core/middleware](./middleware-auth.md#source-tanstack-start-client-core-start-core-middleware) — middleware for server routes
- [start-core/server-functions](./server-runtime.md#source-tanstack-start-client-core-start-core-server-functions) — alternative for RPC-style calls

<a id="source-tanstack-start-server-core"></a>

## Start Server Core

Source: `tanstack-start-server-core`.

## Start Server Core (`@tanstack/start-server-core`)

Server-side runtime for TanStack Start. Provides the request handler, request/response utilities, cookie management, and session management. All utilities are available anywhere in the call stack during a request via AsyncLocalStorage.

> **CRITICAL**: These utilities are SERVER-ONLY. Import them from `@tanstack/<framework>-start/server`, not from the main entry point. They throw if called outside a server request context.
>
> **CRITICAL**: Types are FULLY INFERRED. Never cast, never annotate inferred values.
>
> **CRITICAL**: Read cookies, headers, request URLs, and runtime environment values inside the active request. Do not capture them at module scope; edge runtimes may inject them per request, and concurrent requests must never share request-derived state.

### `createStartHandler`

Creates the main request handler that processes all incoming requests through three phases: server functions, server routes, then app SSR.

```ts
// src/server.ts
// Use @tanstack/<framework>-start for your framework (react, solid, vue)
import { createStartHandler } from '@tanstack/react-start/server'
import { defaultStreamHandler } from '@tanstack/react-start/server'

export default createStartHandler({
  handler: defaultStreamHandler,
})
```

With asset URL transforms (CDN):

```ts
export default createStartHandler({
  handler: defaultStreamHandler,
  transformAssets: 'https://cdn.example.com',
})
```

### Request Utilities

All imported from `@tanstack/<framework>-start/server`. Available anywhere during request handling — no parameter passing needed.

#### Reading Request Data

```ts
// Use @tanstack/<framework>-start for your framework (react, solid, vue)
import { createServerFn } from '@tanstack/react-start'
import {
  getRequest,
  getRequestHeaders,
  getRequestHeader,
  getRequestIP,
  getRequestHost,
  getRequestUrl,
  getRequestProtocol,
} from '@tanstack/react-start/server'

const serverFn = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest()
  const headers = getRequestHeaders()
  const auth = getRequestHeader('authorization')
  const ip = getRequestIP({ xForwardedFor: true })
  const host = getRequestHost()
  const url = getRequestUrl()
  const protocol = getRequestProtocol()

  return { ip, host }
})
```

#### Setting Response Data

```ts
// Use @tanstack/<framework>-start for your framework (react, solid, vue)
import { createServerFn } from '@tanstack/react-start'
import {
  setResponseHeader,
  setResponseHeaders,
  setResponseStatus,
  getResponseHeaders,
  getResponseHeader,
  getResponseStatus,
  removeResponseHeader,
  clearResponseHeaders,
} from '@tanstack/react-start/server'

const serverFn = createServerFn({ method: 'POST' }).handler(async () => {
  setResponseStatus(201)
  setResponseHeader('x-custom', 'value')
  setResponseHeaders({ 'cache-control': 'no-store' })

  return { created: true }
})
```

### Cookie Management

```ts
// Use @tanstack/<framework>-start for your framework (react, solid, vue)
import { createServerFn } from '@tanstack/react-start'
import {
  getCookies,
  getCookie,
  setCookie,
  deleteCookie,
} from '@tanstack/react-start/server'

const serverFn = createServerFn({ method: 'POST' }).handler(async () => {
  const allCookies = getCookies()
  const token = getCookie('session-token')

  setCookie('preference', 'dark', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  deleteCookie('old-cookie')
})
```

### Session Management

Encrypted sessions stored in cookies. Requires a password for encryption.

```ts
// Use @tanstack/<framework>-start for your framework (react, solid, vue)
import { createServerFn } from '@tanstack/react-start'
import {
  useSession,
  getSession,
  updateSession,
  clearSession,
} from '@tanstack/react-start/server'

type SessionData = {
  userId?: string
}

function getSessionConfig() {
  const password = process.env.SESSION_SECRET
  if (!password || password.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters')
  }

  return {
    password,
    name: 'my-app-session',
    maxAge: 60 * 60 * 24 * 7,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    },
  }
}

function getDummyPasswordHash() {
  // Precompute this with the same algorithm and cost as real password hashes.
  const hash = process.env.DUMMY_PASSWORD_HASH
  if (!hash) {
    throw new Error('DUMMY_PASSWORD_HASH is required')
  }
  return hash
}

// Full session manager
const getUser = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await useSession<SessionData>(getSessionConfig())
  if (!session.data.userId) {
    return null
  }
  return db.users.findById(session.data.userId)
})

// Update session
const login = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (
      typeof data !== 'object' ||
      data === null ||
      !('email' in data) ||
      typeof data.email !== 'string' ||
      data.email.trim().length === 0 ||
      !('password' in data) ||
      typeof data.password !== 'string' ||
      data.password.length === 0
    ) {
      throw new Error('Invalid credentials')
    }
    return {
      email: data.email.trim().toLowerCase(),
      password: data.password,
    }
  })
  .handler(async ({ data }) => {
    const user = await db.users.findByEmail(data.email)
    const passwordHash = user?.passwordHash ?? getDummyPasswordHash()
    const passwordMatches = await verifyPassword(data.password, passwordHash)
    if (!user || !passwordMatches) {
      throw new Error('Invalid credentials')
    }

    await updateSession<SessionData>(getSessionConfig(), {
      userId: user.id,
    })
    return { success: true }
  })

// Clear session
const logout = createServerFn({ method: 'POST' }).handler(async () => {
  await clearSession(getSessionConfig())
  return { success: true }
})
```

#### Session Config

| Option     | Type                     | Default     | Description       |
| ---------- | ------------------------ | ----------- | ----------------- |
| `password` | `string`                 | required    | Encryption key    |
| `name`     | `string`                 | `'start'`   | Cookie name       |
| `maxAge`   | `number`                 | `undefined` | Expiry in seconds |
| `cookie`   | `false \| CookieOptions` | `undefined` | Cookie settings   |

#### Session Manager Methods

```ts
const session = await useSession<{ userId: string }>(config)

session.id // Session ID (string | undefined)
session.data // Session data (typed)
await session.update({ userId: '123' }) // Persist session data
await session.clear() // Clear session data
```

#### Production Session Rules

- Keep cookie session data small and non-sensitive. Store a stable session or user ID, then load current permissions and account state from the authoritative store on each protected request.
- Use a server-side session record when you need revocation, device tracking, large data, or immediate role changes. Put only its opaque ID in the cookie.
- Rotate the session after login, privilege changes, password changes, and logout.
- Use `HttpOnly`, `SameSite`, `Path=/`, and `Secure` in production. Use a `__Host-` cookie name in production only when `Secure`, no `Domain`, and `Path=/` are all enforced.
- Use the same cookie name and path when clearing a session. Test login, authenticated refresh, expiry, logout, and a replay of the old cookie.

### Query Validation

Validate query string parameters using a Standard Schema:

```ts
// Use @tanstack/<framework>-start for your framework (react, solid, vue)
import { getValidatedQuery } from '@tanstack/react-start/server'
import { z } from 'zod'

const serverFn = createServerFn({ method: 'GET' }).handler(async () => {
  const query = await getValidatedQuery(
    z.object({
      page: z.coerce.number().default(1),
      limit: z.coerce.number().default(20),
    }),
  )

  return { page: query.page }
})
```

> Note: `getValidatedQuery` accepts a Standard Schema validator, not a callback function.

### How Request Handling Works

`createStartHandler` processes requests in three phases:

1. **Server Function Dispatch** — If URL matches the server function prefix (`/_serverFn`), deserializes the payload, runs global request middleware, executes the server function, and returns the serialized result.

2. **Server Route Handler** — For non-server-function requests, matches the URL against routes with `server.handlers`. Runs route middleware, then the matched HTTP method handler. Handlers can return a `Response` or call `next()` to fall through to SSR.

3. **App Router SSR** — Loads all route loaders, dehydrates state for client hydration, and calls the handler callback (e.g., `defaultStreamHandler`) to render HTML.

### Common Mistakes

#### 1. CRITICAL: Importing server utilities in client code

Server utilities use AsyncLocalStorage and only work during server request handling. Importing them in client code causes build errors or runtime crashes.

```ts
// WRONG — importing in a component file that runs on client
import { getCookie } from '@tanstack/react-start/server'

function MyComponent() {
  const token = getCookie('auth') // crashes on client
}

// CORRECT — use inside server functions only
// Use @tanstack/<framework>-start for your framework (react, solid, vue)
import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'

const getAuth = createServerFn({ method: 'GET' }).handler(async () => {
  return getCookie('auth')
})
```

#### 2. HIGH: Forgetting session password for most session operations

`useSession`, `getSession`, `updateSession`, and `sealSession` all require a `password` field for encryption. Missing it throws at runtime. `clearSession` accepts `Partial<SessionConfig>`, so password is optional for clearing.

#### 3. MEDIUM: Using session without HTTPS in production

Session cookies should use `secure: true` in production. The default cookie options may not enforce this.

#### 4. CRITICAL: Capturing request or environment state at module scope

Do not create session config from `process.env` at module load or cache `getRequest()`, headers, cookies, or session data in a module variable. Create config and read request state inside the handler or middleware callback. This is required for per-request edge environments and prevents cross-request data leaks.

### Cross-References

- [start-core/server-functions](./server-runtime.md#source-tanstack-start-client-core-start-core-server-functions) — creating server functions that use these utilities
- [start-core/middleware](./middleware-auth.md#source-tanstack-start-client-core-start-core-middleware) — request middleware
- [start-core/server-routes](./server-runtime.md#source-tanstack-start-client-core-start-core-server-routes) — server route handlers
