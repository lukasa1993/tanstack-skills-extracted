# Auth Server Primitives — Common Mistakes

[Guide and prerequisites](./tanstack-start-client-core-start-core-auth-server-primitives-8c264874.md) · Published skill · `@tanstack/start-client-core@1.170.29`.

## Common Mistakes

### CRITICAL: Trusting the route guard for server-function auth

```tsx
// WRONG — the RPC is callable directly via POST regardless of the route
export const Route = createFileRoute('/_authenticated/orders')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) throw redirect({ to: '/login' })
  },
})
const getMyOrders = createServerFn({ method: 'GET' }).handler(async () => {
  return db.orders.findMany() // ← anyone can hit the RPC and get all orders
})

// CORRECT — auth enforced on the handler itself
const getMyOrders = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return db.orders.findMany({ where: { userId: context.session.userId } })
  })
```

### CRITICAL: Treating shape validation as authorization

A parsed UUID is _some_ workspace, not an _authorized_ workspace.

```tsx
// WRONG — UUID is well-formed but the user may not be a member
const getWorkspaceData = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ workspaceId: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    return db.workspaces.findById(data.workspaceId) // missing membership check!
  })

// CORRECT — verify the session principal has access to that workspace
const getWorkspaceData = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ workspaceId: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const member = await db.memberships.find({
      userId: context.session.userId,
      workspaceId: data.workspaceId,
    })
    if (!member) throw new Error('Not a member of this workspace')
    return db.workspaces.findById(data.workspaceId)
  })
```

### HIGH: Returning different responses based on email existence

Already covered above — `requestPasswordReset` must return the same body regardless of whether the email matches a user.

### HIGH: Reading cookies/env at module scope

```tsx
// WRONG — module-load time, before any request exists
const SESSION_SECRET = process.env.SESSION_SECRET
export function signSession(payload) {
  return sign(payload, SESSION_SECRET)
}

// CORRECT — read inside per-request callback
export function signSession(payload) {
  return sign(payload, process.env.SESSION_SECRET)
}
```

On Cloudflare Workers and other edge runtimes, the module-level read evaluates to `undefined` even on the server because env is injected per-request. See [start-core/execution-model](./tanstack-start-client-core-start-core-execution-model-6669e01c.md#source-tanstack-start-client-core-start-core-execution-model).

### MEDIUM: Long-lived sessions with no rotation

A session token that never rotates is functionally a long-lived credential. Rotate on login, logout, password change, and role/permission change.
