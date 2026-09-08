# Virtualizer — Optional Options: `initialMeasurementsCache`

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

## Optional Options: `initialMeasurementsCache`


```tsx
initialMeasurementsCache: Array<VirtualItem>
```

**Default:** `[]`

A previously-captured snapshot of measured item sizes (from `takeSnapshot()`) to seed the virtualizer with on mount. Useful for restoring scroll position after navigation: persist the result of `takeSnapshot()` (plus the current `scrollOffset`) in your route state, then pass them back as `initialMeasurementsCache` and `initialOffset` to land users at the same position without re-measuring everything from scratch.

Items not present in the cache fall back to `estimateSize`; items present have their measured `size` restored. The cache is consumed only once, on the first `getMeasurements()` call after mount.
