# Type Safety — The ONE Required Type Annotation: Register

[Guide and prerequisites](./tanstack-router-core-type-safety-d349a495.md) · Published skill · `@tanstack/router-core@1.171.28`.

## The ONE Required Type Annotation: Register

Without this, top-level exports like `Link`, `useNavigate`, `useSearch` have no type safety.

```tsx
// src/router.tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })

// THIS IS REQUIRED — the single type registration for the entire app
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router
```

After registration, every `Link`, `useNavigate`, `useSearch`, `useParams` across the app is fully typed.
