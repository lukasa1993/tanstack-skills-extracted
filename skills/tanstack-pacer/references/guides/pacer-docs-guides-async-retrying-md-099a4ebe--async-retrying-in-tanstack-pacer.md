# Async Retrying — Async Retrying in TanStack Pacer

[Guide and prerequisites](./pacer-docs-guides-async-retrying-md-099a4ebe.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Async Retrying in TanStack Pacer

TanStack Pacer provides two ways to add retry functionality to async functions: the `asyncRetry` convenience function and the `AsyncRetryer` class.

### Using `asyncRetry` Function

The `asyncRetry` function is a convenience wrapper that creates an `AsyncRetryer` instance and returns its execute method:

```ts
import { asyncRetry } from '@tanstack/pacer'

// Define your async function normally
async function fetchData(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Request failed')
  return response.json()
}

// Create a retry-enabled version
const fetchWithRetry = asyncRetry(fetchData, {
  maxAttempts: 3,
  backoff: 'exponential',
  baseWait: 1000,
  maxWait: 5000 // Cap wait time at 5 seconds
})

// Call it
try {
  const data = await fetchWithRetry('/api/data')
  console.log('Success:', data)
} catch (error) {
  console.error('All retries failed:', error)
}
```

### Using `AsyncRetryer` Class

> **⚠️ Important:** The `AsyncRetryer` class is designed for single-use execution. If you call `execute()` multiple times on the same instance, previous executions will be aborted. For multiple calls, create a new instance each time.

The `AsyncRetryer` class provides complete control over retry behavior, state management, and manual abort control:

```ts
import { AsyncRetryer } from '@tanstack/pacer'

const retryer = new AsyncRetryer(
  async (url: string) => {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Request failed')
    return response.json()
  },
  {
    maxAttempts: 5,
    backoff: 'exponential',
    baseWait: 1000,
    maxWait: 5000, // Cap wait time at 5 seconds
    jitter: 0.1, // Add 10% random variation
    maxExecutionTime: 5000, // Abort individual calls after 5 seconds
    maxTotalExecutionTime: 30000, // Abort entire operation after 30 seconds
    key: 'api-fetcher', // Identify this retryer in devtools
    onRetry: (attempt, error, retryer) => {
      console.log(`Retry attempt ${attempt} after error:`, error)
    },
    onSuccess: (result, args, retryer) => {
      console.log('Request succeeded:', result)
    },
    onError: (error, args, retryer) => {
      console.error('Request failed:', error)
    },
    onLastError: (error, retryer) => {
      console.error('All retries exhausted:', error)
    },
    onExecutionTimeout: (retryer) => {
      console.log('Execution attempt timed out')
    },
    onTotalExecutionTimeout: (retryer) => {
      console.log('Total execution time exceeded')
    },
    onSettled: (args, retryer) => {
      console.log('Execution settled')
    },
    onAbort: (reason, retryer) => {
      console.log('Execution aborted:', reason)
    }
  }
)

// Execute the function with retry logic
const data = await retryer.execute('/api/data')

// Manual abort control - cancel ongoing execution
retryer.abort()

// ❌ DON'T DO THIS - will abort the previous execution
// const data2 = await retryer.execute('/api/other-data')

// ✅ DO THIS INSTEAD - create a new instance for each call
const retryer2 = new AsyncRetryer(asyncFn, options)
const data2 = await retryer2.execute('/api/other-data')
```

### Sharing Options Between Instances

Use `asyncRetryerOptions` to share common options between different `AsyncRetryer` instances:

```ts
import { asyncRetryerOptions, AsyncRetryer } from '@tanstack/pacer'

const sharedOptions = asyncRetryerOptions({
  maxAttempts: 3,
  backoff: 'exponential',
  baseWait: 1000,
  maxWait: 5000, // Cap wait time at 5 seconds
  onSuccess: (result, args, retryer) => console.log('Success')
})

const retryer1 = new AsyncRetryer(fn1, { ...sharedOptions, key: 'retryer1' })
const retryer2 = new AsyncRetryer(fn2, { ...sharedOptions, maxAttempts: 5 })
```
