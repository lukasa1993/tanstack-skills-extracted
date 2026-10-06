# Throttling

<a id="source-pacer-docs-framework-angular-guides-throttling-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.1`.

[Topic index](../debounce-throttle.md) · [Source provenance](../SOURCES.md)

Throttling limits how often a function can execute while calls continue to arrive. Unlike debouncing, throttling does not wait for activity to stop. It creates a bounded execution interval that works well for continuous events and updates.

With the default settings, the first call executes immediately. Calls received during the wait period are consolidated into one trailing execution that uses the latest arguments.

## How throttling works

The timeline below shows a throttler that allows one execution every three ticks:

```text
Throttling (one execution per 3 ticks)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️           ⬇️  ⬇️  ⬇️  ⬇️             ⬇️
Executed:     ✅  ❌  ⏳  ->   ✅  ❌  ❌  ❌  ✅             ✅
             [================================================================]
             ^ At most one execution per interval

             [First burst]    [More calls]              [Spaced calls]
             Execute first    Keep latest trailing      Execute when allowed
```

Calls may be discarded, but execution continues at a predictable interval while activity is ongoing.

## When to use throttling

Choose throttling when:

- Work should continue while events are arriving.
- Executions should be spaced by a minimum interval.
- Intermediate calls may be discarded.
- Immediate feedback from the first call is useful.

Choose another utility when:

- Work should wait until activity stops. Use [debouncing](./pacer-docs-framework-angular-guides-debouncing-md-982e1c29.md#source-pacer-docs-framework-angular-guides-debouncing-md).
- A specific number of calls may run within a window. Use [rate limiting](./pacer-docs-framework-angular-guides-rate-limiting-md-3d0393c9.md#source-pacer-docs-framework-angular-guides-rate-limiting-md).
- Every operation must eventually run. Use [queuing](./pacer-docs-framework-angular-guides-queuing-md-cfd6ce2e.md#source-pacer-docs-framework-angular-guides-queuing-md).
- Several items should run together. Use [batching](./pacer-docs-framework-angular-guides-batching-md-7fcb9449.md#source-pacer-docs-framework-angular-guides-batching-md).
- You need Promise results, retries, or abort support. Use [async throttling](./pacer-docs-framework-angular-guides-async-throttling-md-0551d620.md#source-pacer-docs-framework-angular-guides-async-throttling-md).

## Choose an API

- `injectThrottledSignal` or `injectThrottledValue` for throttled signals
- `injectThrottler` for lifecycle methods and selected state

Use instance methods for event handlers, and state or value helpers for rate-controlled UI state.

## Angular example

```ts
import { injectThrottler, injectThrottledSignal } from '@tanstack/angular-pacer'

export class ScrollComponent {
  readonly report = injectThrottler(sendPosition, { wait: 250 })
  readonly displayedPosition = injectThrottledSignal(0, { wait: 100 })

  update(position: number) {
    this.displayedPosition.set(position)
    this.report.maybeExecute(position)
  }
}
```

The focused snippets later in this guide use `injectThrottler` and assume they run inside an Angular injection context.

## Execution timing

The `leading` and `trailing` options control which edges of the throttle interval may execute.

| `leading` | `trailing` | Behavior                                                                                                     |
| --------- | ---------- | ------------------------------------------------------------------------------------------------------------ |
| `true`    | `true`     | Execute the first call immediately and the latest blocked call at the trailing edge. This is the default.    |
| `true`    | `false`    | Execute immediately when allowed and discard calls during the interval.                                      |
| `false`   | `true`     | Delay the first execution until the trailing edge and use the latest arguments received during the interval. |
| `false`   | `false`    | Do not execute any calls.                                                                                    |

```ts
const throttler = injectThrottler(updateProgress, {
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

### Flush

`flush()` immediately executes the pending trailing call. It does nothing when no trailing call is pending.

```ts
throttler.maybeExecute(10) // Leading execution.
throttler.maybeExecute(20) // Pending trailing execution.
throttler.flush() // Executes with 20 now.
```

### Cancel

`cancel()` discards the pending trailing call and clears its stored arguments. It does not reset the timing of the most recent completed execution.

```ts
throttler.maybeExecute(20)
throttler.cancel()
```

### Reset

`reset()` restores state counters and timing values to their defaults. It does not clear an already scheduled timeout. Call `cancel()` before `reset()` when pending work must be discarded.

```ts
throttler.cancel()
throttler.reset()
```

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
const throttler = injectThrottler(updateProgress, {
  enabled: (throttler) => throttler.store.state.executionCount < 100,
  wait: (throttler) => (throttler.store.state.executionCount < 10 ? 100 : 250),
})
```

Disabling a throttler through `setOptions()` cancels a pending trailing execution.

### Observing executions

`onExecute` runs after the wrapped function and receives the executed arguments followed by the throttler instance:

```ts
const throttler = injectThrottler(updateProgress, {
  wait: 100,
  onExecute: (args, throttler) => {
    console.log('Rendered value:', args[0])
    console.log('Executions:', throttler.store.state.executionCount)
  },
})
```

## Angular lifecycle

This section is an exact duplicate. Read [Angular lifecycle in Debouncing](./pacer-docs-framework-angular-guides-debouncing-md-982e1c29.md).

## Reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility in an Angular injection context, usually as a component or service field initializer and select only fields used by the view:

```ts
const throttler = injectThrottler(updateProgress, { wait: 100 }, (state) => ({
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

See the [Angular API reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/framework/angular/reference/index.md) for adapter signatures and the public core reference for complete option and state types.
