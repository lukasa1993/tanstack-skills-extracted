# Server Functions — Calling from Loaders

[Guide and prerequisites](./tanstack-start-client-core-start-core-server-functions-49d113b0.md) · Published skill · `@tanstack/start-client-core@1.170.28`.

## Calling from Loaders

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const getPosts = createServerFn({ method: 'GET' }).handler(async () => {
  const posts = await db.query('SELECT * FROM posts')
  return { posts }
})

export const Route = createFileRoute('/posts')({
  loader: () => getPosts(),
  component: PostList,
})

function PostList() {
  const { posts } = Route.useLoaderData()
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  )
}
```
