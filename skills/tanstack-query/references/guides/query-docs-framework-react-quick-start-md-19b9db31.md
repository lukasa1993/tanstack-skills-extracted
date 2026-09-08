# Quick Start

<a id="source-query-docs-framework-react-quick-start-md"></a>

Release-matched documentation · `@tanstack/react-query@5.102.8`.

[Topic index](../framework-react.md) · [Source provenance](../SOURCES.md)

This code snippet very briefly illustrates the 3 core concepts of React Query:

- [Queries](./query-docs-framework-react-guides-queries-md-4c7087b8.md#source-query-docs-framework-react-guides-queries-md)
- [Mutations](./query-docs-framework-react-guides-mutations-md-38ec4d80.md#source-query-docs-framework-react-guides-mutations-md)
- [Query Invalidation](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/docs/framework/react/guides/query-invalidation.md)

[//]: # 'Example'

If you're looking for a fully functioning example, please have a look at our [simple StackBlitz example](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/examples/react/simple/README.md)

```tsx
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { getTodos, postTodo } from '../my-api'

// Create a client
const queryClient = new QueryClient()

function App() {
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      <Todos />
    </QueryClientProvider>
  )
}

function Todos() {
  // Access the client
  const queryClient = useQueryClient()

  // Queries
  const query = useQuery({ queryKey: ['todos'], queryFn: getTodos })

  // Mutations
  const mutation = useMutation({
    mutationFn: postTodo,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  return (
    <div>
      <ul>
        {query.data?.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>

      <button
        onClick={() => {
          mutation.mutate({
            id: Date.now(),
            title: 'Do Laundry',
          })
        }}
      >
        Add Todo
      </button>
    </div>
  )
}

render(<App />, document.getElementById('root'))
```

[//]: # 'Example'

These three concepts make up most of the core functionality of React Query. The next sections of the documentation will go over each of these core concepts in great detail.
