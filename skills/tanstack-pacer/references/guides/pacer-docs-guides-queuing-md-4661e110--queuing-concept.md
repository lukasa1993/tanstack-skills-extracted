# Queuing — Queuing Concept

[Guide and prerequisites](./pacer-docs-guides-queuing-md-4661e110.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Queuing Concept

Queuing ensures that every operation is eventually processed, even if they come in faster than they can be handled. Unlike the other execution control techniques that drop excess operations, queuing buffers operations in an ordered list and processes them according to specific rules. This makes queuing the only "lossless" execution control technique in TanStack Pacer, unless a `maxSize` is specified which can cause items to be rejected when the buffer is full.

### Queuing Visualization

```text
Queuing (processing one item every 2 ticks)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️     ⬇️  ⬇️     ⬇️  ⬇️  ⬇️
Queue:       [ABC]   [BC]    [BCDE]    [DE]    [E]    []
Executed:     ✅     ✅       ✅        ✅      ✅     ✅
             [=================================================================]
             ^ Unlike rate limiting/throttling/debouncing,
               ALL calls are eventually processed in order

             [Items queue up]   [Process steadily]   [Empty]
              when busy          one by one           queue
```

### When to Use Queuing

Queuing is particularly important when you need to ensure that every operation is processed, even if it means introducing some delay. This makes it ideal for scenarios where data consistency and completeness are more important than immediate execution. When using a `maxSize`, it can also serve as a buffer to prevent overwhelming a system with too many pending operations.

### When Not to Use Queuing

Queuing might not be the best choice when:
- Immediate feedback is more important than processing every operation
- You only care about the most recent value (use [debouncing](./pacer-docs-guides-debouncing-md-2946516b.md#source-pacer-docs-guides-debouncing-md) instead)
- You want to group operations together (use [batching](./pacer-docs-guides-batching-md-c3c877da.md#source-pacer-docs-guides-batching-md) instead)

> [!TIP]
> If you're currently using rate limiting, throttling, or debouncing but finding that dropped operations are causing problems, queuing is likely the solution you need.
