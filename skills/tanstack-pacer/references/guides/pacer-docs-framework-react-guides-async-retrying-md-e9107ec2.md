# Async Retrying

<a id="source-pacer-docs-framework-react-guides-async-retrying-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.0`.

[Topic index](../async-retry.md) · [Source provenance](../SOURCES.md)

Retrying runs an async operation again after it fails. It can make transient failures less visible to users, but it can also repeat side effects and increase load on an unhealthy service.

> [!NOTE]
> `AsyncRetryer` is an alpha API and may change before 1.0. Its current design also supports the retry behavior inside Pacer's other async utilities.

Retrying is the exception among these framework guides: TanStack Pacer does not provide a React-specific retry primitive. The adapter re-exports the public `asyncRetry` function and `AsyncRetryer` class, so this guide uses those APIs and connects long-lived instances to the React lifecycle.

If TanStack Query already owns the request, use its retry support so one system controls request state and cancellation.

## Decide whether retrying is safe

This section is an exact duplicate. Read [Decide whether retrying is safe in Async Retrying](./pacer-docs-framework-angular-guides-async-retrying-md-5b2914c3.md).

## Quick start

`asyncRetry` creates one retryer and returns its bound execution function:

```ts
import { asyncRetry } from '@tanstack/react-pacer'

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
import { AsyncRetryer } from '@tanstack/react-pacer'

async function loadOneUser(id: string) {
  const retryer = new AsyncRetryer(loadUser, { maxAttempts: 3 })
  return retryer.execute(id)
}
```

## Create one retryer per component

```tsx
import { useEffect, useMemo } from 'react'
import { AsyncRetryer } from '@tanstack/react-pacer'

function UserPanel({ id }: { id: string }) {
  const retryer = useMemo(
    () =>
      new AsyncRetryer(loadUser, {
        maxAttempts: 3,
        baseWait: 1000,
        jitter: 0.2,
        backoff: 'exponential',
        maxWait: 5000,
        onRetry: (attempt, error) => {
          console.log(`Attempt ${attempt} failed; retrying`, error)
        },
        onLastError: (error) => {
          console.error('Attempts exhausted:', error)
        },
      }),
    [],
  )

  useEffect(() => () => retryer.abort(), [retryer])

  return <button onClick={() => void retryer.execute(id)}>Reload</button>
}
```

Update `retryer.fn` when the function closes over changing props or state. Starting a second `execute()` on the same instance aborts its earlier retry flow. Create separate instances when executions may overlap.

Use a long-lived `AsyncRetryer` when you need callbacks, state, changing options, or manual abort control. `maxAttempts` includes the first call. A value of `1` disables retries while retaining result, error, timeout, callback, and abort behavior.

## Attempts and backoff

This section is an exact duplicate. Read [Attempts and backoff in Async Retrying](./pacer-docs-framework-angular-guides-async-retrying-md-5b2914c3.md).

## Errors and callbacks

This section is an exact duplicate. Read [Errors and callbacks in Async Retrying](./pacer-docs-framework-angular-guides-async-retrying-md-5b2914c3.md).

## Timeouts

This section is an exact duplicate. Read [Timeouts in Async Retrying](./pacer-docs-framework-angular-guides-async-retrying-md-5b2914c3.md).

## Aborting the underlying operation

This section is an exact duplicate. Read [Aborting the underlying operation in Async Retrying](./pacer-docs-framework-angular-guides-async-retrying-md-5b2914c3.md).

## Resetting and changing options

This section is an exact duplicate. Read [Resetting and changing options in Async Retrying](./pacer-docs-framework-angular-guides-async-retrying-md-5b2914c3.md).

## State

The retryer stores state at `retryer.store`.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers and active executions are not restored.

Commonly useful properties include:

- `currentAttempt`: The current or most recently started attempt number. It returns to `0` after success or reset.
- `isExecuting`: Whether a retry flow is active.
- `lastError`: The most recent failed attempt's error.
- `lastResult`: The most recent successful result.
- `executionCount`: Successful top-level executions, not individual attempts.
- `lastExecutionTime` and `totalExecutionTime`: Timing recorded for the most recent success.
- `status`: `'disabled'`, `'idle'`, `'executing'`, or `'retrying'`.

`AsyncRetryer` does not expose a React state selector. Use its callbacks to copy the fields needed by the view into React state. If you subscribe to `retryer.store` directly, register the unsubscribe function with the same component or owner cleanup that aborts the retryer.

For exact signatures, see the [`asyncRetry` function reference](https://github.com/TanStack/pacer/blob/b58e0222da48550d4d39b6241f8ff5a4142449b6/docs/reference/functions/asyncRetry.md), [`AsyncRetryer` class reference](https://github.com/TanStack/pacer/blob/b58e0222da48550d4d39b6241f8ff5a4142449b6/docs/reference/classes/AsyncRetryer.md), and [`AsyncRetryerOptions` reference](https://github.com/TanStack/pacer/blob/b58e0222da48550d4d39b6241f8ff5a4142449b6/docs/reference/interfaces/AsyncRetryerOptions.md).

## Related docs

- [React adapter](./pacer-docs-framework-react-adapter-md-526adec5.md#source-pacer-docs-framework-react-adapter-md)
- [Choose a Pacer utility](./pacer-docs-guides-which-pacer-utility-should-i-choose-md-a6a065b3.md#source-pacer-docs-guides-which-pacer-utility-should-i-choose-md)
- [Select another framework](./pacer-docs-guides-async-retrying-md-099a4ebe.md#source-pacer-docs-guides-async-retrying-md)
