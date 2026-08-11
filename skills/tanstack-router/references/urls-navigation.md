# URLs and navigation

Path parameters, search parameters, and navigation.

<a id="source-tanstack-router-core-navigation"></a>

## Navigation

Source: `tanstack-router-core-navigation`.

## Navigation

### Setup

Basic type-safe `Link` with `to` and `params`:

```tsx
import { Link } from '@tanstack/react-router'

function PostLink({ postId }: { postId: string }) {
  return (
    <Link to="/posts/$postId" params={{ postId }}>
      View Post
    </Link>
  )
}
```

### Core Patterns

#### Link with Active States

```tsx
import { Link } from '@tanstack/react-router'

function NavLink() {
  return (
    <Link
      to="/posts"
      activeProps={{ className: 'font-bold' }}
      inactiveProps={{ className: 'text-gray-500' }}
      activeOptions={{ exact: true }}
    >
      Posts
    </Link>
  )
}
```

The `data-status` attribute is also set to `"active"` on active links for CSS-based styling.

`activeOptions` controls matching behavior:

- `exact` (default `false`) — when `true`, only matches the exact path (not children)
- `includeHash` (default `false`) — include hash in active matching
- `includeSearch` (default `true`) — include search params in active matching

Children can receive `isActive` as a render function:

```tsx
<Link to="/posts">
  {({ isActive }) => <span className={isActive ? 'font-bold' : ''}>Posts</span>}
</Link>
```

#### Relative Navigation with `from`

Without `from`, navigation resolves from root `/`. To use relative paths like `..`, provide `from`:

```tsx
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  component: PostComponent,
})

function PostComponent() {
  return (
    <div>
      {/* Relative to current route */}
      <Link from={Route.fullPath} to="..">
        Back to Posts
      </Link>

      {/* "." reloads the current route */}
      <Link from={Route.fullPath} to=".">
        Reload
      </Link>
    </div>
  )
}
```

#### useNavigate for Programmatic Navigation

Use `useNavigate` only for side-effect-driven navigation (e.g., after a form submission). For anything the user clicks, prefer `Link`.

```tsx
import { useNavigate } from '@tanstack/react-router'

function CreatePostForm() {
  const navigate = useNavigate({ from: '/posts' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch('/api/posts', { method: 'POST', body: '...' })
    const { id: postId } = await response.json()

    if (response.ok) {
      navigate({ to: '/posts/$postId', params: { postId } })
    }
  }

  return <form onSubmit={handleSubmit}>{/* ... */}</form>
}
```

The `Navigate` component performs an immediate client-side navigation on mount:

```tsx
import { Navigate } from '@tanstack/react-router'

function LegacyRedirect() {
  return <Navigate to="/posts/$postId" params={{ postId: 'my-first-post' }} />
}
```

`router.navigate` is available anywhere you have the router instance, including outside of React.

#### Preloading

Strategies: `intent` (hover/touchstart), `viewport` (intersection observer), `render` (on mount).

Set globally:

```tsx
import { createRouter } from '@tanstack/react-router'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadDelay: 50, // ms, default is 50
})
```

Or per-link:

```tsx
<Link
  to="/posts/$postId"
  params={{ postId }}
  preload="intent"
  preloadDelay={100}
>
  View Post
</Link>
```

Preloaded data stays fresh for 30 seconds by default (`defaultPreloadStaleTime: 30_000`). During that window it won't be refetched. When using an external cache like TanStack Query, set `defaultPreloadStaleTime: 0` to let the external library control freshness.

Manual preloading via the router instance:

```tsx
import { useRouter } from '@tanstack/react-router'

function Component() {
  const router = useRouter()

  useEffect(() => {
    router.preloadRoute({ to: '/posts/$postId', params: { postId: '1' } })
  }, [router])

  return <div />
}
```

#### Navigation Blocking

Use `useBlocker` to prevent navigation when a form has unsaved changes:

```tsx
import { useBlocker } from '@tanstack/react-router'
import { useState } from 'react'

function EditForm() {
  const [formIsDirty, setFormIsDirty] = useState(false)

  useBlocker({
    shouldBlockFn: () => {
      if (!formIsDirty) return false
      const shouldLeave = confirm('Are you sure you want to leave?')
      return !shouldLeave
    },
  })

  return <form>{/* ... */}</form>
}
```

With custom UI using `withResolver`:

