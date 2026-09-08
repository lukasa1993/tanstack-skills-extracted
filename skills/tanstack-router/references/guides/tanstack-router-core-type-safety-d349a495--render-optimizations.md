# Type Safety — Render Optimizations

[Guide and prerequisites](./tanstack-router-core-type-safety-d349a495.md) · Published skill · `@tanstack/router-core@1.171.28`.

## Render Optimizations

### Fine-Grained Selectors with `select`

```tsx
function PostTitle() {
  // Only re-renders when page changes, not when other search params change
  const page = Route.useSearch({ select: ({ page }) => page })
  return <span>Page {page}</span>
}
```

### Structural Sharing

Preserve referential identity across re-renders for search params:

```tsx
const router = createRouter({
  routeTree,
  defaultStructuralSharing: true, // Enable globally
})

// Or per-hook
const result = Route.useSearch({
  select: (search) => ({ foo: search.foo, label: `Page ${search.foo}` }),
  structuralSharing: true,
})
```

Structural sharing only works with JSON-compatible data. TypeScript will error if you return class instances with `structuralSharing: true`.
