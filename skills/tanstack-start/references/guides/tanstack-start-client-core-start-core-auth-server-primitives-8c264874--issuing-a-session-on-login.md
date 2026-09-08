# Auth Server Primitives — Issuing a Session on Login

[Guide and prerequisites](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874.md) · Published skill · `@tanstack/start-client-core@1.170.28`.

## Issuing a Session on Login

```tsx
// src/server/login.functions.ts
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { setSessionCookie } from './session'

export const login = createServerFn({ method: 'POST' })
  .validator(z.object({ email: z.string().email(), password: z.string() }))
  .handler(async ({ data }) => {
    const user = await db.users.findByEmail(data.email)
    // Always run verifyPasswordHash — even when the user doesn't exist —
    // so the user-not-found branch takes the same time as wrong-password.
    // DUMMY_PASSWORD_HASH is a hash of any throwaway password computed once
    // at startup with the same algorithm/cost as real password hashes.
    const hashToCheck = user?.passwordHash ?? DUMMY_PASSWORD_HASH
    const passwordMatches = await verifyPasswordHash(hashToCheck, data.password)
    const ok = user != null && passwordMatches
    if (!ok) throw new Error('Invalid email or password')

    // ROTATE on privilege change: destroy any existing session, then issue fresh.
    await db.sessions.revokeAllForUser(user.id)
    const token = await db.sessions.create({ userId: user.id })
    setSessionCookie(token)
    return { ok: true }
  })
```
