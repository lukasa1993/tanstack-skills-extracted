# Auth Server Primitives

<a id="source-tanstack-start-client-core-start-core-auth-server-primitives"></a>

Published skill · `@tanstack/start-client-core@1.170.29`.

[Topic index](../middleware-auth.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Start Core](./tanstack-start-client-core-start-core-18293f60.md).
Prerequisite: [Server Functions](./tanstack-start-client-core-start-core-server-functions-49d113b0.md).
Prerequisite: [Middleware](./tanstack-start-client-core-start-core-middleware-4735b1c5.md).

## Choose a section

Read the overview or setup when it is a prerequisite, then the section needed for the task.

- [Overview](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874--overview.md) — 2 KiB
- [Production Checklist](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874--production-checklist.md) — 2 KiB
- [Session Cookies](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874--session-cookies.md) — 3 KiB
- [Session Lookup as Middleware](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874--session-lookup-as-middleware.md) — 2 KiB
- [Issuing a Session on Login](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874--issuing-a-session-on-login.md) — 2 KiB
- [Logout](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874--logout.md) — 1 KiB
- [OAuth: state + PKCE](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874--oauth-state-pkce.md) — 2 KiB
- [Password Reset: defeat user enumeration](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874--password-reset-defeat-user-enumeration.md) — 2 KiB
- [CSRF for non-GET RPCs](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874--csrf-for-non-get-rpcs.md) — 2 KiB
- [Rate Limiting Auth Endpoints](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874--rate-limiting-auth-endpoints.md) — 2 KiB
- [Session Rotation on Privilege Change](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874--session-rotation-on-privilege-change.md) — 1 KiB
- [Common Mistakes](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874--common-mistakes.md) — 3 KiB
- [Cross-References](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874--cross-references.md) — 2 KiB

<!-- Original source anchors retained for inbound links. -->
<a id="auth-server-primitives"></a>
<a id="production-checklist"></a>
<a id="session-cookies"></a>
<a id="session-lookup-as-middleware"></a>
<a id="issuing-a-session-on-login"></a>
<a id="logout"></a>
<a id="oauth-state-pkce"></a>
<a id="password-reset-defeat-user-enumeration"></a>
<a id="csrf-for-non-get-rpcs"></a>
<a id="rate-limiting-auth-endpoints"></a>
<a id="session-rotation-on-privilege-change"></a>
<a id="common-mistakes"></a>
<a id="critical-trusting-the-route-guard-for-server-function-auth"></a>
<a id="critical-treating-shape-validation-as-authorization"></a>
<a id="high-returning-different-responses-based-on-email-existence"></a>
<a id="high-reading-cookiesenv-at-module-scope"></a>
<a id="medium-long-lived-sessions-with-no-rotation"></a>
<a id="cross-references"></a>
