# Installation — TypeScript

[Guide and prerequisites](./charts-docs-installation-md-6ab2967d.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## TypeScript

TanStack Charts, including its compact scale entries, ships its own
declarations. Install the matching `@types/d3-*` package for each D3 module your
TypeScript source imports.

Normal chart authoring should not require adapter generics or casts:

```ts
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { defineChart, lineY } from '@tanstack/charts'

const values = [4, 9, 7]

const chart = defineChart({
  marks: [lineY(values)],
  scales: {
    x: { scale: scaleLinear },
    y: { scale: scaleLinear },
  },
})
```

If a channel or scale does not type-check, correct the source type, field, accessor, scale domain, or definition. The [TypeScript guide](./charts-docs-guides-typescript-md-eab57f94.md#source-charts-docs-guides-typescript-md) covers inference and advanced custom marks.
