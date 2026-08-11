# Rate limiting

Synchronous, asynchronous, and server-side rate limiting.

<a id="source-pacer-docs-guides-async-rate-limiting-md"></a>

## Async Rate Limiting

Source: `pacer:docs/guides/async-rate-limiting.md`.

All core concepts from the [Rate Limiting Guide](./rate-limiting.md#source-pacer-docs-guides-rate-limiting-md) apply to async rate limiting as well.

### When to Use Async Rate Limiting

You can usually just use the normal synchronous rate limiter and it will work with async functions, but for advanced use cases, such as wanting to use the return value of a rate-limited function (instead of just calling a setState side effect), or putting your error handling logic in the rate limiter, you can use the async rate limiter.

### Async Rate Limiting in TanStack Pacer

TanStack Pacer provides async rate limiting through the `AsyncRateLimiter` class and the `asyncRateLimit` function.

#### Basic Usage Example

Here's a basic example showing how to use the async rate limiter for an API operation:

```ts
const rateLimitedApi = asyncRateLimit(
  async (id: string) => {
    const response = await fetch(`/api/data/${id}`)
    return response.json()
  },
  {
    limit: 5,
    window: 1000,
    onExecute: (limiter) => {
      console.log('API call succeeded:', limiter.store.state.successCount)
    },
    onReject: (limiter) => {
      console.log(`Rate limit exceeded. Try again in ${limiter.getMsUntilNextWindow()}ms`)
    },
    onError: (error, limiter) => {
      console.error('API call failed:', error)
    }
  }
)

// Usage
try {
  const result = await rateLimitedApi('123')
  // Handle successful result
} catch (error) {
  // Handle errors if no onError handler was provided
  console.error('API call failed:', error)
}
```

> **Note:** When using React, prefer `useAsyncRateLimitedCallback` hook over the `asyncRateLimit` function for better integration with React's lifecycle and automatic cleanup.

### Key Differences from Synchronous Rate Limiting

#### 1. Return Value Handling

Unlike the synchronous rate limiter which returns a boolean indicating success, the async version allows you to capture and use the return value from your rate-limited function. The `maybeExecute` method returns a Promise that resolves with the function's return value, allowing you to await the result and handle it appropriately.

#### 2. Error Handling

The async rate limiter provides robust error handling capabilities:
- If your rate-limited function throws an error and no `onError` handler is provided, the error will be thrown and propagate up to the caller
- If you provide an `onError` handler, errors will be caught and passed to the handler instead of being thrown
- The `throwOnError` option can be used to control error throwing behavior:
  - When true (default if no onError handler), errors will be thrown
  - When false (default if onError handler provided), errors will be swallowed
  - Can be explicitly set to override these defaults
- You can track error counts using `limiter.store.state.errorCount` and check execution state with `limiter.store.state.isExecuting`
- The rate limiter maintains its state and can continue to be used after an error occurs
- Rate limit rejections (when limit is exceeded) are handled separately from execution errors via the `onReject` handler

#### 3. Different Callbacks

The `AsyncRateLimiter` supports the following callbacks:
- `onSuccess`: Called after each successful execution, providing the result, the arguments that were executed, and rate limiter instance
- `onSettled`: Called after each execution (success or failure), providing the arguments that were executed and rate limiter instance
- `onError`: Called if the async function throws an error, providing the error, the arguments that caused the error, and the rate limiter instance

Both the Async and Synchronous rate limiters support the `onReject` callback for handling blocked executions.

Example:

```ts
const asyncLimiter = new AsyncRateLimiter(async (id) => {
  await saveToAPI(id)
}, {
  limit: 5,
  window: 1000,
  onExecute: (rateLimiter) => {
    // Called after each successful execution
    console.log('Async function executed', rateLimiter.store.state.successCount)
  },
  onReject: (rateLimiter) => {
    // Called when an execution is rejected
    console.log(`Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`)
  },
  onError: (error) => {
    // Called if the async function throws an error
    console.error('Async function failed:', error)
  }
})
```

#### 4. Sequential Execution

Since the rate limiter's `maybeExecute` method returns a Promise, you can choose to await each execution before starting the next one. This gives you control over the execution order and ensures each call processes the most up-to-date data. This is particularly useful when dealing with operations that depend on the results of previous calls or when maintaining data consistency is critical.

For example, if you're updating a user's profile and then immediately fetching their updated data, you can await the update operation before starting the fetch.

### Advanced Features: Retry and Abort Support

The async rate limiter includes built-in retry and abort capabilities through integration with `AsyncRetryer`. These features help handle transient failures and provide control over in-flight operations.

#### Retry Support

Configure automatic retries for failed rate-limited function executions using the `asyncRetryerOptions`:

```ts
const rateLimitedApi = asyncRateLimit(
  async (userId: string) => {
    // This might fail due to network issues
    const data = await api.fetchUser(userId)
    return data
  },
  {
    limit: 5,
    window: 1000,
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

Cancel in-flight rate-limited executions using the abort functionality:

```ts
const rateLimiter = new AsyncRateLimiter(
  async (userId: string) => {
    // Access the abort signal for this execution
    const signal = rateLimiter.getAbortSignal()
    if (signal) {
      const response = await fetch(`/api/users/${userId}`, { signal })
      return response.json()
    }
  },
  { limit: 5, window: 1000 }
)

// Start some operations
rateLimiter.maybeExecute('user1')
rateLimiter.maybeExecute('user2')

// Later, abort any in-flight executions
rateLimiter.abort()
```

The abort functionality:
- Cancels all ongoing rate-limited executions using AbortController
- Does NOT clear execution times or reset the rate limiter
- Can be used alongside retry support

Abort only cancels underlying operations (e.g. `fetch`) when you pass the signal from `getAbortSignal()` to them. If your rate-limited function does not attach the signal, abort clears internal state but the async work continues until it completes.

For more details on abort patterns and integration with fetch/axios, see the [Async Retrying Guide](./async-retry.md#source-pacer-docs-guides-async-retrying-md).

#### Sharing Options Between Instances

Use `asyncRateLimiterOptions` to share common options between different `AsyncRateLimiter` instances:

```ts
import { asyncRateLimiterOptions, AsyncRateLimiter } from '@tanstack/pacer'

const sharedOptions = asyncRateLimiterOptions({
  limit: 5,
  window: 1000,
  onSuccess: (result, args, limiter) => console.log('Success')
})

const limiter1 = new AsyncRateLimiter(fn1, { ...sharedOptions, key: 'limiter1' })
const limiter2 = new AsyncRateLimiter(fn2, { ...sharedOptions, onError: (error) => console.error('Error') })
```

### Dynamic Options and Enabling/Disabling

Just like the synchronous rate limiter, the async rate limiter supports dynamic options for `limit`, `window`, and `enabled`, which can be functions that receive the rate limiter instance. This allows for sophisticated, runtime-adaptive rate limiting behavior.

#### Customizing Unmount Behavior

Framework hooks abort any in-flight execution by default when a component unmounts. The automatic abort only cancels underlying operations (e.g. fetch) when the abort signal from `getAbortSignal()` is passed to them. Use the `onUnmount` option to customize this behavior.

### State Management

The `AsyncRateLimiter` class uses TanStack Store for reactive state management, providing real-time access to execution state, error tracking, and rejection statistics. All state is stored in a TanStack Store and can be accessed via `asyncLimiter.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `asyncLimiter.state` along with providing a selector callback as the 3rd argument to the `useAsyncRateLimiter` hook to opt-in to state tracking as shown below.

#### State Selector (Framework Adapters)

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

#### Initial State

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

#### Subscribing to State Changes

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

#### Available State Properties

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

#### Helper Methods

The async rate limiter provides helper methods that compute values based on the current state:

```ts
const asyncLimiter = new AsyncRateLimiter(asyncFn, { limit: 5, window: 1000 })

// These methods use the current state to compute values
console.log(asyncLimiter.getRemainingInWindow()) // Number of calls remaining in current window
console.log(asyncLimiter.getMsUntilNextWindow()) // Milliseconds until next window
```

These methods are computed values that use the current state and don't need to be accessed through the store.

### Framework Adapters

Each framework adapter provides hooks that build on top of the core async rate limiting functionality to integrate with the framework's state management system. Hooks like `createAsyncRateLimiter`, `useAsyncRateLimitedCallback`, or similar are available for each framework.

---

For core rate limiting concepts and synchronous rate limiting, see the [Rate Limiting Guide](./rate-limiting.md#source-pacer-docs-guides-rate-limiting-md).

<a id="source-pacer-docs-guides-rate-limiting-md"></a>

## Rate Limiting

Source: `pacer:docs/guides/rate-limiting.md`.

Rate Limiting, Throttling, and Debouncing are three distinct approaches to controlling function execution frequency. Each technique blocks executions differently, making them "lossy" - meaning some function calls will not execute when they are requested to run too frequently. Understanding when to use each approach is crucial for building performant and reliable applications. This guide will cover the Rate Limiting concepts of TanStack Pacer.

> [!NOTE]
> TanStack Pacer is currently only a front-end library. These are utilities for client-side rate-limiting.

### Rate Limiting Concept

Rate Limiting is a technique that limits the rate at which a function can execute over a specific time window. It is particularly useful for scenarios where you want to prevent a function from being called too frequently, such as when handling API requests or other external service calls. It is the most *naive* approach, as it allows executions to happen in bursts until the quota is met.

#### Rate Limiting Visualization

```text
Rate Limiting (limit: 3 calls per window)
Timeline: [1 second per tick]
                                        Window 1                  |    Window 2
Calls:        ⬇️     ⬇️     ⬇️     ⬇️     ⬇️                             ⬇️     ⬇️
Executed:     ✅     ✅     ✅     ❌     ❌                             ✅     ✅
             [=== 3 allowed ===][=== blocked until window ends ===][=== new window =======]
```

#### Window Types

TanStack Pacer supports two types of rate limiting windows:

1. **Fixed Window** (default)
   - A strict window that resets after the window period
   - All executions within the window count towards the limit
   - The window resets completely after the period
   - Can lead to bursty behavior at window boundaries

2. **Sliding Window**
   - A rolling window that allows executions as old ones expire
   - Provides a more consistent rate of execution over time
   - Better for maintaining a steady flow of executions
   - Prevents bursty behavior at window boundaries

Here's a visualization of sliding window rate limiting:

```text
Sliding Window Rate Limiting (limit: 3 calls per window)
Timeline: [1 second per tick]
                                        Window 1                  |    Window 2
Calls:        ⬇️     ⬇️     ⬇️     ⬇️     ⬇️                             ⬇️     ⬇️
Executed:     ✅     ✅     ✅     ❌     ✅                             ✅     ✅
             [=== 3 allowed ===][=== oldest expires, new allowed ===][=== continues sliding =======]
```

The key difference is that with a sliding window, as soon as the oldest execution expires, a new execution is allowed. This creates a more consistent flow of executions compared to the fixed window approach.

#### When to Use Rate Limiting

Rate Limiting is particularly important when dealing with front-end operations that could accidentally overwhelm your back-end services or cause performance issues in the browser.

#### When Not to Use Rate Limiting

Rate Limiting is the most naive approach to controlling function execution frequency. It is the least flexible and most restrictive of the three techniques. Consider using [throttling](./debounce-throttle.md#source-pacer-docs-guides-throttling-md) or [debouncing](./debounce-throttle.md#source-pacer-docs-guides-debouncing-md) instead for more spaced out executions.

> [!TIP]
> You most likely don't want to use "rate limiting" for most use cases. Consider using [throttling](./debounce-throttle.md#source-pacer-docs-guides-throttling-md) or [debouncing](./debounce-throttle.md#source-pacer-docs-guides-debouncing-md) instead.

Rate Limiting's "lossy" nature also means that some executions will be rejected and lost. This can be a problem if you need to ensure that all executions are always successful. Consider using [queuing](./queue-batch.md#source-pacer-docs-guides-queuing-md) if you need to ensure that all executions are queued up to be executed, but with a throttled delay to slow down the rate of execution.

### Rate Limiting in TanStack Pacer

TanStack Pacer provides both synchronous and asynchronous rate limiting. This guide covers the synchronous `RateLimiter` class and `rateLimit` function. For async rate limiting, see the [Async Rate Limiting Guide](./rate-limiting.md#source-pacer-docs-guides-async-rate-limiting-md).

#### Basic Usage with `rateLimit`

The `rateLimit` function is the simplest way to add rate limiting to any function. It's perfect for most use cases where you just need to enforce a simple limit.

```ts
import { rateLimit } from '@tanstack/pacer'

// Rate limit API calls to 5 per minute
const rateLimitedApi = rateLimit(
  (id: string) => fetchUserData(id),
  {
    limit: 5,
    window: 60 * 1000, // 1 minute in milliseconds
    windowType: 'fixed', // default
    onReject: (rateLimiter) => {
      console.log(`Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`)
    }
  }
)

// First 5 calls will execute immediately
rateLimitedApi('user-1') // ✅ Executes
rateLimitedApi('user-2') // ✅ Executes
rateLimitedApi('user-3') // ✅ Executes
rateLimitedApi('user-4') // ✅ Executes
rateLimitedApi('user-5') // ✅ Executes
rateLimitedApi('user-6') // ❌ Rejected until window resets
```

> **Note:** When using React, prefer `useRateLimitedCallback` hook over the `rateLimit` function for better integration with React's lifecycle and automatic cleanup.

#### Advanced Usage with `RateLimiter` Class

For more complex scenarios where you need additional control over the rate limiting behavior, you can use the `RateLimiter` class directly. This gives you access to additional methods and state information.

```ts
import { RateLimiter } from '@tanstack/pacer'

// Create a rate limiter instance
const limiter = new RateLimiter(
  (id: string) => fetchUserData(id),
  {
    limit: 5,
    window: 60 * 1000,
    onExecute: (rateLimiter) => {
      console.log('Function executed', rateLimiter.store.state.executionCount)
    },
    onReject: (rateLimiter) => {
      console.log(`Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`)
    }
  }
)

// Access current state via TanStack Store
console.log(limiter.getRemainingInWindow()) // Number of calls remaining in current window
console.log(limiter.store.state.executionCount) // Total number of successful executions
console.log(limiter.store.state.rejectionCount) // Total number of rejected executions

// Attempt to execute (returns boolean indicating success)
limiter.maybeExecute('user-1')

// Update options dynamically
limiter.setOptions({ limit: 10 }) // Increase the limit

// Reset all counters and state
limiter.reset()
```

#### Sharing Options Between Instances

Use `rateLimiterOptions` to share common options between different `RateLimiter` instances:

```ts
import { rateLimiterOptions, RateLimiter } from '@tanstack/pacer'

const sharedOptions = rateLimiterOptions({
  limit: 5,
  window: 1000,
  onExecute: (limiter) => console.log('Executed')
})

const limiter1 = new RateLimiter(fn1, { ...sharedOptions, key: 'limiter1' })
const limiter2 = new RateLimiter(fn2, { ...sharedOptions, onReject: (limiter) => console.log('Rejected') })
```

#### Enabling/Disabling

The `RateLimiter` class supports enabling/disabling via the `enabled` option. Using the `setOptions` method, you can enable/disable the rate limiter at any time:

> [!NOTE]
> The `enabled` option enables/disables the actual function execution. Disabling the rate limiter does not turn off rate limiting, it just prevents the function from being executed at all.

```ts
const limiter = new RateLimiter(fn, {
  limit: 5,
  window: 1000,
  enabled: false // Disable by default
})
limiter.setOptions({ enabled: true }) // Enable at any time
```

The `enabled` option can also be a function that returns a boolean, allowing for dynamic enabling/disabling based on runtime conditions:

```ts
const limiter = new RateLimiter(fn, {
  limit: 5,
  window: 1000,
  enabled: (limiter) => {
    return limiter.store.state.executionCount < 100 // Disable after 100 executions
  }
})
```

If you are using a framework adapter where the rate limiter options are reactive, you can set the `enabled` option to a conditional value to enable/disable the rate limiter on the fly. However, if you are using the `rateLimit` function or the `RateLimiter` class directly, you must use the `setOptions` method to change the `enabled` option, since the options that are passed are actually passed to the constructor of the `RateLimiter` class.

#### Dynamic Options

Several options in the RateLimiter support dynamic values through callback functions that receive the rate limiter instance:

```ts
const limiter = new RateLimiter(fn, {
  // Dynamic limit based on execution count
  limit: (limiter) => {
    return Math.max(1, 10 - limiter.store.state.executionCount) // Decrease limit with each execution
  },
  // Dynamic window based on execution count
  window: (limiter) => {
    return limiter.store.state.executionCount * 1000 // Increase window with each execution
  },
  // Dynamic enabled state based on execution count
  enabled: (limiter) => {
    return limiter.store.state.executionCount < 100 // Disable after 100 executions
  }
})
```

The following options support dynamic values:
- `enabled`: Can be a boolean or a function that returns a boolean
- `limit`: Can be a number or a function that returns a number
- `window`: Can be a number or a function that returns a number

This allows for sophisticated rate limiting behavior that adapts to runtime conditions.

#### Callback Options

The synchronous `RateLimiter` supports the following callbacks:

```ts
const limiter = new RateLimiter(fn, {
  limit: 5,
  window: 1000,
  onExecute: (rateLimiter) => {
    // Called after each successful execution
    console.log('Function executed', rateLimiter.store.state.executionCount)
  },
  onReject: (rateLimiter) => {
    // Called when an execution is rejected
    console.log(`Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`)
  }
})
```

The `onExecute` callback is called after each successful execution of the rate-limited function, while the `onReject` callback is called when an execution is rejected due to rate limiting. These callbacks are useful for tracking executions, updating UI state, or providing feedback to users.

### State Management

The `RateLimiter` class uses TanStack Store for reactive state management, providing real-time access to execution state, error tracking, and rejection statistics. All state is stored in a TanStack Store and can be accessed via `limiter.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `limiter.state` along with providing a selector callback as the 3rd argument to the `useRateLimiter` hook to opt-in to state tracking as shown below.

#### State Selector (Framework Adapters)

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

#### Initial State

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

#### Subscribing to State Changes

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

#### Available State Properties

The `RateLimiterState` includes:

- `executionCount`: Number of function executions that have been completed
- `executionTimes`: Array of timestamps when executions occurred for rate limiting calculations
- `isExceeded`: Whether the rate limiter has exceeded the limit
- `maybeExecuteCount`: Number of times `maybeExecute` has been called
- `rejectionCount`: Number of function executions that have been rejected due to rate limiting
- `status`: Current execution status ('disabled' | 'exceeded' | 'idle')

#### Helper Methods

The rate limiter provides helper methods that compute values based on the current state:

```ts
const limiter = new RateLimiter(fn, { limit: 5, window: 1000 })

// These methods use the current state to compute values
console.log(limiter.getRemainingInWindow()) // Number of calls remaining in current window
console.log(limiter.getMsUntilNextWindow()) // Milliseconds until next window
```

These methods are computed values that use the current state and don't need to be accessed through the store.

### Framework Adapters

Each framework adapter builds convenient hooks and functions around the rate limiter classes. Hooks like `useRateLimiter`, or `createRateLimiter` are small wrappers that can cut down on the boilerplate needed in your own code for some common use cases.

---

For asynchronous rate limiting (e.g., API calls, async operations), see the [Async Rate Limiting Guide](./rate-limiting.md#source-pacer-docs-guides-async-rate-limiting-md).

<a id="source-pacer-docs-guides-server-rate-limiting-md"></a>

All sections are exact duplicates of canonical content in this reference.
