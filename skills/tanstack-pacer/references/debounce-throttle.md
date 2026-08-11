# Debounce and throttle

Synchronous and asynchronous debounce/throttle.

<a id="source-pacer-docs-guides-async-debouncing-md"></a>

## Async Debouncing

Source: `pacer:docs/guides/async-debouncing.md`.

All core concepts from the [Debouncing Guide](./debounce-throttle.md#source-pacer-docs-guides-debouncing-md) apply to async debouncing as well.

### When to Use Async Debouncing

You can usually just use the normal synchronous debouncer and it will work with async functions, but for advanced use cases, such as wanting to use the return value of a debounced function (instead of just calling a setState side effect), or putting your error handling logic in the debouncer, you can use the async debouncer.

### Async Debouncing in TanStack Pacer

TanStack Pacer provides async debouncing through the `AsyncDebouncer` class and the `asyncDebounce` function.

#### Basic Usage Example

Here's a basic example showing how to use the async debouncer for a search operation:

```ts
const debouncedSearch = asyncDebounce(
  async (searchTerm: string) => {
    const results = await fetchSearchResults(searchTerm)
    return results
  },
  {
    wait: 500,
    onSuccess: (results, args, debouncer) => {
      console.log('Search succeeded:', results)
      console.log('Search arguments:', args)
    },
      onError: (error, args, debouncer) => {
    console.error('Search failed:', error)
    console.log('Failed arguments:', args)
  }
  }
)

// Usage
try {
  const results = await debouncedSearch('query')
  // Handle successful results
} catch (error) {
  // Handle errors if no onError handler was provided
  console.error('Search failed:', error)
}
```

> **Note:** When using React, prefer `useAsyncDebouncedCallback` hook over the `asyncDebounce` function for better integration with React's lifecycle and automatic cleanup.

### Key Differences from Synchronous Debouncing

#### 1. Return Value Handling

Unlike the synchronous debouncer which returns void, the async version allows you to capture and use the return value from your debounced function. The `maybeExecute` method returns a Promise that resolves with the function's return value, allowing you to await the result and handle it appropriately.

#### 2. Error Handling

The async debouncer provides robust error handling capabilities:
- If your debounced function throws an error and no `onError` handler is provided, the error will be thrown and propagate up to the caller
- If you provide an `onError` handler, errors will be caught and passed to the handler instead of being thrown
- The `throwOnError` option can be used to control error throwing behavior:
  - When true (default if no onError handler), errors will be thrown
  - When false (default if onError handler provided), errors will be swallowed
  - Can be explicitly set to override these defaults
- You can track error counts using `debouncer.store.state.errorCount` and check execution state with `debouncer.store.state.isExecuting`
- The debouncer maintains its state and can continue to be used after an error occurs

#### 3. Different Callbacks

The `AsyncDebouncer` supports the following callbacks:
- `onSuccess`: Called after each successful execution, providing the result, the arguments that were executed, and debouncer instance
- `onSettled`: Called after each execution (success or failure), providing the arguments that were executed and debouncer instance
- `onError`: Called if the async function throws an error, providing the error, the arguments that caused the error, and the debouncer instance

Example:

```ts
const asyncDebouncer = new AsyncDebouncer(async (value) => {
  await saveToAPI(value)
}, {
  wait: 500,
  onSuccess: (result, args, debouncer) => {
    // Called after each successful execution
    console.log('Async function executed', debouncer.store.state.successCount)
    console.log('Executed arguments:', args)
  },
  onSettled: (args, debouncer) => {
    // Called after each execution attempt
    console.log('Async function settled', debouncer.store.state.settleCount)
    console.log('Settled arguments:', args)
  },
  onError: (error) => {
    // Called if the async function throws an error
    console.error('Async function failed:', error)
  }
})
```

#### 4. Sequential Execution

Since the debouncer's `maybeExecute` method returns a Promise, you can choose to await each execution before starting the next one. This gives you control over the execution order and ensures each call processes the most up-to-date data. This is particularly useful when dealing with operations that depend on the results of previous calls or when maintaining data consistency is critical.

For example, if you're updating a user's profile and then immediately fetching their updated data, you can await the update operation before starting the fetch.

### Advanced Features: Retry and Abort Support

The async debouncer includes built-in retry and abort capabilities through integration with `AsyncRetryer`. These features help handle transient failures and provide control over in-flight operations.

#### Retry Support

Configure automatic retries for failed debounced function executions using the `asyncRetryerOptions`:

```ts
const debouncedSave = asyncDebounce(
  async (data: string) => {
    // This might fail due to network issues
    await api.save(data)
  },
  {
    wait: 500,
    asyncRetryerOptions: {
      maxAttempts: 3,
      backoff: 'exponential',
      baseWait: 1000,
      maxWait: 10000,
      jitter: 0.3
    }
  }
)
```

For complete documentation on retry strategies, backoff algorithms, jitter, and advanced retry patterns, see the [Async Retrying Guide](./async-retry.md#source-pacer-docs-guides-async-retrying-md).

#### Abort Support

Cancel in-flight debounced executions using the abort functionality:

```ts
const debouncer = new AsyncDebouncer(
  async (searchTerm: string) => {
    // Access the abort signal for this execution
    const signal = debouncer.getAbortSignal()
    if (signal) {
      const response = await fetch(`/api/search?q=${searchTerm}`, { signal })
      return response.json()
    }
  },
  { wait: 300 }
)

// Start a search
debouncer.maybeExecute('query')

// Later, abort any in-flight execution
debouncer.abort()
```

The abort functionality:
- Cancels all ongoing debounced executions using AbortController
- Does NOT cancel pending executions that haven't started yet (use `cancel()` for that)
- Can be used alongside retry support

Abort only cancels underlying operations (e.g. `fetch`) when you pass the signal from `getAbortSignal()` to them. If your debounced function does not attach the signal, abort clears internal state but the async work continues until it completes.

For more details on abort patterns and integration with fetch/axios, see the [Async Retrying Guide](./async-retry.md#source-pacer-docs-guides-async-retrying-md).

#### Sharing Options Between Instances

Use `asyncDebouncerOptions` to share common options between different `AsyncDebouncer` instances:

```ts
import { asyncDebouncerOptions, AsyncDebouncer } from '@tanstack/pacer'

const sharedOptions = asyncDebouncerOptions({
  wait: 500,
  leading: false,
  trailing: true,
  onSuccess: (result, args, debouncer) => console.log('Success')
})

const debouncer1 = new AsyncDebouncer(fn1, { ...sharedOptions, key: 'debouncer1' })
const debouncer2 = new AsyncDebouncer(fn2, { ...sharedOptions, onError: (error) => console.error('Error') })
```

### Dynamic Options and Enabling/Disabling

Just like the synchronous debouncer, the async debouncer supports dynamic options for `wait` and `enabled`, which can be functions that receive the debouncer instance. This allows for sophisticated, runtime-adaptive debouncing behavior.

#### Flushing Pending Executions

The async debouncer supports flushing pending executions to trigger them immediately:

```ts
const asyncDebouncer = new AsyncDebouncer(asyncFn, { wait: 1000 })

asyncDebouncer.maybeExecute('some-arg')
console.log(asyncDebouncer.store.state.isPending) // true

// Flush immediately instead of waiting
asyncDebouncer.flush()
console.log(asyncDebouncer.store.state.isPending) // false
```

#### Customizing Unmount Behavior

Framework hooks cancel any pending execution and abort any in-flight execution by default when a component unmounts. The automatic abort only cancels underlying operations (e.g. fetch) when the abort signal from `getAbortSignal()` is passed to them. Use the `onUnmount` option to flush instead of canceling.

```tsx
const debouncer = useAsyncDebouncer(fn, {
  wait: 500,
  onUnmount: (d) => d.flush(),
})
```

> **Warning:** For async utils, `flush()` returns a Promise and runs fire-and-forget in the cleanup. If your debounced function updates React/Preact state or Solid signals, those updates may run after the component has unmounted, which can cause "setState on unmounted component" warnings or unexpected reactive updates. Guard your callbacks accordingly.

### State Management

The `AsyncDebouncer` class uses TanStack Store for reactive state management, providing real-time access to execution state, error tracking, and execution statistics. All state is stored in a TanStack Store and can be accessed via `asyncDebouncer.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `asyncDebouncer.state` along with providing a selector callback as the 3rd argument to the `useAsyncDebouncer` hook to opt-in to state tracking as shown below.

#### State Selector (Framework Adapters)

Framework adapters support subscribing to state changes in two ways:

**1. Using `asyncDebouncer.Subscribe` component (Recommended for component tree subscriptions)**

Use the `Subscribe` component to subscribe to state changes deep in your component tree without needing to pass a selector to the hook. This is ideal when you want to subscribe to state in child components.

```tsx
// Default behavior - no reactive state subscriptions at hook level
const asyncDebouncer = useAsyncDebouncer(asyncFn, { wait: 500 })

// Subscribe to state changes deep in component tree using Subscribe component
<asyncDebouncer.Subscribe selector={(state) => ({ isExecuting: state.isExecuting })}>
  {(state) => (
    <div>{state.isExecuting ? 'Executing...' : 'Idle'}</div>
  )}
</asyncDebouncer.Subscribe>
```

**2. Using the `selector` parameter (For hook-level subscriptions)**

The `selector` parameter allows you to specify which state changes will trigger reactive updates at the hook level, optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

**By default, `asyncDebouncer.state` is empty (`{}`) as the selector is empty by default.** This is where the selected slice of TanStack Store state is exposed. You must opt-in to state tracking by providing a selector function.

```ts
// Default behavior - no reactive state subscriptions
const asyncDebouncer = useAsyncDebouncer(asyncFn, { wait: 500 })
console.log(asyncDebouncer.state) // {}

// Opt-in to re-render when isExecuting changes
const asyncDebouncer = useAsyncDebouncer(
  asyncFn,
  { wait: 500 },
  (state) => ({ isExecuting: state.isExecuting })
)
console.log(asyncDebouncer.state.isExecuting) // Reactive value

// Multiple state properties
const asyncDebouncer = useAsyncDebouncer(
  asyncFn,
  { wait: 500 },
  (state) => ({
    isExecuting: state.isExecuting,
    successCount: state.successCount,
    errorCount: state.errorCount
  })
)
```

#### Initial State

You can provide initial state values when creating an async debouncer. This is commonly used to restore state from persistent storage:

```ts
// Load initial state from localStorage
const savedState = localStorage.getItem('async-debouncer-state')
const initialState = savedState ? JSON.parse(savedState) : {}

const asyncDebouncer = new AsyncDebouncer(asyncFn, {
  wait: 500,
  initialState
})
```

#### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const asyncDebouncer = new AsyncDebouncer(asyncFn, { wait: 500 })

// Subscribe to state changes
const unsubscribe = asyncDebouncer.store.subscribe((state) => {
  // do something with the state like persist it to localStorage
})

// Unsubscribe when done
unsubscribe()
```

> **Note:** Framework adapters already subscribe through `useSelector` (React/Preact/Solid) or `injectSelector` (Angular) from TanStack Store. To subscribe manually, use `useSelector(store, selector, { compare: shallow })` from `@tanstack/react-store` (or `@tanstack/preact-store` / `@tanstack/solid-store`; import `shallow` from the same package), or `injectSelector(store, selector)` from `@tanstack/angular-store`.

#### Available State Properties

The `AsyncDebouncerState` includes:

- `canLeadingExecute`: Whether the debouncer can execute on the leading edge of the timeout
- `errorCount`: Number of function executions that have resulted in errors
- `isExecuting`: Whether the debounced function is currently executing asynchronously
- `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to `maybeExecute`
- `lastResult`: The result from the most recent successful function execution
- `maybeExecuteCount`: Number of times `maybeExecute` has been called
- `settleCount`: Number of function executions that have completed (either successfully or with errors)
- `status`: Current execution status ('disabled' | 'idle' | 'pending' | 'executing' | 'settled')
- `successCount`: Number of function executions that have completed successfully

### Framework Adapters

Each framework adapter provides hooks that build on top of the core async debouncing functionality to integrate with the framework's state management system. Hooks like `createAsyncDebouncer`, `useAsyncDebouncedCallback`, or similar are available for each framework.

---

For core debouncing concepts and synchronous debouncing, see the [Debouncing Guide](./debounce-throttle.md#source-pacer-docs-guides-debouncing-md).

<a id="source-pacer-docs-guides-async-throttling-md"></a>

## Async Throttling

Source: `pacer:docs/guides/async-throttling.md`.

All core concepts from the [Throttling Guide](./debounce-throttle.md#source-pacer-docs-guides-throttling-md) apply to async throttling as well.

### When to Use Async Throttling

You can usually just use the normal synchronous throttler and it will work with async functions, but for advanced use cases, such as wanting to use the return value of a throttled function (instead of just calling a setState side effect), or putting your error handling logic in the throttler, you can use the async throttler.

### Async Throttling in TanStack Pacer

TanStack Pacer provides async throttling through the `AsyncThrottler` class and the `asyncThrottle` function.

#### Basic Usage Example

Here's a basic example showing how to use the async throttler for a search operation:

```ts
const throttledSearch = asyncThrottle(
  async (searchTerm: string) => {
    const results = await fetchSearchResults(searchTerm)
    return results
  },
  {
    wait: 500,
    onSuccess: (results, args, throttler) => {
      console.log('Search succeeded:', results)
      console.log('Search arguments:', args)
    },
    onError: (error, args, throttler) => {
      console.error('Search failed:', error)
      console.log('Failed arguments:', args)
    }
  }
)

// Usage
try {
  const results = await throttledSearch('query')
  // Handle successful results
} catch (error) {
  // Handle errors if no onError handler was provided
  console.error('Search failed:', error)
}
```

> **Note:** When using React, prefer `useAsyncThrottledCallback` hook over the `asyncThrottle` function for better integration with React's lifecycle and automatic cleanup.

### Key Differences from Synchronous Throttling

#### 1. Return Value Handling

Unlike the synchronous throttler which returns void, the async version allows you to capture and use the return value from your throttled function. The `maybeExecute` method returns a Promise that resolves with the function's return value, allowing you to await the result and handle it appropriately.

#### 2. Error Handling

The async throttler provides robust error handling capabilities:
- If your throttled function throws an error and no `onError` handler is provided, the error will be thrown and propagate up to the caller
- If you provide an `onError` handler, errors will be caught and passed to the handler instead of being thrown
- The `throwOnError` option can be used to control error throwing behavior:
  - When true (default if no onError handler), errors will be thrown
  - When false (default if onError handler provided), errors will be swallowed
  - Can be explicitly set to override these defaults
- You can track error counts using `throttler.store.state.errorCount` and check execution state with `throttler.store.state.isExecuting`
- The throttler maintains its state and can continue to be used after an error occurs

#### 3. Different Callbacks

The `AsyncThrottler` supports the following callbacks:
- `onSuccess`: Called after each successful execution, providing the result, the arguments that were executed, and throttler instance
- `onSettled`: Called after each execution (success or failure), providing the arguments that were executed and throttler instance
- `onError`: Called if the async function throws an error, providing the error, the arguments that caused the error, and the throttler instance

Example:

```ts
const asyncThrottler = new AsyncThrottler(async (value) => {
  await saveToAPI(value)
}, {
  wait: 500,
  onSuccess: (result, args, throttler) => {
    // Called after each successful execution
    console.log('Async function executed', throttler.store.state.successCount)
    console.log('Executed arguments:', args)
  },
  onSettled: (args, throttler) => {
    // Called after each execution attempt
    console.log('Async function settled', throttler.store.state.settleCount)
    console.log('Settled arguments:', args)
  },
  onError: (error, args, throttler) => {
    // Called if the async function throws an error
    console.error('Async function failed:', error)
    console.log('Failed arguments:', args)
  }
})
```

#### 4. Sequential Execution

Since the throttler's `maybeExecute` method returns a Promise, you can choose to await each execution before starting the next one. This gives you control over the execution order and ensures each call processes the most up-to-date data. This is particularly useful when dealing with operations that depend on the results of previous calls or when maintaining data consistency is critical.

For example, if you're updating a user's profile and then immediately fetching their updated data, you can await the update operation before starting the fetch.

### Advanced Features: Retry and Abort Support

The async throttler includes built-in retry and abort capabilities through integration with `AsyncRetryer`. These features help handle transient failures and provide control over in-flight operations.

#### Retry Support

Configure automatic retries for failed throttled function executions using the `asyncRetryerOptions`:

```ts
const throttledSave = asyncThrottle(
  async (data: string) => {
    // This might fail due to network issues
    await api.save(data)
  },
  {
    wait: 1000,
    asyncRetryerOptions: {
      maxAttempts: 3,
      backoff: 'exponential',
      baseWait: 1000,
      maxWait: 10000,
      jitter: 0.3
    }
  }
)
```

For complete documentation on retry strategies, backoff algorithms, jitter, and advanced retry patterns, see the [Async Retrying Guide](./async-retry.md#source-pacer-docs-guides-async-retrying-md).

#### Abort Support

Cancel in-flight throttled executions using the abort functionality:

```ts
const throttler = new AsyncThrottler(
  async (data: string) => {
    // Access the abort signal for this execution
    const signal = throttler.getAbortSignal()
    if (signal) {
      const response = await fetch('/api/save', {
        method: 'POST',
        body: data,
        signal
      })
      return response.json()
    }
  },
  { wait: 1000 }
)

// Start an operation
throttler.maybeExecute('data')

// Later, abort any in-flight execution
throttler.abort()
```

The abort functionality:
- Cancels all ongoing throttled executions using AbortController
- Does NOT cancel pending executions that haven't started yet (use `cancel()` for that)
- Can be used alongside retry support

Abort only cancels underlying operations (e.g. `fetch`) when you pass the signal from `getAbortSignal()` to them. If your throttled function does not attach the signal, abort clears internal state but the async work continues until it completes.

For more details on abort patterns and integration with fetch/axios, see the [Async Retrying Guide](./async-retry.md#source-pacer-docs-guides-async-retrying-md).

#### Sharing Options Between Instances

Use `asyncThrottlerOptions` to share common options between different `AsyncThrottler` instances:

```ts
import { asyncThrottlerOptions, AsyncThrottler } from '@tanstack/pacer'

const sharedOptions = asyncThrottlerOptions({
  wait: 500,
  leading: true,
  trailing: true,
  onSuccess: (result, args, throttler) => console.log('Success')
})

const throttler1 = new AsyncThrottler(fn1, { ...sharedOptions, key: 'throttler1' })
const throttler2 = new AsyncThrottler(fn2, { ...sharedOptions, wait: 1000 })
```

### Dynamic Options and Enabling/Disabling

Just like the synchronous throttler, the async throttler supports dynamic options for `wait` and `enabled`, which can be functions that receive the throttler instance. This allows for sophisticated, runtime-adaptive throttling behavior.

#### Flushing Pending Executions

The async throttler supports flushing pending executions to trigger them immediately:

```ts
const asyncThrottler = new AsyncThrottler(asyncFn, { wait: 1000 })

asyncThrottler.maybeExecute('some-arg')
console.log(asyncThrottler.store.state.isPending) // true

// Flush immediately instead of waiting
asyncThrottler.flush()
console.log(asyncThrottler.store.state.isPending) // false
```

#### Customizing Unmount Behavior

Framework hooks cancel any pending execution and abort any in-flight execution by default when a component unmounts. The automatic abort only cancels underlying operations (e.g. fetch) when the abort signal from `getAbortSignal()` is passed to them. Use the `onUnmount` option to flush instead of canceling.

```tsx
const throttler = useAsyncThrottler(fn, {
  wait: 500,
  onUnmount: (t) => t.flush(),
})
```

> **Warning:** For async utils, `flush()` returns a Promise and runs fire-and-forget in the cleanup. If your throttled function updates React/Preact state or Solid signals, those updates may run after the component has unmounted, which can cause "setState on unmounted component" warnings or unexpected reactive updates. Guard your callbacks accordingly.

### State Management

The `AsyncThrottler` class uses TanStack Store for reactive state management, providing real-time access to execution state, error tracking, and timing information. All state is stored in a TanStack Store and can be accessed via `asyncThrottler.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `asyncThrottler.state` along with providing a selector callback as the 3rd argument to the `useAsyncThrottler` hook to opt-in to state tracking as shown below.

#### State Selector (Framework Adapters)

Framework adapters support subscribing to state changes in two ways:

**1. Using `asyncThrottler.Subscribe` component (Recommended for component tree subscriptions)**

Use the `Subscribe` component to subscribe to state changes deep in your component tree without needing to pass a selector to the hook. This is ideal when you want to subscribe to state in child components.

```tsx
// Default behavior - no reactive state subscriptions at hook level
const asyncThrottler = useAsyncThrottler(asyncFn, { wait: 500 })

// Subscribe to state changes deep in component tree using Subscribe component
<asyncThrottler.Subscribe selector={(state) => ({ isExecuting: state.isExecuting })}>
  {(state) => (
    <div>{state.isExecuting ? 'Executing...' : 'Idle'}</div>
  )}
</asyncThrottler.Subscribe>
```

**2. Using the `selector` parameter (For hook-level subscriptions)**

The `selector` parameter allows you to specify which state changes will trigger reactive updates at the hook level, optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

**By default, `asyncThrottler.state` is empty (`{}`) as the selector is empty by default.** This is where the selected slice of TanStack Store state is exposed. You must opt-in to state tracking by providing a selector function.

```ts
// Default behavior - no reactive state subscriptions
const asyncThrottler = useAsyncThrottler(asyncFn, { wait: 500 })
console.log(asyncThrottler.state) // {}

// Opt-in to re-render when isExecuting changes
const asyncThrottler = useAsyncThrottler(
  asyncFn,
  { wait: 500 },
  (state) => ({ isExecuting: state.isExecuting })
)
console.log(asyncThrottler.state.isExecuting) // Reactive value

// Multiple state properties
const asyncThrottler = useAsyncThrottler(
  asyncFn,
  { wait: 500 },
  (state) => ({
    isExecuting: state.isExecuting,
    successCount: state.successCount,
    errorCount: state.errorCount
  })
)
```

#### Initial State

You can provide initial state values when creating an async throttler. This is commonly used to restore state from persistent storage:

```ts
// Load initial state from localStorage
const savedState = localStorage.getItem('async-throttler-state')
const initialState = savedState ? JSON.parse(savedState) : {}

const asyncThrottler = new AsyncThrottler(asyncFn, {
  wait: 500,
  initialState
})
```

#### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const asyncThrottler = new AsyncThrottler(asyncFn, { wait: 500 })

// Subscribe to state changes
const unsubscribe = asyncThrottler.store.subscribe((state) => {
  // do something with the state like persist it to localStorage
})

// Unsubscribe when done
unsubscribe()
```

> **Note:** Framework adapters already subscribe through `useSelector` (React/Preact/Solid) or `injectSelector` (Angular) from TanStack Store. To subscribe manually, use `useSelector(store, selector, { compare: shallow })` from `@tanstack/react-store` (or `@tanstack/preact-store` / `@tanstack/solid-store`; import `shallow` from the same package), or `injectSelector(store, selector)` from `@tanstack/angular-store`.

#### Available State Properties

The `AsyncThrottlerState` includes:

- `errorCount`: Number of function executions that have resulted in errors
- `isExecuting`: Whether the throttled function is currently executing asynchronously
- `isPending`: Whether the throttler is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to `maybeExecute`
- `lastExecutionTime`: Timestamp of the last function execution in milliseconds
- `lastResult`: The result from the most recent successful function execution
- `maybeExecuteCount`: Number of times `maybeExecute` has been called
- `nextExecutionTime`: Timestamp when the next execution can occur in milliseconds
- `settleCount`: Number of function executions that have completed (either successfully or with errors)
- `status`: Current execution status ('disabled' | 'idle' | 'pending' | 'executing' | 'settled')
- `successCount`: Number of function executions that have completed successfully

### Framework Adapters

Each framework adapter provides hooks that build on top of the core async throttling functionality to integrate with the framework's state management system. Hooks like `createAsyncThrottler`, `useAsyncThrottledCallback`, or similar are available for each framework.

---

For core throttling concepts and synchronous throttling, see the [Throttling Guide](./debounce-throttle.md#source-pacer-docs-guides-throttling-md).

<a id="source-pacer-docs-guides-debouncing-md"></a>

## Debouncing

Source: `pacer:docs/guides/debouncing.md`.

Rate Limiting, Throttling, and Debouncing are three distinct approaches to controlling function execution frequency. Each technique blocks executions differently, making them "lossy" - meaning some function calls will not execute when they are requested to run too frequently. Understanding when to use each approach is crucial for building performant and reliable applications. This guide will cover the Debouncing concepts of TanStack Pacer.

### Debouncing Concept

Debouncing is a technique that delays the execution of a function until a specified period of inactivity has occurred. Unlike rate limiting which allows bursts of executions up to a limit, or throttling which ensures evenly spaced executions, debouncing collapses multiple rapid function calls into a single execution that only happens after the calls stop. This makes debouncing ideal for handling bursts of events where you only care about the final state after the activity settles.

#### Debouncing Visualization

```text
Debouncing (wait: 3 ticks)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️  ⬇️  ⬇️     ⬇️  ⬇️  ⬇️  ⬇️               ⬇️  ⬇️
Executed:     ❌  ❌  ❌  ❌  ❌     ❌  ❌  ❌  ⏳   ->   ✅     ❌  ⏳   ->    ✅
             [=================================================================]
                                                        ^ Executes here after
                                                         3 ticks of no calls

             [Burst of calls]     [More calls]   [Wait]      [New burst]
             No execution         Resets timer    [Delayed Execute]  [Wait] [Delayed Execute]
```

#### When to Use Debouncing

Debouncing is particularly effective when you want to wait for a "pause" in activity before taking action. This makes it ideal for handling user input or other rapidly-firing events where you only care about the final state.

#### When Not to Use Debouncing

Debouncing might not be the best choice when:
- You need guaranteed execution over a specific time period (use [throttling](./debounce-throttle.md#source-pacer-docs-guides-throttling-md) instead)
- You can't afford to miss any executions (use [queuing](./queue-batch.md#source-pacer-docs-guides-queuing-md) instead)

### Debouncing in TanStack Pacer

TanStack Pacer provides both synchronous and asynchronous debouncing. This guide covers the synchronous `Debouncer` class and `debounce` function. For async debouncing, see the [Async Debouncing Guide](./debounce-throttle.md#source-pacer-docs-guides-async-debouncing-md).

#### Basic Usage with `debounce`

The `debounce` function is the simplest way to add debouncing to any function:

```ts
import { debounce } from '@tanstack/pacer'

// Debounce search input to wait for user to stop typing
const debouncedSearch = debounce(
  (searchTerm: string) => performSearch(searchTerm),
  {
    wait: 500, // Wait 500ms after last keystroke
  }
)

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value)
})
```

> **Note:** When using React, prefer `useDebouncedCallback` hook over the `debounce` function for better integration with React's lifecycle and automatic cleanup.

#### Advanced Usage with `Debouncer` Class

For more control over the debouncing behavior, you can use the `Debouncer` class directly:

```ts
import { Debouncer } from '@tanstack/pacer'

