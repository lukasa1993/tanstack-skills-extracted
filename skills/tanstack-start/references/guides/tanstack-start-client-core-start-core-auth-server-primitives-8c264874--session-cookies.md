# Auth Server Primitives — Session Cookies

[Guide and prerequisites](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874.md) · Published skill · `@tanstack/start-client-core@1.170.28`.

## Session Cookies

The recommended session storage is an HTTP-only cookie holding either an opaque session ID (with server-side lookup) or a signed/encrypted token. The cookie flags matter — set them all.

```tsx
// src/server/session.ts
import {
  getRequestHeader,
  setResponseHeader,
} from '@tanstack/react-start/server'

const SESSION_COOKIE = '__Host-session' // __Host- prefix binds to the exact origin + path '/'
const ONE_DAY = 60 * 60 * 24

export function setSessionCookie(token: string) {
  setResponseHeader(
    'Set-Cookie',
    [
      `${SESSION_COOKIE}=${token}`,
      `HttpOnly`, // not readable from JS — defeats XSS exfiltration
      `Secure`, // HTTPS only (required for __Host- prefix)
      `SameSite=Lax`, // sent on top-level navigations, blocks most CSRF
      `Path=/`, // required for __Host- prefix
      `Max-Age=${ONE_DAY}`,
    ].join('; '),
  )
}

export function clearSessionCookie() {
  setResponseHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`,
  )
}

export function readSessionToken(): string | null {
  const header = getRequestHeader('cookie')
  if (!header) return null
  for (const part of header.split(/;\s*/)) {
    // Split only on the FIRST '=' — signed/base64 values often contain '='.
    const eq = part.indexOf('=')
    if (eq === -1) continue
    if (part.slice(0, eq) === SESSION_COOKIE) return part.slice(eq + 1)
  }
  return null
}
```

Flag rationale:

- `HttpOnly` — JavaScript can't read the cookie, so an XSS bug can't steal the session.
- `Secure` — HTTPS only. Required when using `__Host-` prefix.
- `SameSite=Lax` — blocks CSRF on most cross-origin POST/PUT/DELETE. Use `Strict` for highest-security flows where loss of cross-site GET navigation is acceptable.
- `__Host-` prefix — binds the cookie to the exact origin (no Domain attribute, Path must be `/`, Secure must be set). Prevents subdomain takeover from forging a session cookie.
- `Path=/` — required by `__Host-`.
- `Max-Age` — finite lifetime so a stolen cookie isn't useful forever. Pair with server-side session rotation.
