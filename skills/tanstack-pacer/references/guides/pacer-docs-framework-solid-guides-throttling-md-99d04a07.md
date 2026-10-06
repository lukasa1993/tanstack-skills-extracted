# Throttling

<a id="source-pacer-docs-framework-solid-guides-throttling-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.1`.

[Topic index](../debounce-throttle.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Throttling](./pacer-docs-framework-angular-guides-throttling-md-3ac2ca32.md).

## How throttling works

This section is an exact duplicate. Read [How throttling works in Throttling](./pacer-docs-framework-angular-guides-throttling-md-3ac2ca32.md).

## When to use throttling

This section is an exact duplicate. Read [When to use throttling in Throttling](./pacer-docs-framework-angular-guides-throttling-md-3ac2ca32.md).

## Choose an API

- `createThrottledSignal` or `createThrottledValue` for throttled reactive values
- `createThrottler` for callbacks, lifecycle methods, and selected state

Use the signal or value API for rate-controlled reactive state. Use `createThrottler` for event handlers, lifecycle methods, or timing state.

## Solid example

```tsx
import { createThrottledValue, createThrottler } from '@tanstack/solid-pacer'

const [displayedPosition] = createThrottledValue(() => props.position, {
  wait: 100,
})
const reporter = createThrottler(sendPosition, { wait: 250 }, (state) => ({
  isPending: state.isPending,
}))

reporter.maybeExecute(props.position)
console.log(displayedPosition(), reporter.state().isPending)
```

The focused snippets later in this guide use `createThrottler` and assume they run inside a Solid reactive owner.

## Execution timing

The `leading` and `trailing` options control which edges of the throttle interval may execute.

| `leading` | `trailing` | Behavior                                                                                                     |
| --------- | ---------- | ------------------------------------------------------------------------------------------------------------ |
| `true`    | `true`     | Execute the first call immediately and the latest blocked call at the trailing edge. This is the default.    |
| `true`    | `false`    | Execute immediately when allowed and discard calls during the interval.                                      |
| `false`   | `true`     | Delay the first execution until the trailing edge and use the latest arguments received during the interval. |
| `false`   | `false`    | Do not execute any calls.                                                                                    |

```ts
const throttler = createThrottler(updateProgress, {
  wait: 1000,
  leading: true,
  trailing: true,
})

throttler.maybeExecute(10) // Executes immediately.
throttler.maybeExecute(20)
throttler.maybeExecute(30) // Executes at the trailing edge with 30.
```

Calls received during an existing interval update the trailing arguments without restarting that interval. This is the central difference from debouncing.

## Controlling pending work

This section is an exact duplicate. Read [Controlling pending work in Throttling](./pacer-docs-framework-angular-guides-throttling-md-3ac2ca32.md).

## Configuring behavior at runtime

Use `setOptions()` to update options after construction:

```ts
throttler.setOptions({
  wait: 250,
  trailing: false,
})
```

A changed `wait` value does not reschedule an existing trailing timeout. It applies to later scheduling and executions.

The `enabled` and `wait` options may be functions that receive the throttler instance:

```ts
const throttler = createThrottler(updateProgress, {
  enabled: (throttler) => throttler.store.state.executionCount < 100,
  wait: (throttler) => (throttler.store.state.executionCount < 10 ? 100 : 250),
})
```

Disabling a throttler through `setOptions()` cancels a pending trailing execution.

### Observing executions

`onExecute` runs after the wrapped function and receives the executed arguments followed by the throttler instance:

```ts
const throttler = createThrottler(updateProgress, {
  wait: 100,
  onExecute: (args, throttler) => {
    console.log('Rendered value:', args[0])
    console.log('Executions:', throttler.store.state.executionCount)
  },
})
```

## Solid lifecycle

This section is an exact duplicate. Read [Solid lifecycle in Debouncing](./pacer-docs-framework-solid-guides-debouncing-md-cb70708c.md).

## Reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility inside a Solid reactive owner and select only fields used by the view:

```ts
const throttler = createThrottler(updateProgress, { wait: 100 }, (state) => ({
  isPending: state.isPending,
  executionCount: state.executionCount,
}))

console.log(throttler.state().isPending, throttler.state().executionCount)
```

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Rendering code should read the selected adapter state shown here.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers are not restored.

- `isPending`: Whether a trailing execution is waiting.
- `lastArgs`: The arguments retained for a possible trailing execution.
- `lastExecutionTime`: When the wrapped function last executed.
- `nextExecutionTime`: When another execution can occur.
- `executionCount`: How many times the wrapped function has executed.
- `status`: `'disabled'`, `'idle'`, or `'pending'`.

See the [Solid API reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/framework/solid/reference/index.md) for adapter signatures and the public core reference for complete option and state types.
