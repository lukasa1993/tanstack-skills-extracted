# Quick Start

<a id="source-charts-docs-framework-octane-quick-start-md"></a>

Release-matched documentation · `@tanstack/charts@0.18.0`.

[Topic index](../framework-octane.md) · [Source provenance](../SOURCES.md)

Install TanStack Charts and its Octane peer:

```sh
pnpm add @tanstack/charts octane
```

The shared [Scales](./charts-docs-concepts-scales-and-d3-md-690870a4.md#source-charts-docs-concepts-scales-and-d3-md) page explains the
compact scale families and when a chart needs D3 instead.

## Define and render a chart

Definitions are framework-independent and can be shared with any adapter:

```tsx group=octane-quick-start env=charts-octane file=/src/App.tsrx entry
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { barY, defineChart } from '@tanstack/charts'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/octane'
import { alphabet } from './data'

const percent = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
})

const letterFrequencyChart = defineChart({
  marks: [
    barY(alphabet, {
      x: 'letter',
      y: 'frequency',
    }),
  ],
  scales: {
    x: {
      scale: () => scaleBand().padding(0.18),
    },
    y: {
      scale: scaleLinear,
      nice: true,
      grid: true,
      axis: {
        label: 'Frequency',
        ticks: { format: (value) => percent.format(value) },
      },
    },
  },

  tooltip,
})

export default function App() {
  return (
    <Chart
      definition={letterFrequencyChart}
      height={320}
      ariaLabel="English letter frequencies"
    />
  )
}
```

```ts group=octane-quick-start file=/src/data.ts collapsed
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
]
```

The definition infers the row, scale, and callback types. Normal TSRX authoring
does not need `Chart` generics or casts.

## Responsive sizing

Use `height` for a fixed-height responsive chart:

```tsx
<Chart
  definition={letterFrequencyChart}
  height={320}
  ariaLabel="English letter frequencies"
/>
```

Use `aspectRatio` when height should follow width:

```tsx
<Chart
  definition={letterFrequencyChart}
  aspectRatio={16 / 9}
  initialWidth={720}
  ariaLabel="English letter frequencies"
/>
```

The server scene uses `initialWidth`, then the shared host measures the actual
container after hydration. See
[Octane adapter](./charts-docs-framework-octane-adapter-md-84d0f010.md#source-charts-docs-framework-octane-adapter-md).

## Memoize live definitions

```tsx
import { useMemo } from 'octane'

interface LetterFrequencyInput {
  rows: readonly AlphabetRow[]
  accent: string
}

export function LiveLetterFrequency({ rows, accent }: LetterFrequencyInput) {
  const definition = useMemo(() => {
    return defineChart({
      marks: [
        barY(rows, {
          x: 'letter',
          y: 'frequency',
          fill: accent,
        }),
      ],
      scales: {
        x: {
          scale: () => scaleBand().padding(0.18),
        },
        y: {
          scale: scaleLinear,
          nice: true,
        },
      },

      svgAnimation: true,
      tooltip,
    })
  })

  return (
    <Chart
      definition={definition}
      height={320}
      ariaLabel="Filtered English letter frequencies"
    />
  )
}
```

Octane tracks the values read by `useMemo`. Definition identity tells the chart
host when captured values changed. See
[Chart Definition API](./charts-docs-reference-chart-definitions-md-6855d09b.md#source-charts-docs-reference-chart-definitions-md).

## Interaction callbacks

```tsx
<Chart
  definition={letterFrequencyChart}
  height={320}
  ariaLabel="English letter frequencies"
  onFocusChange={(point) => {
    if (point) {
      console.log(point.datum.letter, point.yValue)
    }
  }}
  onSelect={(point) => {
    if (point) openLetter(point.datum.letter)
  }}
/>
```

Grouped focus, tooltip formatting, keyboard behavior, and application-owned
interaction are documented in
[Focus and interaction](./charts-docs-reference-focus-and-interaction-md-949b11fe.md#source-charts-docs-reference-focus-and-interaction-md).

Continue with the [Octane adapter](./charts-docs-framework-octane-adapter-md-84d0f010.md#source-charts-docs-framework-octane-adapter-md) for lifecycle and SSR, the
[`Chart` reference](./charts-docs-framework-octane-reference-chart-md-5d2228b4.md#source-charts-docs-framework-octane-reference-chart-md) for every prop, or the
[core API reference](./charts-docs-reference-index-md-6fc2c6fc.md#source-charts-docs-reference-index-md).
