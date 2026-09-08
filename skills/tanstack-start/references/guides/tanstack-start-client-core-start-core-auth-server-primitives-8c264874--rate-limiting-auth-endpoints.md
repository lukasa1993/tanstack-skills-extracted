# Auth Server Primitives — Rate Limiting Auth Endpoints

[Guide and prerequisites](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874.md) · Published skill · `@tanstack/start-client-core@1.170.28`.

## Rate Limiting Auth Endpoints

A login endpoint without rate limiting is a credential-stuffing target. Limit per-IP (and ideally per-account) with a sliding window.

```tsx
import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

function rateLimitMiddleware(opts: {
  key: string
  max: number
  windowMs: number
}) {
  return createMiddleware().server(async ({ next }) => {
    const request = getRequest()
    const ip =
      request.headers.get('cf-connecting-ip') ??
      request.headers.get('x-forwarded-for')?.split(',')[0] ??
      'unknown'
    const bucketKey = `rl:${opts.key}:${ip}`
    const allowed = await rateLimiter.consume(
      bucketKey,
      opts.max,
      opts.windowMs,
    )
    if (!allowed) throw new Error('Too many requests')
    return next()
  })
}

// On the login server function:
export const login = createServerFn({ method: 'POST' }).middleware([
  rateLimitMiddleware({ key: 'login', max: 5, windowMs: 60_000 }),
])
// ...
```
