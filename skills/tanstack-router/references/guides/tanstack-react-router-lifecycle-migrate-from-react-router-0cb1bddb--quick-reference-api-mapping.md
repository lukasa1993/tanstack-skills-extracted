# Migrate From React Router — Quick Reference: API Mapping

[Guide and prerequisites](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb.md) · Published skill · `@tanstack/react-router@1.170.46`.

## Quick Reference: API Mapping

| React Router v7              | TanStack Router                                      |
| ---------------------------- | ---------------------------------------------------- |
| `<BrowserRouter>`            | `<RouterProvider router={router} />`                 |
| `<Routes>` / `<Route>`       | File-based: `src/routes/*.tsx`                       |
| `<Link to="/path">`          | `<Link to="/path">`                                  |
| `<Link to={`/posts/${id}`}>` | `<Link to="/posts/$postId" params={{ postId: id }}>` |
| `useNavigate()('/path')`     | `navigate({ to: '/path' })`                          |
| `useParams()`                | `useParams({ from: '/route/$param' })`               |
| `useSearchParams()`          | `validateSearch` + `useSearch({ from })`             |
| `useLoaderData()`            | `Route.useLoaderData()`                              |
| `useLocation()`              | `useMatch`, `useMatches`, `useParams`, `useSearch`   |
| `<Outlet />`                 | `<Outlet />`                                         |
| `loader({ params })`         | `loader: ({ params }) => ...` (route option)         |
| `action({ request })`        | Use mutations / form libraries                       |
| `lazy(() => import(...))`    | `autoCodeSplitting` or `.lazy.tsx` files             |
| `:paramName`                 | `$paramName`                                         |
| `*` (splat)                  | `$` (splat, accessed via `_splat`)                   |
