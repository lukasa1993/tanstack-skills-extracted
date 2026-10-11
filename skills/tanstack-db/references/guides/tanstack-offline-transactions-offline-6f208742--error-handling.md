# Offline — Error Handling

[Guide and prerequisites](./tanstack-offline-transactions-offline-6f208742.md) · Published skill · `@tanstack/offline-transactions@1.1.0`.

## Error Handling

### NonRetriableError

```ts
import { NonRetriableError } from '@tanstack/offline-transactions'

const executor = startOfflineExecutor({
  mutationFns: {
    createTodo: async ({ transaction, idempotencyKey }) => {
      const res = await fetch('/api/todos', { method: 'POST', body: ... })
      if (res.status === 409) {
        throw new NonRetriableError('Duplicate detected')
      }
      if (!res.ok) throw new Error('Server error')
    },
  },
})
```

Throwing `NonRetriableError` stops retry and removes the transaction from the outbox. Use it for failures known to be permanent under the server contract, such as validation errors or a 409 that means an unrecoverable duplicate. A recoverable 401 can instead reach `shouldRetry`.

### Retry decisions

Set `shouldRetry` to override the default decision for a named mutation function
error. The hook receives the named mutation function's `Error` and retry count
(`0` on the first failure). The same `Error` instance is passed through; a
non-`Error` rejection is converted to an `Error` and may lose custom fields.
Return `true` to retry, `false` to stop, or `undefined` to use the
default decision. For example, return `true` for a recoverable 401 and
`undefined` otherwise. `NonRetriableError` always stops without calling the
hook. The default backoff and configured jitter still determine retry timing.
The hook is synchronous and shared by all named mutation functions. An async
hook returns a Promise, which fails its outbox row. Put function-specific
context on the thrown error when retry rules differ between functions.
If the hook throws or returns another value, the executor records a terminal
rejection for that row, removes it from the outbox, and rejects its waiting
promises with the hook failure. Other queued rows continue after the failed
row's deletion is acknowledged. New commits may join the queue during cleanup,
but cannot run ahead of that deletion. A fresh executor does not replay the
failed row. The named mutation function error is logged; the hook failure is
the caller-facing and stored error. Stored errors retain `name`, `message`, and
`stack`, but a restart does not restore an arbitrary error subclass or its
custom fields.
If marker storage or deletion fails, the caller still receives the hook error
while the executor stops with the storage error and retains queued work. A
saved terminal marker skips the named mutation function after restart; an
unmarked row can replay.
To decide from an HTTP status, throw an error carrying `response.status` in
the named mutation function and inspect its numeric status in `shouldRetry`.

```ts
class HttpError extends Error {
  constructor(readonly status: number) {
    super(`HTTP ${status}`)
    this.name = 'HttpError'
  }
}

function throwOnHttpFailure(response: Response): void {
  if (!response.ok) throw new HttpError(response.status)
}

const retryOnRecoverable401 = (error: Error): boolean | undefined =>
  error instanceof HttpError && error.status === 401 ? true : undefined
```

Call `throwOnHttpFailure(response)` in the named mutation function and pass
`shouldRetry: retryOnRecoverable401` in the executor config.

### Idempotency keys

Every offline transaction includes an `idempotencyKey`. Pass it to your API to prevent duplicate execution on retry:

```ts
mutationFns: {
  createTodo: async ({ transaction, idempotencyKey }) => {
    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(transaction.mutations[0].modified),
    })
  },
}
```
