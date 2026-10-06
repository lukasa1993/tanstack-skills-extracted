# Rate Limiting

<a id="source-pacer-docs-framework-vanilla-guides-rate-limiting-md"></a>

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
const limiter = new RateLimiter(sendEvent, {
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
const limiter = new RateLimiter(sendEvent, {
  limit: 3,
  window: 1000,
  windowType: 'sliding',
})
```

Use a sliding window when capacity should return gradually rather than all at once.

## Using rate limiting in TanStack Pacer

TanStack Pacer provides two core APIs:

- `rateLimit` returns a rate-limited function.
- `RateLimiter` exposes helper methods, callbacks, dynamic options, and state.

### Convenience function

```ts
import { rateLimit } from '@tanstack/pacer'

const sendLimitedEvent = rateLimit(sendEvent, {
  limit: 5,
  window: 60_000,
})

sendLimitedEvent('event-1') // true
sendLimitedEvent('event-2') // true
```

The returned boolean reports whether the call was accepted by the limit. It does not contain the wrapped function's return value.

### Class API

```ts
import { RateLimiter } from '@tanstack/pacer'

const limiter = new RateLimiter(sendEvent, {
  limit: 5,
  window: 60_000,
  onReject: (limiter) => {
    console.log('Try again in:', limiter.getMsUntilNextWindow())
  },
})

if (!limiter.maybeExecute('event')) {
  showRateLimitMessage()
}
```

When the limiter is enabled, `maybeExecute()` returns `true` for an accepted execution and `false` for a rejected call.

### Results and errors

The synchronous rate limiter does not retain the wrapped function's return value or catch errors. Errors propagate from `maybeExecute()`. An execution that throws is not added to the execution window.

Use [async rate limiting](./pacer-docs-framework-vanilla-guides-async-rate-limiting-md-cf09d2e0.md#source-pacer-docs-framework-vanilla-guides-async-rate-limiting-md) for Promise results and configurable async error handling.

## Handling rejected calls

Rejected calls do not run later. Use the boolean return value or `onReject` to provide feedback, retry elsewhere, or place work into a queue.

```ts
const limiter = new RateLimiter(sendEvent, {
  limit: 2,
  window: 1000,
  onReject: (limiter) => {
    console.log('Rejected calls:', limiter.store.state.rejectionCount)
  },
})
```

If rejected operations must eventually run, a [queuer](./pacer-docs-framework-vanilla-guides-queuing-md-5b38c344.md#source-pacer-docs-framework-vanilla-guides-queuing-md) is usually a better fit.

## Inspecting capacity

The class provides two computed helpers:

```ts
limiter.getRemainingInWindow() // Accepted executions still available.
limiter.getMsUntilNextWindow() // Time until at least one execution is available.
```

Both helpers use the current `limit`, `window`, `windowType`, and execution history.

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
const limiter = new RateLimiter(sendEvent, {
  enabled: (limiter) => limiter.store.state.executionCount < 100,
  limit: (limiter) => (limiter.store.state.rejectionCount > 10 ? 2 : 5),
  window: 60_000,
})
```

Disabling the limiter prevents the wrapped function from executing. It does not delete existing execution history.

### Observing executions

`onExecute` receives the executed arguments and limiter instance. `onReject` receives the limiter instance.

```ts
const limiter = new RateLimiter(sendEvent, {
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

To share a type-checked configuration across instances, define it with `rateLimiterOptions()`.

## State

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers are not restored.

Commonly useful state includes:

- `executionCount`: Total accepted executions that completed.
- `executionTimes`: Timestamps currently used for window calculations.
- `isExceeded`: Whether the current limit has been reached.
- `rejectionCount`: Calls rejected because the window was full.
- `status`: `'disabled'`, `'exceeded'`, or `'idle'`.

See the [`RateLimiter` API reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/reference/classes/RateLimiter.md) for complete option and state types.