const searchDebouncer = new Debouncer(
  (searchTerm: string) => performSearch(searchTerm),
  { wait: 500 }
)

// Access current state via TanStack Store
console.log(searchDebouncer.store.state.executionCount) // Number of successful executions
console.log(searchDebouncer.store.state.isPending) // Whether a call is pending
console.log(searchDebouncer.store.state.status) // Current execution status

// Update options dynamically
searchDebouncer.setOptions({ wait: 1000 }) // Increase wait time

// Cancel pending execution
searchDebouncer.cancel()

// Flush pending execution immediately
searchDebouncer.flush()
```

#### Leading and Trailing Executions

The synchronous debouncer supports both leading and trailing edge executions:

```ts
const debouncedFn = debounce(fn, {
  wait: 500,
  leading: true,   // Execute on first call
  trailing: true,  // Execute after wait period
})
```

- `leading: true` - Function executes immediately on first call
- `leading: false` (default) - First call starts the wait timer
- `trailing: true` (default) - Function executes after wait period
- `trailing: false` - No execution after wait period

Common patterns:
- `{ leading: false, trailing: true }` - Default, execute after wait
- `{ leading: true, trailing: false }` - Execute immediately, ignore subsequent calls
- `{ leading: true, trailing: true }` - Execute on both first call and after wait

#### Max Wait Time

The TanStack Pacer Debouncer purposely does NOT have a `maxWait` option like other debouncing libraries. If you need to let executions run over a more spread out period of time, consider using the [throttling](./debounce-throttle.md#source-pacer-docs-guides-throttling-md) technique instead.

#### Sharing Options Between Instances

Use `debouncerOptions` to share common options between different `Debouncer` instances:

```ts
import { debouncerOptions, Debouncer } from '@tanstack/pacer'

