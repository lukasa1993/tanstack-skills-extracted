# React adapter

React Start setup and migration.

<a id="source-tanstack-react-start"></a>

## React Start

Source: `tanstack-react-start`.

## React Start (`@tanstack/react-start`)

This is the React Start entry skill. Use the workflow below, then load only the package skill that owns the boundary you are changing. Do not read `start-core`, Router Core, and React Router manuals in full before starting.

For React Server Components patterns, see [react-start/server-components](./deployment-rendering.md#source-tanstack-react-start-server-components).

> **CRITICAL**: All code is ISOMORPHIC by default. Loaders run on BOTH server and client. Use `createServerFn` for server-only logic.

> **CRITICAL**: Do not confuse `@tanstack/react-start` with Next.js or Remix. They are completely different frameworks with different APIs.

> **CRITICAL**: Types are FULLY INFERRED. Never cast, never annotate inferred values.

### Full-Stack Workflow

1. Define the route and component with `createFileRoute`.
2. Put private or server-only reads and writes in `createServerFn`; call reads directly from loaders.
3. Use `useServerFn` for component mutations, then invalidate the router or query cache after the write resolves.
4. Enforce auth in every private server function or server route. Add `beforeLoad` separately for navigation UX.
5. Run the initial SSR path, client navigation, mutation plus reload, direct anonymous endpoint request, runtime response assertion, type tests, and production build.

Load `start-core/server-routes` instead of `server-functions` only when a raw HTTP endpoint is required. Load `router-core/*` only for the specific routing concern involved, such as params or search validation.

### Package API Surface

`@tanstack/react-start` re-exports everything from `@tanstack/start-client-core` plus:

- `useServerFn` — React hook for calling server functions from components

All core APIs (`createServerFn`, `createMiddleware`, `createStart`, `createIsomorphicFn`, `createServerOnlyFn`, `createClientOnlyFn`) are available from `@tanstack/react-start`.

Server utilities (`getRequest`, `getRequestHeader`, `setResponseHeader`, `setResponseHeaders`, `setResponseStatus`) are imported from `@tanstack/react-start/server`.

### Full Project Setup

#### 1. Install Dependencies

```bash
npm i @tanstack/react-start @tanstack/react-router react react-dom
npm i -D vite @vitejs/plugin-react typescript @types/react @types/react-dom
```

#### 2. package.json

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "start": "node .output/server/index.mjs"
  }
}
```

#### 3. tsconfig.json

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "Bundler",
    "module": "ESNext",
    "target": "ES2022",
    "skipLibCheck": true,
    "strictNullChecks": true
  }
}
```

#### 4. vite.config.ts

```ts
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    tanstackStart(), // MUST come before react()
    viteReact(),
  ],
})
```

#### 5. Router Factory (src/router.tsx)

