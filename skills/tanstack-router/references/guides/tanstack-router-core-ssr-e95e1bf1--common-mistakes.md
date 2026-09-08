# Ssr — Common Mistakes

[Guide and prerequisites](./tanstack-router-core-ssr-e95e1bf1.md) · Published skill · `@tanstack/router-core@1.171.28`.

## Common Mistakes

### 1. HIGH: Using browser APIs in loaders without environment check

Loaders run on BOTH client and server with SSR. Browser-only APIs (`window`, `document`, `localStorage`) throw on the server.

```tsx
// WRONG — crashes on server
loader: async () => {
  const token = localStorage.getItem('token')
  return fetchData(token)
}

// CORRECT — guard with environment check
loader: async () => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return fetchData(token)
}
```

### 2. MEDIUM: Using hash fragments for server-rendered content

Hash fragments (`#section`) are never sent to the server. Conditional rendering based on hash causes hydration mismatches.

```tsx
// WRONG — server has no hash, client does → mismatch
component: () => {
  const hash = window.location.hash
  return hash === '#admin' ? <AdminPanel /> : <UserPanel />
}

// CORRECT — use search params for server-visible state
validateSearch: z.object({ view: fallback(z.enum(['admin', 'user']), 'user') }),
component: () => {
  const { view } = Route.useSearch()
  return view === 'admin' ? <AdminPanel /> : <UserPanel />
}
```

### 3. CRITICAL: Generating Next.js, Remix, or React Router DOM patterns

TanStack Router does NOT use `getServerSideProps`, `getStaticProps`, App Router `page.tsx`, Remix-style server-only `loader` exports, or anything from `react-router-dom`.

#### Wrong file structures

```text
WRONG (Next.js Pages Router):
  src/pages/index.tsx
  src/pages/_app.tsx
  src/pages/posts/[id].tsx

WRONG (Next.js App Router):
  app/layout.tsx
  app/page.tsx
  app/posts/[id]/page.tsx

WRONG (Next.js custom App):
  _app/index.tsx
  pages/_app.tsx, pages/_document.tsx

CORRECT (TanStack Router file-based routing):
  src/routes/__root.tsx
  src/routes/index.tsx
  src/routes/posts/$postId.tsx
```

#### Wrong imports

```tsx
// WRONG — react-router-dom is a different library
import {
  Link,
  useNavigate,
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom'

// WRONG — Next.js Link/router
import Link from 'next/link'
import { useRouter } from 'next/router' // Pages Router
import { useRouter } from 'next/navigation' // App Router

// CORRECT — everything routing-related lives in @tanstack/react-router
import {
  Link,
  useNavigate,
  useRouter,
  useLocation,
  redirect,
} from '@tanstack/react-router'
```

#### Wrong loader/data-fetching patterns

```tsx
// WRONG — Next.js Pages Router
export async function getServerSideProps() {
  return { props: { data: await fetchData() } }
}

// WRONG — Remix
export async function loader({ request }: LoaderFunctionArgs) {
  return json({ data: await fetchData() })
}

// CORRECT — TanStack Router
export const Route = createFileRoute('/data')({
  loader: async () => {
    const data = await fetchData()
    return { data }
  },
  component: DataPage,
})

function DataPage() {
  const { data } = Route.useLoaderData()
  return <div>{data}</div>
}
```

If you see `src/pages/`, `app/layout.tsx`, `react-router-dom`, or any of the above in agent output, the agent is generating for the wrong framework. The build will either fail or produce duplicate `/` routes that conflict at runtime.
