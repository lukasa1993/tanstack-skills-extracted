# Async Debouncing

<a id="source-pacer-docs-framework-solid-guides-async-debouncing-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.1`.

[Topic index](../debounce-throttle.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Async Debouncing](./pacer-docs-framework-angular-guides-async-debouncing-md-d0499802.md).

## Choose an API

- `createAsyncDebouncer` for Promise results, lifecycle methods, and selected state

## Solid example

```tsx
import { createAsyncDebouncer } from '@tanstack/solid-pacer'

const search = createAsyncDebouncer(
  fetchSearchResults,
  { wait: 300 },
  (state) => ({
    isExecuting: state.isExecuting,
    isPending: state.isPending,
  }),
)

void search.maybeExecute('pacer')
console.log(search.state().isPending)
```

The focused snippets later in this guide use `createAsyncDebouncer` and assume they run inside a Solid reactive owner.

## Promise results

This section is an exact duplicate. Read [Promise results in Async Debouncing](./pacer-docs-framework-angular-guides-async-debouncing-md-d0499802.md).

## Leading and trailing execution

This section is an exact duplicate. Read [Leading and trailing execution in Async Debouncing](./pacer-docs-framework-angular-guides-async-debouncing-md-d0499802.md).

## Errors and callbacks

This section is an exact duplicate. Read [Errors and callbacks in Async Debouncing](./pacer-docs-framework-angular-guides-async-debouncing-md-d0499802.md).

## Retrying failed executions

Pass `asyncRetryerOptions` to retry an execution after it starts:

```ts
const save = createAsyncDebouncer(saveDraft, {
  wait: 500,
  asyncRetryerOptions: {
    maxAttempts: 3,
    backoff: 'exponential',
    baseWait: 500,
    jitter: 0.2,
  },
})
```

`maxAttempts` includes the first attempt. Debouncing decides when one logical execution starts; the retryer then manages attempts for that execution. See the [Async Retrying Guide](./pacer-docs-framework-solid-guides-async-retrying-md-13290069.md#source-pacer-docs-framework-solid-guides-async-retrying-md) for retry safety, backoff, and timeout behavior.

## Canceling pending work and aborting active work

Pending and active work have separate controls:

- `cancel()` clears a trailing execution that has not started. It does not stop an active Promise.
- `abort()` aborts active executions. It does not clear a pending trailing execution.
- `flush()` starts pending work immediately and returns its result. It does not affect active work.

For an underlying operation such as `fetch` to stop, pass the debouncer's signal to it:

```ts
const search = createAsyncDebouncer(
  async (query: string) => {
    const response = await fetch(`/api/search?q=${query}`, {
      signal: search.getAbortSignal() ?? undefined,
    })
    return response.json()
  },
  { wait: 300 },
)

search.maybeExecute('pacer')
search.abort()
```

Calling `abort()` without using the signal stops retry management but cannot force an arbitrary Promise to stop.

### Resetting safely

`reset()` restores default state, but it does not clear a scheduled trailing timeout or guarantee that active work stops. Use the lifecycle methods first when you need a complete cleanup:

```ts
search.cancel()
search.abort()
search.reset()
```

## Configuration

This section is an exact duplicate. Read [Configuration in Async Debouncing](./pacer-docs-framework-angular-guides-async-debouncing-md-d0499802.md).

## Solid lifecycle

The adapter cancels pending work and aborts active work when its owner is destroyed. Providing `onUnmount` replaces that default cleanup, so a custom callback must perform every required lifecycle action. When custom cleanup flushes work, remember that user callbacks can run while the component is being destroyed.

## Reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility inside a Solid reactive owner and select only fields used by the view:

```ts
const debouncer = createAsyncDebouncer(
  fetchSearchResults,
  { wait: 300 },
  (state) => ({
    isPending: state.isPending,
    isExecuting: state.isExecuting,
    lastResult: state.lastResult,
  }),
)

console.log(
  debouncer.state().isPending,
  debouncer.state().isExecuting,
  debouncer.state().lastResult,
)
```

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Rendering code should read the selected adapter state shown here.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers and active executions are not restored.

- `isPending`: Whether a trailing execution is scheduled.
- `isExecuting`: Whether the wrapped function is active.
- `lastArgs`: The arguments retained for pending work.
- `lastResult`: The most recent successful result.
- `successCount`, `errorCount`, and `settleCount`: Execution outcome counts.
- `status`: `'disabled'`, `'idle'`, `'pending'`, `'executing'`, or `'settled'`.

See the [Solid API reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/framework/solid/reference/index.md) for adapter signatures and the public core reference for complete option and state types.