const sharedOptions = debouncerOptions({
  wait: 500,
  leading: false,
  trailing: true
})

const debouncer1 = new Debouncer(fn1, { ...sharedOptions, key: 'debouncer1' })
const debouncer2 = new Debouncer(fn2, { ...sharedOptions, wait: 1000 })
```

#### Enabling/Disabling

The `Debouncer` class supports enabling/disabling via the `enabled` option. Using the `setOptions` method, you can enable/disable the debouncer at any time:

```ts
const debouncer = new Debouncer(fn, { wait: 500, enabled: false }) // Disable by default
debouncer.setOptions({ enabled: true }) // Enable at any time
```

The `enabled` option can also be a function that returns a boolean, allowing for dynamic enabling/disabling based on runtime conditions:

```ts
const debouncer = new Debouncer(fn, {
  wait: 500,
  enabled: (debouncer) => {
    return debouncer.store.state.executionCount < 10 // Disable after 10 executions
  }
})
```

If you are using a framework adapter where the debouncer options are reactive, you can set the `enabled` option to a conditional value to enable/disable the debouncer on the fly:

```ts
// React example
const debouncer = useDebouncer(
  setSearch,
  { wait: 500, enabled: searchInput.value.length > 3 } // Enable/disable based on input length IF using a framework adapter that supports reactive options
)
```

#### Dynamic Options

Several options in the Debouncer support dynamic values through callback functions that receive the debouncer instance:

```ts
const debouncer = new Debouncer(fn, {
  // Dynamic wait time based on execution count
  wait: (debouncer) => {
    return debouncer.store.state.executionCount * 100 // Increase wait time with each execution
  },
  // Dynamic enabled state based on execution count
  enabled: (debouncer) => {
    return debouncer.store.state.executionCount < 10 // Disable after 10 executions
  }
})
```

The following options support dynamic values:
- `enabled`: Can be a boolean or a function that returns a boolean
- `wait`: Can be a number or a function that returns a number

This allows for sophisticated debouncing behavior that adapts to runtime conditions.

#### Callback Options

The synchronous `Debouncer` supports the following callback:

```ts
const debouncer = new Debouncer(fn, {
  wait: 500,
  onExecute: (debouncer) => {
    // Called after each successful execution
    console.log('Function executed', debouncer.store.state.executionCount)
  }
})
```

The `onExecute` callback is called after each successful execution of the debounced function, making it useful for tracking executions, updating UI state, or performing cleanup operations.

#### Flushing Pending Executions

The debouncer supports flushing pending executions to trigger them immediately:

```ts
const debouncer = new Debouncer(fn, { wait: 1000 })

