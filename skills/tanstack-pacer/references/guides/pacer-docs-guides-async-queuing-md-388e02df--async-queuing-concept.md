# Async Queuing — Async Queuing Concept

[Guide and prerequisites](./pacer-docs-guides-async-queuing-md-388e02df.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Async Queuing Concept

Async queuing extends the basic queuing concept by adding concurrent processing capabilities. Instead of processing one item at a time, an async queuer can process multiple items simultaneously while still maintaining order and control over the execution. This is particularly useful when dealing with I/O operations, network requests, or any tasks that spend most of their time waiting rather than consuming CPU.

### Async Queuing Visualization

```text
Async Queuing (concurrency: 2, wait: 2 ticks)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️  ⬇️     ⬇️  ⬇️     ⬇️
Queue:       [ABC]   [C]    [CDE]    [E]    []
Active:      [A,B]   [B,C]  [C,D]    [D,E]  [E]
Completed:    -       A      B        C      D,E
             [=================================================================]
             ^ Unlike regular queuing, multiple items
               can be processed concurrently

             [Items queue up]   [Process 2 at once]   [Complete]
              when busy         with wait between      all items
```

### When to Use Async Queuing

Async queuing is particularly effective when you need to:
- Process multiple asynchronous operations concurrently
- Control the number of simultaneous operations
- Handle Promise-based tasks with proper error handling
- Maintain order while maximizing throughput
- Process background tasks that can run in parallel

### When Not to Use Async Queuing

The AsyncQueuer is very versatile and can be used in many situations. If you don't need concurrent processing, use [Queuing](./pacer-docs-guides-queuing-md-4661e110.md#source-pacer-docs-guides-queuing-md) instead. If you don't need all executions that are queued to go through, use [Throttling](./pacer-docs-guides-throttling-md-b3667c78.md#source-pacer-docs-guides-throttling-md) instead.

If you want to group operations together, use [Batching](./pacer-docs-guides-batching-md-c3c877da.md#source-pacer-docs-guides-batching-md) instead.