```tsx
import { useBlocker } from '@tanstack/react-router'
import { useState } from 'react'

function EditForm() {
  const [formIsDirty, setFormIsDirty] = useState(false)

  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => formIsDirty,
    withResolver: true,
  })

  return (
    <>
      <form>{/* ... */}</form>
      {status === 'blocked' && (
        <div>
          <p>Are you sure you want to leave?</p>
          <button onClick={proceed}>Yes</button>
          <button onClick={reset}>No</button>
        </div>
      )}
    </>
  )
}
```

Control `beforeunload` separately:

```tsx
useBlocker({
  shouldBlockFn: () => formIsDirty,
  enableBeforeUnload: formIsDirty,
})
```

#### linkOptions for Reusable Navigation Options

`linkOptions` provides eager type-checking on navigation options objects, so errors surface at definition, not at spread-site:

```tsx
import {
  linkOptions,
  Link,
  useNavigate,
  redirect,
} from '@tanstack/react-router'

const dashboardLinkOptions = linkOptions({
  to: '/dashboard',
  search: { search: '' },
})

// Use anywhere: Link, navigate, redirect
function Nav() {
  const navigate = useNavigate()

  return (
    <div>
      <Link {...dashboardLinkOptions}>Dashboard</Link>
      <button onClick={() => navigate(dashboardLinkOptions)}>Go</button>
    </div>
  )
}

// Also works in an array for navigation bars
const navOptions = linkOptions([
  { to: '/dashboard', label: 'Summary', activeOptions: { exact: true } },
  { to: '/dashboard/invoices', label: 'Invoices' },
  { to: '/dashboard/users', label: 'Users' },
])

function NavBar() {
  return (
    <nav>
      {navOptions.map((option) => (
        <Link
          {...option}
          key={option.to}
          activeProps={{ className: 'font-bold' }}
        >
          {option.label}
        </Link>
      ))}
    </nav>
  )
}
```

#### createLink for Custom Components

Wraps any component with TanStack Router's type-safe navigation:

```tsx
import * as React from 'react'
import { createLink, LinkComponent } from '@tanstack/react-router'

interface BasicLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

const BasicLinkComponent = React.forwardRef<HTMLAnchorElement, BasicLinkProps>(
  (props, ref) => {
    return <a ref={ref} {...props} className="block px-3 py-2 text-blue-700" />
  },
)

const CreatedLinkComponent = createLink(BasicLinkComponent)

export const CustomLink: LinkComponent<typeof BasicLinkComponent> = (props) => {
  return <CreatedLinkComponent preload="intent" {...props} />
}
```

Usage retains full type safety:

```tsx
<CustomLink to="/dashboard/invoices/$invoiceId" params={{ invoiceId: 0 }} />
```

#### Scroll Restoration

Enable globally on the router:

```tsx
const router = createRouter({
  routeTree,
  scrollRestoration: true,
})
```

For nested scrollable areas:

```tsx
const router = createRouter({
  routeTree,
  scrollRestoration: true,
  scrollToTopSelectors: ['#main-scrollable-area'],
})
```

Custom cache keys:

```tsx
const router = createRouter({
  routeTree,
  scrollRestoration: true,
  getScrollRestorationKey: (location) => location.pathname,
})
```

Prevent scroll reset for a specific navigation:

```tsx
<Link to="/posts" resetScroll={false}>
  Posts
</Link>
```

#### MatchRoute for Pending UI

```tsx
import { Link, MatchRoute } from '@tanstack/react-router'

function Nav() {
  return (
    <Link to="/users">
      Users
      <MatchRoute to="/users" pending>
        <Spinner />
      </MatchRoute>
    </Link>
  )
}
```

### Common Mistakes

#### CRITICAL: Interpolating params into the `to` string

```tsx
// WRONG — breaks type safety and param encoding
<Link to={`/posts/${postId}`}>Post</Link>

// CORRECT — use the params option
<Link to="/posts/$postId" params={{ postId }}>Post</Link>
```

Dynamic segments are declared with `$` in the route path. Always pass them via `params`. This applies to `Link`, `useNavigate`, `Navigate`, and `router.navigate`.

#### MEDIUM: Using useNavigate for clickable elements

```tsx
// WRONG — no href, no cmd+click, no preloading, no accessibility
function BadNav() {
  const navigate = useNavigate()
  return <button onClick={() => navigate({ to: '/posts' })}>Posts</button>
}

// CORRECT — real <a> tag with href, accessible, preloadable
function GoodNav() {
  return <Link to="/posts">Posts</Link>
}
```

