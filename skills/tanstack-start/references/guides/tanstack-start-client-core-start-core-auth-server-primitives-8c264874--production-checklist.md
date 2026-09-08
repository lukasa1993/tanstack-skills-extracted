# Auth Server Primitives — Production Checklist

[Guide and prerequisites](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874.md) · Published skill · `@tanstack/start-client-core@1.170.28`.

## Production Checklist

- Enforce auth in every server function, server route, or API endpoint that reads or writes private user, tenant, or account data. Use route `beforeLoad` for page UX, not as the data boundary.
- Use `.validator()` on every server function that accepts input.
- Store sessions in `HttpOnly`, `Secure`, `SameSite` cookies. Do not store session tokens in `localStorage` or `sessionStorage`.
- Hash passwords with bcrypt, scrypt, or Argon2. For missing users, verify against a dummy hash and return the same login/reset message.
- Rate limit login, registration, and password-reset endpoints.
- Use CSRF or same-origin protections for non-GET server functions and server routes.
- Log authentication events and monitor failures.
- Test direct unauthenticated calls to protected server functions; they should reject before returning data.
- Follow the anonymous redirect and inspect its HTML and serialized state. Login and unauthorized pages must not name the protected user, tenant, or record.
