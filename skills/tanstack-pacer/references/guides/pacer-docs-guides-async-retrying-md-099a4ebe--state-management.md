# Async Retrying — State Management

[Guide and prerequisites](./pacer-docs-guides-async-retrying-md-099a4ebe.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## State Management

The `AsyncRetryer` class uses TanStack Store for reactive state management, providing real-time access to execution state, error tracking, and retry statistics. All state is stored in a TanStack Store and can be accessed via `asyncRetryer.store.state`. Framework adapters provide their own state management patterns for reactive updates.

### State Selector (Framework Adapters)

Framework adapters support a `selector` argument that allows you to specify which state changes will trigger re-renders. This optimizes performance by preventing unnecessary re-renders when irrelevant state changes occur.

**By default, `retryer.state` is empty (`{}`) as the selector is empty by default.** This is where the selected slice of TanStack Store state is exposed. You must opt-in to state tracking by providing a selector function.

```tsx
// Example with framework adapter (conceptual)
// Framework adapters provide their own hooks and state management patterns
// Check the specific framework adapter documentation for exact usage
```

### Initial State

You can provide initial state values when creating an async retryer. This is commonly used to restore state from persistent storage:

```ts
// Load initial state from localStorage
const savedState = localStorage.getItem('async-retryer-state')
const initialState = savedState ? JSON.parse(savedState) : {}

const retryer = new AsyncRetryer(asyncFn, {
  maxAttempts: 3,
  initialState
})
```

### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const retryer = new AsyncRetryer(asyncFn, { maxAttempts: 3 })

// Subscribe to state changes
const unsubscribe = retryer.store.subscribe((state) => {
  // do something with the state like persist it to localStorage
  localStorage.setItem('async-retryer-state', JSON.stringify(state))
})

// Unsubscribe when done
unsubscribe()
```

> **Note:** Framework adapters already subscribe through `useSelector` (React/Preact/Solid) or `injectSelector` (Angular) from TanStack Store. To subscribe manually, use `useSelector(store, selector, { compare: shallow })` from `@tanstack/react-store` (or `@tanstack/preact-store` / `@tanstack/solid-store`; import `shallow` from the same package), or `injectSelector(store, selector)` from `@tanstack/angular-store`.

### Available State Properties

The `AsyncRetryerState` includes:

- `currentAttempt`: The current retry attempt number (0 when not executing)
- `executionCount`: Total number of completed executions (successful or failed)
- `isExecuting`: Whether the retryer is currently executing the function
- `lastError`: The most recent error encountered during execution
- `lastExecutionTime`: Timestamp of the last execution completion in milliseconds
- `lastResult`: The result from the most recent successful execution
- `status`: Current execution status ('disabled' | 'idle' | 'executing' | 'retrying')
- `totalExecutionTime`: Total time spent executing (including retries) in milliseconds

### Status Values

The `status` property indicates the current state of the retryer:

- `'disabled'`: The retryer is disabled (via `enabled: false`)
- `'idle'`: Ready to execute, not currently running
- `'executing'`: Currently executing the first attempt
- `'retrying'`: Currently executing a retry attempt (attempt > 1)
