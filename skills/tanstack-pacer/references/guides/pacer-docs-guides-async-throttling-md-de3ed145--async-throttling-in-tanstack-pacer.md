# Async Throttling — Async Throttling in TanStack Pacer

[Guide and prerequisites](./pacer-docs-guides-async-throttling-md-de3ed145.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Async Throttling in TanStack Pacer

TanStack Pacer provides async throttling through the `AsyncThrottler` class and the `asyncThrottle` function.

### Basic Usage Example

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