debouncer.maybeExecute('some-arg')
console.log(debouncer.store.state.isPending) // true

// Flush immediately instead of waiting
debouncer.flush()
console.log(debouncer.store.state.isPending) // false
```

#### Customizing Unmount Behavior

Framework hooks cancel pending work by default when a component unmounts. Use the `onUnmount` option to flush instead.

```tsx
const debouncer = useDebouncer(fn, {
  wait: 500,
  onUnmount: (d) => d.flush(),
})
```

### State Management

The `Debouncer` class uses TanStack Store for reactive state management, providing real-time access to execution state and statistics. All state is stored in a TanStack Store and can be accessed via `debouncer.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `debouncer.state` along with providing a selector callback as the 3rd argument to the `useDebouncer` hook to opt-in to state tracking as shown below.

#### State Selector (Framework Adapters)

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

#### Initial State

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

#### Subscribing to State Changes

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

#### Available State Properties

The `DebouncerState` includes:

- `canLeadingExecute`: Whether the debouncer can execute on the leading edge of the timeout
- `executionCount`: Number of function executions that have been completed
- `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to `maybeExecute`
- `maybeExecuteCount`: Number of times `maybeExecute` has been called
- `status`: Current execution status ('disabled' | 'idle' | 'pending')

### Framework Adapters

Each framework adapter builds convenient hooks and functions around the debouncer classes. Hooks like `useDebouncer`, or `createDebouncer` are small wrappers that can cut down on the boilerplate needed in your own code for some common use cases.

---

For asynchronous debouncing (e.g., API calls, async operations), see the [Async Debouncing Guide](./debounce-throttle.md#source-pacer-docs-guides-async-debouncing-md).

<a id="source-pacer-docs-guides-throttling-md"></a>

## Throttling

Source: `pacer:docs/guides/throttling.md`.

Rate Limiting, Throttling, and Debouncing are three distinct approaches to controlling function execution frequency. Each technique blocks executions differently, making them "lossy" - meaning some function calls will not execute when they are requested to run too frequently. Understanding when to use each approach is crucial for building performant and reliable applications. This guide will cover the Throttling concepts of TanStack Pacer.

### Throttling Concept

Throttling ensures function executions are evenly spaced over time. Unlike rate limiting which allows bursts of executions up to a limit, or debouncing which waits for activity to stop, throttling creates a smoother execution pattern by enforcing consistent delays between calls. If you set a throttle of one execution per second, calls will be spaced out evenly regardless of how rapidly they are requested.

#### Throttling Visualization

```text
Throttling (one execution per 3 ticks)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️           ⬇️  ⬇️  ⬇️  ⬇️             ⬇️
Executed:     ✅  ❌  ⏳  ->   ✅  ❌  ❌  ❌  ✅             ✅
             [=================================================================]
             ^ Only one execution allowed per 3 ticks,
               regardless of how many calls are made

             [First burst]    [More calls]              [Spaced calls]
             Execute first    Execute after             Execute each time
             then throttle    wait period               wait period passes