Use `useNavigate` only for programmatic side-effect navigation (after form submit, async action, etc).

#### HIGH: Not providing `from` for relative navigation

```tsx
// WRONG — without from, ".." resolves from root
<Link to="..">Back</Link>

// CORRECT — provide from for relative resolution
<Link from={Route.fullPath} to="..">Back</Link>
```

Without `from`, only absolute paths are autocompleted and type-safe. Relative paths like `..` resolve from root instead of the current route.

#### HIGH: Using search as object instead of function loses existing params

```tsx
// WRONG — replaces ALL search params with just { page: 2 }
<Link to="." search={{ page: 2 }}>Page 2</Link>

// CORRECT — preserves existing search params, updates page
<Link to="." search={(prev) => ({ ...prev, page: 2 })}>Page 2</Link>
```

When you pass `search` as a plain object, it replaces all search params. Use the function form to spread previous params and selectively update.

---

### Cross-References

- See also: **./urls-navigation.md#source-tanstack-router-core-search-params** — Link `search` prop interacts with search param validation
- See also: **./foundations.md#source-tanstack-router-core-type-safety** — `from` narrowing improves type inference on Link

<a id="source-tanstack-router-core-path-params"></a>

## Path Params

Source: `tanstack-router-core-path-params`.

## Path Params

Path params capture dynamic URL segments into named variables. They are defined with a `$` prefix in the route path.

> **CRITICAL**: Never interpolate params into the `to` string. Always use the `params` prop. This is the most common agent mistake for path params.

> **CRITICAL**: Types are fully inferred. Never annotate the return of `useParams()`.

### Dynamic Segments

A segment prefixed with `$` captures text until the next `/`.

```tsx
// src/routes/posts.$postId.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    // params.postId is string — fully inferred, do not annotate
    return fetchPost(params.postId)
  },
  component: PostComponent,
})

function PostComponent() {
  const { postId } = Route.useParams()
  const data = Route.useLoaderData()
  return (
    <h1>
      Post {postId}: {data.title}
    </h1>
  )
}
```

Multiple dynamic segments work across path levels:

```tsx
// src/routes/teams.$teamId.members.$memberId.tsx
export const Route = createFileRoute('/teams/$teamId/members/$memberId')({
  component: MemberComponent,
})

function MemberComponent() {
  const { teamId, memberId } = Route.useParams()
  return (
    <div>
      Team {teamId}, Member {memberId}
    </div>
  )
}
```

### Splat / Catch-All Routes

A route with a path ending in `$` (bare dollar sign) captures everything after it. The value is available under the `_splat` key.

```tsx
// src/routes/files.$.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/files/$')({
  component: FileViewer,
})

function FileViewer() {
  const { _splat } = Route.useParams()
  // URL: /files/documents/report.pdf → _splat = "documents/report.pdf"
  return <div>File path: {_splat}</div>
}
```

### Optional Params

Optional params use `{-$paramName}` syntax. The segment may or may not be present. When absent, the value is `undefined`.

```tsx
// src/routes/posts.{-$category}.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/{-$category}')({
  component: PostsComponent,
})

function PostsComponent() {
  const { category } = Route.useParams()
  // URL: /posts → category is undefined
  // URL: /posts/tech → category is "tech"
  return <div>{category ? `Posts in ${category}` : 'All Posts'}</div>
}
```

Multiple optional params:

```tsx
// Matches: /posts, /posts/tech, /posts/tech/hello-world
export const Route = createFileRoute('/posts/{-$category}/{-$slug}')({
  component: PostComponent,
})
```

#### i18n with Optional Locale

```tsx
// src/routes/{-$locale}/about.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/{-$locale}/about')({
  component: AboutComponent,
})

function AboutComponent() {
  const { locale } = Route.useParams()
  const currentLocale = locale || 'en'
  return <h1>{currentLocale === 'fr' ? 'À Propos' : 'About Us'}</h1>
}
// Matches: /about, /en/about, /fr/about
```

### Prefix and Suffix Patterns

Curly braces `{}` around `$paramName` allow text before or after the dynamic part within a single segment.

#### Prefix

```tsx
// src/routes/posts/post-{$postId}.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/post-{$postId}')({
  component: PostComponent,
})

function PostComponent() {
  const { postId } = Route.useParams()
  // URL: /posts/post-123 → postId = "123"
  return <div>Post ID: {postId}</div>
}
```

#### Suffix

