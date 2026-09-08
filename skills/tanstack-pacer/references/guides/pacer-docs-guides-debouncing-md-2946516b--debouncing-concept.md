# Debouncing — Debouncing Concept

[Guide and prerequisites](./pacer-docs-guides-debouncing-md-2946516b.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Debouncing Concept

Debouncing is a technique that delays the execution of a function until a specified period of inactivity has occurred. Unlike rate limiting which allows bursts of executions up to a limit, or throttling which ensures evenly spaced executions, debouncing collapses multiple rapid function calls into a single execution that only happens after the calls stop. This makes debouncing ideal for handling bursts of events where you only care about the final state after the activity settles.

### Debouncing Visualization

```text
Debouncing (wait: 3 ticks)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️  ⬇️  ⬇️     ⬇️  ⬇️  ⬇️  ⬇️               ⬇️  ⬇️
Executed:     ❌  ❌  ❌  ❌  ❌     ❌  ❌  ❌  ⏳   ->   ✅     ❌  ⏳   ->    ✅
             [=================================================================]
                                                        ^ Executes here after
                                                         3 ticks of no calls

             [Burst of calls]     [More calls]   [Wait]      [New burst]
             No execution         Resets timer    [Delayed Execute]  [Wait] [Delayed Execute]
```

### When to Use Debouncing

Debouncing is particularly effective when you want to wait for a "pause" in activity before taking action. This makes it ideal for handling user input or other rapidly-firing events where you only care about the final state.

### When Not to Use Debouncing

Debouncing might not be the best choice when:
- You need guaranteed execution over a specific time period (use [throttling](./pacer-docs-guides-throttling-md-b3667c78.md#source-pacer-docs-guides-throttling-md) instead)
- You can't afford to miss any executions (use [queuing](./pacer-docs-guides-queuing-md-4661e110.md#source-pacer-docs-guides-queuing-md) instead)
