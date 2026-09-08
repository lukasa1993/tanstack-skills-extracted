# Type Safety — Types Flow Automatically

[Guide and prerequisites](./tanstack-router-core-type-safety-d349a495.md) · Published skill · `@tanstack/router-core@1.171.28`.

## Types Flow Automatically

### Route Hooks — No Annotation Needed

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

### Context Flows Through the Tree

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
