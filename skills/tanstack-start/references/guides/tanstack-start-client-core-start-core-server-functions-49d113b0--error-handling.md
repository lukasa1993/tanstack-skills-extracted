# Server Functions — Error Handling

[Guide and prerequisites](./tanstack-start-client-core-start-core-server-functions-49d113b0.md) · Published skill · `@tanstack/start-client-core@1.170.29`.

## Error Handling

### Errors

```tsx
const riskyFunction = createServerFn().handler(async () => {
  throw new Error('Something went wrong!')
})

try {
  await riskyFunction()
} catch (error) {
  console.log(error.message) // "Something went wrong!"
}
```

### Redirects

```tsx
import { redirect } from '@tanstack/react-router'

const requireAuth = createServerFn().handler(async () => {
  const user = await getCurrentUser()
  if (!user) {
    throw redirect({ to: '/login' })
  }
  return user
})
```

### Not Found

```tsx
import { notFound } from '@tanstack/react-router'

const getPost = createServerFn()
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const post = await db.findPost(data.id)
    if (!post) {
      throw notFound()
    }
    return post
  })
```
