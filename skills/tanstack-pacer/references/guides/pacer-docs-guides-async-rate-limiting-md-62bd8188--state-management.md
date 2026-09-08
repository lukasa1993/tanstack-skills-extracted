# Async Rate Limiting — State Management

[Guide and prerequisites](./pacer-docs-guides-async-rate-limiting-md-62bd8188.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## State Management

The `AsyncRateLimiter` class uses TanStack Store for reactive state management, providing real-time access to execution state, error tracking, and rejection statistics. All state is stored in a TanStack Store and can be accessed via `asyncLimiter.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `asyncLimiter.state` along with providing a selector callback as the 3rd argument to the `useAsyncRateLimiter` hook to opt-in to state tracking as shown below.

### State Selector (Framework Adapters)

Framework adapters support subscribing to state changes in two ways:

**1. Using `asyncRateLimiter.Subscribe` component (Recommended for component tree subscriptions)**

Use the `Subscribe` component to subscribe to state changes deep in your component tree without needing to pass a selector to the hook. This is ideal when you want to subscribe to state in child components.

```tsx
// Default behavior - no reactive state subscriptions at hook level
const asyncRateLimiter = useAsyncRateLimiter(asyncFn, { limit: 5, window: 1000 })

// Subscribe to state changes deep in component tree using Subscribe component
<asyncRateLimiter.Subscribe selector={(state) => ({ isExecuting: state.isExecuting })}>
  {(state) => (
    <div>{state.isExecuting ? 'Executing...' : 'Idle'}</div>
  )}
</asyncRateLimiter.Subscribe>
```

**2. Using the `selector` parameter (For hook-level subscriptions)**

The `selector` parameter allows you to specify which state changes will trigger reactive updates at the hook level, optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

**By default, `asyncRateLimiter.state` is empty (`{}`) as the selector is empty by default.** This is where the selected slice of TanStack Store state is exposed. You must opt-in to state tracking by providing a selector function.

```ts
// Default behavior - no reactive state subscriptions
const asyncLimiter = useAsyncRateLimiter(asyncFn, { limit: 5, window: 1000 })
console.log(asyncLimiter.state) // {}

// Opt-in to re-render when isExecuting changes
const asyncLimiter = useAsyncRateLimiter(
  asyncFn,
  { limit: 5, window: 1000 },
  (state) => ({ isExecuting: state.isExecuting })
)
console.log(asyncLimiter.state.isExecuting) // Reactive value

// Multiple state properties
const asyncLimiter = useAsyncRateLimiter(
  asyncFn,
  { limit: 5, window: 1000 },
  (state) => ({
    isExecuting: state.isExecuting,
    successCount: state.successCount,
    errorCount: state.errorCount
  })
)
```

### Initial State

You can provide initial state values when creating an async rate limiter:

```ts
const savedState = localStorage.getItem('async-rate-limiter-state')
const initialState = savedState ? JSON.parse(savedState) : {}

const asyncLimiter = new AsyncRateLimiter(asyncFn, {
  limit: 5,
  window: 1000,
  initialState
})
```

### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const asyncLimiter = new AsyncRateLimiter(asyncFn, { limit: 5, window: 1000 })

// Subscribe to state changes
const unsubscribe = asyncLimiter.store.subscribe((state) => {
  // do something with the state like persist it to localStorage
})

// Unsubscribe when done
unsubscribe()
```

> **Note:** Framework adapters already subscribe through `useSelector` (React/Preact/Solid) or `injectSelector` (Angular) from TanStack Store. To subscribe manually, use `useSelector(store, selector, { compare: shallow })` from `@tanstack/react-store` (or `@tanstack/preact-store` / `@tanstack/solid-store`; import `shallow` from the same package), or `injectSelector(store, selector)` from `@tanstack/angular-store`.

### Available State Properties

The `AsyncRateLimiterState` includes:

- `errorCount`: Number of function executions that have resulted in errors
- `executionTimes`: Array of timestamps when executions occurred for rate limiting calculations
- `isExecuting`: Whether the rate-limited function is currently executing asynchronously
- `lastResult`: The result from the most recent successful function execution
- `maybeExecuteCount`: Number of times `maybeExecute` has been called
- `rejectionCount`: Number of function executions that have been rejected due to rate limiting
- `settledCount`: Number of function executions that have completed (either successfully or with errors)
- `status`: Current execution status ('disabled' | 'exceeded' | 'idle')
- `successCount`: Number of function executions that have completed successfully

### Helper Methods

The async rate limiter provides helper methods that compute values based on the current state:

```ts
const asyncLimiter = new AsyncRateLimiter(asyncFn, { limit: 5, window: 1000 })

// These methods use the current state to compute values
console.log(asyncLimiter.getRemainingInWindow()) // Number of calls remaining in current window
console.log(asyncLimiter.getMsUntilNextWindow()) // Milliseconds until next window
```

These methods are computed values that use the current state and don't need to be accessed through the store.
