# Virtualizer — Optional Options: `initialRect`

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

## Optional Options: `initialRect`


```tsx
initialRect?: Rect
```

The initial `Rect` of the scrollElement. This is mostly useful if you need to run the virtualizer in an SSR environment, otherwise the initialRect will be calculated on mount by the `observeElementRect` implementation.