```tsx
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

#### 6. Root Route (src/routes/\_\_root.tsx)

```tsx
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
      { title: 'My TanStack Start App' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
```

#### 7. Index Route (src/routes/index.tsx)

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const getGreeting = createServerFn({ method: 'GET' }).handler(async () => {
  return 'Hello from TanStack Start!'
})

export const Route = createFileRoute('/')({
  loader: () => getGreeting(),
  component: HomePage,
})

function HomePage() {
  const greeting = Route.useLoaderData()
  return <h1>{greeting}</h1>
}
```

### useServerFn Hook

Use `useServerFn` to call server functions from React components with proper integration:

```tsx
import { createServerFn, useServerFn } from '@tanstack/react-start'

const updatePost = createServerFn({ method: 'POST' })
  .validator((data: { id: string; title: string }) => data)
  .handler(async ({ data }) => {
    await db.posts.update(data.id, { title: data.title })
    return { success: true }
  })

function EditPostForm({ postId }: { postId: string }) {
  const updatePostFn = useServerFn(updatePost)
  const [title, setTitle] = useState('')

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        await updatePostFn({ data: { id: postId, title } })
      }}
    >
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button type="submit">Save</button>
    </form>
  )
}
```

### Global Start Configuration (src/start.ts)

```tsx
import { createStart, createMiddleware } from '@tanstack/react-start'

const requestLogger = createMiddleware().server(async ({ next, request }) => {
  console.log(`${request.method} ${request.url}`)
  return next()
})

export const startInstance = createStart(() => ({
  requestMiddleware: [requestLogger],
}))
```

### React-Specific Components

All routing components from `@tanstack/react-router` work in Start:

- `<RouterProvider>` — not needed in Start (handled automatically)
- `<Outlet>` — renders matched child route
- `<Link>` — type-safe navigation
- `<Navigate>` — declarative redirect
- `<HeadContent>` — renders head tags (must be in `<head>`)
- `<Scripts>` — renders body scripts (must be in `<body>`)
- `<Await>` — renders deferred data with Suspense
- `<ClientOnly>` — renders children only after hydration
- `<CatchBoundary>` — error boundary

### Hooks Reference

All hooks from `@tanstack/react-router` work in Start:

- `useRouter()` — router instance
- `useRouterState()` — subscribe to router state
- `useNavigate()` — programmatic navigation
- `useSearch({ from })` — validated search params
- `useParams({ from })` — path params
- `useLoaderData({ from })` — loader data
- `useMatch({ from })` — full route match
- `useRouteContext({ from })` — route context
- `Route.useLoaderData()` — typed loader data (preferred in route files)
- `Route.useSearch()` — typed search params (preferred in route files)

### Common Mistakes

#### 1. CRITICAL: Importing from wrong package

```tsx
// WRONG — this is the SPA router, NOT Start
import { createServerFn } from '@tanstack/react-router'

// CORRECT — server functions come from react-start
import { createServerFn } from '@tanstack/react-start'

// CORRECT — routing APIs come from react-router (re-exported by Start too)
import { createFileRoute, Link } from '@tanstack/react-router'
```

#### 2. HIGH: Using React hooks in beforeLoad or loader

```tsx
// WRONG — beforeLoad/loader are NOT React components
beforeLoad: () => {
  const auth = useAuth() // React hook, cannot be used here
}

// CORRECT — pass state via router context
const rootRoute = createRootRouteWithContext<{ auth: AuthState }>()({})
```

#### 3. HIGH: Missing Scripts component

Without `<Scripts />` in the root route's `<body>`, client JavaScript doesn't load and the app won't hydrate.

### Cross-References

- [start-core](./foundations.md#source-tanstack-start-client-core-start-core) — core Start concepts
- [router-core](./router-essentials.md#source-tanstack-router-core) — routing fundamentals
- [react-router](./router-essentials.md#source-tanstack-router-core) — React Router hooks and components

<a id="source-tanstack-react-start-lifecycle-migrate-from-nextjs"></a>

## Migrate From Nextjs

Source: `tanstack-react-start-lifecycle-migrate-from-nextjs`.

## Migrate from Next.js App Router to TanStack Start

This is a step-by-step migration checklist. Complete tasks in order.

> **CRITICAL**: TanStack Start is isomorphic by default. ALL code runs in both environments unless you use `createServerFn`. This is the opposite of Next.js Server Components, where code is server-only by default.

> **CRITICAL**: TanStack Start uses `createServerFn`, NOT `"use server"` directives. Do not carry over any `"use server"` or `"use client"` directives.

> **CRITICAL**: Types are FULLY INFERRED in TanStack Router/Start. Never cast, never annotate inferred values.

### Pre-Migration

- [ ] **Create a migration branch**

```bash
git checkout -b migrate-to-tanstack-start
```

- [ ] **Install TanStack Start**

```bash
npm i @tanstack/react-start @tanstack/react-router
npm i -D vite @vitejs/plugin-react
```

- [ ] **Remove Next.js**

```bash
npm uninstall next @next/font @next/image
```

### Concept Mapping

| Next.js App Router               | TanStack Start                                                            |
| -------------------------------- | ------------------------------------------------------------------------- |
| `app/page.tsx`                   | `src/routes/index.tsx`                                                    |
| `app/layout.tsx`                 | `src/routes/__root.tsx`                                                   |
| `app/posts/[id]/page.tsx`        | `src/routes/posts/$postId.tsx`                                            |
| `app/api/users/route.ts`         | `src/routes/api/users.ts` (server property)                               |
| `"use server"` + Server Actions  | `createServerFn()`                                                        |
| `"use client"`                   | Not needed (everything is isomorphic)                                     |
| Server Components (default)      | All components are isomorphic; use `createServerFn` for server-only logic |
| `next/navigation` `useRouter`    | `useRouter()` from `@tanstack/react-router`                               |
| `next/link` `Link`               | `<Link>` from `@tanstack/react-router`                                    |
| `next/head` or `metadata` export | `head` property on route                                                  |
| `middleware.ts` (edge)           | `createMiddleware()` in `src/start.ts`                                    |
| `next.config.js`                 | `vite.config.ts` with `tanstackStart()`                                   |
| `generateStaticParams`           | `prerender` config in `vite.config.ts`                                    |

### Step 1: Vite Configuration

Replace `next.config.js` with:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    tanstackStart(), // MUST come before react()
    viteReact(),
  ],
})
```

Update `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "start": "node .output/server/index.mjs"
  }
}
```

### Step 2: Router Factory

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

### Step 3: Convert Layout → Root Route

Next.js:

```tsx
// app/layout.tsx
export const metadata = { title: 'My App' }
export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

TanStack Start:

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

### Step 4: Convert Pages → File Routes

Next.js:

```tsx
// app/posts/[id]/page.tsx
export default function PostPage({ params }: { params: { id: string } }) {
  // ...
}
```

TanStack Start:

```tsx
// src/routes/posts/$postId.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  component: PostPage,
})

function PostPage() {
  const { postId } = Route.useParams()
  // ...
}
```

Key differences:

- Dynamic segments use `$param` not `[param]`
- Params accessed via `Route.useParams()` not component props
- Route path in filename uses `.` or `/` separators

### Step 5: Convert Server Actions → Server Functions

Next.js:

