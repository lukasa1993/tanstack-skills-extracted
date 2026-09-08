# Auth Server Primitives — Logout

[Guide and prerequisites](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874.md) · Published skill · `@tanstack/start-client-core@1.170.28`.

## Logout

```tsx
import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '~/server/auth-middleware'
import { clearSessionCookie } from '~/server/session'

export const logout = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await db.sessions.revoke(context.session.id)
    clearSessionCookie()
    return { ok: true }
  })
```
