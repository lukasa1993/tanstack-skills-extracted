# Polar And Radar — Polar hierarchy

[Guide and prerequisites](./charts-docs-examples-polar-and-radar-md-6fe0ac13.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Polar hierarchy

The optional `sunburst` mark accepts flat hierarchy rows and owns value
aggregation, partitioning, responsive rings, and sector geometry.

```ts group=polar-sunburst env=charts file=/src/chart.ts entry
import { defineChart } from '@tanstack/charts'
import { sunburst } from '@tanstack/charts/hierarchy/sunburst'
import { polar } from '@tanstack/charts/polar'
import { rows } from './data'

export default defineChart({
  marks: [
    polar({
      radiusRatio: 0.88,
      startAngle: Math.PI / 2,
      endAngle: Math.PI / 2 - Math.PI * 2,
      marks: [
        sunburst(rows, {
          path: 'name',
          delimiter: '.',
          value: 'size',
          innerRadius: ({ radius }) => radius * 0.14,
          ringPadding: 2,
          color: 'branchId',
          stroke: '#fff',
        }),
      ],
      scales: {
        angle: null,
        radius: null,
      },
    }),
  ],
  scales: {
    x: null,
    y: null,
  },
  color: { range: ['#7c3aed', '#0ea5e9', '#14b8a6'] },
})
```

```ts group=polar-sunburst file=/src/data.ts collapsed
export interface PackageRow {
  name: string
  size: number | null
}

export const rows: readonly PackageRow[] = [
  { name: 'app', size: null },
  { name: 'app.ui', size: null },
  { name: 'app.ui.button', size: 8 },
  { name: 'app.ui.dialog', size: 5 },
  { name: 'app.data', size: null },
  { name: 'app.data.cache', size: 6 },
  { name: 'app.data.client', size: 11 },
]
```

Use `nodeId` and `parentId` for explicit parent-reference rows. Responsive
`innerRadius` and `outerRadius` callbacks receive the final polar radius;
`ringPadding` remains a fixed pixel gap. Every `SunburstNode` retains its
direct row and source index, while `branchId` gives descendants the color of
their first ancestor below the root. See the
[Sunburst Mark reference](./charts-docs-reference-marks-sunburst-md-ebf0a51e.md#source-charts-docs-reference-marks-sunburst-md) and the
[full Flare hierarchy](https://tanstack.com/charts/catalog/101-sunburst/).
