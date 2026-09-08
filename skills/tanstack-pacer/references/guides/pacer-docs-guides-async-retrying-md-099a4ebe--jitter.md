# Async Retrying — Jitter

[Guide and prerequisites](./pacer-docs-guides-async-retrying-md-099a4ebe.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Jitter

Jitter adds randomness to retry delays to prevent thundering herd problems, where many clients retry at the same time and overwhelm a recovering service. The `jitter` option accepts a value between 0 and 1, representing the percentage of random variation to apply:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  backoff: 'exponential',
  baseWait: 1000,
  jitter: 0.1 // Add ±10% random variation
})
// Attempt 2: wait 900-1100ms (1000ms ± 10%)
// Attempt 3: wait 1800-2200ms (2000ms ± 10%)
// Attempt 4: wait 3600-4400ms (4000ms ± 10%)
```

Jitter is particularly useful when:
- Multiple clients might fail at the same time (e.g., service outage)
- You're dealing with rate-limited APIs
- You want to spread out retry attempts to avoid overwhelming a recovering service
