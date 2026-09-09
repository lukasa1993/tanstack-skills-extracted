# Interactions And Selections — Zoom and pan

[Guide and prerequisites](./charts-docs-guides-interactions-and-selections-md-8a834d6d.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Zoom and pan

Keep zoom state as a semantic window, not an opaque DOM transform. Import the
optional first-party behavior and bind it to the same window used by the x
scale:

```ts
import { defineChart, lineY } from '@tanstack/charts'
import {
  zoomX,
  type ZoomXChange,
  type ZoomXWindow,
} from '@tanstack/charts/interaction/zoom'
import { controlledSignal } from '@tanstack/charts/interaction/signal'

const definition = defineChart({
  marks: [lineY(rows, { x: 'date', y: 'value' })],
  scales: {
    x: { scale: utcScale.copy().domain([window.start, window.end]) },
    y: null,
  },
  controls: [
    zoomX({
      window: controlledSignal<ZoomXWindow<Date>, ZoomXChange<Date>>(
        window,
        (next) => setWindow(next),
      ),
      extent: fullExtent,
      scaleExtent: [1, 8],
      ariaLabel: 'Zoomable revenue window',
      format: (date) => dayFormat(date),
    }),
  ],
})
```

`extent` is the complete allowed x domain. `scaleExtent` is `[1, maximum]` and
defaults to `[1, Infinity]`. The behavior owns final-scale inversion,
pointer-anchored wheel zoom, drag and horizontal-wheel pan, touch input,
keyboard zoom and pan, clamping, cancellation, and teardown. It captures the
wheel only after its plot surface receives focus, so normal page scrolling
remains available beforehand.

Every proposal is a complete number or Date window. `ZoomXChange` distinguishes
gesture `preview`, `commit`, and `cancel` events, includes the gesture origin,
and records its action and source. Rebuild the definition with every accepted
preview for live movement; a cancel proposes the origin. Keyboard changes
commit immediately.

Keep visible-row filtering or clipping, y-domain policy, status, reset and
recovery controls, follow-latest behavior, and persistence in the application.
A reset updates the same controlled window. Import `d3-zoom` directly only
when the application needs a different gesture policy.
