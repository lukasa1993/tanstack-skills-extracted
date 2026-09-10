# Motion — Definition-local motion

[Guide and prerequisites](./charts-docs-reference-motion-md-125c7e38.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Definition-local motion

`motion` on a definition, mark, axis, tick collection, tick-label collection,
or axis label is inert policy. The optional renderer consumes it. Definitions
remain valid for static SVG and Canvas, which paint the final state.

This stays true in a mixed chart. A mark that selects `canvasChartRenderer`
keeps its authored motion option, but the Canvas layer paints the final scene
instead of running the tween or spring policy. The optional `motion()` renderer
still animates the default-renderer layers it owns.

```ts
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'

const definition = defineChart({
  motion: {
    transition: { type: 'spring', stiffness: 170, damping: 18 },
  },
  marks: [
    lineY(rows, {
      id: 'forecast',
      x: 'month',
      y: 'forecast',
      key: 'id',
      motion: { transition: { type: 'spring', mass: 1.25 } },
    }),
    dot(rows, {
      x: 'month',
      y: 'actual',
      key: 'id',
      motion(context) {
        return {
          delay: context.phase === 'enter' ? context.datumIndex * 35 : 0,
        }
      },
    }),
  ],
  scales: {
    x: {
      scale: scaleBand,
      axis: {
        ticks: { motion: { transition: { type: 'tween', duration: 180 } } },
        tickLabels: { motion: { delay: 40 } },
      },
    },
    y: { scale: scaleLinear },
  },
})
```

The cascade is renderer default, chart, mark, axis, specific guide, then the
active focus-state transition. Same-type transitions inherit omitted fields.
Set `motion: false` at any definition scope to suppress inherited motion for
that scope. A more specific child can re-enable motion with its own definition.
An authored `delay` replaces automatic entrance staggering for that target.
Spring updates begin immediately even when a definition returns a delay, so a
retarget cannot freeze incoming momentum. Spring enter and exit delays, and
tween delays in every phase, are honored.

All built-in marks accept `ChartMarkMotionOptions<TDatum>`. Nested polar marks
also accept `motion`; their timing is merged below the parent `polar` mark.

| Scope                          | Motion input                                         |
| ------------------------------ | ---------------------------------------------------- |
| Renderer fallback              | `motion({ transition })`                             |
| Whole chart                    | `defineChart({ motion })`                            |
| Any built-in mark              | The mark's `motion` option                           |
| Axis, including its grid lines | `x.axis.motion` or `y.axis.motion`                   |
| Tick rules                     | `axis.ticks.motion`                                  |
| Tick labels                    | `axis.tickLabels.motion`                             |
| Axis label                     | `axis.label.motion` when `label` is an object        |
| Crosshair or focus guide       | The guide mark's `motion` option                     |
| HTML tooltip                   | Inherits chart motion; `tooltip.motion` overrides it |

Grid lines use their axis policy because they are part of that axis's guide
system. `tooltip.motion: false` keeps the tooltip immediate even when chart
geometry animates. Legends and application-owned controls are not marks and do
not currently participate in the motion cascade.
