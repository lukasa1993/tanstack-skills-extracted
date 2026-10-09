# Tooltips And Focus — Tooltip motion

[Guide and prerequisites](./charts-docs-guides-tooltips-and-focus-md-98d6a918.md) · Release-matched documentation · `@tanstack/charts@1.1.0`.

## Tooltip motion

The built-in tooltip uses the active motion renderer's transition for entry,
movement between points, retargeting, and exit:

```ts
import { motion } from '@tanstack/charts/motion'

const renderer = motion({
  transition: {
    type: 'spring',
    stiffness: 170,
    damping: 18,
    mass: 1,
  },
})

const definition = defineChart({
  marks,
  scales: {
    x: null,
    y: null,
  },
  tooltip,
})

mountChartRenderer(container, {
  definition,
  renderer,
  width: 640,
  height: 360,
  ariaLabel: 'Monthly visitors',
})
```

A static chart-level transition can refine the renderer fallback:

```ts
const definition = defineChart({
  marks,
  scales: {
    x: null,
    y: null,
  },
  motion: {
    transition: { type: 'spring', stiffness: 170, damping: 18, mass: 1 },
  },
  tooltip,
})
```

Set `tooltip.motion` to another transition to override both, or set it to
`false` to keep the tooltip immediate. These options customize the active
motion renderer; a static renderer stays immediate and does not import spring
physics. The renderer's reduced-motion policy also applies to the tooltip.

For fast pointer inspection alongside slower data animation, set
`tooltip: { use: tooltip, motion: false }`, or give the tooltip a short tween:

```ts
const tooltipOptions = {
  use: tooltip,
  motion: { transition: { type: 'tween', duration: 120 } },
}
```

Inline mark `states` wait for active entrance and data motion to finish.
Tooltips and separate focus marks continue updating during that time. See
the [motion reference](./charts-docs-reference-motion-md-125c7e38.md#source-charts-docs-reference-motion-md) for an immediate
`whenFocused` dot example.
