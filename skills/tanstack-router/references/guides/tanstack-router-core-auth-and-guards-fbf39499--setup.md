# Auth And Guards — Setup

[Guide and prerequisites](./tanstack-router-core-auth-and-guards-fbf39499.md) · Published skill · `@tanstack/router-core@1.171.29`.

## Setup

Protect routes with `beforeLoad` + `redirect()` in a pathless layout route (`_authenticated`):

```tsx
// src/routes/_authenticated.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  // component defaults to Outlet — no need to declare it
})
```

Any route file placed under `src/routes/_authenticated/` is automatically protected:

```tsx
// src/routes/_authenticated/dashboard.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardComponent,
})

function DashboardComponent() {
  const { auth } = Route.useRouteContext()
  return <div>Welcome, {auth.user?.username}</div>
}
```
