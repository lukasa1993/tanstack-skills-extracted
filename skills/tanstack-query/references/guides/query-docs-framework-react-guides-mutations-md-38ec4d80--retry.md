# Mutations — Retry

[Guide and prerequisites](./query-docs-framework-react-guides-mutations-md-38ec4d80.md) · Release-matched documentation · `@tanstack/react-query@5.102.8`.

## Retry

By default, TanStack Query will not retry a mutation on error, but it is possible with the `retry` option:

[//]: # 'Example9'

```tsx
const mutation = useMutation({
  mutationFn: addTodo,
  retry: 3,
})
```

[//]: # 'Example9'

If mutations fail because the device is offline, they will be retried in the same order when the device reconnects.
