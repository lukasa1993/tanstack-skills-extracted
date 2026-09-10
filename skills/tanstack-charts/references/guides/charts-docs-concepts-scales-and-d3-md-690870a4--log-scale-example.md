# Scales And D3 — Log-scale example

[Guide and prerequisites](./charts-docs-concepts-scales-and-d3-md-690870a4.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Log-scale example

```ts group=log-scale env=charts file=/src/chart.ts entry
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleLog } from 'd3-scale'
import { defineChart, dot } from '@tanstack/charts'
import { flare, type FlareRow } from './data'

type SizedFlareRow = FlareRow & { size: number }

const rows = flare.filter((row): row is SizedFlareRow => row.size !== null)

export default defineChart({
  marks: [
    dot(rows, {
      x: 'size',
      y: (row) => row.name.split('.').length - 1,
      key: 'name',
      r: 4,
      fill: '#2563eb',
    }),
  ],
  scales: {
    x: {
      scale: scaleLog().domain([200, 30_000]),
      grid: true,
      axis: { label: 'Class size' },
    },
    y: {
      scale: scaleLinear,
      grid: true,
      axis: { label: 'Hierarchy depth' },
    },
  },
})
```

```ts group=log-scale file=/src/data.ts collapsed
export interface FlareRow {
  name: string
  size: number | null
}

export const flare: readonly FlareRow[] = [
  { name: 'flare.analytics.cluster', size: 3938 },
  { name: 'flare.analytics.graph', size: 10_871 },
  { name: 'flare.analytics.optimization', size: 5731 },
  { name: 'flare.display', size: 12_867 },
  { name: 'flare.query', size: 2779 },
  { name: 'flare.unresolved', size: null },
]
```

This chart upgrades only x. Install `d3-scale` and `@types/d3-scale` for
`scaleLog`; the ordinary numeric y mapping remains compact.