```

#### When to Use Throttling

Throttling is particularly effective when you need consistent, predictable execution timing. This makes it ideal for handling frequent events or updates where you want smooth, controlled behavior.

#### When Not to Use Throttling

Throttling might not be the best choice when:
- You want to wait for activity to stop (use [debouncing](./debounce-throttle.md#source-pacer-docs-guides-debouncing-md) instead)
- You can't afford to miss any executions (use [queuing](./queue-batch.md#source-pacer-docs-guides-queuing-md) instead)

> [!TIP]
> Throttling is often the best choice when you need smooth, consistent execution timing. It provides a more predictable execution pattern than rate limiting and more immediate feedback than debouncing.

### Throttling in TanStack Pacer

TanStack Pacer provides both synchronous and asynchronous throttling. This guide covers the synchronous `Throttler` class and `throttle` function. For async throttling, see the [Async Throttling Guide](./debounce-throttle.md#source-pacer-docs-guides-async-throttling-md).

#### Basic Usage with `throttle`

The `throttle` function is the simplest way to add throttling to any function:

```ts
import { throttle } from '@tanstack/pacer'

// Throttle UI updates to once every 200ms
const throttledUpdate = throttle(
  (value: number) => updateProgressBar(value),
  {
    wait: 200,
  }
)

// In a rapid loop, only executes every 200ms
for (let i = 0; i < 100; i++) {
  throttledUpdate(i) // Many calls get throttled
}
```

> **Note:** When using React, prefer `useThrottledCallback` hook over the `throttle` function for better integration with React's lifecycle and automatic cleanup.

#### Advanced Usage with `Throttler` Class

For more control over the throttling behavior, you can use the `Throttler` class directly:

```ts
import { Throttler } from '@tanstack/pacer'

