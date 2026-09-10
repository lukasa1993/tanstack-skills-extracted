# Auth Server Primitives — Session Lookup as Middleware

[Guide and prerequisites](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874.md) · Published skill · `@tanstack/start-client-core@1.170.29`.

## Session Lookup as Middleware

Use middleware to centralize session loading so every protected handler sees a typed session:

```tsx
// src/server/auth-middleware.ts
import { createMiddleware } from '@tanstack/react-start'
import { readSessionToken } from './session'

export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const token = readSessionToken()
    const session = token ? await db.sessions.findValid(token) : null
    if (!session) throw new Error('Unauthorized')
    return next({ context: { session } })
  },
)
```

Attach it to every server function that needs a logged-in user:

```tsx
import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '~/server/auth-middleware'

export const getMyOrders = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return db.orders.findMany({ where: { userId: context.session.userId } })
  })
```

> **Route guards do not cover this.** A `createFileRoute('/_authenticated/orders')` with a `beforeLoad` redirect does NOT protect `getMyOrders` — the RPC is reachable directly whether or not the user ever hits the route. Apply `authMiddleware` (or re-check inside `.handler()`) on every server function that needs auth.
