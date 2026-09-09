# Polar And Radar — Partial-circle gauge

[Guide and prerequisites](./charts-docs-examples-polar-and-radar-md-6fe0ac13.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Partial-circle gauge

A gauge is the same composition over a restricted pie interval. It is not a
separate geometry implementation.

```ts group=polar-partial-gauge env=charts file=/src/chart.ts entry
import { defineChart } from '@tanstack/charts'
import { pie, polar, radialArc, radialText } from '@tanstack/charts/polar'
import { scaleLinear } from '@tanstack/charts/scales/linear'

const value = Math.max(0, Math.min(100, 72))
const reading = { id: 'complete', value } as const
const parts = [reading, { id: 'remaining', value: 100 - value }] as const
const slices = pie(parts, {
  value: 'value',
  startAngle: -Math.PI * 0.75,
  endAngle: Math.PI * 0.75,
})

export default defineChart({
  marks: [
    polar({
      radiusRatio: 0.84,
      scales: {
        angle: { scale: scaleLinear().domain([0, 1]) },
        radius: { scale: scaleLinear().domain([0, 1]) },
      },

      marks: [
        radialArc(slices, {
          innerRadius: ({ radius }) => radius * 0.72,
          cornerRadius: 999,
          color: 'id',
          key: 'id',
        }),
        radialText([reading], {
          angle: 0,
          radius: 0,
          text: (row) => `${row.value}%`,
          key: 'id',
          fill: 'currentColor',
          fontSize: 20,
          fontWeight: 700,
        }),
      ],
    }),
  ],
  scales: {
    x: null,
    y: null,
  },
  color: {
    domain: ['complete', 'remaining'],
    range: ['#ef4444', '#e2e8f0'],
  },
})
```

Bound the input before layout and expose the exact value outside the arc. Arc
length is useful for a compact status summary, not fine comparison. Add ticks,
a needle, and a center label only when they carry meaning; see the
[needle gauge](https://tanstack.com/charts/catalog/98-needle-gauge/) for that
composition.
