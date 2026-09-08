# Async Debouncing — Advanced Features: Retry and Abort Support

[Guide and prerequisites](./pacer-docs-guides-async-debouncing-md-97c781af.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Advanced Features: Retry and Abort Support

The async debouncer includes built-in retry and abort capabilities through integration with `AsyncRetryer`. These features help handle transient failures and provide control over in-flight operations.

### Retry Support

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

For complete documentation on retry strategies, backoff algorithms, jitter, and advanced retry patterns, see the [Async Retrying Guide](./pacer-docs-guides-async-retrying-md-099a4ebe.md#source-pacer-docs-guides-async-retrying-md).

### Abort Support

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

For more details on abort patterns and integration with fetch/axios, see the [Async Retrying Guide](./pacer-docs-guides-async-retrying-md-099a4ebe.md#source-pacer-docs-guides-async-retrying-md).

### Sharing Options Between Instances

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
