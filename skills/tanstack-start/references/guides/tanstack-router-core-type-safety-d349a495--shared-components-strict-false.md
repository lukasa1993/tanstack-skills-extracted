# Type Safety — Shared Components: `strict: false`

[Guide and prerequisites](./tanstack-router-core-type-safety-d349a495.md) · Published skill · `@tanstack/router-core@1.171.29`.

## Shared Components: `strict: false`

When a component is used across multiple routes, use `strict: false` instead of `from`:

```tsx
import { useSearch } from '@tanstack/react-router'

function GlobalSearch() {
  // Returns union of all routes' search params — no runtime error if route doesn't match
  const search = useSearch({ strict: false })
  return <span>Query: {search.q ?? ''}</span>
}
```
