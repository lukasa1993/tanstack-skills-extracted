# Auth Server Primitives — OAuth: state + PKCE

[Guide and prerequisites](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874.md) · Published skill · `@tanstack/start-client-core@1.170.28`.

## OAuth: state + PKCE

For OAuth authorization-code flow, generate a one-time `state` (CSRF defense) and a PKCE verifier (defense against authorization-code interception). Store both in a short-lived signed cookie keyed to this exact login attempt.

```tsx
// src/server/oauth.functions.ts
import { createServerFn } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import {
  getRequestHeader,
  setResponseHeader,
} from '@tanstack/react-start/server'
import crypto from 'node:crypto'

const OAUTH_STATE_COOKIE = '__Host-oauth' // expires fast; one-shot

function base64url(buf: Buffer) {
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

export const startOAuth = createServerFn({ method: 'GET' }).handler(
  async () => {
    const state = base64url(crypto.randomBytes(32))
    const verifier = base64url(crypto.randomBytes(32))
    const challenge = base64url(
      crypto.createHash('sha256').update(verifier).digest(),
    )

    setResponseHeader(
      'Set-Cookie',
      `${OAUTH_STATE_COOKIE}=${signed({ state, verifier })}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
    )

    throw redirect({
      href:
        `https://provider.example/authorize` +
        `?response_type=code` +
        `&client_id=${process.env.OAUTH_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(process.env.OAUTH_REDIRECT_URI!)}` +
        `&state=${state}` +
        `&code_challenge=${challenge}` +
        `&code_challenge_method=S256`,
    })
  },
)
```

In the callback handler, **verify the cookie state matches the returned state** and exchange the code with the verifier. If state is missing or doesn't match, abort — the request did not originate from your `startOAuth`.
