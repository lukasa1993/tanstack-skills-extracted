# Type Safety — Code-Split Files: `getRouteApi`

[Guide and prerequisites](./tanstack-router-core-type-safety-d349a495.md) · Published skill · `@tanstack/router-core@1.171.29`.

## Code-Split Files: `getRouteApi`

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
