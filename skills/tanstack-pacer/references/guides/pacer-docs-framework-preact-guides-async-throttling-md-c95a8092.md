# Async Throttling

<a id="source-pacer-docs-framework-preact-guides-async-throttling-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.1`.

[Topic index](../debounce-throttle.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Async Throttling](./pacer-docs-framework-angular-guides-async-throttling-md-0551d620.md).

## Choose an API

- `useAsyncThrottledCallback` for a stable Promise-returning handler
- `useAsyncThrottler` for lifecycle methods and selected execution state

## Preact example

```tsx
import { useAsyncThrottler } from '@tanstack/preact-pacer'

function SaveButton() {
  const saver = useAsyncThrottler(savePosition, { wait: 1000 }, (state) => ({
    isExecuting: state.isExecuting,
    isPending: state.isPending,
  }))

  return (
    <button
      onClick={() => void saver.maybeExecute(42)}
      disabled={saver.state.isExecuting}
    >
      Save
    </button>
  )
}
```

The focused snippets later in this guide use `useAsyncThrottler` and assume they run inside a component or another hook.

## Promise results

This section is an exact duplicate. Read [Promise results in Async Throttling](./pacer-docs-framework-angular-guides-async-throttling-md-0551d620.md).

## Leading and trailing execution

This section is an exact duplicate. Read [Leading and trailing execution in Async Throttling](./pacer-docs-framework-angular-guides-async-throttling-md-0551d620.md).

## Errors and callbacks

This section is an exact duplicate. Read [Errors and callbacks in Async Throttling](./pacer-docs-framework-angular-guides-async-throttling-md-0551d620.md).

## Retrying failed executions

Configure the retryer used for each execution with `asyncRetryerOptions`:

```ts
const saver = useAsyncThrottler(savePositionToServer, {
  wait: 1000,
  asyncRetryerOptions: {
    maxAttempts: 3,
    backoff: 'exponential',
    baseWait: 500,
    jitter: 0.2,
  },
})
```

`maxAttempts` includes the first attempt. Throttling controls logical executions; retrying controls the attempts within each execution. See the [Async Retrying Guide](./pacer-docs-framework-preact-guides-async-retrying-md-cdac611d.md#source-pacer-docs-framework-preact-guides-async-retrying-md) before enabling retries for operations with side effects.

## Canceling pending work and aborting active work

- `cancel()` clears a pending trailing execution. It does not stop active work or reset the current throttle interval.
- `abort()` aborts active executions. It does not clear pending trailing work.
- `flush()` runs pending trailing work immediately and returns its result.

Pass the throttler's signal to the underlying API when it supports cancellation:

```ts
const saver = useAsyncThrottler(
  async (position: number) => {
    return fetch('/api/position', {
      method: 'POST',
      body: JSON.stringify({ position }),
      signal: saver.getAbortSignal() ?? undefined,
    })
  },
  { wait: 1000 },
)

saver.abort()
```

Calling `abort()` without using the signal stops retry management but cannot force an arbitrary Promise to stop.

### Resetting safely

`reset()` restores default state, but it does not clear a scheduled timeout or guarantee that active work stops. Clean up the lifecycle first when necessary:

```ts
saver.cancel()
saver.abort()
saver.reset()
```

## Configuration

This section is an exact duplicate. Read [Configuration in Async Throttling](./pacer-docs-framework-angular-guides-async-throttling-md-0551d620.md).

## Preact lifecycle

This section is an exact duplicate. Read [Preact lifecycle in Async Debouncing](./pacer-docs-framework-preact-guides-async-debouncing-md-3002b7b1.md).

## Reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility at the top level of a component or another hook and select only fields used by the view:

```ts
const throttler = useAsyncThrottler(
  savePositionToServer,
  { wait: 1000 },
  (state) => ({
    isPending: state.isPending,
    isExecuting: state.isExecuting,
    lastResult: state.lastResult,
  }),
)

console.log(
  throttler.state.isPending,
  throttler.state.isExecuting,
  throttler.state.lastResult,
)
```

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Rendering code should read the selected adapter state shown here.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers and active executions are not restored.

- `isPending`: Whether a trailing execution is scheduled.
- `isExecuting`: Whether the wrapped function is active.
- `lastArgs`: The latest arguments retained for trailing work.
- `lastResult`: The most recent successful result.
- `lastExecutionTime` and `nextExecutionTime`: Current timing boundaries.
- `successCount`, `errorCount`, and `settleCount`: Execution outcome counts.

See the [Preact API reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/framework/preact/reference/index.md) for adapter signatures and the public core reference for complete option and state types.
