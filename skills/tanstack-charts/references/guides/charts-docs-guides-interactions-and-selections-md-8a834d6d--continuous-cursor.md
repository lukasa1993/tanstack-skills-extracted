# Interactions And Selections — Continuous cursor

[Guide and prerequisites](./charts-docs-guides-interactions-and-selections-md-8a834d6d.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Continuous cursor

Use `continuousCursor` for an arbitrary x/y plot position that must not snap to
a datum:

```ts
import { defineChart, dot } from '@tanstack/charts'
import {
  continuousCursor,
  type ContinuousCursorChange,
  type ContinuousCursorPosition,
} from '@tanstack/charts/interaction/cursor'
import { controlledSignal } from '@tanstack/charts/interaction/signal'

type Position = ContinuousCursorPosition<number, number>

const definition = defineChart({
  marks: [dot(rows, { x: 'horsepower', y: 'economy' })],
  scales: {
    x: { scale: horsepowerScale },
    y: { scale: economyScale },
  },

  controls: [
    continuousCursor({
      position: controlledSignal<
        Position | null,
        ContinuousCursorChange<number, number>
      >(cursorPosition, (next, { reason }) => {
        if (reason.type === 'commit' || reason.type === 'clear') {
          setCursorPosition(next)
        }
      }),
      xLabel: { format: (value) => `HP ${value.toFixed(1)}` },
      yLabel: { format: (value) => `MPG ${value.toFixed(1)}` },
    }),
  ],
})
```

Both scales must be invertible numeric or temporal scales. The behavior uses
their final resolved ranges, including a reversed y range, and clamps values to
the plot. This is the same default inversion used by a free `cursorHost`
binding. Rules and the marker are enabled by default. Axis labels are opt-in.

A `null` controlled position leaves pointer previews transient. Click or tap
proposes a `commit`; accepting its non-null position pins the cursor. A second
activation or Escape proposes `clear`. Pointer leave and cancellation clear an
unpinned preview. `ContinuousCursorChange` distinguishes `preview`, `commit`,
and `clear`, records pointer, touch, or keyboard source, and preserves the
origin position.

The SVG and Canvas DOM hosts replace the static scene fallback with a host
overlay, so pointer movement repaints the guide without rebuilding the chart
scene. Static SVG and React Native paint an accepted non-null position but do
not provide pointer input. Pair the cursor with semantic sliders or inputs and
visible status text for keyboard and nonvisual operation. Those controls can
write the same application-owned position.
