# Type Safety — TypeScript Performance

[Guide and prerequisites](./tanstack-router-core-type-safety-d349a495.md) · Published skill · `@tanstack/router-core@1.171.28`.

## TypeScript Performance

### Use Object Syntax for `addChildren` in Large Route Trees

```tsx
// SLOWER — tuple syntax
const routeTree = rootRoute.addChildren([
  postsRoute.addChildren([postRoute, postsIndexRoute]),
  indexRoute,
])

// FASTER — object syntax (TS checks objects faster than large tuples)
const routeTree = rootRoute.addChildren({
  postsRoute: postsRoute.addChildren({ postRoute, postsIndexRoute }),
  indexRoute,
})
```

With file-based routing the route tree is generated, so this is handled for you.

### Avoid Returning Unused Inferred Types from Loaders

When using external caches like TanStack Query, don't let the router infer complex return types you never consume:

```tsx
// SLOWER — TS infers the full ensureQueryData return type into the route tree
export const Route = createFileRoute('/posts/$postId')({
  loader: ({ context: { queryClient }, params: { postId } }) =>
    queryClient.ensureQueryData(postQueryOptions(postId)),
  component: PostComponent,
})

// FASTER — void return, inference stays out of the route tree
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ context: { queryClient }, params: { postId } }) => {
    await queryClient.ensureQueryData(postQueryOptions(postId))
  },
  component: PostComponent,
})
```

### `as const satisfies` for Link Option Objects

Never use `LinkProps` as a variable type — it's an enormous union:

```tsx
import type { LinkProps, RegisteredRouter } from '@tanstack/react-router'

// WRONG — LinkProps is a massive union, extremely slow TS check
const wrongProps: LinkProps = { to: '/posts' }

// CORRECT — infer a precise type, validate against LinkProps
const goodProps = { to: '/posts' } as const satisfies LinkProps

// EVEN BETTER — narrow LinkProps with generic params
const narrowedProps = {
  to: '/posts',
} as const satisfies LinkProps<RegisteredRouter, string, '/posts'>
```

### Type-Safe Link Option Arrays

```tsx
import type { LinkProps } from '@tanstack/react-router'

export const navLinks = [
  { to: '/posts' },
  { to: '/posts/$postId', params: { postId: '1' } },
] as const satisfies ReadonlyArray<LinkProps>

// Use the precise inferred type, not LinkProps directly
export type NavLink = (typeof navLinks)[number]
```
