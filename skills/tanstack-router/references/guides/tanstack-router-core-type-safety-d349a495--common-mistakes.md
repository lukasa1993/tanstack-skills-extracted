# Type Safety — Common Mistakes

[Guide and prerequisites](./tanstack-router-core-type-safety-d349a495.md) · Published skill · `@tanstack/router-core@1.171.28`.

## Common Mistakes

### 1. CRITICAL: Adding type annotations or casts to inferred values

```tsx
// WRONG — casting masks real type errors
const search = useSearch({ from: '/posts' }) as { page: number }

// WRONG — unnecessary annotation
const params: { postId: string } = useParams({ from: '/posts/$postId' })

// WRONG — generic param on hook
const data = useLoaderData<{ posts: Post[] }>({ from: '/posts' })

// CORRECT — let inference work
const search = useSearch({ from: '/posts' })
const params = useParams({ from: '/posts/$postId' })
const data = useLoaderData({ from: '/posts' })
```

### 2. HIGH: Using un-narrowed `LinkProps` type

```tsx
// WRONG — LinkProps is a massive union, causes severe TS slowdown
const myProps: LinkProps = { to: '/posts' }

// CORRECT — use as const satisfies for precise inference
const myProps = { to: '/posts' } as const satisfies LinkProps
```

### 3. HIGH: Not narrowing `Link`/`useNavigate` with `from`

```tsx
// WRONG — search is a union of ALL routes, TS check grows with route count
<Link to=".." search={{ page: 0 }} />

// CORRECT — narrowed, fast check
<Link from={Route.fullPath} to=".." search={{ page: 0 }} />
```

### 4. CRITICAL (cross-skill): Missing router type registration

```tsx
// WRONG — Link/useNavigate have no autocomplete, all paths are untyped strings
const router = createRouter({ routeTree })
// (no declare module)

// CORRECT — always register
const router = createRouter({ routeTree })
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

### 5. CRITICAL (cross-skill): Wrong-framework imports and file structure

Wrong-framework code looks plausible (it's React) but breaks the build or produces conflicting `/` routes at runtime.

```tsx
// WRONG — react-router-dom and next/* are different libraries
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

// CORRECT — all routing exports come from @tanstack/react-router
import {
  Link,
  Outlet,
  useNavigate,
  useRouter,
  useLocation,
  useParams,
  redirect,
} from '@tanstack/react-router'
```

```tsx
// WRONG file structures + APIs:
//   src/pages/*.tsx with getServerSideProps / getStaticProps  (Next.js Pages Router)
//   app/layout.tsx + app/page.tsx                              (Next.js App Router)
//   _app/index.tsx, pages/_app.tsx, pages/_document.tsx        (Next.js custom App)
//   loader/action exports                                       (Remix)

// CORRECT — TanStack file-based routing at src/routes/*.tsx
export const Route = createFileRoute('/posts')({
  loader: async () => { ... },
  validateSearch: zodValidator(schema),
  component: PostsComponent,
})
const search = Route.useSearch()
```

If a build error mentions `react-router-dom`, `next/`, `pages/_app`, or duplicate `/` routes, fix the import — don't paper over with type assertions.

### 6. CRITICAL: Treating typecheck as proof of runtime schema propagation

Types can say a field exists while a database projection, API serializer, or server function omits it. When adding or renaming a field, trace the value through storage, validation, handler output, loader data, and rendered UI. Do not cast the response to the desired type.
Add a runtime assertion against the real handler or serialized response, such as `expect(await getOrder({ data: { id } })).toMatchObject({ totalCents: 2599 })`.
Then run the route-level test and production build. The type test remains necessary, but it is not the runtime contract test.

See also: router-core (Register setup), router-core/navigation (from narrowing), router-core/code-splitting (getRouteApi).
