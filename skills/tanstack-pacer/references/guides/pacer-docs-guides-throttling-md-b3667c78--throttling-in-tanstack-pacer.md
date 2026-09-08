# Throttling — Throttling in TanStack Pacer

[Guide and prerequisites](./pacer-docs-guides-throttling-md-b3667c78.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Throttling in TanStack Pacer

TanStack Pacer provides both synchronous and asynchronous throttling. This guide covers the synchronous `Throttler` class and `throttle` function. For async throttling, see the [Async Throttling Guide](./pacer-docs-guides-async-throttling-md-de3ed145.md#source-pacer-docs-guides-async-throttling-md).

### Basic Usage with `throttle`

The `throttle` function is the simplest way to add throttling to any function:

```ts
import { throttle } from '@tanstack/pacer'

// Throttle UI updates to once every 200ms
const throttledUpdate = throttle(
  (value: number) => updateProgressBar(value),
  {
    wait: 200,
  }
)

// In a rapid loop, only executes every 200ms
for (let i = 0; i < 100; i++) {
  throttledUpdate(i) // Many calls get throttled
}
```

> **Note:** When using React, prefer `useThrottledCallback` hook over the `throttle` function for better integration with React's lifecycle and automatic cleanup.

### Advanced Usage with `Throttler` Class

For more control over the throttling behavior, you can use the `Throttler` class directly:

```ts
import { Throttler } from '@tanstack/pacer'

const updateThrottler = new Throttler(
  (value: number) => updateProgressBar(value),
  { wait: 200 }
)

// Access current state via TanStack Store
console.log(updateThrottler.store.state.executionCount) // Number of successful executions
console.log(updateThrottler.store.state.lastExecutionTime) // Timestamp of last execution
console.log(updateThrottler.store.state.isPending) // Whether execution is pending
console.log(updateThrottler.store.state.status) // Current execution status

// Cancel any pending execution
updateThrottler.cancel()

// Flush pending execution immediately
updateThrottler.flush()
```

### Leading and Trailing Executions

The synchronous throttler supports both leading and trailing edge executions:

```ts
const throttledFn = throttle(fn, {
  wait: 200,
  leading: true,   // Execute on first call (default)
  trailing: true,  // Execute after wait period (default)
})
```

- `leading: true` (default) - Execute immediately on first call
- `leading: false` - Skip first call, wait for trailing execution
- `trailing: true` (default) - Execute last call after wait period
- `trailing: false` - Skip last call if within wait period

Common patterns:
- `{ leading: true, trailing: true }` - Default, most responsive
- `{ leading: false, trailing: true }` - Delay all executions
- `{ leading: true, trailing: false }` - Skip queued executions

### Sharing Options Between Instances

Use `throttlerOptions` to share common options between different `Throttler` instances:

```ts
import { throttlerOptions, Throttler } from '@tanstack/pacer'

const sharedOptions = throttlerOptions({
  wait: 200,
  leading: true,
  trailing: true
})

const throttler1 = new Throttler(fn1, { ...sharedOptions, key: 'throttler1' })
const throttler2 = new Throttler(fn2, { ...sharedOptions, wait: 300 })
```

### Enabling/Disabling

The `Throttler` class supports enabling/disabling via the `enabled` option. Using the `setOptions` method, you can enable/disable the throttler at any time:

```ts
const throttler = new Throttler(fn, { wait: 200, enabled: false }) // Disable by default
throttler.setOptions({ enabled: true }) // Enable at any time
```

The `enabled` option can also be a function that returns a boolean, allowing for dynamic enabling/disabling based on runtime conditions:

```ts
const throttler = new Throttler(fn, {
  wait: 200,
  enabled: (throttler) => {
    return throttler.store.state.executionCount < 50 // Disable after 50 executions
  }
})
```

If you are using a framework adapter where the throttler options are reactive, you can set the `enabled` option to a conditional value to enable/disable the throttler on the fly. However, if you are using the `throttle` function or the `Throttler` class directly, you must use the `setOptions` method to change the `enabled` option, since the options that are passed are actually passed to the constructor of the `Throttler` class.

### Dynamic Options

Several options in the Throttler support dynamic values through callback functions that receive the throttler instance:

```ts
const throttler = new Throttler(fn, {
  // Dynamic wait time based on execution count
  wait: (throttler) => {
    return throttler.store.state.executionCount * 100 // Increase wait time with each execution
  },
  // Dynamic enabled state based on execution count
  enabled: (throttler) => {
    return throttler.store.state.executionCount < 50 // Disable after 50 executions
  }
})
```

The following options support dynamic values:
- `enabled`: Can be a boolean or a function that returns a boolean
- `wait`: Can be a number or a function that returns a number

This allows for sophisticated throttling behavior that adapts to runtime conditions.

### Callback Options

The synchronous `Throttler` supports the following callback:

```ts
const throttler = new Throttler(fn, {
  wait: 200,
  onExecute: (throttler) => {
    // Called after each successful execution
    console.log('Function executed', throttler.store.state.executionCount)
  }
})
```

The `onExecute` callback is called after each successful execution of the throttled function, making it useful for tracking executions, updating UI state, or performing cleanup operations.

### Flushing Pending Executions

The throttler supports flushing pending executions to trigger them immediately:

```ts
const throttler = new Throttler(fn, { wait: 1000 })

throttler.maybeExecute('some-arg')
console.log(throttler.store.state.isPending) // true

// Flush immediately instead of waiting
throttler.flush()
console.log(throttler.store.state.isPending) // false
```

### Customizing Unmount Behavior

Framework hooks cancel pending work by default when a component unmounts. Use the `onUnmount` option to flush instead.

```tsx
const throttler = useThrottler(fn, {
  wait: 200,
  onUnmount: (t) => t.flush(),
})
```
