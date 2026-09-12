# Virtualizer — Optional Options: `isScrollingResetDelay`

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.10`.

## Optional Options: `isScrollingResetDelay`


```tsx
isScrollingResetDelay: number
```

This option allows you to specify the duration to wait after the last scroll event before resetting the isScrolling instance property. The default value is 150 milliseconds.

The implementation of this option is driven by the need for a reliable mechanism to handle scrolling behavior across different browsers. Until all browsers uniformly support the scrollEnd event.
