# Migrate From React Router — Path Params

[Guide and prerequisites](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb.md) · Published skill · `@tanstack/react-router@1.170.46`.

## Path Params

- [ ] **Update `useParams` with `from` property**

React Router:

```tsx
import { useParams } from 'react-router'
const { postId } = useParams()
```

TanStack Router:

```tsx
import { useParams } from '@tanstack/react-router'
const { postId } = useParams({ from: '/posts/$postId' })
```

Or from within the route component:

```tsx
const { postId } = Route.useParams()
```
