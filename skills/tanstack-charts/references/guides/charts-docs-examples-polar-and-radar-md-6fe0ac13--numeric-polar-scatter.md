# Polar And Radar — Numeric polar scatter

[Guide and prerequisites](./charts-docs-examples-polar-and-radar-md-6fe0ac13.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Numeric polar scatter

The same coordinate accepts independent points. Wind direction and speed stay
as explicit transforms over source `u` and `v` measurements.

```ts group=polar-scatter env=charts file=/src/chart.ts entry
import { defineChart } from '@tanstack/charts'
import { angleGrid, polar, radialDot, radialGrid } from '@tanstack/charts/polar'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { latitudeBand, windDirection, windSpeed } from './wind'

export default defineChart({
  marks: [
    polar({
      scales: {
        angle: { scale: scaleLinear().domain([0, 360]) },
        radius: { scale: scaleLinear().domain([0, 13]) },
      },

      guides: [
        radialGrid({ values: [3, 6, 9, 12] }),
        angleGrid({ values: [0, 90, 180, 270], labels: false }),
      ],
      marks: [
        radialDot(latitudeBand, {
          angle: windDirection,
          radius: windSpeed,
          r: 4.5,
          fill: '#e11d48',
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

```ts group=polar-scatter file=/src/wind.ts collapsed
export interface WindRow {
  latitude: number
  u: number
  v: number
}

const wind: readonly WindRow[] = [
  { latitude: 48.125, u: 4.2, v: 1.6 },
  { latitude: 48.125, u: 2.1, v: 5.8 },
  { latitude: 48.125, u: -3.4, v: 6.2 },
  { latitude: 48.125, u: -5.1, v: -2.3 },
  { latitude: 48.125, u: 1.8, v: -4.7 },
]

export const latitudeBand = wind.filter((row) => row.latitude === 48.125)

export function windDirection(row: WindRow) {
  return (Math.atan2(row.v, row.u) * (180 / Math.PI) + 360) % 360
}

export function windSpeed(row: WindRow) {
  return Math.hypot(row.u, row.v)
}
```

The [catalog polar scatter](https://tanstack.com/charts/catalog/107-polar-scatter/)
uses a denser sample from the same latitude band.