```tsx
// src/routes/files/{$fileName}[.]txt.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/files/{$fileName}.txt')({
  component: FileComponent,
})

function FileComponent() {
  const { fileName } = Route.useParams()
  // URL: /files/readme.txt → fileName = "readme"
  return <div>File: {fileName}.txt</div>
}
```

#### Combined Prefix + Suffix

```tsx
// URL: /users/user-456.json → userId = "456"
export const Route = createFileRoute('/users/user-{$userId}.json')({
  component: UserComponent,
})

function UserComponent() {
  const { userId } = Route.useParams()
  return <div>User: {userId}</div>
}
```

### Navigating with Path Params

#### Object Form

```tsx
import { Link } from '@tanstack/react-router'

function PostLink({ postId }: { postId: string }) {
  return (
    <Link to="/posts/$postId" params={{ postId }}>
      View Post
    </Link>
  )
}
```

#### Function Form (Preserves Other Params)

```tsx
function PostLink({ postId }: { postId: string }) {
  return (
    <Link to="/posts/$postId" params={(prev) => ({ ...prev, postId })}>
      View Post
    </Link>
  )
}
```

#### Programmatic Navigation

```tsx
import { useNavigate } from '@tanstack/react-router'

function GoToPost({ postId }: { postId: string }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => {
        navigate({ to: '/posts/$postId', params: { postId } })
      }}
    >
      Go to Post
    </button>
  )
}
```

#### Navigating with Optional Params

```tsx
// Include the optional param
<Link to="/posts/{-$category}" params={{ category: 'tech' }}>
  Tech Posts
</Link>

// Omit the optional param (renders /posts)
<Link to="/posts/{-$category}" params={{ category: undefined }}>
  All Posts
</Link>
```

### Reading Params Outside Route Components

#### `useParams` with `from`

```tsx
import { useParams } from '@tanstack/react-router'

function PostHeader() {
  const { postId } = useParams({ from: '/posts/$postId' })
  return <h2>Post {postId}</h2>
}
```

#### `useParams` with `strict: false`

```tsx
function GenericBreadcrumb() {
  const params = useParams({ strict: false })
  // params is a union of all possible route params
  return <span>{params.postId ?? 'Home'}</span>
}
```

### Params in Loaders and `beforeLoad`

```tsx
export const Route = createFileRoute('/posts/$postId')({
  beforeLoad: async ({ params }) => {
    // params.postId available here
    const canView = await checkPermission(params.postId)
    if (!canView) throw redirect({ to: '/unauthorized' })
  },
  loader: async ({ params }) => {
    return fetchPost(params.postId)
  },
})
```

### Allowed Characters

By default, params are encoded with `encodeURIComponent`. Allow extra characters via router config:

```tsx
import { createRouter } from '@tanstack/react-router'

const router = createRouter({
  routeTree,
  pathParamsAllowedCharacters: ['@', '+'],
})
```

Allowed characters: `;`, `:`, `@`, `&`, `=`, `+`, `$`, `,`.

### Common Mistakes

#### 1. CRITICAL (cross-skill): Interpolating path params into `to` string

```tsx
// WRONG — breaks type safety and param encoding
<Link to={`/posts/${postId}`}>Post</Link>

// CORRECT — use params prop
<Link to="/posts/$postId" params={{ postId }}>Post</Link>
```

#### 2. MEDIUM: Using `*` for splat routes instead of `$`

TanStack Router uses `$` for splat routes. The captured value is under `_splat`, not `*`.

```tsx
// WRONG (React Router / other frameworks)
// <Route path="/files/*" />

// CORRECT (TanStack Router)
// File: src/routes/files.$.tsx
export const Route = createFileRoute('/files/$')({
  component: () => {
    const { _splat } = Route.useParams()
    return <div>{_splat}</div>
  },
})
```

> Note: `*` works in v1 for backwards compatibility but will be removed in v2. Always use `_splat`.

#### 3. MEDIUM: Using curly braces for basic dynamic segments

Curly braces are ONLY for prefix/suffix patterns and optional params. Basic dynamic segments use bare `$`.

```tsx
// WRONG — braces not needed for basic params
createFileRoute('/posts/{$postId}')

// CORRECT — bare $ for basic dynamic segments
createFileRoute('/posts/$postId')

// CORRECT — braces for prefix pattern
createFileRoute('/posts/post-{$postId}')

// CORRECT — braces for optional param
createFileRoute('/posts/{-$category}')
```

#### 4. Params are always strings

