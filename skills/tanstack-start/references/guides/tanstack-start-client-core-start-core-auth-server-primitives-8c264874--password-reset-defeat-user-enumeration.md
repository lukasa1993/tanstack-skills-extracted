# Auth Server Primitives — Password Reset: defeat user enumeration

[Guide and prerequisites](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874.md) · Published skill · `@tanstack/start-client-core@1.170.28`.

## Password Reset: defeat user enumeration

When a user requests a reset, do not let the response shape or timing reveal whether the email is registered.

```tsx
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const requestPasswordReset = createServerFn({ method: 'POST' })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const user = await db.users.findByEmail(data.email)
    if (user) {
      const token = await db.passwordResets.issue(user.id)
      await sendResetEmail(user.email, token)
    }
    // Always 200, always the same body, regardless of whether the user exists.
    // The user is told to check their inbox; no confirmation either way.
    return { ok: true }
  })
```

Do NOT:

- Return 200 if exists, 404 if not.
- Use a different message ("we sent you a link" vs "no account found").
- Skip the work when the user doesn't exist (timing leak — measurable from the wire).
