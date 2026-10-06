# Async Debouncing

<a id="source-pacer-docs-framework-vanilla-guides-async-debouncing-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.1`.

[Topic index](../debounce-throttle.md) · [Source provenance](../SOURCES.md)

Async debouncing keeps the timing behavior described in the [Debouncing Guide](./pacer-docs-framework-vanilla-guides-debouncing-md-41782cae.md#source-pacer-docs-framework-vanilla-guides-debouncing-md), while adding Promise results, retries, error callbacks, and control over in-flight work.

Use async debouncing when the debounced operation returns a value you need, can reject, or needs retry and abort support. A synchronous `Debouncer` can call an async function as a side effect, but it does not manage the resulting Promise.

## Quick start

Use `asyncDebounce` when you only need a callable function:

```ts
import { asyncDebounce } from '@tanstack/pacer'

const search = asyncDebounce(
  async (query: string) => {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    if (!response.ok) throw new Error('Search failed')
    return response.json()
  },
  { wait: 300 },
)

const results = await search('pacer')
```

Use `AsyncDebouncer` when you need methods, state, or callbacks:

```ts
import { AsyncDebouncer } from '@tanstack/pacer'

const search = new AsyncDebouncer(fetchSearchResults, {
  wait: 300,
  onSuccess: (results, args) => {
    console.log('Results for:', args[0], results)
  },
  onError: (error, args) => {
    console.error('Search failed for:', args[0], error)
  },
})

const results = await search.maybeExecute('pacer')
```

The timing options have the same defaults as synchronous debouncing: `leading: false` and `trailing: true`. Each call resets the trailing delay, and the latest arguments are used when that delay ends.

## Promise results

This section is an exact duplicate. Read [Promise results in Async Debouncing](./pacer-docs-framework-angular-guides-async-debouncing-md-d0499802.md).

## Leading and trailing execution

The four combinations match synchronous debouncing:

| `leading` | `trailing` | Behavior |
| --- | --- | --- |
| `false` | `true` | Execute after calls stop for `wait` milliseconds. This is the default. |
| `true` | `false` | Execute immediately, then ignore calls until the quiet period ends. |
| `true` | `true` | Execute the first call immediately and the latest later call on the trailing edge. |
| `false` | `false` | Record calls without executing the function. |

With both edges enabled, a single call executes only on the leading edge. A trailing execution requires another call during the wait period.

## Errors and callbacks

This section is an exact duplicate. Read [Errors and callbacks in Async Debouncing](./pacer-docs-framework-angular-guides-async-debouncing-md-d0499802.md).

## Retrying failed executions

Pass `asyncRetryerOptions` to retry an execution after it starts:

```ts
const save = new AsyncDebouncer(saveDraft, {
  wait: 500,
  asyncRetryerOptions: {
    maxAttempts: 3,
    backoff: 'exponential',
    baseWait: 500,
    jitter: 0.2,
  },
})
```

`maxAttempts` includes the first attempt. Debouncing decides when one logical execution starts; the retryer then manages attempts for that execution. See the [Async Retrying Guide](./pacer-docs-framework-vanilla-guides-async-retrying-md-315874fb.md#source-pacer-docs-framework-vanilla-guides-async-retrying-md) for retry safety, backoff, and timeout behavior.

## Canceling pending work and aborting active work

Pending and active work have separate controls:

- `cancel()` clears a trailing execution that has not started. It does not stop an active Promise.
- `abort()` aborts active executions. It does not clear a pending trailing execution.
- `flush()` starts pending work immediately and returns its result. It does not affect active work.

For an underlying operation such as `fetch` to stop, pass the debouncer's signal to it:

```ts
const search = new AsyncDebouncer(
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

`wait` and `enabled` may be values or functions that receive the debouncer instance. `setOptions()` merges new options into the current configuration.

```ts
search.setOptions({
  enabled: (debouncer) => debouncer.store.state.errorCount < 3,
  wait: (debouncer) =>
    debouncer.store.state.successCount === 0 ? 200 : 500,
})
```

Changing `wait` does not reschedule an existing timeout. The new value applies when later work is scheduled.

Use `asyncDebouncerOptions()` to define reusable, type-checked option objects.

## State

The class stores state at `debouncer.store`.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers and active executions are not restored.

Commonly useful properties include:

- `isPending`: Whether a trailing execution is scheduled.
- `isExecuting`: Whether the wrapped function is active.
- `lastArgs`: The arguments retained for pending work.
- `lastResult`: The most recent successful result.
- `successCount`, `errorCount`, and `settleCount`: Execution outcome counts.
- `status`: `'disabled'`, `'idle'`, `'pending'`, `'executing'`, or `'settled'`.

See the [`AsyncDebouncer` API reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/reference/classes/AsyncDebouncer.md) for the complete state and option types.
