# Type Safety — Type Utilities for Generic Components

[Guide and prerequisites](./tanstack-router-core-type-safety-d349a495.md) · Published skill · `@tanstack/router-core@1.171.28`.

## Type Utilities for Generic Components

### `ValidateLinkOptions` — Type-Safe Link Props in Custom Components

```tsx
import {
  Link,
  type RegisteredRouter,
  type ValidateLinkOptions,
} from '@tanstack/react-router'

interface NavItemProps<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> {
  label: string
  linkOptions: ValidateLinkOptions<TRouter, TOptions>
}

export function NavItem<TRouter extends RegisteredRouter, TOptions>(
  props: NavItemProps<TRouter, TOptions>,
): React.ReactNode
export function NavItem(props: NavItemProps): React.ReactNode {
  return (
    <li>
      <Link {...props.linkOptions}>{props.label}</Link>
    </li>
  )
}

// Usage — fully type-safe
<NavItem label="Posts" linkOptions={{ to: '/posts' }} />
<NavItem label="Post" linkOptions={{ to: '/posts/$postId', params: { postId: '1' } }} />
```

### `ValidateNavigateOptions` and `ValidateRedirectOptions`

Same pattern as `ValidateLinkOptions` above, for `useNavigate` and `redirect`. Declare a generic public overload plus a non-generic implementation signature so the call site stays narrowed and the body works without casts:

```tsx
import {
  useNavigate,
  type RegisteredRouter,
  type ValidateNavigateOptions,
} from '@tanstack/react-router'

export function useDelayedNavigate<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
>(
  options: ValidateNavigateOptions<TRouter, TOptions>,
  delayMs: number,
): () => void
export function useDelayedNavigate(
  options: ValidateNavigateOptions,
  delayMs: number,
) {
  const navigate = useNavigate()
  return () => {
    setTimeout(() => navigate(options), delayMs)
  }
}
```

`ValidateRedirectOptions` works identically — declare a generic overload accepting `ValidateRedirectOptions<TRouter, TOptions>` and an impl signature accepting `ValidateRedirectOptions`, then call `redirect(options)` in the body.

### Render Props for Maximum Performance

Instead of accepting `LinkProps`, invert control so `Link` is narrowed at the call site:

```tsx
function Card(props: { title: string; renderLink: () => React.ReactNode }) {
  return (
    <div>
      <h2>{props.title}</h2>
      {props.renderLink()}
    </div>
  )
}

// Link narrowed to exactly /posts — no union check
;<Card title="All Posts" renderLink={() => <Link to="/posts">View</Link>} />
```
