# Polar And Radar — Radial bars

[Guide and prerequisites](./charts-docs-examples-polar-and-radar-md-6fe0ac13.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Radial bars

Choose the mark by the quantitative direction. A rose extends one bar through
radius for each angle band. Concentric radial bars extend through angle for
each radius band. Band padding controls categorical occupancy.

```ts group=polar-radial-bars env=charts file=/src/chart.ts entry
import { defineChart } from '@tanstack/charts'
import { polar, radialBarRadius } from '@tanstack/charts/polar'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { frequencies } from './data'

const letters = frequencies.map((row) => row.letter)
const maximum = Math.max(...frequencies.map((row) => row.frequency))

export default defineChart({
  marks: [
    polar({
      radiusRatio: 0.8,
      scales: {
        angle: { scale: () => scaleBand<string>().padding(0.12) },
        radius: {
          scale: scaleLinear().domain([0, maximum]),
          range: [({ radius }) => radius * 0.3, ({ radius }) => radius],
        },
      },

      marks: [
        radialBarRadius(frequencies, {
          angle: 'letter',
          radius: 'frequency',
          color: 'letter',
          key: 'letter',
        }),
      ],
    }),
  ],
  scales: {
    x: null,
    y: null,
  },
  color: {
    domain: letters,
    range: ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a'],
  },
})
```

```ts group=polar-radial-bars file=/src/data.ts collapsed
export interface FrequencyRow {
  letter: string
  frequency: number
}

export const frequencies: readonly FrequencyRow[] = [
  { letter: 'E', frequency: 0.12702 },
  { letter: 'T', frequency: 0.09056 },
  { letter: 'A', frequency: 0.08167 },
  { letter: 'O', frequency: 0.07507 },
  { letter: 'I', frequency: 0.06966 },
]
```

An omitted radius baseline in `radialBarRadius` starts at the physical center;
the responsive radius range controls the quantitative endpoints. Supply
`radius1` when both endpoints are semantic values. Signed radius data should
use `radius1: 0` so semantic zero maps through the scale.

Use `radialBarAngle` when values should extend around the circle instead. See
the [concentric radial-bar example](https://tanstack.com/charts/catalog/100-radial-bars/).