const updateThrottler = new Throttler(
  (value: number) => updateProgressBar(value),
  { wait: 200 }
)

// Access current state via TanStack Store
console.log(updateThrottler.store.state.executionCount) // Number of successful executions
console.log(updateThrottler.store.state.lastExecutionTime) // Timestamp of last execution
console.log(updateThrottler.store.state.isPending) // Whether execution is pending
console.log(updateThrottler.store.state.status) // Current execution status

// Cancel any pending execution
updateThrottler.cancel()

// Flush pending execution immediately
updateThrottler.flush()
```

#### Leading and Trailing Executions

The synchronous throttler supports both leading and trailing edge executions:

```ts
const throttledFn = throttle(fn, {
  wait: 200,
  leading: true,   // Execute on first call (default)
  trailing: true,  // Execute after wait period (default)
})
```

- `leading: true` (default) - Execute immediately on first call
- `leading: false` - Skip first call, wait for trailing execution
- `trailing: true` (default) - Execute last call after wait period
- `trailing: false` - Skip last call if within wait period

Common patterns:
- `{ leading: true, trailing: true }` - Default, most responsive
- `{ leading: false, trailing: true }` - Delay all executions
- `{ leading: true, trailing: false }` - Skip queued executions

#### Sharing Options Between Instances

Use `throttlerOptions` to share common options between different `Throttler` instances:

```ts
import { throttlerOptions, Throttler } from '@tanstack/pacer'

