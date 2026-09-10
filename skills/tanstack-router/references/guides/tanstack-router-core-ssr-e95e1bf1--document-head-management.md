# Ssr — Document Head Management

[Guide and prerequisites](./tanstack-router-core-ssr-e95e1bf1.md) · Published skill · `@tanstack/router-core@1.171.29`.

## Document Head Management

Use the `head` route option to manage `<title>`, `<meta>`, `<link>`, and `<style>` tags. Render `<HeadContent />` in `<head>` and `<Scripts />` in `<body>`.

### Root Route with Head

```tsx
// src/routes/__root.tsx
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'UTF-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { title: 'My App' },
    ],
    links: [{ rel: 'icon', href: '/favicon.ico' }],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}
```

### Per-Route Head (Nested Deduplication)

Child route `title` and `meta` tags override parent tags with the same `name`/`property`:

```tsx
// src/routes/posts/$postId.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const post = await fetchPost(params.postId)
    return { post }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData.post.title },
      { name: 'description', content: loaderData.post.excerpt },
    ],
  }),
  component: PostPage,
})

function PostPage() {
  const { post } = Route.useLoaderData()
  return <article>{post.content}</article>
}
```

### SPA Head (No Full HTML Control)

For SPAs without server-rendered HTML, render `<HeadContent />` at the top of the component tree:

```tsx
import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router'

const rootRoute = createRootRoute({
  head: () => ({
    meta: [{ title: 'My SPA' }],
  }),
  component: () => (
    <>
      <HeadContent />
      <Outlet />
    </>
  ),
})
```
