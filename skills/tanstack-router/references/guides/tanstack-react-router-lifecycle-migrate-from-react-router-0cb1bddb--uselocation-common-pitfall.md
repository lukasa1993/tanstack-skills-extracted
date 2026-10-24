# Migrate From React Router — `useLocation` — Common Pitfall

[Guide and prerequisites](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb.md) · Published skill · `@tanstack/react-router@1.170.46`.

## `useLocation` — Common Pitfall

- [ ] **Replace `useLocation` with specific hooks**

React Router's `useLocation` is heavily used, and TanStack Router has a hook with the same name — but they are NOT equivalent. TanStack Router's `useLocation()` returns the router's current location, which during pending navigations may differ from what's currently rendered. Most React Router `useLocation` usage should be replaced with more specific hooks. See [#3110](https://github.com/TanStack/router/issues/3110).

Replace based on what you actually need:

```tsx
// React Router
import { useLocation } from 'react-router'
const location = useLocation()

// ❌ DON'T just swap to TanStack Router's useLocation — it's the "live" URL
import { useLocation } from '@tanstack/react-router'

// ✅ DO use the specific hook for what you need:
import {
  useMatch,
  useMatches,
  useParams,
  useSearch,
} from '@tanstack/react-router'

// Current route match (replaces most useLocation().pathname usage)
const match = useMatch({ from: '/posts/$postId' })

// All active matches (replaces useLocation for breadcrumbs/analytics)
const matches = useMatches()

// Path params (replaces useLocation + manual parsing)
const { postId } = useParams({ from: '/posts/$postId' })

// Search params (replaces useLocation().search parsing)
const { page } = useSearch({ from: '/posts' })
```