const sharedOptions = throttlerOptions({
  wait: 200,
  leading: true,
  trailing: true
})

const throttler1 = new Throttler(fn1, { ...sharedOptions, key: 'throttler1' })
const throttler2 = new Throttler(fn2, { ...sharedOptions, wait: 300 })
```

#### Enabling/Disabling

The `Throttler` class supports enabling/disabling via the `enabled` option. Using the `setOptions` method, you can enable/disable the throttler at any time:

```ts
const throttler = new Throttler(fn, { wait: 200, enabled: false }) // Disable by default
throttler.setOptions({ enabled: true }) // Enable at any time
```

The `enabled` option can also be a function that returns a boolean, allowing for dynamic enabling/disabling based on runtime conditions:

```ts
const throttler = new Throttler(fn, {
  wait: 200,
  enabled: (throttler) => {
    return throttler.store.state.executionCount < 50 // Disable after 50 executions
  }
})
```

If you are using a framework adapter where the throttler options are reactive, you can set the `enabled` option to a conditional value to enable/disable the throttler on the fly. However, if you are using the `throttle` function or the `Throttler` class directly, you must use the `setOptions` method to change the `enabled` option, since the options that are passed are actually passed to the constructor of the `Throttler` class.

#### Dynamic Options

Several options in the Throttler support dynamic values through callback functions that receive the throttler instance:

```ts
const throttler = new Throttler(fn, {
  // Dynamic wait time based on execution count
  wait: (throttler) => {
    return throttler.store.state.executionCount * 100 // Increase wait time with each execution
  },
  // Dynamic enabled state based on execution count
  enabled: (throttler) => {
    return throttler.store.state.executionCount < 50 // Disable after 50 executions
  }
})
```

The following options support dynamic values:
- `enabled`: Can be a boolean or a function that returns a boolean
- `wait`: Can be a number or a function that returns a number

This allows for sophisticated throttling behavior that adapts to runtime conditions.

#### Callback Options

The synchronous `Throttler` supports the following callback:

```ts
const throttler = new Throttler(fn, {
  wait: 200,
  onExecute: (throttler) => {
    // Called after each successful execution
    console.log('Function executed', throttler.store.state.executionCount)
  }
})
```

The `onExecute` callback is called after each successful execution of the throttled function, making it useful for tracking executions, updating UI state, or performing cleanup operations.

#### Flushing Pending Executions

The throttler supports flushing pending executions to trigger them immediately:

```ts
const throttler = new Throttler(fn, { wait: 1000 })

