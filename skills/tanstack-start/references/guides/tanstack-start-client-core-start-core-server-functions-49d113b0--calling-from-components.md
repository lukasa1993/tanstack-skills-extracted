# Server Functions — Calling from Components

[Guide and prerequisites](./tanstack-start-client-core-start-core-server-functions-49d113b0.md) · Published skill · `@tanstack/start-client-core@1.170.29`.

## Calling from Components

Use the `useServerFn` hook to call server functions from event handlers:

```tsx
import { useServerFn } from '@tanstack/react-start'

const deletePost = createServerFn({ method: 'POST' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await db.delete('posts').where({ id: data.id })
    return { success: true }
  })

function DeleteButton({ postId }: { postId: string }) {
  const deletePostFn = useServerFn(deletePost)

  return (
    <button onClick={() => deletePostFn({ data: { id: postId } })}>
      Delete
    </button>
  )
}
```
