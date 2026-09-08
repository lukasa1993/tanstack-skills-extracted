# Rate Limiting — Rate Limiting Concept

[Guide and prerequisites](./pacer-docs-guides-rate-limiting-md-9f0c5f8e.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Rate Limiting Concept

Rate Limiting is a technique that limits the rate at which a function can execute over a specific time window. It is particularly useful for scenarios where you want to prevent a function from being called too frequently, such as when handling API requests or other external service calls. It is the most *naive* approach, as it allows executions to happen in bursts until the quota is met.

### Rate Limiting Visualization

```text
Rate Limiting (limit: 3 calls per window)
Timeline: [1 second per tick]
                                        Window 1                  |    Window 2
Calls:        ⬇️     ⬇️     ⬇️     ⬇️     ⬇️                             ⬇️     ⬇️
Executed:     ✅     ✅     ✅     ❌     ❌                             ✅     ✅
             [=== 3 allowed ===][=== blocked until window ends ===][=== new window =======]
```

### Window Types

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

### When to Use Rate Limiting

Rate Limiting is particularly important when dealing with front-end operations that could accidentally overwhelm your back-end services or cause performance issues in the browser.

### When Not to Use Rate Limiting

Rate Limiting is the most naive approach to controlling function execution frequency. It is the least flexible and most restrictive of the three techniques. Consider using [throttling](./pacer-docs-guides-throttling-md-b3667c78.md#source-pacer-docs-guides-throttling-md) or [debouncing](./pacer-docs-guides-debouncing-md-2946516b.md#source-pacer-docs-guides-debouncing-md) instead for more spaced out executions.

> [!TIP]
> You most likely don't want to use "rate limiting" for most use cases. Consider using [throttling](./pacer-docs-guides-throttling-md-b3667c78.md#source-pacer-docs-guides-throttling-md) or [debouncing](./pacer-docs-guides-debouncing-md-2946516b.md#source-pacer-docs-guides-debouncing-md) instead.

Rate Limiting's "lossy" nature also means that some executions will be rejected and lost. This can be a problem if you need to ensure that all executions are always successful. Consider using [queuing](./pacer-docs-guides-queuing-md-4661e110.md#source-pacer-docs-guides-queuing-md) if you need to ensure that all executions are queued up to be executed, but with a throttled delay to slow down the rate of execution.
