# Layout Axes And Coordinates — Band alignment

[Guide and prerequisites](./charts-docs-concepts-layout-axes-and-coordinates-md-371d3a9a.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Band alignment

A band scale returns the start of a band. TanStack Charts centers the resolved positional value:

```text
band start ├──────── bandwidth ────────┤
                         ▲
                  mapped chart value
```

This gives bars, dots, text, ticks, and interaction points a shared categorical center.

Bars use the full primary bandwidth minus their `inset`:

```ts
barX(rows, {
  x: 'value',
  y: 'category',
  inset: 2,
})
```

The band scale's `paddingInner` and `paddingOuter` determine category spacing.
`inset` removes additional pixels from both bar edges after layout.

For side-by-side bars, `layout: group()` subdivides the primary bandwidth. See
[Bars and Rankings](./charts-docs-examples-bars-and-rankings-md-28e82163.md#source-charts-docs-examples-bars-and-rankings-md).
