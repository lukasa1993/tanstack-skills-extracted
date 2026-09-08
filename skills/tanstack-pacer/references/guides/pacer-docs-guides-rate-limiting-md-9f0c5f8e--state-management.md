# Rate Limiting — State Management

[Guide and prerequisites](./pacer-docs-guides-rate-limiting-md-9f0c5f8e.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## State Management

The `RateLimiter` class uses TanStack Store for reactive state management, providing real-time access to execution state, error tracking, and rejection statistics. All state is stored in a TanStack Store and can be accessed via `limiter.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `limiter.state` along with providing a selector callback as the 3rd argument to the `useRateLimiter` hook to opt-in to state tracking as shown below.

### State Selector (Framework Adapters)

Framework adapters support subscribing to state changes in two ways:

**1. Using `rateLimiter.Subscribe` component (Recommended for component tree subscriptions)**

Use the `Subscribe` component to subscribe to state changes deep in your component tree without needing to pass a selector to the hook. This is ideal when you want to subscribe to state in child components.

```tsx
// Default behavior - no reactive state subscriptions at hook level
const rateLimiter = useRateLimiter(fn, { limit: 5, window: 1000 })

// Subscribe to state changes deep in component tree using Subscribe component
<rateLimiter.Subscribe selector={(state) => ({ rejectionCount: state.rejectionCount })}>
  {(state) => (
    <div>Rejections: {state.rejectionCount}</div>
  )}
</rateLimiter.Subscribe>
```

**2. Using the `selector` parameter (For hook-level subscriptions)**

The `selector` parameter allows you to specify which state changes will trigger reactive updates at the hook level, optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

**By default, `rateLimiter.state` is empty (`{}`) as the selector is empty by default.** This is where the selected slice of TanStack Store state is exposed. You must opt-in to state tracking by providing a selector function.

```ts
// Default behavior - no reactive state subscriptions
const limiter = useRateLimiter(fn, { limit: 5, window: 1000 })
console.log(limiter.state) // {}

// Opt-in to re-render when rejectionCount changes
const limiter = useRateLimiter(
  fn,
  { limit: 5, window: 1000 },
  (state) => ({ rejectionCount: state.rejectionCount })
)
console.log(limiter.state.rejectionCount) // Reactive value

// Multiple state properties
const limiter = useRateLimiter(
  fn,
  { limit: 5, window: 1000 },
  (state) => ({
    executionCount: state.executionCount,
    rejectionCount: state.rejectionCount,
    status: state.status
  })
)
```

### Initial State

You can provide initial state values when creating a rate limiter. This is commonly used to restore state from persistent storage:

```ts
// Load initial state from localStorage
const savedState = localStorage.getItem('rate-limiter-state')
const initialState = savedState ? JSON.parse(savedState) : {}

const limiter = new RateLimiter(fn, {
  limit: 5,
  window: 1000,
  initialState
})
```

### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const limiter = new RateLimiter(fn, { limit: 5, window: 1000 })

// Subscribe to state changes
const unsubscribe = limiter.store.subscribe((state) => {
  // do something with the state like persist it to localStorage
})

// Unsubscribe when done
unsubscribe()
```

> **Note:** Framework adapters already subscribe through `useSelector` (React/Preact/Solid) or `injectSelector` (Angular) from TanStack Store. To subscribe manually, use `useSelector(store, selector, { compare: shallow })` from `@tanstack/react-store` (or `@tanstack/preact-store` / `@tanstack/solid-store`; import `shallow` from the same package), or `injectSelector(store, selector)` from `@tanstack/angular-store`.

### Available State Properties

The `RateLimiterState` includes:

- `executionCount`: Number of function executions that have been completed
- `executionTimes`: Array of timestamps when executions occurred for rate limiting calculations
- `isExceeded`: Whether the rate limiter has exceeded the limit
- `maybeExecuteCount`: Number of times `maybeExecute` has been called
- `rejectionCount`: Number of function executions that have been rejected due to rate limiting
- `status`: Current execution status ('disabled' | 'exceeded' | 'idle')

### Helper Methods

The rate limiter provides helper methods that compute values based on the current state:

```ts
const limiter = new RateLimiter(fn, { limit: 5, window: 1000 })

// These methods use the current state to compute values
console.log(limiter.getRemainingInWindow()) // Number of calls remaining in current window
console.log(limiter.getMsUntilNextWindow()) // Milliseconds until next window
```

These methods are computed values that use the current state and don't need to be accessed through the store.
