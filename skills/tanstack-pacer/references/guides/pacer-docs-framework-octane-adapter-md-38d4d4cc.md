# Adapter

<a id="source-pacer-docs-framework-octane-adapter-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.1`.

[Topic index](../framework-octane.md) · [Source provenance](../SOURCES.md)

The `octane-pacer` adapter connects Pacer scheduling utilities to Octane state and lifecycle management. It re-exports the core package, including utility classes, stateless functions, option types, and async retrying.

## Installation

```sh
pnpm add @tanstack/octane-pacer
```

Octane requires Node.js 22.22.2 or newer and Octane 0.1.36.

## Lifecycle and state

Call hooks at the top level of a compiled Octane component. The compiler assigns each call its own hook slot. The hook retains its utility across renders and commits the current callback and options in a layout effect. Selected state triggers rendering, and unmounting cleans up the utility. Use Octane 0.1.36; this package does not support the 0.2 line yet.

By default, the selected state is `{}`. Pass a selector to subscribe only to the fields your UI reads. The underlying `store` remains available for additional subscriptions.

## API overview

| Utility                                                | Instance API          | Convenience APIs                                                       |
| ------------------------------------------------------ | --------------------- | ---------------------------------------------------------------------- |
| [batching](./pacer-docs-framework-octane-guides-batching-md-61cbe702.md#source-pacer-docs-framework-octane-guides-batching-md)                       | `useBatcher`          | `useBatchedCallback`                                                   |
| [debouncing](./pacer-docs-framework-octane-guides-debouncing-md-fb6b0927.md#source-pacer-docs-framework-octane-guides-debouncing-md)                   | `useDebouncer`        | `useDebouncedCallback`, `useDebouncedState`, `useDebouncedValue`       |
| [queuing](./pacer-docs-framework-octane-guides-queuing-md-b048b26f.md#source-pacer-docs-framework-octane-guides-queuing-md)                         | `useQueuer`           | `useQueuedState`, `useQueuedValue`                                     |
| [rate limiting](./pacer-docs-framework-octane-guides-rate-limiting-md-cd84fb6a.md#source-pacer-docs-framework-octane-guides-rate-limiting-md)             | `useRateLimiter`      | `useRateLimitedCallback`, `useRateLimitedState`, `useRateLimitedValue` |
| [throttling](./pacer-docs-framework-octane-guides-throttling-md-f0267f8b.md#source-pacer-docs-framework-octane-guides-throttling-md)                   | `useThrottler`        | `useThrottledCallback`, `useThrottledState`, `useThrottledValue`       |
| [async batching](./pacer-docs-framework-octane-guides-async-batching-md-857e159c.md#source-pacer-docs-framework-octane-guides-async-batching-md)           | `useAsyncBatcher`     | `useAsyncBatchedCallback`                                              |
| [async debouncing](./pacer-docs-framework-octane-guides-async-debouncing-md-81a13a64.md#source-pacer-docs-framework-octane-guides-async-debouncing-md)       | `useAsyncDebouncer`   | `useAsyncDebouncedCallback`                                            |
| [async queuing](./pacer-docs-framework-octane-guides-async-queuing-md-86f5a6c6.md#source-pacer-docs-framework-octane-guides-async-queuing-md)             | `useAsyncQueuer`      | `useAsyncQueuedState`                                                  |
| [async rate limiting](./pacer-docs-framework-octane-guides-async-rate-limiting-md-c4857be8.md#source-pacer-docs-framework-octane-guides-async-rate-limiting-md) | `useAsyncRateLimiter` | `useAsyncRateLimitedCallback`                                          |
| [async throttling](./pacer-docs-framework-octane-guides-async-throttling-md-15c13b68.md#source-pacer-docs-framework-octane-guides-async-throttling-md)       | `useAsyncThrottler`   | `useAsyncThrottledCallback`                                            |

## Example

This counter coalesces rapid clicks into one update after 500 ms. Flush applies the latest pending count immediately.

```tsx
import { useState } from 'octane'
import { useDebouncer } from '@tanstack/octane-pacer'

export function Counter() {
  const [count, setCount] = useState(0)
  const [debouncedCount, setDebouncedCount] = useState(0)
  const debouncer = useDebouncer(setDebouncedCount, { wait: 500 }, (state) => ({
    isPending: state.isPending,
  }))
  function increment() {
    const next = count + 1
    setCount(next)
    debouncer.maybeExecute(next)
  }
  return (
    <div>
      <button onClick={increment}>Increment</button>
      <p>
        Count: {count}. Debounced: {debouncedCount}.
      </p>
      <p>Pending: {String(debouncer.state.isPending)}</p>
      <button onClick={() => debouncer.flush()}>Flush</button>
    </div>
  )
}
```

## Child subscriptions

Use `utility.Subscribe` with an ordinary JSX render callback. The child subscribes to its selection without changing the utility owner's selection, and unmounting releases it.

```tsx
<debouncer.Subscribe selector={(state) => ({ isPending: state.isPending })}>
  {({ isPending }) => <span>Pending: {String(isPending)}</span>}
</debouncer.Subscribe>
```

Use the JSX callback syntax shown here with Octane 0.1.36. Native `@{...}` template blocks are not supported as this component's render callback.

## Reactive options

Pass a plain options object, property getters, or an options factory. The adapter evaluates top-level getters, while function-valued core options remain callbacks. Options update the existing utility; pending work, counters, and the store retain their identity.

Options retain the core partial-merge behavior. Omitting a key preserves the previous setting; explicitly passing `undefined` clears it. `key`, `initialState`, and `initialItems` initialize the utility once and do not recreate it on later updates.

## Default options

Wrap descendants in `PacerProvider` with `defaultOptions`. Group defaults by utility, such as `{ debouncer: { leading: true } }`. Local options take precedence and provider changes apply after commit.

## Cleanup

Debouncers, throttlers, and batchers cancel pending timers by default. Queuers stop processing. Async variants also abort active work. Synchronous rate limiters need no timer cleanup.

Set `onUnmount` to replace the default cleanup, for example to call `flush()` before leaving a page. The callback receives the adapter instance and its selected state. If you replace cleanup for an async utility, call its cancellation or abort methods when needed.

## Callback and value helpers

Callback helpers return only the scheduled function. Use an instance API when you need `flush`, `cancel`, queue controls, or state subscriptions.

State helpers return `[value, setValue, utility]`; value helpers return `[value, utility]`. Setters accept a new value or a functional update. Synchronous queue state helpers return `[items, addItem, utility]`. Async queue state helpers return `[items, utility]`; call `utility.addItem()` to enqueue an item.

## Async utilities

The five async utilities preserve typed results and core error behavior. Use `onSuccess`, `onError`, and `onSettled` for outcomes, and `asyncRetryerOptions` for retry configuration. `abort()` is cooperative: your operation must observe the supplied abort signal. See the individual async guides for scheduling and concurrency details.

## Devtools

Install `@tanstack/devtools` and `@tanstack/pacer-devtools`. Mount `TanStackDevtoolsCore` with `plugins: [pacerDevtoolsPlugin()]` once in your application and unmount it during cleanup. Give each utility a `key` to make it appear in the Pacer panel.

See the [devtools setup guide](./pacer-docs-devtools-md-2f4aa95a.md#source-pacer-docs-devtools-md) for this framework's mount and cleanup code.

## API reference

See the [generated reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/framework/octane/reference/index.md) for signatures, options, and return types.
