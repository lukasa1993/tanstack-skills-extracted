# Adapter

<a id="source-pacer-docs-framework-vue-adapter-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.1`.

[Topic index](../framework-vue.md) · [Source provenance](../SOURCES.md)

The `vue-pacer` adapter connects Pacer scheduling utilities to Vue state and lifecycle management. It re-exports the core package, including utility classes, stateless functions, option types, and async retrying.

## Installation

```sh
pnpm add @tanstack/vue-pacer
```

The package is ESM-only and requires Node.js 20 or newer when running in Node.js.

## Lifecycle and state

Call composables during component setup or inside an active Vue effect scope. Disposing the scope stops option watchers and subscriptions and cleans up the utility. Read selected state through `utility.state.value` in JavaScript; Vue templates unwrap refs.

By default, the selected state is `{}`. Pass a selector to subscribe only to the fields your UI reads. The underlying `store` remains available for additional subscriptions.

## API overview

| Utility | Instance API | State and value helpers |
| ------------------------------------------------------ | --------------------- | ---------------------------------------------------------------------- |
| [batching](./pacer-docs-framework-vue-guides-batching-md-6054fc95.md#source-pacer-docs-framework-vue-guides-batching-md) | `useBatcher` | None |
| [debouncing](./pacer-docs-framework-vue-guides-debouncing-md-e67a058c.md#source-pacer-docs-framework-vue-guides-debouncing-md) | `useDebouncer` | `useDebouncedState`, `useDebouncedValue` |
| [queuing](./pacer-docs-framework-vue-guides-queuing-md-eea7798f.md#source-pacer-docs-framework-vue-guides-queuing-md) | `useQueuer` | `useQueuedState`, `useQueuedValue` |
| [rate limiting](./pacer-docs-framework-vue-guides-rate-limiting-md-1a484003.md#source-pacer-docs-framework-vue-guides-rate-limiting-md) | `useRateLimiter` | `useRateLimitedState`, `useRateLimitedValue` |
| [throttling](./pacer-docs-framework-vue-guides-throttling-md-1e3c1d0b.md#source-pacer-docs-framework-vue-guides-throttling-md) | `useThrottler` | `useThrottledState`, `useThrottledValue` |
| [async batching](./pacer-docs-framework-vue-guides-async-batching-md-b15448cf.md#source-pacer-docs-framework-vue-guides-async-batching-md) | `useAsyncBatcher` | None |
| [async debouncing](./pacer-docs-framework-vue-guides-async-debouncing-md-a30dc2be.md#source-pacer-docs-framework-vue-guides-async-debouncing-md) | `useAsyncDebouncer` | None |
| [async queuing](./pacer-docs-framework-vue-guides-async-queuing-md-f13bd5bc.md#source-pacer-docs-framework-vue-guides-async-queuing-md) | `useAsyncQueuer` | `useAsyncQueuedState` |
| [async rate limiting](./pacer-docs-framework-vue-guides-async-rate-limiting-md-d985af70.md#source-pacer-docs-framework-vue-guides-async-rate-limiting-md) | `useAsyncRateLimiter` | None |
| [async throttling](./pacer-docs-framework-vue-guides-async-throttling-md-218d88bc.md#source-pacer-docs-framework-vue-guides-async-throttling-md) | `useAsyncThrottler` | None |

## Example

This counter coalesces rapid clicks into one update after 500 ms. Flush applies the latest pending count immediately.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useDebouncer } from '@tanstack/vue-pacer'

const count = ref(0)
const debouncedCount = ref(0)
const debouncer = useDebouncer(
  (value: number) => {
    debouncedCount.value = value
  },
  { wait: 500 },
  (state) => ({ isPending: state.isPending }),
)
const state = debouncer.state
function increment() {
  debouncer.maybeExecute(++count.value)
}
</script>

<template>
  <button @click="increment">Increment</button>
  <p>Count: {{ count }}. Debounced: {{ debouncedCount }}.</p>
  <p>Pending: {{ state.isPending }}</p>
  <button @click="debouncer.flush()">Flush</button>
</template>
```

## Child subscriptions

Use `utility.Subscribe` to select state for a child slot without subscribing the owning component to those fields. The slot receives the selected value and releases its subscription when removed.

```vue
<debouncer.Subscribe
  :selector="(state) => ({ isPending: state.isPending })"
  v-slot="{ isPending }"
>
  <span>Pending: {{ isPending }}</span>
</debouncer.Subscribe>
```

## Reactive options

Pass a plain options object, property getters, or an options factory. The adapter evaluates top-level getters, while function-valued core options remain callbacks. Options update the existing utility; pending work, counters, and the store retain their identity.

Options retain the core partial-merge behavior. Omitting a key preserves the previous setting; explicitly passing `undefined` clears it. `key`, `initialState`, and `initialItems` initialize the utility once and do not recreate it on later updates.

## Default options

Wrap descendants in `PacerProvider` or call `providePacerOptions` during setup. Both accept defaults grouped by utility, such as `{ debouncer: { leading: true } }`. Provider defaults remain reactive and local options take precedence.

## Cleanup

Debouncers, throttlers, and batchers cancel pending timers by default. Queuers stop processing. Async variants also abort active work. Synchronous rate limiters need no timer cleanup.

Set `onUnmount` to replace the default cleanup, for example to call `flush()` before leaving a page. The callback receives the adapter instance and its selected state. If you replace cleanup for an async utility, call its cancellation or abort methods when needed.

## Event handlers and value helpers

Use an instance method as the event handler: `maybeExecute` for debouncing, throttling, and rate limiting, or `addItem` for batching. The instance also provides control methods and state subscriptions.

State helpers return `[value, setValue, utility]`; value helpers return `[value, utility]`. Read the Vue ref through `.value` in JavaScript. Setters accept a new value or a functional update. Synchronous queue state helpers return `[itemsAccessor, addItem, utility]`. Async queue state helpers return `[itemsAccessor, utility]`; call `utility.addItem()` to enqueue an item. Queued value helpers return the last processed value, rather than the list of pending items.

## Async utilities

The five async utilities preserve typed results and core error behavior. Use `onSuccess`, `onError`, and `onSettled` for outcomes, and `asyncRetryerOptions` for retry configuration. `abort()` is cooperative: your operation must observe the supplied abort signal. See the individual async guides for scheduling and concurrency details.

## Devtools

Install `@tanstack/vue-pacer-devtools` and `@tanstack/vue-devtools`. Pass `pacerDevtoolsPlugin()` to the host's `plugins` prop. See the [devtools setup](./pacer-docs-devtools-md-2f4aa95a.md#source-pacer-docs-devtools-md) for an example. The `/production` entry explicitly includes the panel in production builds.

## API reference

See the [generated reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/framework/vue/reference/index.md) for signatures, options, and return types.
