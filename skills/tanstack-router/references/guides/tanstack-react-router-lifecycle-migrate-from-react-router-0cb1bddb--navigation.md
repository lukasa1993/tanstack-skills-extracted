# Migrate From React Router — Navigation

[Guide and prerequisites](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb.md) · Published skill · `@tanstack/react-router@1.170.46`.

## Navigation

- [ ] **Convert all `<Link>` components**

React Router:

```tsx
import { Link } from 'react-router'
;<Link to={`/posts/${postId}`}>View Post</Link>
```

TanStack Router:

```tsx
import { Link } from '@tanstack/react-router'
;<Link to="/posts/$postId" params={{ postId }}>
  View Post
</Link>
```

Key differences:

- `to` is a route path pattern, NOT an interpolated string
- `params` is a separate prop with typed values
- Active styling: use `activeProps={{ className: 'font-bold' }}` or `data-status="active"` attribute for CSS

- [ ] **Convert all `useNavigate` calls**

React Router:

```tsx
import { useNavigate } from 'react-router'
const navigate = useNavigate()
navigate(`/posts/${postId}`)
```

TanStack Router:

```tsx
import { useNavigate } from '@tanstack/react-router'
const navigate = useNavigate()
navigate({ to: '/posts/$postId', params: { postId } })
```
