# Auth Server Primitives — Session Cookies

[Guide and prerequisites](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874.md) · Published skill · `@tanstack/start-client-core@1.170.39`.

## Session Cookies

The recommended session storage is an HTTP-only cookie holding either an opaque session ID (with server-side lookup) or a signed/encrypted token. The cookie flags matter — set them all.

```tsx
// src/server/session.ts
import {
  deleteCookie,
  getCookie,
  setCookie,
} from '@tanstack/react-start/server'

const SESSION_COOKIE = '__Host-session' // __Host- prefix binds to the exact origin + path '/'
const ONE_DAY = 60 * 60 * 24

const sessionCookieOptions = {
  httpOnly: true, // not readable from JS — defeats XSS exfiltration
  secure: true, // HTTPS only (required for __Host- prefix)
  sameSite: 'lax', // sent on top-level navigations, blocks most CSRF
  path: '/', // required for __Host- prefix
} as const

export function setSessionCookie(token: string) {
  setCookie(SESSION_COOKIE, token, {
    ...sessionCookieOptions,
    maxAge: ONE_DAY,
  })
}

export function clearSessionCookie() {
  deleteCookie(SESSION_COOKIE, sessionCookieOptions)
}

export function readSessionToken(): string | null {
  return getCookie(SESSION_COOKIE) ?? null
}
```

Write cookies with `setCookie` (or `appendResponseHeader('set-cookie', serialized)` for a cookie that a library already serialized). Do not use `setResponseHeader('Set-Cookie', ...)` for this: it replaces every cookie on the outgoing response, including cookies set by other middleware or returned by a handler.

Flag rationale:

- `HttpOnly` — JavaScript can't read the cookie, so an XSS bug can't steal the session.
- `Secure` — HTTPS only. Required when using `__Host-` prefix.
- `SameSite=Lax` — blocks CSRF on most cross-origin POST/PUT/DELETE. Use `Strict` for highest-security flows where loss of cross-site GET navigation is acceptable.
- `__Host-` prefix — binds the cookie to the exact origin (no Domain attribute, Path must be `/`, Secure must be set). Prevents subdomain takeover from forging a session cookie.
- `Path=/` — required by `__Host-`.
- `Max-Age` — finite lifetime so a stolen cookie isn't useful forever. Pair with server-side session rotation.
