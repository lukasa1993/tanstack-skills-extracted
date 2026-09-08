# Type Safety — Overview

[Guide and prerequisites](./tanstack-router-core-type-safety-d349a495.md) · Published skill · `@tanstack/router-core@1.171.28`.

# Type Safety

TanStack Router is FULLY type-inferred. Params, search params, context, and loader data all flow through the route tree automatically. The **#1 AI agent mistake** is adding type annotations, casts, or generic parameters to values that are already inferred.

> **CRITICAL**: NEVER use `as Type`, explicit generic params, `satisfies` on hook returns, or type annotations on inferred values. Every cast masks real type errors and breaks the inference chain.
> **CRITICAL**: Do NOT confuse TanStack Router with Next.js or React Router. There is no `getServerSideProps`, no `useSearchParams()`, no `useLoaderData()` from `react-router-dom`.
