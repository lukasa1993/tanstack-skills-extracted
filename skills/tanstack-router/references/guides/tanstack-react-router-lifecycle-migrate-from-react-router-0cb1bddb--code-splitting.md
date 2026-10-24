# Migrate From React Router — Code Splitting

[Guide and prerequisites](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb.md) · Published skill · `@tanstack/react-router@1.170.46`.

## Code Splitting

- [ ] **Convert lazy route imports** — with `autoCodeSplitting: true` in the plugin config, this is automatic. For manual splitting, use `.lazy.tsx` files:

```tsx
// src/routes/lazy-page.lazy.tsx
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/lazy-page')({
  component: () => <div>Lazy loaded</div>,
})
```
