# Data Loading — Common Mistakes

[Guide and prerequisites](./tanstack-router-core-data-loading-9f5ce056.md) · Published skill · `@tanstack/router-core@1.171.29`.

## Common Mistakes

### CRITICAL: Assuming loaders only run on the server

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

### MEDIUM: Not understanding staleTime default is 0

Default `staleTime` is `0`. This means data reloads in the background on every route re-match. This is intentional — it ensures fresh data. But if your data is expensive or static, set `staleTime`:

```tsx
export const Route = createFileRoute('/posts')({
  loader: () => fetchPosts(),
  staleTime: 60_000, // Consider fresh for 1 minute
})
```

### HIGH: Using reset() instead of router.invalidate() in error components

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

### HIGH: Missing double parentheses on createRootRouteWithContext

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

### HIGH: Using React hooks in beforeLoad or loader

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

### HIGH: Property order affects TypeScript inference

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

### HIGH: Returning entire search object from loaderDeps

```tsx
// WRONG — loader re-runs on ANY search param change
loaderDeps: ({ search }) => search

// CORRECT — only re-run when page changes
loaderDeps: ({ search }) => ({ page: search.page })
```

Returning the whole `search` object means unrelated param changes (e.g., `sortDirection`, `viewMode`) trigger unnecessary reloads because deep equality fails on the entire object.
