# Async Rate Limiting

<a id="source-pacer-docs-framework-react-guides-async-rate-limiting-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.1`.

[Topic index](../rate-limiting.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Async Rate Limiting](./pacer-docs-framework-angular-guides-async-rate-limiting-md-47c4dd05.md).

## Choose an API

This section is an exact duplicate. Read [Choose an API in Async Rate Limiting](./pacer-docs-framework-preact-guides-async-rate-limiting-md-081cd186.md).

## React example

```tsx
import { useAsyncRateLimiter } from '@tanstack/react-pacer'

function LoadButton() {
  const limiter = useAsyncRateLimiter(
    loadUser,
    { limit: 3, window: 10_000 },
    (state) => ({
      rejectionCount: state.rejectionCount,
      isExecuting: state.isExecuting,
    }),
  )

  return (
    <button onClick={() => void limiter.maybeExecute('123')}>
      Load ({limiter.state.rejectionCount} rejected)
    </button>
  )
}
```

The focused snippets later in this guide use `useAsyncRateLimiter` and assume they run inside a component or another hook.

## Accepted and rejected calls

This section is an exact duplicate. Read [Accepted and rejected calls in Async Rate Limiting](./pacer-docs-framework-angular-guides-async-rate-limiting-md-47c4dd05.md).

## Window behavior

This section is an exact duplicate. Read [Window behavior in Async Rate Limiting](./pacer-docs-framework-angular-guides-async-rate-limiting-md-47c4dd05.md).

## Errors and callbacks

This section is an exact duplicate. Read [Errors and callbacks in Async Rate Limiting](./pacer-docs-framework-angular-guides-async-rate-limiting-md-47c4dd05.md).

## Retrying accepted executions

This section is an exact duplicate. Read [Retrying accepted executions in Async Rate Limiting](./pacer-docs-framework-preact-guides-async-rate-limiting-md-081cd186.md).

## Aborting active work

This section is an exact duplicate. Read [Aborting active work in Async Rate Limiting](./pacer-docs-framework-preact-guides-async-rate-limiting-md-081cd186.md).

## Configuration

This section is an exact duplicate. Read [Configuration in Async Rate Limiting](./pacer-docs-framework-angular-guides-async-rate-limiting-md-47c4dd05.md).

## React lifecycle

The adapter aborts active work when its owner is destroyed. Providing `onUnmount` replaces that default cleanup, so a custom callback must call `abort()` when active work should still be stopped.

## Reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility at the top level of a component or another hook and select only fields used by the view:

```ts
const limiter = useAsyncRateLimiter(
  loadUserFromApi,
  { limit: 5, window: 60_000 },
  (state) => ({
    isExceeded: state.isExceeded,
    isExecuting: state.isExecuting,
    rejectionCount: state.rejectionCount,
  }),
)

console.log(
  limiter.state.isExceeded,
  limiter.state.isExecuting,
  limiter.state.rejectionCount,
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

See the [React API reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/framework/react/reference/index.md) for adapter signatures and the public core reference for complete option and state types.