Path params are always parsed as strings. If you need a number, parse in the loader or component:

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const id = parseInt(params.postId, 10)
    if (isNaN(id)) throw notFound()
    return fetchPost(id)
  },
})
```

You can also use `params.parse` and `params.stringify` on the route for bidirectional transformation:

```tsx
export const Route = createFileRoute('/posts/$postId')({
  params: {
    parse: (raw) => ({ postId: parseInt(raw.postId, 10) }),
    stringify: (parsed) => ({ postId: String(parsed.postId) }),
  },
  loader: async ({ params }) => {
    // params.postId is now number
    return fetchPost(params.postId)
  },
})
```

<a id="source-tanstack-router-core-search-params"></a>

## Search Params

Source: `tanstack-router-core-search-params`.

## Search Params

TanStack Router treats search params as JSON-first application state. They are automatically parsed from the URL into structured objects (numbers, booleans, arrays, nested objects) and validated via `validateSearch` on each route.

> **CRITICAL**: When using `zodValidator()` and Zod v3, use `fallback()` from `@tanstack/zod-adapter`, NOT zod's `.catch()`. Using `.catch()` with the zod adapter makes the output type `unknown`, destroying type safety. This does not apply to Valibot or ArkType (which use their own fallback mechanisms). It also does not apply to Zod v4, which should use `.catch()` and not use the `zodValidator()`.
> **CRITICAL**: Types are fully inferred. Never annotate the return of `useSearch()`.

### Setup: Zod Adapter (Recommended)

```bash
npm install zod @tanstack/zod-adapter
```

```tsx
// src/routes/products.tsx
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const productSearchSchema = z.object({
  page: z.number().default(1).catch(1),
  filter: z.string().default(''),
  sort: z.enum(['newest', 'oldest', 'price']).default('newest').catch('newest'),
})

export const Route = createFileRoute('/products')({
  validateSearch: productSearchSchema,
  component: ProductsPage,
})

function ProductsPage() {
  // page: number, filter: string, sort: 'newest' | 'oldest' | 'price'
  // ALL INFERRED — do not annotate
  const { page, filter, sort } = Route.useSearch()

  return (
    <div>
      <p>
        Page {page}, filter: {filter}, sort: {sort}
      </p>
    </div>
  )
}
```

### Reading Search Params

#### In Route Components: `Route.useSearch()`

```tsx
function ProductsPage() {
  const { page, sort } = Route.useSearch()
  return <div>Page {page}</div>
}
```

#### In Code-Split Components: `getRouteApi()`

```tsx
import { getRouteApi } from '@tanstack/react-router'

const routeApi = getRouteApi('/products')

function ProductFilters() {
  const { sort } = routeApi.useSearch()
  return <select value={sort}>{/* options */}</select>
}
```

#### From Any Component: `useSearch({ from })`

```tsx
import { useSearch } from '@tanstack/react-router'

function SortIndicator() {
  const { sort } = useSearch({ from: '/products' })
  return <span>Sorted by: {sort}</span>
}
```

#### Loose Access: `useSearch({ strict: false })`

```tsx
function GenericPaginator() {
  const search = useSearch({ strict: false })
  // search.page is number | undefined (union of all routes)
  return <span>Page: {search.page ?? 1}</span>
}
```

### Writing Search Params

#### Link with Function Form (Preserves Existing Params)

```tsx
import { Link } from '@tanstack/react-router'

function Pagination() {
  return (
    <Link
      from="/products"
      search={(prev) => ({ ...prev, page: prev.page + 1 })}
    >
      Next Page
    </Link>
  )
}
```

#### Link with Object Form (Replaces All Params)

```tsx
<Link to="/products" search={{ page: 1, filter: '', sort: 'newest' }}>
  Reset
</Link>
```

#### Programmatic: `useNavigate()`

```tsx
import { useNavigate } from '@tanstack/react-router'

function SortDropdown() {
  const navigate = useNavigate({ from: '/products' })

  return (
    <select
      onChange={(e) => {
        navigate({
          search: (prev) => ({ ...prev, sort: e.target.value, page: 1 }),
        })
      }}
    >
      <option value="newest">Newest</option>
      <option value="price">Price</option>
    </select>
  )
}
```

### Search Param Inheritance

Parent route search params are automatically merged into child routes:

```tsx
// src/routes/shop.tsx — parent defines shared params
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const shopSearchSchema = z.object({
  currency: z.enum(['USD', 'EUR']).default('USD').catch('USD'),
})

