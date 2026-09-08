# Motion — `motion`

[Guide and prerequisites](./charts-docs-reference-motion-md-125c7e38.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## `motion`

```ts
import { motion } from '@tanstack/charts/motion'

const renderer = motion({
  transition: { type: 'spring', stiffness: 170, damping: 18, mass: 1 },
})
```

```ts
function motion(options?: ChartMotionOptions): UniversalChartRenderer

function motion<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>(options?: ChartMotionOptions): ChartRenderer<TDatum, TXValue, TYValue>

interface ChartMotionOptions {
  initial?: boolean | 'always'
  transition?: ChartMotionTransition
  respectReducedMotion?: boolean
  resize?: boolean
}
```

Use `motion(options)` beside a typed definition and let the host infer its
datum and axis values. The explicit generic overload remains available when a
low-level caller must type the renderer before it has a definition.

| Option                 | Default                                       | Meaning                                                       |
| ---------------------- | --------------------------------------------- | ------------------------------------------------------------- |
| `initial`              | `true`                                        | Animate first client paint; `always` also replays adopted SVG |
| `transition`           | 1,100 ms tween with the default entrance ease | Renderer-wide fallback                                        |
| `respectReducedMotion` | `true`                                        | Snap when `prefers-reduced-motion: reduce` matches            |
| `resize`               | `false`                                       | Animate updates caused only by a chart size change            |

Server-rendered SVG is adopted without replaying entrance motion by default.
Set `initial: 'always'` when a hydrated chart should replay the same entrance
as a client-only mount. Keyed updates start from painted geometry. An
interrupted spring carries its sampled value and velocity into the new target.
A spring has no duration; it finishes when both `restSpeed` and `restDelta` are
satisfied, with a 10-second safety limit.

Initial choreography follows geometry: Cartesian bars and paths grow from
their semantic baseline, radial lines and areas grow from the polar center,
and arcs sweep through their authored angle. Keyed removals stay painted
through their exit transition.

Data-less `crosshair` marks use the same keyed focus-motion path. Rapid pointer
or keyboard retargeting preserves the guide elements and incoming spring
velocity; labels remain aligned to their moving rules.

The built-in HTML tooltip also consumes this renderer's transition. Entry,
movement, retargeting, and exit therefore use the same spring without copying
the transition into the chart definition. A static renderer keeps the tooltip
immediate and does not import the motion runtime.

Use the renderer-neutral host in vanilla applications:

```ts
import { mountChartRenderer } from '@tanstack/charts/renderer'
import { motion } from '@tanstack/charts/motion'

const host = mountChartRenderer(container, {
  definition,
  renderer: motion(),
  width: 640,
  height: 360,
  ariaLabel: 'Monthly revenue',
})
```

React and Octane applications use their `/core` component entry and pass the
same renderer. Other adapters start with their default SVG renderer, and a
definition may still select Canvas for individual marks.
