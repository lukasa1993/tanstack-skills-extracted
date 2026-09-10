# Build Cloudflare Adapter — 7. Durable Object lock store (only if needed)

[Guide and prerequisites](./tanstack-ai-persistence-build-cloudflare-adapter-64163c5a.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## 7. Durable Object lock store (only if needed)

Implement `LockStore` from `@tanstack/ai/locks`. `withLock(key, fn)`
routes each key to a Durable Object instance (`idFromName(key)`) that serializes
owners. Use **leases** so a crashed owner cannot block forever: the DO grants a
lease with an expiry, an alarm reclaims it, and the lock passes the callback an
`AbortSignal` that fires when ownership can no longer be guaranteed. Callbacks
must stop starting external mutations once the signal aborts.

Export the DO class from the Worker entry so wrangler can bind it:

```ts ignore
export { ChatLockDurableObject } from './locks'
```

Then wire both middlewares:

```ts ignore
import { withLocks } from '@tanstack/ai/locks'
import { withPersistence } from '@tanstack/ai-persistence'

const middleware = [
  withPersistence(chatPersistence(env.AI_STATE)),
  withLocks(createDurableObjectLockStore(env.AI_LOCKS)),
]
```
