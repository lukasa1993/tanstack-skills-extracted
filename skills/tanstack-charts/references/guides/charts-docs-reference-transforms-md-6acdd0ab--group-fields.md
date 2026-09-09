# Transforms — Group fields

[Guide and prerequisites](./charts-docs-reference-transforms-md-6acdd0ab.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Group fields

`by: 'region'` preserves the field name in the result. Compound groups use a
named object:

```ts
const daily = groupBy(orders, {
  by: {
    region: 'region',
    day: (datum) => utcDay.floor(datum.createdAt),
  },
  outputs: {
    revenue: { value: 'amount', reduce: 'sum' },
    orders: { reduce: 'count' },
  },
})
```

The result contains `region` and `day`, not an opaque `key` or tuple.
