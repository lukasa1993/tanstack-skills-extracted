# Migrate From React Router — Outlet

[Guide and prerequisites](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb.md) · Published skill · `@tanstack/react-router@1.170.46`.

## Outlet

- [ ] **Replace React Router `Outlet` with TanStack Router `Outlet`**

The API is identical — just change the import:

```tsx
// Before
import { Outlet } from 'react-router'

// After
import { Outlet } from '@tanstack/react-router'
```
