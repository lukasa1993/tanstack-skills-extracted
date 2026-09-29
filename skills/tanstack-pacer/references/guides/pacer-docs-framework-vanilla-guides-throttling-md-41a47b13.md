# Throttling

<a id="source-pacer-docs-framework-vanilla-guides-throttling-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.0`.

[Topic index](../debounce-throttle.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Throttling](./pacer-docs-framework-angular-guides-throttling-md-3ac2ca32.md).

## How throttling works

This section is an exact duplicate. Read [How throttling works in Throttling](./pacer-docs-framework-angular-guides-throttling-md-3ac2ca32.md).

## When to use throttling

This section is an exact duplicate. Read [When to use throttling in Throttling](./pacer-docs-framework-angular-guides-throttling-md-3ac2ca32.md).

## Using throttling in TanStack Pacer

TanStack Pacer provides two core throttling APIs:

- `throttle` returns a throttled function.
- `Throttler` exposes lifecycle methods, dynamic options, callbacks, and observable state.

### Convenience function

Use `throttle` when you only need to invoke the throttled function:

```ts
import { throttle } from '@tanstack/pacer'

const updateScrollPosition = throttle(
  (position: number) => {
    renderScrollPosition(position)
  },
  { wait: 100 },
)

window.addEventListener('scroll', () => {
  updateScrollPosition(window.scrollY)
})
```

### Class API

Use `Throttler` when you need to inspect or control pending work:

```ts
import { Throttler } from '@tanstack/pacer'

const scrollThrottler = new Throttler(renderScrollPosition, {
  wait: 100,
})

scrollThrottler.maybeExecute(120) // Executes immediately.
scrollThrottler.maybeExecute(180) // Becomes the trailing call.

console.log(scrollThrottler.store.state.isPending) // true
```

Both the function returned by `throttle` and `Throttler.maybeExecute()` return `void`.

### Results and errors

The synchronous throttler does not retain return values or catch errors. A leading error propagates from `maybeExecute()`. A trailing execution runs later from a timer, so handle its errors inside the wrapped function.

Use [async throttling](./pacer-docs-framework-vanilla-guides-async-throttling-md-80491b52.md#source-pacer-docs-framework-vanilla-guides-async-throttling-md) when the caller must await a result or when the utility should manage async errors.

## Execution timing

The `leading` and `trailing` options control which edges of the throttle interval may execute.

| `leading` | `trailing` | Behavior |
| --- | --- | --- |
| `true` | `true` | Execute the first call immediately and the latest blocked call at the trailing edge. This is the default. |
| `true` | `false` | Execute immediately when allowed and discard calls during the interval. |
| `false` | `true` | Delay the first execution until the trailing edge and use the latest arguments received during the interval. |
| `false` | `false` | Do not execute any calls. |

```ts
const throttler = new Throttler(updateProgress, {
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
const throttler = new Throttler(updateProgress, {
  enabled: (throttler) => throttler.store.state.executionCount < 100,
  wait: (throttler) =>
    throttler.store.state.executionCount < 10 ? 100 : 250,
})
```

Disabling a throttler through `setOptions()` cancels a pending trailing execution.

### Observing executions

`onExecute` runs after the wrapped function and receives the executed arguments followed by the throttler instance:

```ts
const throttler = new Throttler(updateProgress, {
  wait: 100,
  onExecute: (args, throttler) => {
    console.log('Rendered value:', args[0])
    console.log('Executions:', throttler.store.state.executionCount)
  },
})
```

To share a type-checked configuration across instances, define it with `throttlerOptions()`.

## State

The class stores its state at `throttler.store`.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers are not restored.

Commonly useful properties include:

- `isPending`: Whether a trailing execution is waiting.
- `lastArgs`: The arguments retained for a possible trailing execution.
- `lastExecutionTime`: When the wrapped function last executed.
- `nextExecutionTime`: When another execution can occur.
- `executionCount`: How many times the wrapped function has executed.
- `status`: `'disabled'`, `'idle'`, or `'pending'`.

See the [`Throttler` API reference](https://github.com/TanStack/pacer/blob/b58e0222da48550d4d39b6241f8ff5a4142449b6/docs/reference/classes/Throttler.md) for complete option and state types.
