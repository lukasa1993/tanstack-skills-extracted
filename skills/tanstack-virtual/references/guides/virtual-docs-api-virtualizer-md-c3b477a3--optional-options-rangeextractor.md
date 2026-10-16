# Virtualizer — Optional Options: `rangeExtractor`

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.19.5`.

## Optional Options: `rangeExtractor`


```tsx
rangeExtractor?: (range: Range) => number[]
```

This function receives visible range indexes and should return array of indexes to render. This is useful if you need to add or remove items from the virtualizer manually regardless of the visible range, eg. rendering sticky items, headers, footers, etc. The default range extractor implementation will return the visible range indexes and is exported as `defaultRangeExtractor`. When `lanes` is greater than `1`, `range.lanes` holds the lane count and `defaultRangeExtractor` applies `overscan` as whole rows; a custom extractor that computes its own indexes should do the same to keep lanes aligned.
