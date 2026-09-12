# Virtualizer — Optional Options: `useScrollendEvent`

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.10`.

## Optional Options: `useScrollendEvent`


```tsx
useScrollendEvent: boolean
```

Determines whether to use the native scrollend event to detect when scrolling has stopped. If set to false, a debounced fallback is used to reset the isScrolling instance property after isScrollingResetDelay milliseconds. The default value is `false`.

The implementation of this option is driven by the need for a reliable mechanism to handle scrolling behavior across different browsers. Until all browsers uniformly support the scrollEnd event.
