# Async Rate Limiting — Async Rate Limiting in TanStack Pacer

[Guide and prerequisites](./pacer-docs-guides-async-rate-limiting-md-62bd8188.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Async Rate Limiting in TanStack Pacer

TanStack Pacer provides async rate limiting through the `AsyncRateLimiter` class and the `asyncRateLimit` function.

### Basic Usage Example

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
