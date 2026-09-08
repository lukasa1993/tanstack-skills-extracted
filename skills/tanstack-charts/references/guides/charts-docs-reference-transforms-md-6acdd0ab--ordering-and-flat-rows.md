# Transforms — Ordering and flat rows

[Guide and prerequisites](./charts-docs-reference-transforms-md-6acdd0ab.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Ordering and flat rows

`rollingWindow` and `cumulative` accept `orderBy` and ascending or descending `order`.
Input order is used when `orderBy` is omitted. `rank` orders by its `value` and
supports competition, dense, and ordinal ties.

One-to-one transforms spread the input row and add named outputs:

```ts
const trends = rollingWindow(daily, {
  by: 'region',
  orderBy: 'day',
  size: 28,
  partial: false,
  outputs: {
    revenue28d: { value: 'revenue', reduce: 'sum' },
    averageOrder28d: { value: 'averageOrder', reduce: 'mean' },
  },
})

lineY(trends, { x: 'day', y: 'revenue28d', color: 'region' })
```

There is no nested `datum.datum` path. A named output may intentionally replace
an input field; the original rows remain available through lineage. Structural
`source` and `sourceIndexes` names are reserved.
