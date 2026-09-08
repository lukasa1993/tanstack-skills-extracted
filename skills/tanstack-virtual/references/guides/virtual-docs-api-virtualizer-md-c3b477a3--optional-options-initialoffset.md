# Virtualizer — Optional Options: `initialOffset`

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

## Optional Options: `initialOffset`


```tsx
initialOffset?: number | (() => number)
```

The position where the list is scrolled to on render. This is useful if you are rendering the virtualizer in a SSR environment or are conditionally rendering the virtualizer.
