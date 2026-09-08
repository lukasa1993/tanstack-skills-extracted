# Debouncing — Debouncing in TanStack Pacer

[Guide and prerequisites](./pacer-docs-guides-debouncing-md-2946516b.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Debouncing in TanStack Pacer

TanStack Pacer provides both synchronous and asynchronous debouncing. This guide covers the synchronous `Debouncer` class and `debounce` function. For async debouncing, see the [Async Debouncing Guide](./pacer-docs-guides-async-debouncing-md-97c781af.md#source-pacer-docs-guides-async-debouncing-md).

### Basic Usage with `debounce`

The `debounce` function is the simplest way to add debouncing to any function:

```ts
import { debounce } from '@tanstack/pacer'

// Debounce search input to wait for user to stop typing
const debouncedSearch = debounce(
  (searchTerm: string) => performSearch(searchTerm),
  {
    wait: 500, // Wait 500ms after last keystroke
  }
)

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value)
})
```

> **Note:** When using React, prefer `useDebouncedCallback` hook over the `debounce` function for better integration with React's lifecycle and automatic cleanup.

### Advanced Usage with `Debouncer` Class

For more control over the debouncing behavior, you can use the `Debouncer` class directly:

```ts
import { Debouncer } from '@tanstack/pacer'

const searchDebouncer = new Debouncer(
  (searchTerm: string) => performSearch(searchTerm),
  { wait: 500 }
)

// Access current state via TanStack Store
console.log(searchDebouncer.store.state.executionCount) // Number of successful executions
console.log(searchDebouncer.store.state.isPending) // Whether a call is pending
console.log(searchDebouncer.store.state.status) // Current execution status

// Update options dynamically
searchDebouncer.setOptions({ wait: 1000 }) // Increase wait time

// Cancel pending execution
searchDebouncer.cancel()

// Flush pending execution immediately
searchDebouncer.flush()
```

### Leading and Trailing Executions

The synchronous debouncer supports both leading and trailing edge executions:

```ts
const debouncedFn = debounce(fn, {
  wait: 500,
  leading: true,   // Execute on first call
  trailing: true,  // Execute after wait period
})
```

- `leading: true` - Function executes immediately on first call
- `leading: false` (default) - First call starts the wait timer
- `trailing: true` (default) - Function executes after wait period
- `trailing: false` - No execution after wait period

Common patterns:
- `{ leading: false, trailing: true }` - Default, execute after wait
- `{ leading: true, trailing: false }` - Execute immediately, ignore subsequent calls
- `{ leading: true, trailing: true }` - Execute on both first call and after wait

### Max Wait Time

The TanStack Pacer Debouncer purposely does NOT have a `maxWait` option like other debouncing libraries. If you need to let executions run over a more spread out period of time, consider using the [throttling](./pacer-docs-guides-throttling-md-b3667c78.md#source-pacer-docs-guides-throttling-md) technique instead.

### Sharing Options Between Instances

Use `debouncerOptions` to share common options between different `Debouncer` instances:

```ts
import { debouncerOptions, Debouncer } from '@tanstack/pacer'

const sharedOptions = debouncerOptions({
  wait: 500,
  leading: false,
  trailing: true
})

const debouncer1 = new Debouncer(fn1, { ...sharedOptions, key: 'debouncer1' })
const debouncer2 = new Debouncer(fn2, { ...sharedOptions, wait: 1000 })
```

### Enabling/Disabling

The `Debouncer` class supports enabling/disabling via the `enabled` option. Using the `setOptions` method, you can enable/disable the debouncer at any time:

```ts
const debouncer = new Debouncer(fn, { wait: 500, enabled: false }) // Disable by default
debouncer.setOptions({ enabled: true }) // Enable at any time
```

The `enabled` option can also be a function that returns a boolean, allowing for dynamic enabling/disabling based on runtime conditions:

```ts
const debouncer = new Debouncer(fn, {
  wait: 500,
  enabled: (debouncer) => {
    return debouncer.store.state.executionCount < 10 // Disable after 10 executions
  }
})
```

If you are using a framework adapter where the debouncer options are reactive, you can set the `enabled` option to a conditional value to enable/disable the debouncer on the fly:

```ts
// React example
const debouncer = useDebouncer(
  setSearch,
  { wait: 500, enabled: searchInput.value.length > 3 } // Enable/disable based on input length IF using a framework adapter that supports reactive options
)
```

### Dynamic Options

Several options in the Debouncer support dynamic values through callback functions that receive the debouncer instance:

```ts
const debouncer = new Debouncer(fn, {
  // Dynamic wait time based on execution count
  wait: (debouncer) => {
    return debouncer.store.state.executionCount * 100 // Increase wait time with each execution
  },
  // Dynamic enabled state based on execution count
  enabled: (debouncer) => {
    return debouncer.store.state.executionCount < 10 // Disable after 10 executions
  }
})
```

The following options support dynamic values:
- `enabled`: Can be a boolean or a function that returns a boolean
- `wait`: Can be a number or a function that returns a number

This allows for sophisticated debouncing behavior that adapts to runtime conditions.

### Callback Options

The synchronous `Debouncer` supports the following callback:

```ts
const debouncer = new Debouncer(fn, {
  wait: 500,
  onExecute: (debouncer) => {
    // Called after each successful execution
    console.log('Function executed', debouncer.store.state.executionCount)
  }
})
```

The `onExecute` callback is called after each successful execution of the debounced function, making it useful for tracking executions, updating UI state, or performing cleanup operations.

### Flushing Pending Executions

The debouncer supports flushing pending executions to trigger them immediately:

```ts
const debouncer = new Debouncer(fn, { wait: 1000 })

debouncer.maybeExecute('some-arg')
console.log(debouncer.store.state.isPending) // true

// Flush immediately instead of waiting
debouncer.flush()
console.log(debouncer.store.state.isPending) // false
```

### Customizing Unmount Behavior

Framework hooks cancel pending work by default when a component unmounts. Use the `onUnmount` option to flush instead.

```tsx
const debouncer = useDebouncer(fn, {
  wait: 500,
  onUnmount: (d) => d.flush(),
})
```
