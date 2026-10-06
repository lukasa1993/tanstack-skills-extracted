# Async Rate Limiting

<a id="source-pacer-docs-framework-solid-guides-async-rate-limiting-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.1`.

[Topic index](../rate-limiting.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Async Rate Limiting](./pacer-docs-framework-angular-guides-async-rate-limiting-md-47c4dd05.md).

## Choose an API

- `createAsyncRateLimiter` for results, capacity helpers, and selected state

## Solid example

```tsx
import { createAsyncRateLimiter } from '@tanstack/solid-pacer'

const limiter = createAsyncRateLimiter(
  loadUser,
  { limit: 3, window: 10_000 },
  (state) => ({
    rejectionCount: state.rejectionCount,
  }),
)

const user = await limiter.maybeExecute('123')
console.log(user, limiter.state().rejectionCount)
```

The focused snippets later in this guide use `createAsyncRateLimiter` and assume they run inside a Solid reactive owner.

## Accepted and rejected calls

This section is an exact duplicate. Read [Accepted and rejected calls in Async Rate Limiting](./pacer-docs-framework-angular-guides-async-rate-limiting-md-47c4dd05.md).

## Window behavior

This section is an exact duplicate. Read [Window behavior in Async Rate Limiting](./pacer-docs-framework-angular-guides-async-rate-limiting-md-47c4dd05.md).

## Errors and callbacks

This section is an exact duplicate. Read [Errors and callbacks in Async Rate Limiting](./pacer-docs-framework-angular-guides-async-rate-limiting-md-47c4dd05.md).

## Retrying accepted executions

Configure retries for each accepted execution with `asyncRetryerOptions`:

```ts
const limiter = createAsyncRateLimiter(sendRequest, {
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

`maxAttempts` includes the first attempt. One accepted rate-limit slot may therefore produce multiple attempts against the downstream service. Account for that service's own limits before combining rate limiting and retries. See the [Async Retrying Guide](./pacer-docs-framework-solid-guides-async-retrying-md-13290069.md#source-pacer-docs-framework-solid-guides-async-retrying-md) for retry safety.

## Aborting active work

`abort()` aborts all active executions. It does not remove their timestamps or restore window capacity. Pass each execution's signal to the underlying operation for cancellation to propagate:

```ts
const limiter = createAsyncRateLimiter(
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

This section is an exact duplicate. Read [Configuration in Async Rate Limiting](./pacer-docs-framework-angular-guides-async-rate-limiting-md-47c4dd05.md).

## Solid lifecycle

The adapter aborts active work when its owner is destroyed. Providing `onUnmount` replaces that default cleanup, so a custom callback must call `abort()` when active work should still be stopped.

## Reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility inside a Solid reactive owner and select only fields used by the view:

```ts
const limiter = createAsyncRateLimiter(
  loadUserFromApi,
  { limit: 5, window: 60_000 },
  (state) => ({
    isExceeded: state.isExceeded,
    isExecuting: state.isExecuting,
    rejectionCount: state.rejectionCount,
  }),
)

console.log(
  limiter.state().isExceeded,
  limiter.state().isExecuting,
  limiter.state().rejectionCount,
)
```

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Rendering code should read the selected adapter state shown here.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers and active executions are not restored.

- `executionTimes`: Accepted start times still used by the window.
- `isExceeded`: Whether the current limit has been reached.
- `isExecuting`: Whether at least one accepted execution is active.
- `rejectionCount`: Calls rejected by the window.
- `lastResult`: The most recent successful result.
- `successCount`, `errorCount`, and `settleCount`: Execution outcome counts.

See the [Solid API reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/framework/solid/reference/index.md) for adapter signatures and the public core reference for complete option and state types.
