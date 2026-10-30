# React Db — Setup

[Guide and prerequisites](./tanstack-react-db-ba0ab260.md) · Published skill · `@tanstack/react-db@1.0.0-rc.1`.

## Setup

```tsx
import { eq, not, useLiveQuery } from '@tanstack/react-db'

function TodoList() {
  const { data: todos, isLoading } = useLiveQuery({
    query: (q) =>
      q
        .from({ todo: todoCollection })
        .where(({ todo }) => not(todo.completed))
        .orderBy(({ todo }) => todo.created_at, 'asc'),
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  )
}
```

`@tanstack/react-db` re-exports everything from `@tanstack/db`. In React projects, import everything from `@tanstack/react-db`.
