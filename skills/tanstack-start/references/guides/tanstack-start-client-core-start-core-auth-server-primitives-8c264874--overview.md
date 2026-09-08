# Auth Server Primitives — Overview

[Guide and prerequisites](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874.md) · Published skill · `@tanstack/start-client-core@1.170.28`.

# Auth Server Primitives

This skill covers the **server half** of authentication: session storage, cookie issuance, OAuth flow, password-reset hardening, CSRF, rate limiting. For the **routing half** (`_authenticated` layout, `beforeLoad` redirects, RBAC checks), see [router-core/auth-and-guards](./tanstack-router-core-auth-and-guards-fbf39499.md#source-tanstack-router-core-auth-and-guards).

> **CRITICAL**: Protect the data/API boundary first. Server functions, server routes, and other API endpoints that touch private data must enforce auth **inside the handler** or middleware. Route guards are route UX, not the data security boundary.
> **CRITICAL**: Validating the _shape_ of a client-supplied identifier (`z.string().uuid().parse(...)`) is not authorization. A parsed UUID is still _some_ tenant — re-check membership against the session principal before using it.
> **CRITICAL**: Read session/cookies inside `.handler()` or middleware `.server()`, not at module scope. Module-level reads run before requests exist (and are also undefined on Cloudflare Workers).
