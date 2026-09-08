# Async Debouncing — Async Debouncing in TanStack Pacer

[Guide and prerequisites](./pacer-docs-guides-async-debouncing-md-97c781af.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Async Debouncing in TanStack Pacer

TanStack Pacer provides async debouncing through the `AsyncDebouncer` class and the `asyncDebounce` function.

### Basic Usage Example

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
