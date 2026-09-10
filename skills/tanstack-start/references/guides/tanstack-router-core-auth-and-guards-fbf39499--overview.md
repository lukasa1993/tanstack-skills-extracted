# Auth And Guards — Overview

[Guide and prerequisites](./tanstack-router-core-auth-and-guards-fbf39499.md) · Published skill · `@tanstack/router-core@1.171.29`.

# Auth and Guards

> **This skill covers the routing side of auth.** Route guards are UX and navigation control; the data/API boundary still belongs in the server function, server route, or API endpoint that reads or mutates private data. For the **server-side primitives** — session cookies (`HttpOnly`/`Secure`/`SameSite`), `useSession`-style helpers, OAuth `state` + PKCE, password-reset enumeration defense, CSRF, rate limiting — see [start-core/auth-server-primitives](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874.md#source-tanstack-start-client-core-start-core-auth-server-primitives).
>
> **CRITICAL**: A route guard (`beforeLoad`) does NOT protect a `createServerFn` declared on that route. Server functions are API endpoints reachable independently of the route that calls them. See "Route guards do not protect server functions" below.
