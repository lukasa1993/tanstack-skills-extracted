# Ssr — Setup: Shared Router Factory

[Guide and prerequisites](./tanstack-router-core-ssr-e95e1bf1.md) · Published skill · `@tanstack/router-core@1.171.28`.

## Setup: Shared Router Factory

The router must be created identically on server and client. Export a factory function from a shared file:

```tsx
// src/router.tsx
import { createRouter as createTanstackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function createRouter() {
  return createTanstackRouter({ routeTree })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
```
