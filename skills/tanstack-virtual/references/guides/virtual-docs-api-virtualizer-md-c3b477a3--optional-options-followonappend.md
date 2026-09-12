# Virtualizer — Optional Options: `followOnAppend`

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.10`.

## Optional Options: `followOnAppend`


```tsx
followOnAppend?: boolean | 'auto' | 'smooth' | 'instant'
```

**Default:** `false`

When used with `anchorTo: 'end'`, controls whether the virtualizer scrolls to the end after new items are appended. The follow only happens if the viewport was already at the end before the append; users who have scrolled up to read history are not pulled down.

Passing `true` is equivalent to `'auto'`. Passing a scroll behavior uses that behavior for the follow.

Following also works when older items are trimmed from the start in the same update without increasing the count. This requires persistent keys, a non-empty suffix of the old list retained in order, and appended items with new keys. Non-growing updates with no retained items are not automatically followed.

This option does not follow prepends. It only follows appended output, and only when the viewport was already within `scrollEndThreshold` of the end before the append.
