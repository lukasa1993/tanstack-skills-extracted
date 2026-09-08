# Async Batching — When to Use Async Batching

[Guide and prerequisites](./pacer-docs-guides-async-batching-md-151108d1.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## When to Use Async Batching

While the synchronous batcher works well for many use cases, async batching provides additional capabilities that are particularly useful when:

- You need to capture and use the return value from batch executions
- Your batch processing involves asynchronous operations (API calls, database operations, file I/O)
- You require advanced error handling with configurable error behavior
- You want to track success/error statistics separately
- You need to monitor when batches are actively executing
