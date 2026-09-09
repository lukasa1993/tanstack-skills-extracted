# Line And Area — Layering area and line

[Guide and prerequisites](./charts-docs-reference-marks-line-and-area-md-6c72b4c2.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Layering area and line

Area marks do not automatically draw their upper line. Compose the layers:

```ts
const definition = defineChart({
  marks: [
    areaY(rows, {
      x: 'date',
      y: 'value',
      z: 'series',
      fillOpacity: 0.16,
    }),
    lineY(rows, {
      x: 'date',
      y: 'value',
      z: 'series',
    }),
  ],
  scales: {
    x: { scale: xScale },
    y: { scale: yScale },
  },
})
```

Use matching channels and scales when the two layers must align. Identity
inference is evaluated independently for every interactive layer; supply a
key only where its automatic candidate is not stable.
