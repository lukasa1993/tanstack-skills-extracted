# Async Retrying

<a id="source-pacer-docs-framework-vanilla-guides-async-retrying-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.0`.

[Topic index](../async-retry.md) · [Source provenance](../SOURCES.md)

Retrying runs an async operation again after it fails. It can make transient failures less visible to users, but it can also repeat side effects and increase load on an unhealthy service.

> [!NOTE]
> `AsyncRetryer` is an alpha API and may change before 1.0. Its current design also supports the retry behavior inside Pacer's other async utilities.

If TanStack Query already owns the request, use its retry support so one system controls request state and cancellation.

## Decide whether retrying is safe

This section is an exact duplicate. Read [Decide whether retrying is safe in Async Retrying](./pacer-docs-framework-angular-guides-async-retrying-md-5b2914c3.md).

## Quick start

`asyncRetry` creates one retryer and returns its bound execution function:

```ts
import { asyncRetry } from '@tanstack/pacer'

const loadUserWithRetry = asyncRetry(loadUser, {
  maxAttempts: 3,
  baseWait: 1000,
  jitter: 0.2,
})

try {
  const result = await loadUserWithRetry('123')
  console.log(result)
} catch (error) {
  console.error('All attempts failed:', error)
}
```

The defaults are three total attempts, exponential backoff from 1000 milliseconds, no maximum delay, no jitter, and `throwOnError: 'last'`.

The returned function can be reused sequentially. It owns one `AsyncRetryer`, so starting a new call while an earlier call is active aborts the earlier retry flow. When calls may overlap, create a retryer per call or use another utility that manages concurrency:

```ts
import { AsyncRetryer } from '@tanstack/pacer'

async function loadOneUser(id: string) {
  const retryer = new AsyncRetryer(loadUser, { maxAttempts: 3 })
  return retryer.execute(id)
}
```

## Using the class

Use `AsyncRetryer` when you need callbacks, state, changing options, or manual abort control:

```ts
import { AsyncRetryer } from '@tanstack/pacer'

const retryer = new AsyncRetryer(loadUser, {
  maxAttempts: 4,
  backoff: 'exponential',
  baseWait: 500,
  maxWait: 5000,
  jitter: 0.2,
  onRetry: (attempt, error) => {
    console.log(`Attempt ${attempt} failed; retrying`, error)
  },
  onLastError: (error) => {
    console.error('Attempts exhausted:', error)
  },
})

const result = await retryer.execute('123')
```

`maxAttempts` includes the first call. A value of `1` disables retries while retaining the result, error, timeout, callback, and abort behavior.

## Attempts and backoff

The first attempt starts immediately. A delay is calculated only after a failed attempt that has another attempt available.

With `baseWait: 1000`, the nominal delays are:

| Failed attempt | Exponential | Linear | Fixed |
| --- | ---: | ---: | ---: |
| 1 | 1000 ms | 1000 ms | 1000 ms |
| 2 | 2000 ms | 2000 ms | 1000 ms |
| 3 | 4000 ms | 3000 ms | 1000 ms |
| 4 | 8000 ms | 4000 ms | 1000 ms |

`maxWait` caps the nominal delay before jitter. `baseWait`, `maxWait`, and `maxAttempts` can also be functions that receive the retryer instance.

### Add jitter for shared services

Many clients can fail at the same time and otherwise retry in synchronized waves. `jitter` adds random variation above or below each nominal delay:

```ts
const retryer = new AsyncRetryer(loadUser, {
  maxAttempts: 4,
  baseWait: 1000,
  maxWait: 10_000,
  jitter: 0.25,
})
```

Use a value from `0` to `1`, where `0.25` allows up to 25 percent variation. Because jitter is applied after `maxWait`, the final randomized delay can be slightly greater than `maxWait`.

## Errors and callbacks

This section is an exact duplicate. Read [Errors and callbacks in Async Retrying](./pacer-docs-framework-angular-guides-async-retrying-md-5b2914c3.md).

## Timeouts

This section is an exact duplicate. Read [Timeouts in Async Retrying](./pacer-docs-framework-angular-guides-async-retrying-md-5b2914c3.md).

## Aborting the underlying operation

This section is an exact duplicate. Read [Aborting the underlying operation in Async Retrying](./pacer-docs-framework-angular-guides-async-retrying-md-5b2914c3.md).

## Resetting and changing options

This section is an exact duplicate. Read [Resetting and changing options in Async Retrying](./pacer-docs-framework-angular-guides-async-retrying-md-5b2914c3.md).

## State

The class stores state at `retryer.store`.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers and active executions are not restored.

Commonly useful properties include:

- `currentAttempt`: The current or most recently started attempt number. It returns to `0` after success or reset.
- `isExecuting`: Whether a retry flow is active.
- `lastError`: The most recent failed attempt's error.
- `lastResult`: The most recent successful result.
- `executionCount`: Successful top-level executions, not individual attempts.
- `lastExecutionTime` and `totalExecutionTime`: Timing recorded for the most recent success.
- `status`: `'disabled'`, `'idle'`, `'executing'`, or `'retrying'`.

`AsyncRetryer` is a core API and does not have framework-specific hooks. Subscribe through `retryer.store` or the appropriate TanStack Store adapter when reactive state is needed.

For exact signatures, see the [`asyncRetry` function reference](https://github.com/TanStack/pacer/blob/b58e0222da48550d4d39b6241f8ff5a4142449b6/docs/reference/functions/asyncRetry.md), [`AsyncRetryer` class reference](https://github.com/TanStack/pacer/blob/b58e0222da48550d4d39b6241f8ff5a4142449b6/docs/reference/classes/AsyncRetryer.md), and [`AsyncRetryerOptions` reference](https://github.com/TanStack/pacer/blob/b58e0222da48550d4d39b6241f8ff5a4142449b6/docs/reference/interfaces/AsyncRetryerOptions.md).
