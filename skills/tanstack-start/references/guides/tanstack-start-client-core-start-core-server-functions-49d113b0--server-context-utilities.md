# Server Functions — Server Context Utilities

[Guide and prerequisites](./tanstack-start-client-core-start-core-server-functions-49d113b0.md) · Published skill · `@tanstack/start-client-core@1.170.28`.

## Server Context Utilities

Access request/response details inside server function handlers:

```tsx
import { createServerFn } from '@tanstack/react-start'
import {
  getRequest,
  getRequestHeader,
  setResponseHeaders,
  setResponseStatus,
} from '@tanstack/react-start/server'

// Public, non-personalized data — safe to cache shared across users.
const getPublicData = createServerFn({ method: 'GET' }).handler(async () => {
  setResponseHeaders({
    // 'public' is correct ONLY when the response does not depend on identity.
    // For anything tied to a session/user/tenant, use 'private' or 'no-store'.
    'Cache-Control': 'public, max-age=300',
  })
  setResponseStatus(200)
  return fetchPublicData()
})

// Authenticated data — must NOT be 'public'.
const getMyData = createServerFn({ method: 'GET' }).handler(async () => {
  const authHeader = getRequestHeader('Authorization')
  // ... auth check ...

  setResponseHeaders({
    // 'private' = only the user-agent may cache. Vary by Cookie/Authorization
    // so any intermediary that does cache keys by identity, not URL alone.
    'Cache-Control': 'private, max-age=60',
    Vary: 'Cookie, Authorization',
  })
  return fetchPersonalizedData()
})
```

Available utilities:

- `getRequest()` — full Request object
- `getRequestHeader(name)` — single request header
- `setResponseHeader(name, value)` — single response header
- `setResponseHeaders(headers)` — multiple response headers
- `setResponseStatus(code)` — HTTP status code
