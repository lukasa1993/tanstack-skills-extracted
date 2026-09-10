# Layout Axes And Coordinates — Complete horizontal ranking

[Guide and prerequisites](./charts-docs-concepts-layout-axes-and-coordinates-md-371d3a9a.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Complete horizontal ranking

```ts group=horizontal-ranking env=charts file=/src/chart.ts entry
import { barX, defineChart, ruleX } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { citywages } from './data'

const rows = [...citywages]
  .sort((left, right) => right.POP_2015 - left.POP_2015)
  .slice(0, 8)

const compact = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export default defineChart({
  marks: [
    ruleX([0], { stroke: '#94a3b8', strokeOpacity: 0.6 }),
    barX(rows, {
      x: 'POP_2015',
      y: 'Metro',
      fill: '#2563eb',
      inset: 2,
      radius: 3,
    }),
  ],
  scales: {
    x: {
      scale: scaleLinear,
      nice: true,
      grid: true,
      axis: {
        label: '2015 population',
        ticks: { format: (value) => compact.format(value) },
      },
    },
    y: {
      scale: () => scaleBand<string>().paddingInner(0.12).paddingOuter(0.06),
    },
  },
})
```

```ts group=horizontal-ranking file=/src/data.ts collapsed
export interface MetroPopulation {
  Metro: string
  POP_2015: number
}

export const citywages: readonly MetroPopulation[] = [
  { Metro: 'New York–Newark–Jersey City', POP_2015: 20_182_305 },
  { Metro: 'Los Angeles–Long Beach–Anaheim', POP_2015: 13_340_068 },
  { Metro: 'Chicago–Naperville–Elgin', POP_2015: 9_532_569 },
  { Metro: 'Dallas–Fort Worth–Arlington', POP_2015: 7_206_144 },
  { Metro: 'Houston–The Woodlands–Sugar Land', POP_2015: 6_656_947 },
  { Metro: 'Washington–Arlington–Alexandria', POP_2015: 6_097_684 },
  { Metro: 'Philadelphia–Camden–Wilmington', POP_2015: 6_069_875 },
  { Metro: 'Miami–Fort Lauderdale–West Palm Beach', POP_2015: 6_012_331 },
]
```

This chart needs only the lightweight linear and band scale entries.

For responsive layout recipes, see [Responsive Charts](./charts-docs-guides-responsive-charts-md-aaa3953e.md#source-charts-docs-guides-responsive-charts-md). For the exact shape of scenes and resolved bounds, see [Runtime and Scene Reference](./charts-docs-reference-runtime-and-scene-md-e3fcc593.md#source-charts-docs-reference-runtime-and-scene-md).
