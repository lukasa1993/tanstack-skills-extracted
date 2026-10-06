# Async Throttling

<a id="source-pacer-docs-framework-react-guides-async-throttling-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.1`.

[Topic index](../debounce-throttle.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Async Throttling](./pacer-docs-framework-angular-guides-async-throttling-md-0551d620.md).

## Choose an API

This section is an exact duplicate. Read [Choose an API in Async Throttling](./pacer-docs-framework-preact-guides-async-throttling-md-c95a8092.md).

## React example

```tsx
import { useAsyncThrottler } from '@tanstack/react-pacer'

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

This section is an exact duplicate. Read [Retrying failed executions in Async Throttling](./pacer-docs-framework-preact-guides-async-throttling-md-c95a8092.md).

## Canceling pending work and aborting active work

This section is an exact duplicate. Read [Canceling pending work and aborting active work in Async Throttling](./pacer-docs-framework-preact-guides-async-throttling-md-c95a8092.md).

## Configuration

This section is an exact duplicate. Read [Configuration in Async Throttling](./pacer-docs-framework-angular-guides-async-throttling-md-0551d620.md).

## React lifecycle

This section is an exact duplicate. Read [React lifecycle in Async Debouncing](./pacer-docs-framework-react-guides-async-debouncing-md-110609a3.md).

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

See the [React API reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/framework/react/reference/index.md) for adapter signatures and the public core reference for complete option and state types.
