# Throttling

<a id="source-pacer-docs-framework-react-guides-throttling-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.1`.

[Topic index](../debounce-throttle.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Throttling](./pacer-docs-framework-angular-guides-throttling-md-3ac2ca32.md).

## How throttling works

This section is an exact duplicate. Read [How throttling works in Throttling](./pacer-docs-framework-angular-guides-throttling-md-3ac2ca32.md).

## When to use throttling

This section is an exact duplicate. Read [When to use throttling in Throttling](./pacer-docs-framework-angular-guides-throttling-md-3ac2ca32.md).

## Choose an API

- `useThrottledCallback` for a stable throttled event handler
- `useThrottledState` or `useThrottledValue` for throttled React state
- `useThrottler` for lifecycle methods and selected state

Use the callback API for event handlers, the state or value API for rate-controlled UI state, and the instance API for lifecycle methods and timing state.

## React example

```tsx
import { useThrottledCallback, useThrottledValue } from '@tanstack/react-pacer'

function ScrollStatus({ position }: { position: number }) {
  const report = useThrottledCallback(sendPosition, { wait: 250 })
  const [displayedPosition] = useThrottledValue(position, { wait: 100 })

  return (
    <button onClick={() => report(position)}>Report {displayedPosition}</button>
  )
}
```

The focused snippets later in this guide use `useThrottler` and assume they run inside a component or another hook.

## Execution timing

This section is an exact duplicate. Read [Execution timing in Throttling](./pacer-docs-framework-preact-guides-throttling-md-bb89a482.md).

## Controlling pending work

This section is an exact duplicate. Read [Controlling pending work in Throttling](./pacer-docs-framework-angular-guides-throttling-md-3ac2ca32.md).

## Configuring behavior at runtime

This section is an exact duplicate. Read [Configuring behavior at runtime in Throttling](./pacer-docs-framework-preact-guides-throttling-md-bb89a482.md).

## React lifecycle

The adapter cancels pending work when its owner is destroyed. Providing `onUnmount` replaces that default cleanup, so a custom callback must perform every required lifecycle action. When custom cleanup flushes work, remember that user callbacks can run while the component is being destroyed.

## Reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility at the top level of a component or another hook and select only fields used by the view:

```ts
const throttler = useThrottler(updateProgress, { wait: 100 }, (state) => ({
  isPending: state.isPending,
  executionCount: state.executionCount,
}))

console.log(throttler.state.isPending, throttler.state.executionCount)
```

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Rendering code should read the selected adapter state shown here.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers are not restored.

- `isPending`: Whether a trailing execution is waiting.
- `lastArgs`: The arguments retained for a possible trailing execution.
- `lastExecutionTime`: When the wrapped function last executed.
- `nextExecutionTime`: When another execution can occur.
- `executionCount`: How many times the wrapped function has executed.
- `status`: `'disabled'`, `'idle'`, or `'pending'`.

See the [React API reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/framework/react/reference/index.md) for adapter signatures and the public core reference for complete option and state types.
