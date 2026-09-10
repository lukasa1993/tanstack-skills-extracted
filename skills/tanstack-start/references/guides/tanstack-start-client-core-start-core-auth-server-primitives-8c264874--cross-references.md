# Auth Server Primitives — Cross-References

[Guide and prerequisites](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874.md) · Published skill · `@tanstack/start-client-core@1.170.29`.

## Cross-References

- [router-core/auth-and-guards](./tanstack-router-core-auth-and-guards-fbf39499.md#source-tanstack-router-core-auth-and-guards) — the routing side: `_authenticated` layout, `beforeLoad`, `redirect`, RBAC checks.
- [start-core/server-functions](./tanstack-start-client-core-start-core-server-functions-49d113b0.md#source-tanstack-start-client-core-start-core-server-functions) — how to expose RPCs (and how the route guard does NOT cover them).
- [start-core/middleware](./tanstack-start-client-core-start-core-middleware-4735b1c5.md#source-tanstack-start-client-core-start-core-middleware) — composing `authMiddleware` and others.
- [start-core/execution-model](./tanstack-start-client-core-start-core-execution-model-6669e01c.md#source-tanstack-start-client-core-start-core-execution-model) — why module-level env/secret reads are wrong.
