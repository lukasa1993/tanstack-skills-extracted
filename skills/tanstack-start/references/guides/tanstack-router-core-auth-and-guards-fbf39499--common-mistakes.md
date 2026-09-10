# Auth And Guards — Common Mistakes

[Guide and prerequisites](./tanstack-router-core-auth-and-guards-fbf39499.md) · Published skill · `@tanstack/router-core@1.171.29`.

## Common Mistakes

### CRITICAL: Route guards do not protect server functions

A `beforeLoad` redirect protects the **route's UI**, not the **server functions** declared on it. `createServerFn` produces an RPC endpoint reachable directly with its declared HTTP method regardless of which route renders the calling UI. An attacker doesn't have to load `/_authenticated/orders` — they can call this GET RPC endpoint directly.

```tsx
// WRONG — handler has no auth check; the route guard doesn't help
import { createServerFn } from '@tanstack/react-start'
import { createFileRoute, redirect } from '@tanstack/react-router'

const getMyOrders = createServerFn({ method: 'GET' }).handler(async () => {
  return db.orders.findMany() // ← anyone can hit the RPC
})

export const Route = createFileRoute('/_authenticated/orders')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) throw redirect({ to: '/login' })
  },
  loader: () => getMyOrders(),
})
```

```tsx
// CORRECT — auth enforced on the handler itself, via middleware
import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '~/server/auth-middleware'

const getMyOrders = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return db.orders.findMany({ where: { userId: context.session.userId } })
  })
```

Rule of thumb: every `createServerFn`, server route, or API endpoint that touches user data needs `authMiddleware` (or an equivalent in-handler check). The route guard is for the page experience; the endpoint guard is for the data. See [start-core/auth-server-primitives](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874.md#source-tanstack-start-client-core-start-core-auth-server-primitives) for the full session/middleware pattern.

### CRITICAL: The anonymous destination can still disclose protected data

Protect the entire anonymous response, not only the API call. A public login or unauthorized page still leaks data if its title, copy, search params, or serialized loader state names the protected user, tenant, record, or resource. Test a direct anonymous request and follow redirects. Assert that the handler rejects before reading private data, no protected loader runs, the final HTML and serialized state contain no protected identity, and the redirect contains only a sanitized relative return URL.

### HIGH: Auth check in component instead of beforeLoad

Component-level auth checks cause a **flash of protected content** before the redirect:

```tsx
// WRONG — protected content renders briefly before redirect
export const Route = createFileRoute('/_authenticated/dashboard')({
  component: () => {
    const auth = useAuth()
    if (!auth.isAuthenticated) return <Navigate to="/login" />
    return <Dashboard />
  },
})

// CORRECT — beforeLoad runs before any rendering
export const Route = createFileRoute('/_authenticated/dashboard')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: Dashboard,
})
```

### HIGH: Not re-throwing redirects in try/catch

`redirect()` works by throwing. If `beforeLoad` has a try/catch, the redirect gets swallowed:

```tsx
// WRONG — redirect is caught and swallowed
beforeLoad: async ({ context }) => {
  try {
    await validateSession(context.auth)
  } catch (e) {
    console.error(e) // swallows the redirect!
  }
}

// CORRECT — use isRedirect to distinguish intentional redirects from errors
import { isRedirect } from '@tanstack/react-router'

beforeLoad: async ({ context }) => {
  try {
    await validateSession(context.auth)
  } catch (e) {
    if (isRedirect(e)) throw e
    console.error(e)
  }
}
```

### MEDIUM: Conditionally rendering root route component

The root route always renders regardless of auth state. You cannot conditionally render its component:

```tsx
// WRONG — root route always renders, this doesn't protect anything
export const Route = createRootRoute({
  component: () => {
    if (!isAuthenticated()) return <Login />
    return <Outlet />
  },
})

// CORRECT — use a pathless layout route for auth boundaries
// src/routes/_authenticated.tsx
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
})
```

Place protected routes as children of the `_authenticated` layout route. Public routes (login, home, etc.) live outside it.
