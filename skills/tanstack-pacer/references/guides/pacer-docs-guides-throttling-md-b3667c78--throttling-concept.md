# Throttling — Throttling Concept

[Guide and prerequisites](./pacer-docs-guides-throttling-md-b3667c78.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Throttling Concept

Throttling ensures function executions are evenly spaced over time. Unlike rate limiting which allows bursts of executions up to a limit, or debouncing which waits for activity to stop, throttling creates a smoother execution pattern by enforcing consistent delays between calls. If you set a throttle of one execution per second, calls will be spaced out evenly regardless of how rapidly they are requested.

### Throttling Visualization

```text
Throttling (one execution per 3 ticks)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️           ⬇️  ⬇️  ⬇️  ⬇️             ⬇️
Executed:     ✅  ❌  ⏳  ->   ✅  ❌  ❌  ❌  ✅             ✅
             [=================================================================]
             ^ Only one execution allowed per 3 ticks,
               regardless of how many calls are made

             [First burst]    [More calls]              [Spaced calls]
             Execute first    Execute after             Execute each time
             then throttle    wait period               wait period passes
```

### When to Use Throttling

Throttling is particularly effective when you need consistent, predictable execution timing. This makes it ideal for handling frequent events or updates where you want smooth, controlled behavior.

### When Not to Use Throttling

Throttling might not be the best choice when:
- You want to wait for activity to stop (use [debouncing](./pacer-docs-guides-debouncing-md-2946516b.md#source-pacer-docs-guides-debouncing-md) instead)
- You can't afford to miss any executions (use [queuing](./pacer-docs-guides-queuing-md-4661e110.md#source-pacer-docs-guides-queuing-md) instead)

> [!TIP]
> Throttling is often the best choice when you need smooth, consistent execution timing. It provides a more predictable execution pattern than rate limiting and more immediate feedback than debouncing.
