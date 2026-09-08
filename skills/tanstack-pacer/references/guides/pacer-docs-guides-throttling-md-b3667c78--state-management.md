# Throttling — State Management

[Guide and prerequisites](./pacer-docs-guides-throttling-md-b3667c78.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## State Management

The `Throttler` class uses TanStack Store for reactive state management, providing real-time access to execution state and timing information. All state is stored in a TanStack Store and can be accessed via `throttler.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `throttler.state` along with providing a selector callback as the 3rd argument to the `useThrottler` hook to opt-in to state tracking as shown below.

### State Selector (Framework Adapters)

Framework adapters support subscribing to state changes in two ways:

**1. Using `throttler.Subscribe` component (Recommended for component tree subscriptions)**

Use the `Subscribe` component to subscribe to state changes deep in your component tree without needing to pass a selector to the hook. This is ideal when you want to subscribe to state in child components.

```tsx
// Default behavior - no reactive state subscriptions at hook level
const throttler = useThrottler(fn, { wait: 200 })

// Subscribe to state changes deep in component tree using Subscribe component
<throttler.Subscribe selector={(state) => ({ isPending: state.isPending })}>
  {(state) => (
    <div>{state.isPending ? 'Waiting...' : 'Ready'}</div>
  )}
</throttler.Subscribe>
```

**2. Using the `selector` parameter (For hook-level subscriptions)**

The `selector` parameter allows you to specify which state changes will trigger reactive updates at the hook level, optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

**By default, `throttler.state` is empty (`{}`) as the selector is empty by default.** This is where the selected slice of TanStack Store state is exposed. You must opt-in to state tracking by providing a selector function.

```ts
// Default behavior - no reactive state subscriptions
const throttler = useThrottler(fn, { wait: 200 })
console.log(throttler.state) // {}

// Opt-in to re-render when isPending changes
const throttler = useThrottler(
  fn,
  { wait: 200 },
  (state) => ({ isPending: state.isPending })
)
console.log(throttler.state.isPending) // Reactive value

// Multiple state properties
const throttler = useThrottler(
  fn,
  { wait: 200 },
  (state) => ({
    isPending: state.isPending,
    executionCount: state.executionCount,
    status: state.status
  })
)
```

### Initial State

You can provide initial state values when creating a throttler. This is commonly used to restore state from persistent storage:

```ts
// Load initial state from localStorage
const savedState = localStorage.getItem('throttler-state')
const initialState = savedState ? JSON.parse(savedState) : {}

const throttler = new Throttler(fn, {
  wait: 200,
  initialState
})
```

### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const throttler = new Throttler(fn, { wait: 200 })

// Subscribe to state changes
const unsubscribe = throttler.store.subscribe((state) => {
  // do something with the state like persist it to localStorage
})

// Unsubscribe when done
unsubscribe()
```

> **Note:** Framework adapters already subscribe through `useSelector` (React/Preact/Solid) or `injectSelector` (Angular) from TanStack Store. To subscribe manually, use `useSelector(store, selector, { compare: shallow })` from `@tanstack/react-store` (or `@tanstack/preact-store` / `@tanstack/solid-store`; import `shallow` from the same package), or `injectSelector(store, selector)` from `@tanstack/angular-store`.

### Available State Properties

The `ThrottlerState` includes:

- `executionCount`: Number of function executions that have been completed
- `isPending`: Whether the throttler is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to `maybeExecute`
- `lastExecutionTime`: Timestamp of the last function execution in milliseconds
- `maybeExecuteCount`: Number of times `maybeExecute` has been called
- `nextExecutionTime`: Timestamp when the next execution can occur in milliseconds
- `status`: Current execution status ('disabled' | 'idle' | 'pending')
