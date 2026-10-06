# Async Rate Limiting

<a id="source-pacer-docs-framework-vanilla-guides-async-rate-limiting-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.1`.

[Topic index](../rate-limiting.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Async Rate Limiting](./pacer-docs-framework-angular-guides-async-rate-limiting-md-47c4dd05.md).

## Quick start

Use `asyncRateLimit` when you only need a callable function:

```ts
import { asyncRateLimit } from '@tanstack/pacer'

const loadUser = asyncRateLimit(
  async (id: string) => {
    const response = await fetch(`/api/users/${id}`)
    if (!response.ok) throw new Error('Request failed')
    return response.json()
  },
  { limit: 5, window: 60_000 },
)

const user = await loadUser('123')
```

Use `AsyncRateLimiter` when you need methods, state, or callbacks:

```ts
import { AsyncRateLimiter } from '@tanstack/pacer'

const limiter = new AsyncRateLimiter(loadUserFromApi, {
  limit: 5,
  window: 60_000,
  onReject: (args, limiter) => {
    console.log(
      `Rejected ${args[0]}; retry in ${limiter.getMsUntilNextWindow()}ms`,
    )
  },
})

const user = await limiter.maybeExecute('123')
```

## Accepted and rejected calls

This section is an exact duplicate. Read [Accepted and rejected calls in Async Rate Limiting](./pacer-docs-framework-angular-guides-async-rate-limiting-md-47c4dd05.md).

## Window behavior

This section is an exact duplicate. Read [Window behavior in Async Rate Limiting](./pacer-docs-framework-angular-guides-async-rate-limiting-md-47c4dd05.md).

## Errors and callbacks

This section is an exact duplicate. Read [Errors and callbacks in Async Rate Limiting](./pacer-docs-framework-angular-guides-async-rate-limiting-md-47c4dd05.md).

## Retrying accepted executions

Configure retries for each accepted execution with `asyncRetryerOptions`:

```ts
const limiter = new AsyncRateLimiter(sendRequest, {
  limit: 5,
  window: 60_000,
  asyncRetryerOptions: {
    maxAttempts: 3,
    backoff: 'exponential',
    baseWait: 1000,
    jitter: 0.2,
  },
})
```

`maxAttempts` includes the first attempt. One accepted rate-limit slot may therefore produce multiple attempts against the downstream service. Account for that service's own limits before combining rate limiting and retries. See the [Async Retrying Guide](./pacer-docs-framework-vanilla-guides-async-retrying-md-315874fb.md#source-pacer-docs-framework-vanilla-guides-async-retrying-md) for retry safety.

## Aborting active work

`abort()` aborts all active executions. It does not remove their timestamps or restore window capacity. Pass each execution's signal to the underlying operation for cancellation to propagate:

```ts
const limiter = new AsyncRateLimiter(
  async (id: string) => {
    return fetch(`/api/users/${id}`, {
      signal: limiter.getAbortSignal() ?? undefined,
    })
  },
  { limit: 5, window: 60_000 },
)

limiter.abort()
```

When several executions overlap, `getAbortSignal()` without an argument refers to the most recently started execution. Pass its `maybeExecuteCount` to target a specific active execution.

### Resetting

`reset()` clears the rate-limit timestamps and restores default state. It does not guarantee that active underlying work stops, so abort first when a full cleanup is required:

```ts
limiter.abort()
limiter.reset()
```

Resetting restores capacity immediately. Only do this when starting a genuinely new limiting period, not as a way to bypass the configured limit.

## Configuration

`enabled`, `limit`, and `window` may be values or functions that receive the limiter instance. `setOptions()` merges new options into the current configuration.

```ts
limiter.setOptions({
  enabled: (limiter) => limiter.store.state.errorCount < 3,
  limit: (limiter) =>
    limiter.store.state.rejectionCount > 10 ? 2 : 5,
})
```

Changing `limit`, `window`, or `windowType` does not erase existing execution history. Call `reset()` if a new configuration should begin with a fresh window. A disabled limiter does not execute the function or consume capacity; its calls resolve with `undefined`.

Use `asyncRateLimiterOptions()` to define reusable, type-checked option objects.

## State

The class stores state at `limiter.store`.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers and active executions are not restored.

Commonly useful properties include:

- `executionTimes`: Accepted start times still used by the window.
- `isExceeded`: Whether the current limit has been reached.
- `isExecuting`: Whether at least one accepted execution is active.
- `rejectionCount`: Calls rejected by the window.
- `lastResult`: The most recent successful result.
- `successCount`, `errorCount`, and `settleCount`: Execution outcome counts.

See the [`AsyncRateLimiter` API reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/reference/classes/AsyncRateLimiter.md) for complete option and state types.
