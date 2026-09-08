# Virtualizer — Optional Options: `useCachedMeasurements`

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

## Optional Options: `useCachedMeasurements`


```tsx
useCachedMeasurements?: boolean
```

**Default:** `false`

When enabled, the default `measureElement` implementation skips DOM measurement and returns the previously cached size for each item (falling back to `estimateSize` if no cached size exists).

This is useful when the virtualized list is temporarily hidden (e.g. via `display: none` on a parent element). Without this option, the ResizeObserver fires with size `0` for all items when hidden, resetting all measurements. When the list becomes visible again, items may need to be re-measured, which can cause layout shifts.

**Usage:** Toggle this option to `true` before hiding the list and back to `false` when showing it. The ResizeObserver remains attached, so real measurements resume automatically when the flag is turned off and elements become visible again.

> ⚠️ This option only affects the default `measureElement`. If you provide a custom `measureElement`, you are responsible for handling this case yourself.
