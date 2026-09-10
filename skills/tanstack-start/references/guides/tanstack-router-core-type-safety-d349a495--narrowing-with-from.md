# Type Safety — Narrowing with `from`

[Guide and prerequisites](./tanstack-router-core-type-safety-d349a495.md) · Published skill · `@tanstack/router-core@1.171.29`.

## Narrowing with `from`

Without `from`, hooks return a union of ALL routes' types — slow for TypeScript and imprecise.

### On Hooks

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

### On `Link`

```tsx
import { Link } from '@tanstack/react-router'

// WRONG — search resolves to union of ALL routes' search params, slow TS check
<Link to=".." search={{ page: 0 }} />

// CORRECT — narrowed, fast TS check
<Link from="/posts/$postId" to=".." search={{ page: 0 }} />

// Also correct — Route.fullPath in route components
<Link from={Route.fullPath} to=".." search={{ page: 0 }} />
```
