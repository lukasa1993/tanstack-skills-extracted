# Polar And Radar — Numeric polar line

[Guide and prerequisites](./charts-docs-examples-polar-and-radar-md-6fe0ac13.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Numeric polar line

Lightweight linear scales map numeric angle and radius values without changing
the mark API. Here a visible transform maps observation dates to angles while
preserving the source temperature field.

```ts group=polar-line env=charts file=/src/chart.ts entry
import { defineChart } from '@tanstack/charts'
import {
  angleGrid,
  polar,
  radialGrid,
  radialLine,
} from '@tanstack/charts/polar'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { dayOfYearAngle, seattle2012 } from './weather'

export default defineChart({
  marks: [
    polar({
      scales: {
        angle: { scale: scaleLinear().domain([0, 360]) },
        radius: { scale: scaleLinear().domain([-10, 40]) },
      },

      guides: [
        radialGrid({ values: [0, 10, 20, 30, 40] }),
        angleGrid({ values: [0, 90, 180, 270], labels: false }),
      ],
      marks: [
        radialLine(seattle2012, {
          angle: dayOfYearAngle,
          radius: 'temp_max',
          stroke: '#0f766e',
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

```ts group=polar-line file=/src/weather.ts collapsed
export interface WeatherRow {
  location: string
  date: Date
  temp_max: number
}

const weather: readonly WeatherRow[] = [
  { location: 'Seattle', date: new Date('2012-01-15'), temp_max: 8.3 },
  { location: 'Seattle', date: new Date('2012-03-15'), temp_max: 12.2 },
  { location: 'Seattle', date: new Date('2012-05-15'), temp_max: 18.9 },
  { location: 'Seattle', date: new Date('2012-07-15'), temp_max: 25.6 },
  { location: 'Seattle', date: new Date('2012-09-15'), temp_max: 21.1 },
  { location: 'Seattle', date: new Date('2012-11-15'), temp_max: 11.7 },
]

export const seattle2012 = weather.filter(
  (row) => row.location === 'Seattle' && row.date.getUTCFullYear() === 2012,
)

export function dayOfYearAngle(row: WeatherRow) {
  const year = row.date.getUTCFullYear()
  const start = Date.UTC(year, 0, 1)
  const end = Date.UTC(year + 1, 0, 1)
  return ((row.date.getTime() - start) / (end - start)) * 360
}
```

The [full-year polar line](https://tanstack.com/charts/catalog/106-polar-line/)
uses the same transform with the complete weather series.
