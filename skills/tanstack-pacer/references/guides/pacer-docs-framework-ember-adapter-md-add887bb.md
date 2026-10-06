# Adapter

<a id="source-pacer-docs-framework-ember-adapter-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.1`.

[Topic index](../framework-ember.md) · [Source provenance](../SOURCES.md)

The `ember-pacer` adapter connects Pacer scheduling utilities to Ember state and lifecycle management. It re-exports the core package, including utility classes, stateless functions, option types, and async retrying.

## Installation

```sh
pnpm add @tanstack/ember-pacer
```

The package is ESM-only and requires Node.js 20 or newer when running in Node.js.

## Lifecycle and state

Call the `use*` template helpers inside a `{{#let}}` block. The execution callback is the first positional argument and the optional state selector is the second. Pass options as named arguments. Ember tracks named arguments and updates the same utility after rendering. Removing the helper from the template releases its subscriptions and cleans up pending work.

By default, the selected state is `{}`. Pass a selector to subscribe only to the fields your UI reads. The underlying `store` remains available for additional subscriptions.

## API overview

| Utility | Instance API | State and value helpers |
| ------------------------------------------------------ | --------------------- | ---------------------------------------------------------------------- |
| [batching](./pacer-docs-framework-ember-guides-batching-md-bda90a65.md#source-pacer-docs-framework-ember-guides-batching-md) | `useBatcher` | None |
| [debouncing](./pacer-docs-framework-ember-guides-debouncing-md-df58f17e.md#source-pacer-docs-framework-ember-guides-debouncing-md) | `useDebouncer` | `useDebouncedState`, `useDebouncedValue` |
| [queuing](./pacer-docs-framework-ember-guides-queuing-md-47a109ba.md#source-pacer-docs-framework-ember-guides-queuing-md) | `useQueuer` | `useQueuedState`, `useQueuedValue` |
| [rate limiting](./pacer-docs-framework-ember-guides-rate-limiting-md-f6011d40.md#source-pacer-docs-framework-ember-guides-rate-limiting-md) | `useRateLimiter` | `useRateLimitedState`, `useRateLimitedValue` |
| [throttling](./pacer-docs-framework-ember-guides-throttling-md-75ead36b.md#source-pacer-docs-framework-ember-guides-throttling-md) | `useThrottler` | `useThrottledState`, `useThrottledValue` |
| [async batching](./pacer-docs-framework-ember-guides-async-batching-md-d955ef77.md#source-pacer-docs-framework-ember-guides-async-batching-md) | `useAsyncBatcher` | None |
| [async debouncing](./pacer-docs-framework-ember-guides-async-debouncing-md-cd4bcf1a.md#source-pacer-docs-framework-ember-guides-async-debouncing-md) | `useAsyncDebouncer` | None |
| [async queuing](./pacer-docs-framework-ember-guides-async-queuing-md-d94ed0ba.md#source-pacer-docs-framework-ember-guides-async-queuing-md) | `useAsyncQueuer` | `useAsyncQueuedState` |
| [async rate limiting](./pacer-docs-framework-ember-guides-async-rate-limiting-md-57ab1491.md#source-pacer-docs-framework-ember-guides-async-rate-limiting-md) | `useAsyncRateLimiter` | None |
| [async throttling](./pacer-docs-framework-ember-guides-async-throttling-md-42a2f7b0.md#source-pacer-docs-framework-ember-guides-async-throttling-md) | `useAsyncThrottler` | None |

## Example

This counter coalesces rapid clicks into one update after 500 ms. Flush applies the latest pending count immediately.

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useDebouncer } from '@tanstack/ember-pacer'
import type { DebouncerState, EmberDebouncer } from '@tanstack/ember-pacer'

export default class Counter extends Component {
  @tracked count = 0
  @tracked debouncedCount = 0
  execute = (value: number) => {
    this.debouncedCount = value
  }
  select = (state: DebouncerState<(value: number) => void>) => ({
    isPending: state.isPending,
  })
  increment = (debouncer: EmberDebouncer<(value: number) => void>) => {
    debouncer.maybeExecute(++this.count)
  }

  <template>
    {{#let (useDebouncer this.execute this.select wait=500) as |debouncer|}}
      <button {{on 'click' (fn this.increment debouncer)}}>Increment</button>
      <p>Count: {{this.count}}. Debounced: {{this.debouncedCount}}.</p>
      <p>Pending: {{debouncer.state.isPending}}</p>
      <button {{on 'click' debouncer.flush}}>Flush</button>
    {{/let}}
  </template>
}
```

## Child subscriptions

Invoke the contextual `utility.Subscribe` helper with a selector. Reading its result in a template tracks only that selection; removing the helper releases the subscription.

```hbs
{{#let (debouncer.Subscribe this.select) as |state|}}
  <span>Pending: {{state.isPending}}</span>
{{/let}}
```

## Reactive options

Pass tracked values directly as named arguments, for example `wait=this.wait`. A scope created by `createPacerScope(() => defaults)` supplies contextual helpers with shared defaults. Pass the scope through component arguments to share it. Local named options take precedence.

Options retain the core partial-merge behavior. Omitting a key preserves the previous setting; explicitly passing `undefined` clears it. `key`, `initialState`, and `initialItems` initialize the utility once and do not recreate it on later updates.

## Default options

`createPacerScope` returns typed contextual helpers. Invoke `scope.useDebouncer` with normal positional and named arguments. Scope defaults can be a factory or an object with getters. Each helper owns its cleanup.

## Cleanup

Debouncers, throttlers, and batchers cancel pending timers by default. Queuers stop processing. Async variants also abort active work. Synchronous rate limiters need no timer cleanup.

Set `onUnmount` to replace the default cleanup, for example to call `flush()` before leaving a page. The callback receives the adapter instance and its selected state. If you replace cleanup for an async utility, call its cancellation or abort methods when needed.

## Event handlers and value helpers

Use an instance method as the event handler: `maybeExecute` for debouncing, throttling, and rate limiting, or `addItem` for batching. The instance also provides control methods and state subscriptions.

State and value helpers return an object with `value`, `setValue`, and `utility`. Read `value` in the template so Ember tracks it. State helpers initialize once; value helpers process changes to their positional input. Queue state helpers return the queue with `items` selected by default.

## Async utilities

The five async utilities preserve typed results and core error behavior. Use `onSuccess`, `onError`, and `onSettled` for outcomes, and `asyncRetryerOptions` for retry configuration. `abort()` is cooperative: your operation must observe the supplied abort signal. See the individual async guides for scheduling and concurrency details.

## Devtools

Install `@tanstack/devtools` and `@tanstack/pacer-devtools`. Mount `TanStackDevtoolsCore` with `plugins: [pacerDevtoolsPlugin()]` once in your application and unmount it during cleanup. Give each utility a `key` to make it appear in the Pacer panel.

See the [devtools setup guide](./pacer-docs-devtools-md-2f4aa95a.md#source-pacer-docs-devtools-md) for this framework's mount and cleanup code.

## API reference

See the [generated reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/framework/ember/reference/index.md) for signatures, options, and return types.
