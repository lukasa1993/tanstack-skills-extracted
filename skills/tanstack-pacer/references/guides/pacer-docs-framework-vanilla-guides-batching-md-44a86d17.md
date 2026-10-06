# Batching

<a id="source-pacer-docs-framework-vanilla-guides-batching-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.1`.

[Topic index](../queue-batch.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Batching](./pacer-docs-framework-angular-guides-batching-md-7fcb9449.md).

## How batching works

This section is an exact duplicate. Read [How batching works in Batching](./pacer-docs-framework-angular-guides-batching-md-7fcb9449.md).

## When to use batching

This section is an exact duplicate. Read [When to use batching in Batching](./pacer-docs-framework-angular-guides-batching-md-7fcb9449.md).

## Using batching in TanStack Pacer

TanStack Pacer provides two core APIs:

- `batch` returns a function that adds one item to a batch.
- `Batcher` exposes lifecycle methods, custom triggers, callbacks, and state.

### Convenience function

```ts
import { batch } from '@tanstack/pacer'

const sendEvents = batch<string>(
  (events) => {
    analytics.send(events)
  },
  {
    maxSize: 3,
    wait: 2000,
  },
)

sendEvents('opened-page')
sendEvents('clicked-button')
sendEvents('submitted-form') // Executes a batch of three items.
```

The returned function exposes no lifecycle methods and returns `void`.

### Class API

```ts
import { Batcher } from '@tanstack/pacer'

const eventBatcher = new Batcher<string>(
  (events) => {
    analytics.send(events)
  },
  {
    maxSize: 5,
    wait: 2000,
  },
)

eventBatcher.addItem('opened-page')
eventBatcher.addItem('clicked-button')

console.log(eventBatcher.peekAllItems())
```

### Results and errors

The synchronous batcher does not retain the wrapped function's return value or catch errors. It clears the current batch before invoking the function. If the function throws, those items are no longer queued.

Use [async batching](./pacer-docs-framework-vanilla-guides-async-batching-md-2ba792c7.md#source-pacer-docs-framework-vanilla-guides-async-batching-md) for Promise results, failed-item tracking, configurable error handling, retries, and abort support.

## Choosing batch triggers

### Batch size

`maxSize` executes the batch as soon as the number of collected items reaches the limit.

```ts
const batcher = new Batcher(processBatch, {
  maxSize: 100,
})
```

The default is `Infinity`, so a size trigger is disabled unless you provide one.

### Wait time

`wait` executes a batch after no new items arrive for the configured duration. Every added item restarts the timer.

```ts
const batcher = new Batcher(processBatch, {
  wait: 1000,
})
```

The default is `Infinity`, so a time trigger is disabled unless you provide one. A continuous stream of items can keep restarting the timer. Combine `wait` with `maxSize` when a batch must eventually run under continuous traffic.

### Custom trigger

`getShouldExecute` runs after each item is added. Return `true` to execute the current batch immediately.

```ts
const batcher = new Batcher<number>(processBatch, {
  getShouldExecute: (items) => items.includes(0),
})

batcher.addItem(4)
batcher.addItem(0) // Executes [4, 0].
```

If several triggers are configured, the first one reached executes the batch.

## Controlling collected items

This section is an exact duplicate. Read [Controlling collected items in Batching](./pacer-docs-framework-angular-guides-batching-md-7fcb9449.md).

## Configuring and observing batches

Use `setOptions()` to update future trigger behavior:

```ts
batcher.setOptions({
  maxSize: 20,
  wait: 500,
})
```

Changing `wait` does not reschedule an existing timer. The next `addItem()` call replaces that timer using the current value.

The `wait` option may be a function that receives the batcher instance:

```ts
const batcher = new Batcher(processBatch, {
  wait: (batcher) => (batcher.store.state.size > 10 ? 100 : 500),
})
```

Use `onItemsChange` to observe collection changes and `onExecute` to observe completed batch calls:

```ts
const batcher = new Batcher(processBatch, {
  maxSize: 10,
  onItemsChange: (batcher) => {
    console.log('Collected:', batcher.store.state.size)
  },
  onExecute: (items, batcher) => {
    console.log('Processed:', items)
    console.log('Batches:', batcher.store.state.executionCount)
  },
})
```

Do not use `started` to pause a batcher. It is currently a no-op, so every `addItem()` call evaluates the configured triggers.

## State

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers are not restored.

Commonly useful state includes:

- `items`: Items currently collected.
- `size`: Number of collected items.
- `isEmpty`: Whether the batch is empty.
- `isPending`: Whether a wait timer is active.
- `executionCount`: Completed batch executions.
- `totalItemsProcessed`: Items passed to completed batch executions.
- `status`: `'idle'` or `'pending'`.

See the [`Batcher` API reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/reference/classes/Batcher.md) for complete option and state types.
