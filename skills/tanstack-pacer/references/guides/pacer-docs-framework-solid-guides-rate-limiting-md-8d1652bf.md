# Rate Limiting

<a id="source-pacer-docs-framework-solid-guides-rate-limiting-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.1`.

[Topic index](../rate-limiting.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Rate Limiting](./pacer-docs-framework-angular-guides-rate-limiting-md-3d0393c9.md).

## How rate limiting works

This section is an exact duplicate. Read [How rate limiting works in Rate Limiting](./pacer-docs-framework-angular-guides-rate-limiting-md-3d0393c9.md).

## When to use rate limiting

This section is an exact duplicate. Read [When to use rate limiting in Rate Limiting](./pacer-docs-framework-angular-guides-rate-limiting-md-3d0393c9.md).

## Window types

The `windowType` option controls when capacity returns.

### Fixed window

A fixed window starts when its first execution is accepted. All accepted executions remain counted until that window ends. Capacity then resets together.

```ts
const limiter = createRateLimiter(sendEvent, {
  limit: 3,
  window: 1000,
  windowType: 'fixed',
})
```

Fixed windows can allow bursts near a boundary because a full quota becomes available when the window resets.

### Sliding window

A sliding window tracks each accepted execution separately. Capacity returns one execution at a time as old timestamps leave the window.

```text
Sliding Window (limit: 3 calls per window)
Timeline: [1 second per tick]
Calls:        ⬇️     ⬇️     ⬇️     ⬇️           ⬇️
Executed:     ✅     ✅     ✅     ❌           ✅
             [=== full ===][oldest execution expires][=== one available ===]
```

```ts
const limiter = createRateLimiter(sendEvent, {
  limit: 3,
  window: 1000,
  windowType: 'sliding',
})
```

Use a sliding window when capacity should return gradually rather than all at once.

## Choose an API

- `createRateLimitedSignal` or `createRateLimitedValue` for quota-controlled values
- `createRateLimiter` for callbacks, capacity helpers, and selected state

Use the signal or value API for quota-controlled reactive state. Use `createRateLimiter` for operations, capacity helpers, or rejection state.

## Solid example

```tsx
import { createRateLimiter } from '@tanstack/solid-pacer'

const limiter = createRateLimiter(
  sendEvent,
  { limit: 3, window: 10_000 },
  (state) => ({
    rejectionCount: state.rejectionCount,
  }),
)

const accepted = limiter.maybeExecute('clicked')
console.log(accepted, limiter.state().rejectionCount)
```

The focused snippets later in this guide use `createRateLimiter` and assume they run inside a Solid reactive owner.

## Handling rejected calls

Rejected calls do not run later. Use the boolean return value or `onReject` to provide feedback, retry elsewhere, or place work into a queue.

```ts
const limiter = createRateLimiter(sendEvent, {
  limit: 2,
  window: 1000,
  onReject: (limiter) => {
    console.log('Rejected calls:', limiter.store.state.rejectionCount)
  },
})
```

If rejected operations must eventually run, a [queuer](./pacer-docs-framework-solid-guides-queuing-md-e5e28330.md#source-pacer-docs-framework-solid-guides-queuing-md) is usually a better fit.

## Inspecting capacity

This section is an exact duplicate. Read [Inspecting capacity in Rate Limiting](./pacer-docs-framework-angular-guides-rate-limiting-md-3d0393c9.md).

## Resetting and configuring the limiter

`reset()` clears execution timestamps, counters, and cleanup timers. The next call starts with full capacity.

```ts
limiter.reset()
```

Use `setOptions()` to update the configuration:

```ts
limiter.setOptions({
  limit: 10,
  window: 30_000,
})
```

Changing options does not erase existing execution history. Call `reset()` when the new configuration should begin with a fresh window.

The `enabled`, `limit`, and `window` options may be functions that receive the limiter instance:

```ts
const limiter = createRateLimiter(sendEvent, {
  enabled: (limiter) => limiter.store.state.executionCount < 100,
  limit: (limiter) => (limiter.store.state.rejectionCount > 10 ? 2 : 5),
  window: 60_000,
})
```

Disabling the limiter prevents the wrapped function from executing. It does not delete existing execution history.

### Observing executions

`onExecute` receives the executed arguments and limiter instance. `onReject` receives the limiter instance.

```ts
const limiter = createRateLimiter(sendEvent, {
  limit: 5,
  window: 1000,
  onExecute: (args, limiter) => {
    console.log('Sent:', args)
    console.log('Remaining:', limiter.getRemainingInWindow())
  },
  onReject: (limiter) => {
    console.log('Rejected:', limiter.store.state.rejectionCount)
  },
})
```

## Solid lifecycle

The adapter has no default operation cleanup because a synchronous limiter has no pending or active work. Use `onUnmount` only when the component needs custom teardown related to the limiter.

## Reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility inside a Solid reactive owner and select only fields used by the view:

```ts
const limiter = createRateLimiter(
  sendEvent,
  { limit: 5, window: 60_000 },
  (state) => ({
    isExceeded: state.isExceeded,
    rejectionCount: state.rejectionCount,
  }),
)

console.log(limiter.state().isExceeded, limiter.state().rejectionCount)
```

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Rendering code should read the selected adapter state shown here.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers are not restored.

Commonly useful state includes:

- `executionCount`: Total accepted executions that completed.
- `executionTimes`: Timestamps currently used for window calculations.
- `isExceeded`: Whether the current limit has been reached.
- `rejectionCount`: Calls rejected because the window was full.
- `status`: `'disabled'`, `'exceeded'`, or `'idle'`.

See the [Solid API reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/framework/solid/reference/index.md) for adapter signatures and the public core reference for complete option and state types.
