# Migrate From React Router — Search Params

[Guide and prerequisites](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb.md) · Published skill · `@tanstack/react-router@1.170.46`.

## Search Params

- [ ] **Replace `useSearchParams` with `validateSearch` + `useSearch`**

React Router:

```tsx
import { useSearchParams } from 'react-router'

function Posts() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1

  const goToPage = (p: number) => setSearchParams({ page: String(p) })
}
```

TanStack Router:

```tsx
// In the route definition:
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/posts')({
  validateSearch: z.object({
    page: z.number().default(1).catch(1),
  }),
  component: Posts,
})

// In the component:
import { useNavigate } from '@tanstack/react-router'

function Posts() {
  const { page } = Route.useSearch()
  const navigate = useNavigate({ from: '/posts' })

  const goToPage = (p: number) => {
    navigate({ search: (prev) => ({ ...prev, page: p }) })
  }
}
```

Key differences:

- Search params are validated and typed at the route level
- `useSearch()` returns typed objects, not `URLSearchParams`
- Update with function form to preserve other params
