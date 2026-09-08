# Debouncing — State Management

[Guide and prerequisites](./pacer-docs-guides-debouncing-md-2946516b.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## State Management

The `Debouncer` class uses TanStack Store for reactive state management, providing real-time access to execution state and statistics. All state is stored in a TanStack Store and can be accessed via `debouncer.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `debouncer.state` along with providing a selector callback as the 3rd argument to the `useDebouncer` hook to opt-in to state tracking as shown below.

### State Selector (Framework Adapters)

Framework adapters support subscribing to state changes in two ways:

**1. Using `debouncer.Subscribe` component (Recommended for component tree subscriptions)**

Use the `Subscribe` component to subscribe to state changes deep in your component tree without needing to pass a selector to the hook. This is ideal when you want to subscribe to state in child components.

```tsx
// Default behavior - no reactive state subscriptions at hook level
const debouncer = useDebouncer(fn, { wait: 500 })

// Subscribe to state changes deep in component tree using Subscribe component
<debouncer.Subscribe selector={(state) => ({ isPending: state.isPending })}>
  {(state) => (
    <div>{state.isPending ? 'Waiting...' : 'Ready'}</div>
  )}
</debouncer.Subscribe>
```

**2. Using the `selector` parameter (For hook-level subscriptions)**

The `selector` parameter allows you to specify which state changes will trigger reactive updates at the hook level, optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

**By default, `debouncer.state` is empty (`{}`) as the selector is empty by default.** This is where the selected slice of TanStack Store state is exposed. You must opt-in to state tracking by providing a selector function.

```ts
// Default behavior - no reactive state subscriptions
const debouncer = useDebouncer(fn, { wait: 500 })
console.log(debouncer.state) // {}

// Opt-in to re-render when isPending changes
const debouncer = useDebouncer(
  fn,
  { wait: 500 },
  (state) => ({ isPending: state.isPending })
)
console.log(debouncer.state.isPending) // Reactive value

// Multiple state properties
const debouncer = useDebouncer(
  fn,
  { wait: 500 },
  (state) => ({
    isPending: state.isPending,
    executionCount: state.executionCount,
    status: state.status
  })
)
```

### Initial State

You can provide initial state values when creating a debouncer. This is commonly used to restore state from persistent storage:

```ts
// Load initial state from localStorage
const savedState = localStorage.getItem('debouncer-state')
const initialState = savedState ? JSON.parse(savedState) : {}

const debouncer = new Debouncer(fn, {
  wait: 500,
  key: 'search-debouncer',
  initialState
})
```

### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const debouncer = new Debouncer(fn, { wait: 500 })

// Subscribe to state changes
const unsubscribe = debouncer.store.subscribe((state) => {
  // do something with the state like persist it to localStorage
})

// Unsubscribe when done
unsubscribe()
```

> **Note:** Framework adapters already subscribe through `useSelector` (React/Preact/Solid) or `injectSelector` (Angular) from TanStack Store. To subscribe manually, use `useSelector(store, selector, { compare: shallow })` from `@tanstack/react-store` (or `@tanstack/preact-store` / `@tanstack/solid-store`; import `shallow` from the same package), or `injectSelector(store, selector)` from `@tanstack/angular-store`.

### Available State Properties

The `DebouncerState` includes:

- `canLeadingExecute`: Whether the debouncer can execute on the leading edge of the timeout
- `executionCount`: Number of function executions that have been completed
- `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to `maybeExecute`
- `maybeExecuteCount`: Number of times `maybeExecute` has been called
- `status`: Current execution status ('disabled' | 'idle' | 'pending')
