# Polar — `focusGroupAngle`

[Guide and prerequisites](./charts-docs-reference-marks-polar-md-29a92849.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## `focusGroupAngle`

```ts
import { defineChart, type ChartDefinition } from '@tanstack/charts'
import { focusGroupAngle } from '@tanstack/charts/polar'
import { tooltip } from '@tanstack/charts/tooltip'

declare const definition: ChartDefinition

const interactiveDefinition = defineChart(definition, {
  focus: focusGroupAngle,
  tooltip,
})
```

`focusGroupAngle` is the polar equivalent of `group-x`. Pointer resolution
uses the nearest radial ray instead of the nearest point anchor, then returns
one point per series with the same semantic angle value. The closest radius is
primary. Keyboard navigation visits one representative per angle in angular
order. `maxFocusDistance` is the scene-pixel distance from the pointer to the
ray; set it to `Number.POSITIVE_INFINITY` for continuous angular snapping.
