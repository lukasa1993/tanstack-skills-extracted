# Virtualizer — Optional Options: `followOnAppend`

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

## Optional Options: `followOnAppend`


```tsx
followOnAppend?: boolean | 'auto' | 'smooth' | 'instant'
```

**Default:** `false`

When used with `anchorTo: 'end'`, controls whether the virtualizer scrolls to the end after new items are appended. The follow only happens if the viewport was already at the end before the append; users who have scrolled up to read history are not pulled down.

Passing `true` is equivalent to `'auto'`. Passing a scroll behavior uses that behavior for the follow.

This option does not follow prepends. It only follows appended output, and only when the viewport was already within `scrollEndThreshold` of the end before the append.
