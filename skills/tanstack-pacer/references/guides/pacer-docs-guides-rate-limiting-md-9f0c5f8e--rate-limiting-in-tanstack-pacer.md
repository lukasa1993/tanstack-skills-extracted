# Rate Limiting — Rate Limiting in TanStack Pacer

[Guide and prerequisites](./pacer-docs-guides-rate-limiting-md-9f0c5f8e.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Rate Limiting in TanStack Pacer

TanStack Pacer provides both synchronous and asynchronous rate limiting. This guide covers the synchronous `RateLimiter` class and `rateLimit` function. For async rate limiting, see the [Async Rate Limiting Guide](./pacer-docs-guides-async-rate-limiting-md-62bd8188.md#source-pacer-docs-guides-async-rate-limiting-md).

### Basic Usage with `rateLimit`

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

### Advanced Usage with `RateLimiter` Class

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

### Sharing Options Between Instances

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

### Enabling/Disabling

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

### Dynamic Options

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

### Callback Options

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