export const Route = createFileRoute('/shop')({
  validateSearch: shopSearchSchema,
})
```

```tsx
// src/routes/shop/products.tsx — child inherits currency
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/shop/products')({
  component: ShopProducts,
})

function ShopProducts() {
  // currency is available here from parent — fully typed
  const { currency } = Route.useSearch()
  return <div>Currency: {currency}</div>
}
```

### Search Middlewares

#### `retainSearchParams` — Keep Params Across Navigation

```tsx
import { createRootRoute, retainSearchParams } from '@tanstack/react-router'
import { z } from 'zod'

const rootSearchSchema = z.object({
  debug: z.boolean().optional(),
})

export const Route = createRootRoute({
  validateSearch: rootSearchSchema,
  search: {
    middlewares: [retainSearchParams(['debug'])],
  },
})
```

#### `stripSearchParams` — Remove Default Values from URL

```tsx
import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { z } from 'zod'

const defaults = { sort: 'newest', page: 1 }

const searchSchema = z.object({
  sort: z.string().default(defaults.sort),
  page: z.number().default(defaults.page),
})

export const Route = createFileRoute('/items')({
  validateSearch: searchSchema,
  search: {
    middlewares: [stripSearchParams(defaults)],
  },
})
```

#### Chaining Middlewares

```tsx
export const Route = createFileRoute('/search')({
  validateSearch: z.object({
    retainMe: z.string().optional(),
    arrayWithDefaults: z.string().array().default(['foo', 'bar']),
    required: z.string(),
  }),
  search: {
    middlewares: [
      retainSearchParams(['retainMe']),
      stripSearchParams({ arrayWithDefaults: ['foo', 'bar'] }),
    ],
  },
})
```

### Custom Serialization

Override the default JSON serialization at the router level:

```tsx
import {
  createRouter,
  parseSearchWith,
  stringifySearchWith,
} from '@tanstack/react-router'

const router = createRouter({
  routeTree,
  // Example: use JSURL2 for compact, human-readable URLs
  parseSearch: parseSearchWith(parse),
  stringifySearch: stringifySearchWith(stringify),
})
```

### Using Search Params in Loaders via `loaderDeps`

```tsx
export const Route = createFileRoute('/products')({
  validateSearch: productSearchSchema,
  // Pick ONLY the params the loader needs — not the entire search object
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ deps }) => {
    return fetchProducts({ page: deps.page })
  },
})
```

### Common Mistakes

#### 1. HIGH: Using zod v3's `.catch()` with `zodValidator()` instead of adapter `fallback()`

```tsx
// WRONG — .catch() with zodValidator makes the type unknown
const schema = z.object({ page: z.number().catch(1) })
validateSearch: zodValidator(schema) // page is typed as unknown!

// CORRECT — fallback() preserves the inferred type
import { fallback } from '@tanstack/zod-adapter'
const schema = z.object({ page: fallback(z.number(), 1) })
```

**Important:** This only applies when using Zod v3, not when using Zod v4. For v4, using `.catch()` is correct.

#### 2. HIGH: Returning entire search object from `loaderDeps`

```tsx
// WRONG — loader re-runs on ANY search param change
loaderDeps: ({ search }) => search

// CORRECT — loader only re-runs when page changes
loaderDeps: ({ search }) => ({ page: search.page })
```

#### 3. HIGH: Passing Date objects in search params

```tsx
// WRONG — Date does not serialize correctly to JSON in URLs
<Link search={{ startDate: new Date() }}>

// CORRECT — convert to ISO string
<Link search={{ startDate: new Date().toISOString() }}>
```

#### 4. MEDIUM: Parent route missing `validateSearch` blocks inheritance

```tsx
// WRONG — child cannot access shared params
export const Route = createRootRoute({
  component: RootComponent,
  // no validateSearch!
})

// CORRECT — parent must define validateSearch for children to inherit
export const Route = createRootRoute({
  validateSearch: globalSearchSchema,
  component: RootComponent,
})
```

#### 5. HIGH (cross-skill): Using search as object instead of function loses params

```tsx
// WRONG — replaces ALL search params, losing any existing ones
<Link to="." search={{ page: 2 }}>Page 2</Link>

// CORRECT — preserves existing params, updates only page
<Link to="." search={(prev) => ({ ...prev, page: 2 })}>Page 2</Link>
```

### References

- [Validation Patterns Reference](./assets/tanstack-router-core-search-params/references/validation-patterns.md) — comprehensive patterns for all validation libraries
