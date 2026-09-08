# Async Retrying — Danger with Misconfigured Retries

[Guide and prerequisites](./pacer-docs-guides-async-retrying-md-099a4ebe.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Danger with Misconfigured Retries

Before implementing retries, understanding the underlying concepts helps you make better decisions about retry strategies and configurations.

### The Thundering Herd Problem

The thundering herd problem occurs when many clients simultaneously retry failed requests to a recovering service, overwhelming it and preventing recovery. This usually happens when a service has a brief outage affecting many clients at once, causing all clients to fail and begin retrying. Without any randomization, these clients attempt retries at exactly the same intervals. The resulting synchronized retry attempts put heavy load on the recovering service, which reinforces the outage and leads to more simultaneous retry cycles.

**How TanStack Pacer Addresses This:**

Jitter adds randomness to retry delays, spreading out retry attempts across time rather than having them occur simultaneously. When you configure jitter, each client's retry timing becomes slightly different:

```ts
// Without jitter: all clients retry at exactly 1s, 2s, 4s, 8s
// This can overwhelm a recovering service

// With jitter: clients retry at randomized intervals
const retryer = new AsyncRetryer(asyncFn, {
  backoff: 'exponential',
  baseWait: 1000,
  jitter: 0.3 // 30% random variation
})
// Client A might retry at: 850ms, 1.7s, 3.6s, 7.2s
// Client B might retry at: 1.15s, 2.3s, 4.4s, 8.8s
// Client C might retry at: 950ms, 1.9s, 3.8s, 7.6s
```

This distribution prevents synchronized retry waves and gives the service breathing room to recover.

### Exponential Backoff and Resource Conservation

Exponential backoff doubles the wait time between retries. This pattern serves multiple purposes:

**Fast Recovery for Transient Issues:**
The first retry happens quickly (after `baseWait`), catching brief network hiccups or momentary service interruptions.

**Reduced Load on Failing Services:**
As retries continue, the increasing delays reduce the request rate to a struggling service, giving it time to recover rather than keeping it under constant pressure.

**Resource Efficiency:**
Long delays between later retries prevent your application from consuming resources (memory, connections, threads) waiting for a service that might be down for an extended period.

```ts
// With exponential backoff and 1s base wait:
// Attempt 1: immediate
// Attempt 2: 1s later (service might recover quickly)
// Attempt 3: 2s later (giving service more time)
// Attempt 4: 4s later (backing off further)
// Attempt 5: 8s later (minimal load if service is down)
```