throttler.maybeExecute('some-arg')
console.log(throttler.store.state.isPending) // true

// Flush immediately instead of waiting
throttler.flush()
console.log(throttler.store.state.isPending) // false
```

#### Customizing Unmount Behavior

Framework hooks cancel pending work by default when a component unmounts. Use the `onUnmount` option to flush instead.

```tsx
const throttler = useThrottler(fn, {
  wait: 200,
  onUnmount: (t) => t.flush(),
})
```

### State Management

The `Throttler` class uses TanStack Store for reactive state management, providing real-time access to execution state and timing information. All state is stored in a TanStack Store and can be accessed via `throttler.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `throttler.state` along with providing a selector callback as the 3rd argument to the `useThrottler` hook to opt-in to state tracking as shown below.

#### State Selector (Framework Adapters)

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

#### Initial State

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

#### Subscribing to State Changes

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

#### Available State Properties

The `ThrottlerState` includes:

- `executionCount`: Number of function executions that have been completed
- `isPending`: Whether the throttler is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to `maybeExecute`
- `lastExecutionTime`: Timestamp of the last function execution in milliseconds
- `maybeExecuteCount`: Number of times `maybeExecute` has been called
- `nextExecutionTime`: Timestamp when the next execution can occur in milliseconds
- `status`: Current execution status ('disabled' | 'idle' | 'pending')

### Framework Adapters

Each framework adapter builds convenient hooks and functions around the throttler classes. Hooks like `useThrottler`, or `createThrottler` are small wrappers that can cut down on the boilerplate needed in your own code for some common use cases.

---

For asynchronous throttling (e.g., API calls, async operations), see the [Async Throttling Guide](./debounce-throttle.md#source-pacer-docs-guides-async-throttling-md).
