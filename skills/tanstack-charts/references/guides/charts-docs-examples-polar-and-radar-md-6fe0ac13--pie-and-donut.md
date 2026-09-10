# Polar And Radar — Pie and donut

[Guide and prerequisites](./charts-docs-examples-polar-and-radar-md-6fe0ac13.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Pie and donut

Use `pie` to turn totals into flat source-linked angular intervals.
`radialArc` renders the intervals. This example uses a responsive inner radius
for a donut; return `0` instead for a pie.

```ts group=polar-pie-donut env=charts file=/src/chart.ts entry
import { defineChart } from '@tanstack/charts'
import { pie, polar, radialArc } from '@tanstack/charts/polar'
import { alphabet } from './data'

const slices = pie(alphabet, { value: 'frequency' })
const letters = alphabet.map((row) => row.letter)

export default defineChart({
  marks: [
    polar({
      inset: 8,
      radiusRatio: 0.82,
      marks: [
        radialArc(slices, {
          innerRadius: ({ radius }) => radius * 0.58,
          cornerRadius: 4,
          color: 'letter',
          key: 'letter',
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
  color: {
    domain: letters,
    range: ['#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f97316', '#94a3b8'],
  },
})
```

```ts group=polar-pie-donut file=/src/data.ts collapsed
export interface AlphabetRow {
  letter: string
  frequency: number
}

export const alphabet: readonly AlphabetRow[] = [
  { letter: 'E', frequency: 0.12702 },
  { letter: 'T', frequency: 0.09056 },
  { letter: 'A', frequency: 0.08167 },
  { letter: 'O', frequency: 0.07507 },
  { letter: 'I', frequency: 0.06966 },
  { letter: 'Other', frequency: 0.55602 },
]
```

The same primitives cover labels, center content, padding, rounded corners,
and concentric rings. See the catalog examples for a
[labeled pie](https://tanstack.com/charts/catalog/93-labeled-pie/),
[center-content donut](https://tanstack.com/charts/catalog/94-center-donut/),
[rounded donut](https://tanstack.com/charts/catalog/95-rounded-donut/), and
[nested donut](https://tanstack.com/charts/catalog/96-nested-donut/).

Radial offsets are signed pixels applied after scale mapping. They do not
change the radius domain or reserve outer margin; leave space with
`radiusRatio`, `inset`, or chart margins.

Source order is the default. Use `orderBy` and `order` only for an explicit
angular sort. Stable arc keys must come from the original row, not the
generated slice index.

Each allocated row keeps the original fields plus direct `source` and
`sourceIndexes` lineage. Fixed allocation fields overwrite source fields with
the same names. `gapAngle` materializes direct empty space; the returned
`padAngle: 0` prevents `radialArc` from padding that interval again.
