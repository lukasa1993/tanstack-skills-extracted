# Middleware — Built-in: toolCacheMiddleware

[Guide and prerequisites](./tanstack-ai-core-middleware-b87affa9.md) · Published skill · `@tanstack/ai@0.53.0`.

## Built-in: toolCacheMiddleware

Caches tool call results by name + arguments. Import from `@tanstack/ai/middlewares`:

```typescript
import { chat } from '@tanstack/ai'
import { toolCacheMiddleware } from '@tanstack/ai/middlewares'

const stream = chat({
  adapter,
  messages,
  tools: [weatherTool],
  middleware: [
    toolCacheMiddleware({
      ttl: 60_000, // Cache entries expire after 60 seconds
      maxSize: 50, // Max 50 entries (LRU eviction)
      toolNames: ['getWeather'], // Only cache specific tools
    }),
  ],
})
```

Options: `maxSize` (default 100), `ttl` (default Infinity), `toolNames` (default all),
`keyFn` (custom cache key), `storage` (custom backend like Redis). See
`docs/advanced/middleware.md` for custom storage examples.
