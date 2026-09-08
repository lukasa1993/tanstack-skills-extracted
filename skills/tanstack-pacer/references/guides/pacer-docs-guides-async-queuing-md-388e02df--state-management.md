# Async Queuing — State Management

[Guide and prerequisites](./pacer-docs-guides-async-queuing-md-388e02df.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## State Management

The `AsyncQueuer` class uses TanStack Store for reactive state management, providing real-time access to queue state, processing statistics, and concurrent task tracking. All state is stored in a TanStack Store and can be accessed via `asyncQueuer.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `asyncQueuer.state` along with providing a selector callback as the 3rd argument to the `useAsyncQueuer` hook to opt-in to state tracking as shown below.

### State Selector (Framework Adapters)

Framework adapters support subscribing to state changes in two ways:

**1. Using `asyncQueuer.Subscribe` component (Recommended for component tree subscriptions)**

Use the `Subscribe` component to subscribe to state changes deep in your component tree without needing to pass a selector to the hook. This is ideal when you want to subscribe to state in child components.

```tsx
// Default behavior - no reactive state subscriptions at hook level
const asyncQueuer = useAsyncQueuer(processFn, { concurrency: 2, wait: 1000 })

// Subscribe to state changes deep in component tree using Subscribe component
<asyncQueuer.Subscribe selector={(state) => ({ activeItems: state.activeItems })}>
  {(state) => (
    <div>Active items: {state.activeItems.length}</div>
  )}
</asyncQueuer.Subscribe>
```

**2. Using the `selector` parameter (For hook-level subscriptions)**

The `selector` parameter allows you to specify which state changes will trigger reactive updates at the hook level, optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

**By default, `asyncQueuer.state` is empty (`{}`) as the selector is empty by default.** This is where the selected slice of TanStack Store state is exposed. You must opt-in to state tracking by providing a selector function.

```ts
// Default behavior - no reactive state subscriptions
const queue = useAsyncQueuer(processFn, { concurrency: 2, wait: 1000 })
console.log(queue.state) // {}

// Opt-in to re-render when activeItems changes
const queue = useAsyncQueuer(
  processFn,
  { concurrency: 2, wait: 1000 },
  (state) => ({ activeItems: state.activeItems })
)
console.log(queue.state.activeItems.length) // Reactive value

// Multiple state properties
const queue = useAsyncQueuer(
  processFn,
  { concurrency: 2, wait: 1000 },
  (state) => ({
    activeItems: state.activeItems,
    successCount: state.successCount,
    errorCount: state.errorCount
  })
)
```

### Initial State

You can provide initial state values when creating an async queuer:

```ts
const savedState = localStorage.getItem('async-queuer-state')
const initialState = savedState ? JSON.parse(savedState) : {}

const queue = new AsyncQueuer(processFn, {
  concurrency: 2,
  wait: 1000,
  initialState
})
```

### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const queue = new AsyncQueuer(processFn, { concurrency: 2, wait: 1000 })

// Subscribe to state changes
const unsubscribe = queue.store.subscribe((state) => {
  // do something with the state like persist it to localStorage
})

// Unsubscribe when done
unsubscribe()
```

> **Note:** Framework adapters already subscribe through `useSelector` (React/Preact/Solid) or `injectSelector` (Angular) from TanStack Store. To subscribe manually, use `useSelector(store, selector, { compare: shallow })` from `@tanstack/react-store` (or `@tanstack/preact-store` / `@tanstack/solid-store`; import `shallow` from the same package), or `injectSelector(store, selector)` from `@tanstack/angular-store`.

### Available State Properties

The `AsyncQueuerState` includes all properties from the core queuing guide plus:

- `activeItems`: Array of items currently being processed
- `addItemCount`: Number of times addItem has been called (for reduction calculations)
- `errorCount`: Number of function executions that have resulted in errors
- `expirationCount`: Number of items that have been removed from the queue due to expiration
- `isEmpty`: Whether the queuer has no items to process (items array is empty)
- `isFull`: Whether the queuer has reached its maximum capacity
- `isIdle`: Whether the queuer is not currently processing any items
- `isRunning`: Whether the queuer is active and will process items automatically
- `items`: Array of items currently waiting to be processed
- `itemTimestamps`: Timestamps when items were added to the queue for expiration tracking
- `lastResult`: The result from the most recent successful function execution
- `pendingTick`: Whether the queuer has a pending timeout for processing the next item
- `rejectionCount`: Number of items that have been rejected from being added to the queue
- `settledCount`: Number of function executions that have completed (either successfully or with errors)
- `size`: Number of items currently in the queue
- `status`: Current processing status ('idle' | 'running' | 'stopped')
- `successCount`: Number of function executions that have completed successfully

### Framework Adapters

Each framework adapter builds convenient hooks and functions around the async queuer classes. Hooks like `useAsyncQueuer` or `useAsyncQueuedState` are small wrappers that can cut down on the boilerplate needed in your own code for some common use cases.

---

For core queuing concepts and synchronous queuing, see the [Queuing Guide](./pacer-docs-guides-queuing-md-4661e110.md#source-pacer-docs-guides-queuing-md).
