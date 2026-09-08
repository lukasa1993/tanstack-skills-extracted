# Async Retrying — Backoff Strategies

[Guide and prerequisites](./pacer-docs-guides-async-retrying-md-099a4ebe.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Backoff Strategies

The `backoff` option controls how the wait time between retry attempts changes:

### Exponential Backoff (Default)

Wait time doubles with each attempt. This is the most common strategy and works well for most scenarios:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  backoff: 'exponential',
  baseWait: 1000
})
// Attempt 1: immediate
// Attempt 2: wait 1 second (1000ms * 2^0)
// Attempt 3: wait 2 seconds (1000ms * 2^1)
// Attempt 4: wait 4 seconds (1000ms * 2^2)
// Attempt 5: wait 8 seconds (1000ms * 2^3)
```

### Linear Backoff

Wait time increases linearly with each attempt:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  backoff: 'linear',
  baseWait: 1000
})
// Attempt 1: immediate
// Attempt 2: wait 1 second (1000ms * 1)
// Attempt 3: wait 2 seconds (1000ms * 2)
// Attempt 4: wait 3 seconds (1000ms * 3)
// Attempt 5: wait 4 seconds (1000ms * 4)
```

### Fixed Backoff

Wait time remains constant for all attempts:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  backoff: 'fixed',
  baseWait: 1000
})
// Attempt 1: immediate
// Attempt 2: wait 1 second
// Attempt 3: wait 1 second
// Attempt 4: wait 1 second
// Attempt 5: wait 1 second
```