```tsx
// app/actions.ts
'use server'
export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  await db.posts.create({ title })
}
```

TanStack Start:

```tsx
// src/utils/posts.functions.ts
import { createServerFn } from '@tanstack/react-start'

export const createPost = createServerFn({ method: 'POST' })
  .validator((data) => {
    if (!(data instanceof FormData)) throw new Error('Expected FormData')
    return { title: data.get('title')?.toString() || '' }
  })
  .handler(async ({ data }) => {
    await db.posts.create({ title: data.title })
    return { success: true }
  })
```

### Step 6: Convert Data Fetching

Next.js Server Component:

```tsx
// app/posts/page.tsx (Server Component — server-only by default)
export default async function PostsPage() {
  const posts = await db.posts.findMany()
  return <PostList posts={posts} />
}
```

TanStack Start:

```tsx
// src/routes/posts.tsx
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const getPosts = createServerFn({ method: 'GET' }).handler(async () => {
  return db.posts.findMany()
})

export const Route = createFileRoute('/posts')({
  loader: () => getPosts(), // loader is isomorphic, getPosts runs on server
  component: PostsPage,
})

function PostsPage() {
  const posts = Route.useLoaderData()
  return <PostList posts={posts} />
}
```

### Step 7: Convert API Routes → Server Routes

Next.js:

```ts
// app/api/users/route.ts
export async function GET() {
  const users = await db.users.findMany()
  return Response.json(users)
}
```

TanStack Start:

```ts
// src/routes/api/users.ts
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/users')({
  server: {
    handlers: {
      GET: async () => {
        const users = await db.users.findMany()
        return Response.json(users)
      },
    },
  },
})
```

### Step 8: Convert Navigation

Next.js:

```tsx
import Link from 'next/link'
;<Link href={`/posts/${post.id}`}>View Post</Link>
```

TanStack Start:

```tsx
import { Link } from '@tanstack/react-router'
;<Link to="/posts/$postId" params={{ postId: post.id }}>
  View Post
</Link>
```

Never interpolate params into the `to` string. Use `params` prop.

### Step 9: Convert Middleware

Next.js:

```ts
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')
  if (!token) return NextResponse.redirect(new URL('/login', request.url))
}
export const config = { matcher: ['/dashboard/:path*'] }
```

TanStack Start:

```tsx
// src/start.ts — must be manually created
import { createStart, createMiddleware } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'

const authMiddleware = createMiddleware().server(async ({ next, request }) => {
  const cookie = request.headers.get('cookie')
  if (!cookie?.includes('session=')) {
    throw redirect({ to: '/login' })
  }
  return next()
})

export const startInstance = createStart(() => ({
  requestMiddleware: [authMiddleware],
}))
```

### Step 10: Convert Metadata/SEO

Next.js:

```tsx
export const metadata = {
  title: 'Post Title',
  description: 'Post description',
}
```

TanStack Start:

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => fetchPost(params.postId),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData.title },
      { name: 'description', content: loaderData.excerpt },
      { property: 'og:title', content: loaderData.title },
    ],
  }),
})
```

### Post-Migration Checklist

- [ ] Remove all `"use server"` and `"use client"` directives
- [ ] Remove `next.config.js` / `next.config.ts`
- [ ] Remove `app/` directory (replaced by `src/routes/`)
- [ ] Remove `middleware.ts` (replaced by `src/start.ts`)
- [ ] Verify no `next/*` imports remain
- [ ] Run `npm run dev` and check all routes
- [ ] Verify server-only code is inside `createServerFn` (not bare in components/loaders)
- [ ] Check that `<Scripts />` is in the root route `<body>`

### Common Mistakes

#### 1. CRITICAL: Keeping Server Component mental model

```tsx
// WRONG — treating component as server-only (Next.js habit)
function PostsPage() {
  const posts = await db.posts.findMany() // fails on client
  return <div>{posts.map(...)}</div>
}

// CORRECT — use server function + loader
const getPosts = createServerFn({ method: 'GET' }).handler(async () => {
  return db.posts.findMany()
})

export const Route = createFileRoute('/posts')({
  loader: () => getPosts(),
  component: PostsPage,
})
```

#### 2. CRITICAL: Using "use server" directive

```tsx
// WRONG — "use server" is Next.js/React pattern
'use server'
export async function myAction() { ... }

// CORRECT — use createServerFn
export const myAction = createServerFn({ method: 'POST' })
  .handler(async () => { ... })
```

#### 3. HIGH: Interpolating params into Link href

```tsx
// WRONG — Next.js pattern
<Link to={`/posts/${post.id}`}>View</Link>

// CORRECT — TanStack Router pattern
<Link to="/posts/$postId" params={{ postId: post.id }}>View</Link>
```

### Cross-References

- [react-start](./framework-react.md#source-tanstack-react-start) — full React Start setup
- [start-core/server-functions](./server-runtime.md#source-tanstack-start-client-core-start-core-server-functions) — server function patterns
- [start-core/execution-model](./foundations.md#source-tanstack-start-client-core-start-core-execution-model) — isomorphic execution
