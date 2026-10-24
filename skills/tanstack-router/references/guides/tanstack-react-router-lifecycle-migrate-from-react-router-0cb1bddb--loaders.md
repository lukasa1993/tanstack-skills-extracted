# Migrate From React Router — Loaders

[Guide and prerequisites](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb.md) · Published skill · `@tanstack/react-router@1.170.46`.

## Loaders

- [ ] **Convert React Router loaders**

React Router (v7):

```tsx
export async function loader({ params }) {
  const post = await fetchPost(params.postId)
  return { post }
}

export default function Post() {
  const { post } = useLoaderData()
  return <div>{post.title}</div>
}
```

TanStack Router:

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const post = await fetchPost(params.postId)
    return { post }
  },
  component: Post,
})

function Post() {
  const { post } = Route.useLoaderData()
  return <div>{post.title}</div>
}
```

Key differences:

- Loader is a route option, not a separate export
- `useLoaderData()` is called via `Route.useLoaderData()` (or `useLoaderData({ from })`)
- TanStack Router loaders run on the CLIENT by default (not server-only)
- No `json()` wrapper needed — return plain objects
