# Async Debouncing

<a id="source-pacer-docs-framework-react-guides-async-debouncing-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.0`.

[Topic index](../debounce-throttle.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Async Debouncing](./pacer-docs-framework-angular-guides-async-debouncing-md-d0499802.md).

## Choose an API

This section is an exact duplicate. Read [Choose an API in Async Debouncing](./pacer-docs-framework-preact-guides-async-debouncing-md-3002b7b1.md).

## React example

```tsx
import { useAsyncDebouncedCallback } from '@tanstack/react-pacer'

function SearchBox() {
  const search = useAsyncDebouncedCallback(fetchSearchResults, {
    wait: 300,
    onError: reportError,
  })

  return <input onChange={(event) => void search(event.currentTarget.value)} />
}
```

The focused snippets later in this guide use `useAsyncDebouncer` and assume they run inside a component or another hook.

## Promise results

This section is an exact duplicate. Read [Promise results in Async Debouncing](./pacer-docs-framework-angular-guides-async-debouncing-md-d0499802.md).

## Leading and trailing execution

This section is an exact duplicate. Read [Leading and trailing execution in Async Debouncing](./pacer-docs-framework-angular-guides-async-debouncing-md-d0499802.md).

## Errors and callbacks

This section is an exact duplicate. Read [Errors and callbacks in Async Debouncing](./pacer-docs-framework-angular-guides-async-debouncing-md-d0499802.md).

## Retrying failed executions

This section is an exact duplicate. Read [Retrying failed executions in Async Debouncing](./pacer-docs-framework-preact-guides-async-debouncing-md-3002b7b1.md).

## Canceling pending work and aborting active work

This section is an exact duplicate. Read [Canceling pending work and aborting active work in Async Debouncing](./pacer-docs-framework-preact-guides-async-debouncing-md-3002b7b1.md).

## Configuration

This section is an exact duplicate. Read [Configuration in Async Debouncing](./pacer-docs-framework-angular-guides-async-debouncing-md-d0499802.md).

## React lifecycle

The adapter cancels pending work and aborts active work when its owner is destroyed. Providing `onUnmount` replaces that default cleanup, so a custom callback must perform every required lifecycle action. When custom cleanup flushes work, remember that user callbacks can run while the component is being destroyed.

## Reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility at the top level of a component or another hook and select only fields used by the view:

```ts
const debouncer = useAsyncDebouncer(
  fetchSearchResults,
  { wait: 300 },
  (state) => ({
    isPending: state.isPending,
    isExecuting: state.isExecuting,
    lastResult: state.lastResult,
  }),
)

console.log(
  debouncer.state.isPending,
  debouncer.state.isExecuting,
  debouncer.state.lastResult,
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

See the [React API reference](https://github.com/TanStack/pacer/blob/b58e0222da48550d4d39b6241f8ff5a4142449b6/docs/framework/react/reference/index.md) for adapter signatures and the public core reference for complete option and state types.
