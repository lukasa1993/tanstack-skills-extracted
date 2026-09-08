# Data Loading — Setup

[Guide and prerequisites](./tanstack-router-core-data-loading-9f5ce056.md) · Published skill · `@tanstack/router-core@1.171.28`.

## Setup

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
