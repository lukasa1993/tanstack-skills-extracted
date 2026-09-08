# Ssr — Body Scripts

[Guide and prerequisites](./tanstack-router-core-ssr-e95e1bf1.md) · Published skill · `@tanstack/router-core@1.171.28`.

## Body Scripts

Use `scripts` (separate from `head.scripts`) to inject scripts into `<body>` before the app entry point:

```tsx
export const Route = createRootRoute({
  scripts: () => [{ children: 'console.log("runs before hydration")' }],
})
```

The `<Scripts />` component renders these. Place it at the end of `<body>`.
