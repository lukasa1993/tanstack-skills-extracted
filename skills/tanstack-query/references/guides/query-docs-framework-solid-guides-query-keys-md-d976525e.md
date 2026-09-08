# Query Keys

<a id="source-query-docs-framework-solid-guides-query-keys-md"></a>

Release-matched documentation · `@tanstack/solid-query@5.102.8`.

[Topic index](../framework-solid.md) · [Source provenance](../SOURCES.md)

[//]: # 'Example'

```tsx
// A list of todos
useQuery(() => ({ queryKey: ['todos'], ... }))

// Something else, whatever!
useQuery(() => ({ queryKey: ['something', 'special'], ... }))
```

[//]: # 'Example'
[//]: # 'Example2'

```tsx
// An individual todo
useQuery(() => ({ queryKey: ['todo', 5], ... }))

// An individual todo in a "preview" format
useQuery(() => ({ queryKey: ['todo', 5, { preview: true }], ...}))

// A list of todos that are "done"
useQuery(() => ({ queryKey: ['todos', { type: 'done' }], ... }))
```

[//]: # 'Example2'
[//]: # 'Example3'

```tsx
useQuery(() => ({ queryKey: ['todos', { status, page }], ... }))
useQuery(() => ({ queryKey: ['todos', { page, status }], ...}))
useQuery(() => ({ queryKey: ['todos', { page, status, other: undefined }], ... }))
```

[//]: # 'Example3'
[//]: # 'Example4'

```tsx
useQuery(() => ({ queryKey: ['todos', status, page], ... }))
useQuery(() => ({ queryKey: ['todos', page, status], ...}))
useQuery(() => ({ queryKey: ['todos', undefined, page, status], ...}))
```

[//]: # 'Example4'
[//]: # 'Example5'

```tsx
function Todos(props) {
  const todosQuery = useQuery(() => ({
    queryKey: ['todos', props.todoId],
    queryFn: () => fetchTodoById(props.todoId),
  }))
}
```

[//]: # 'Example5'
