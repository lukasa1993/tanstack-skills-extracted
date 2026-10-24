# Migrate From React Router — Common Mistakes

[Guide and prerequisites](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb.md) · Published skill · `@tanstack/react-router@1.170.46`.

## Common Mistakes

### 1. HIGH: Leaving React Router imports alongside TanStack Router

Both libraries export `Link`, `useNavigate`, `Outlet`, etc. Leftover React Router imports cause "cannot use useNavigate outside of context" errors because the wrong context provider is used.

```tsx
// WRONG — mixed imports
import { Link } from '@tanstack/react-router'
import { useNavigate } from 'react-router' // <- still React Router!

// CORRECT — all from TanStack Router
import { Link, useNavigate } from '@tanstack/react-router'
```

**Fix**: Uninstall `react-router`/`react-router-dom` completely. TypeScript will flag every stale import.

### 2. HIGH: Using React Router `useSearchParams` pattern

```tsx
// WRONG — React Router pattern, returns URLSearchParams
const [searchParams, setSearchParams] = useSearchParams()
const page = Number(searchParams.get('page'))

// CORRECT — TanStack Router pattern, returns typed object
// Route definition:
validateSearch:
  z.object({
    page: z.number().default(1).catch(1),
  }),

// Component:
const { page } = Route.useSearch()
// page is already typed as number — no casting needed
```

### 3. HIGH: Interpolating params into `to` string

```tsx
// WRONG — React Router habit
<Link to={`/posts/${postId}`}>Post</Link>

// CORRECT — TanStack Router: path pattern + params prop
<Link to="/posts/$postId" params={{ postId }}>Post</Link>
```

### 4. MEDIUM: Using `:param` syntax instead of `$param`

```text
React Router: /posts/:postId
TanStack Router: /posts/$postId
```

File naming also uses `$`: `src/routes/posts/$postId.tsx`
