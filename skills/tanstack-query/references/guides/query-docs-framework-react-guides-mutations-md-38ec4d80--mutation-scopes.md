# Mutations — Mutation Scopes

[Guide and prerequisites](./query-docs-framework-react-guides-mutations-md-38ec4d80.md) · Release-matched documentation · `@tanstack/react-query@5.102.8`.

## Mutation Scopes

Per default, all mutations run in parallel - even if you invoke `.mutate()` of the same mutation multiple times. Mutations can be given a `scope` with an `id` to avoid that. All mutations with the same `scope.id` will run in serial, which means when they are triggered, they will start in `isPaused: true` state if there is already a mutation for that scope in progress. They will be put into a queue and will automatically resume once their time in the queue has come.

[//]: # 'ExampleScopes'

```tsx
const mutation = useMutation({
  mutationFn: addTodo,
  scope: {
    id: 'todo',
  },
})
```

[//]: # 'ExampleScopes'
[//]: # 'Materials'
