# Auth Server Primitives — CSRF for non-GET RPCs

[Guide and prerequisites](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874.md) · Published skill · `@tanstack/start-client-core@1.170.28`.

## CSRF for non-GET RPCs

`SameSite=Lax` on the session cookie blocks most cross-site CSRF for POST/PUT/DELETE. Two cases need extra defense:

1. **Top-level GET navigation that mutates** — never do this. Always use POST/PUT/DELETE for mutations.
2. **POST from a page on a sibling subdomain** — `SameSite=Lax` does NOT block this; verify the `Origin` header matches your app's origin in middleware.

```tsx
import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

export const csrfMiddleware = createMiddleware().server(async ({ next }) => {
  const request = getRequest()
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const origin = request.headers.get('origin')
    // Compare the FULL origin (scheme + host + port) — host alone lets
    // http://example.com pass a check meant for https://example.com.
    if (!origin || new URL(origin).origin !== process.env.APP_ORIGIN) {
      throw new Error('Origin check failed')
    }
  }
  return next()
})
```

Attach this to global request middleware in `src/start.ts` so it covers every non-GET request, including server routes and SSR.
