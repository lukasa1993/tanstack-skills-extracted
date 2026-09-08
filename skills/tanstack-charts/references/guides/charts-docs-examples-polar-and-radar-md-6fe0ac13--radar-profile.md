# Polar And Radar — Radar profile

[Guide and prerequisites](./charts-docs-examples-polar-and-radar-md-6fe0ac13.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Radar profile

Radar combines an inferred angle factory and a fixed radius instance with
polar guides and radial marks. TanStack supplies both responsive ranges. The
normalization remains visible in a separate source file because it determines
the meaning of every radius.

```ts group=polar-radar env=charts file=/src/chart.ts entry
import { defineChart } from '@tanstack/charts'
import {
  angleGrid,
  polar,
  radialArea,
  radialGrid,
  radialLine,
} from '@tanstack/charts/polar'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scalePoint } from '@tanstack/charts/scales/point'
import { curveLinearClosed } from 'd3-shape'
import { events } from './data'
import { profile } from './normalize'

export default defineChart({
  marks: [
    polar({
      radiusRatio: 0.72,
      scales: {
        angle: { scale: scalePoint<string>().domain(events), wrap: true },
        radius: { scale: scaleLinear().domain([0, 1]) },
      },

      guides: [
        radialGrid({
          values: [0.25, 0.5, 0.75, 1],
          shape: 'polygon',
        }),
        angleGrid({ labels: true }),
      ],
      marks: [
        radialArea(profile, {
          angle: 'event',
          radius: 'relativePerformance',
          curve: curveLinearClosed,
          fill: '#7c3aed',
          fillOpacity: 0.22,
        }),
        radialLine(profile, {
          angle: 'event',
          radius: 'relativePerformance',
          curve: curveLinearClosed,
          stroke: '#8b5cf6',
          strokeWidth: 2,
        }),
      ],
    }),
  ],
  scales: {
    x: null,
    y: null,
  },
})
```

```ts group=polar-radar file=/src/data.ts collapsed
export interface DecathlonRow {
  Country: string
  '100 Meters': number
  'Long Jump': number
  'High Jump': number
  '100 Meter Hurdles': number
}

export const decathlon: readonly DecathlonRow[] = [
  {
    Country: 'United States',
    '100 Meters': 10.35,
    'Long Jump': 7.96,
    'High Jump': 2.05,
    '100 Meter Hurdles': 13.61,
  },
  {
    Country: 'Great Britain',
    '100 Meters': 10.44,
    'Long Jump': 7.74,
    'High Jump': 2.11,
    '100 Meter Hurdles': 13.75,
  },
  {
    Country: 'Germany',
    '100 Meters': 10.67,
    'Long Jump': 7.62,
    'High Jump': 2.08,
    '100 Meter Hurdles': 14.02,
  },
  {
    Country: 'France',
    '100 Meters': 10.58,
    'Long Jump': 7.81,
    'High Jump': 1.99,
    '100 Meter Hurdles': 13.88,
  },
]

export const events = [
  '100 Meters',
  'Long Jump',
  'High Jump',
  '100 Meter Hurdles',
] as const

export type RadarEvent = (typeof events)[number]
```

```ts group=polar-radar file=/src/normalize.ts collapsed
import { normalize, select } from '@tanstack/charts'
import { fold } from '@tanstack/charts/transform/fold'
import { decathlon, events } from './data'
import type { RadarEvent } from './data'

const timedEvents = new Set<RadarEvent>(['100 Meters', '100 Meter Hurdles'])
const folded = fold(decathlon, {
  fields: events,
  as: { key: 'event', value: 'result' },
})
const normalized = normalize(folded, {
  by: 'event',
  value: (datum) =>
    timedEvents.has(datum.event) ? -datum.result : datum.result,
  basis: 'extent',
  as: 'relativePerformance',
})

export const profile = select(normalized, {
  by: 'event',
  select: 'first',
})
```

Use radar for a small, fixed set of compatible dimensions. Keep every domain
and direction explicit, and do not rank profiles by apparent filled area. See
the [comparative radar](https://tanstack.com/charts/catalog/99-comparative-radar/)
when multiple profiles are the point of the chart.
