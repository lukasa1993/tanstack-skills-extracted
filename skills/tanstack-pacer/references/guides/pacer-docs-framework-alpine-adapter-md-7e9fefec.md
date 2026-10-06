# Adapter

<a id="source-pacer-docs-framework-alpine-adapter-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.1`.

[Topic index](../framework-alpine.md) · [Source provenance](../SOURCES.md)

The `alpine-pacer` adapter connects Pacer scheduling utilities to Alpine state and lifecycle management. It re-exports the core package, including utility classes, stateless functions, option types, and async retrying.

## Installation

```sh
pnpm add @tanstack/alpine-pacer
```

The package is ESM-only and requires Node.js 20 or newer when running in Node.js.

## Lifecycle and state

Create a `createPacerScope()` for each component and call `scope.destroy()` from Alpine's `destroy` hook. Scope methods own option effects, state subscriptions, and utility cleanup. Alternatively, install `pacerPlugin` to use the automatically owned `$pacer` magic. Read selected state through `utility.state`.

By default, the selected state is `{}`. Pass a selector to subscribe only to the fields your UI reads. The underlying `store` remains available for additional subscriptions.

## API overview

| Utility | Instance API | State and value helpers |
| ------------------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------- |
| [batching](./pacer-docs-framework-alpine-guides-batching-md-99b0924d.md#source-pacer-docs-framework-alpine-guides-batching-md) | `createBatcher` | None |
| [debouncing](./pacer-docs-framework-alpine-guides-debouncing-md-97f88f23.md#source-pacer-docs-framework-alpine-guides-debouncing-md) | `createDebouncer` | `createDebouncedState`, `createDebouncedValue` |
| [queuing](./pacer-docs-framework-alpine-guides-queuing-md-f8a57223.md#source-pacer-docs-framework-alpine-guides-queuing-md) | `createQueuer` | `createQueuedState`, `createQueuedValue` |
| [rate limiting](./pacer-docs-framework-alpine-guides-rate-limiting-md-81d12791.md#source-pacer-docs-framework-alpine-guides-rate-limiting-md) | `createRateLimiter` | `createRateLimitedState`, `createRateLimitedValue` |
| [throttling](./pacer-docs-framework-alpine-guides-throttling-md-195c4355.md#source-pacer-docs-framework-alpine-guides-throttling-md) | `createThrottler` | `createThrottledState`, `createThrottledValue` |
| [async batching](./pacer-docs-framework-alpine-guides-async-batching-md-f55c3643.md#source-pacer-docs-framework-alpine-guides-async-batching-md) | `createAsyncBatcher` | None |
| [async debouncing](./pacer-docs-framework-alpine-guides-async-debouncing-md-05950f97.md#source-pacer-docs-framework-alpine-guides-async-debouncing-md) | `createAsyncDebouncer` | None |
| [async queuing](./pacer-docs-framework-alpine-guides-async-queuing-md-f41eed74.md#source-pacer-docs-framework-alpine-guides-async-queuing-md) | `createAsyncQueuer` | `createAsyncQueuedState` |
| [async rate limiting](./pacer-docs-framework-alpine-guides-async-rate-limiting-md-c315b89c.md#source-pacer-docs-framework-alpine-guides-async-rate-limiting-md) | `createAsyncRateLimiter` | None |
| [async throttling](./pacer-docs-framework-alpine-guides-async-throttling-md-ab6e1b99.md#source-pacer-docs-framework-alpine-guides-async-throttling-md) | `createAsyncThrottler` | None |

## Example

This counter coalesces rapid clicks into one update after 500 ms. Flush applies the latest pending count immediately.

```ts
import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type { AlpineDebouncer } from '@tanstack/alpine-pacer'

Alpine.data('counter', () => {
  const scope = createPacerScope()
  return {
    count: 0,
    debouncedCount: 0,
    debouncer: null as AlpineDebouncer<
      (value: number) => void,
      { isPending: boolean }
    > | null,
    init() {
      this.debouncer = scope.createDebouncer(
        (value: number) => {
          this.debouncedCount = value
        },
        { wait: 500 },
        (state) => ({ isPending: state.isPending }),
      )
    },
    increment() {
      this.debouncer!.maybeExecute(++this.count)
    },
    destroy() {
      scope.destroy()
    },
  }
})
Alpine.start()
```

```html
<div x-data="counter">
  <button @click="increment">Increment</button>
  <p>
    Count: <span x-text="count"></span>. Debounced:
    <span x-text="debouncedCount"></span>.
  </p>
  <p>Pending: <span x-text="debouncer.state.isPending"></span></p>
  <button @click="debouncer.flush()">Flush</button>
</div>
```

## Child subscriptions

Call `utility.subscribe(childScope, selector)` for a child Alpine component. It returns a reactive getter without changing the utility owner's selection. Destroy the child scope in the component's `destroy` hook.

```ts
const selected = debouncer.subscribe(childScope, (state) => ({
  isPending: state.isPending,
}))
// Read selected().isPending in the child's template or reactive getter.
```

## Reactive options

Pass a plain options object, property getters, or an options factory. The adapter evaluates top-level getters, while function-valued core options remain callbacks. Options update the existing utility; pending work, counters, and the store retain their identity.

Options retain the core partial-merge behavior. Omitting a key preserves the previous setting; explicitly passing `undefined` clears it. `key`, `initialState`, and `initialItems` initialize the utility once and do not recreate it on later updates.

## Default options

Pass defaults to `createPacerScope`, either as an object or a factory. All utilities created through that scope inherit them. Use utility keys such as `debouncer` and `asyncQueuer`; local options take precedence.

## Cleanup

Debouncers, throttlers, and batchers cancel pending timers by default. Queuers stop processing. Async variants also abort active work. Synchronous rate limiters need no timer cleanup.

Set `onUnmount` to replace the default cleanup, for example to call `flush()` before leaving a page. The callback receives the adapter instance and its selected state. If you replace cleanup for an async utility, call its cancellation or abort methods when needed.

## Event handlers and value helpers

Use an instance method as the event handler: `maybeExecute` for debouncing, throttling, and rate limiting, or `addItem` for batching. The instance also provides control methods and state subscriptions.

State helpers return `[value, setValue, utility]`; value helpers return `[value, utility]`. Read values by calling their accessors. Setters accept a new value or a functional update. Synchronous queue state helpers return `[itemsAccessor, addItem, utility]`. Async queue state helpers return `[itemsAccessor, utility]`; call `utility.addItem()` to enqueue an item. Queued value helpers return the last processed value, rather than the list of pending items.

## Async utilities

The five async utilities preserve typed results and core error behavior. Use `onSuccess`, `onError`, and `onSettled` for outcomes, and `asyncRetryerOptions` for retry configuration. `abort()` is cooperative: your operation must observe the supplied abort signal. See the individual async guides for scheduling and concurrency details.

## Devtools

Install `@tanstack/devtools` and `@tanstack/pacer-devtools`. Mount `TanStackDevtoolsCore` with `plugins: [pacerDevtoolsPlugin()]` once in your application and unmount it during cleanup. Give each utility a `key` to make it appear in the Pacer panel.

See the [devtools setup guide](./pacer-docs-devtools-md-2f4aa95a.md#source-pacer-docs-devtools-md) for this framework's mount and cleanup code.

## API reference

See the [generated reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/framework/alpine/reference/index.md) for signatures, options, and return types.
