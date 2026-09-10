# Auth Server Primitives — Session Rotation on Privilege Change

[Guide and prerequisites](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874.md) · Published skill · `@tanstack/start-client-core@1.170.29`.

## Session Rotation on Privilege Change

Whenever the user's privileges change — login, logout, role change, password change — **destroy the old session and issue a new one**. This neutralizes session-fixation attacks where an attacker plants their own session ID in the victim's browser before login.

```tsx
// In the login handler (already shown above): destroy any pre-login session, then create a fresh one.
await db.sessions.revokeAllForUser(user.id)
const token = await db.sessions.create({ userId: user.id })
setSessionCookie(token)
```

```tsx
// On password change / role grant:
await db.sessions.revokeAllForUser(user.id) // destroy existing
const token = await db.sessions.create({ userId: user.id }) // issue fresh
setSessionCookie(token)
```
