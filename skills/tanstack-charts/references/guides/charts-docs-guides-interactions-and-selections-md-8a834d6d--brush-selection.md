# Interactions And Selections — Brush selection

[Guide and prerequisites](./charts-docs-guides-interactions-and-selections-md-8a834d6d.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Brush selection

A complete brush owns:

- drag start, move, end, and cancellation;
- reverse dragging normalization;
- semantic snapping;
- a visible selected range;
- focusable handles or equivalent range inputs;
- current-range text;
- reset behavior;
- selection preservation after data updates.

Import the optional first-party behavior and bind it to application state:

```tsx group=controlled-brush env=charts-react file=/src/App.tsx entry
import { useMemo, useState } from 'react'
import { defineChart, lineY } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import {
  brushX,
  type BrushRange,
  type BrushXChange,
} from '@tanstack/charts/interaction/brush'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { Chart } from '@tanstack/charts/react'
import { rows } from './data'

const weeks = rows.map((row) => row.week)
const initialRange: BrushRange<number> = { start: 2, end: 6 }

export default function App() {
  const [range, setRange] = useState<BrushRange<number>>(initialRange)
  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          lineY(rows, {
            x: 'week',
            y: 'signups',
            points: true,
            stroke: '#2563eb',
            strokeWidth: 2.5,
          }),
        ],
        scales: {
          x: { scale: scaleLinear().domain([1, 8]) },
          y: { scale: scaleLinear, grid: true, axis: { label: 'Signups' } },
        },

        controls: [
          brushX({
            range: controlledSignal<BrushRange<number>, BrushXChange<number>>(
              range,
              (next, { reason }) => {
                if (reason.type === 'commit') setRange(next)
              },
            ),
            values: weeks,
            format: (week) => `Week ${week}`,
            ariaLabel: 'Reporting range',
            startAriaLabel: 'Range start',
            endAriaLabel: 'Range end',
          }),
        ],
      }),
    [range],
  )

  const isInitial =
    range.start === initialRange.start && range.end === initialRange.end

  return (
    <section>
      <Chart
        definition={definition}
        height={280}
        ariaLabel="Weekly signups with a selectable reporting range"
      />
      <p role="status" aria-live="polite">
        Current range: weeks {range.start}–{range.end}
      </p>
      <button
        type="button"
        disabled={isInitial}
        onClick={() => setRange({ ...initialRange })}
      >
        Reset range
      </button>
    </section>
  )
}
```

```ts group=controlled-brush file=/src/data.ts collapsed
export const rows = [
  { week: 1, signups: 18 },
  { week: 2, signups: 24 },
  { week: 3, signups: 31 },
  { week: 4, signups: 29 },
  { week: 5, signups: 42 },
  { week: 6, signups: 48 },
  { week: 7, signups: 46 },
  { week: 8, signups: 57 },
]
```

`values` defines semantic order, snapping, and keyboard steps. It is required
for strings and for keyboard handles. Number and Date brushes may omit it only
with `keyboard: false` and an invertible scale. The range remains non-null: a
blank click proposes a snapped zero-width range, which application policy can
expand into a fixed focus window.

Change reasons distinguish pointer previews, commits, and cancellation from
keyboard commits and cancellation. Rebuild the definition with the accepted
range. The behavior retains active controlled echoes, cancels divergent
external updates, normalizes reverse drags, clamps to the final plot, and
ignores synthetic D3 move events.

SVG and Canvas DOM hosts replace the static scene fallback with one accessible
brush overlay. Static SVG and React Native retain the visual selection only;
native applications must supply their own semantic range control. Import
`d3-brush` and `d3-selection` directly only for a different application-owned
gesture.

[Open the monthly time-series brush catalog case](https://tanstack.com/charts/catalog/89-brush-range-selection/).
