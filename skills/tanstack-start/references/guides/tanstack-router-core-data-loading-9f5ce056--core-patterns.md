# Data Loading — Core Patterns

[Guide and prerequisites](./tanstack-router-core-data-loading-9f5ce056.md) · Published skill · `@tanstack/router-core@1.171.29`.

## Core Patterns

### loaderDeps for Search-Param-Driven Cache Keys

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

### SWR Caching Configuration

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

### Pending States (pendingComponent / pendingMs / pendingMinMs)

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

### Router Context with createRootRouteWithContext (Factory Pattern)

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

### Deferred Data Loading

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

### Invalidation After Mutations

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

### Error Handling

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

### Loader Parameters

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
