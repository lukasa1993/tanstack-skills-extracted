# Custom Marks And Renderers — Interaction points

[Guide and prerequisites](./charts-docs-guides-custom-marks-and-renderers-md-88f45847.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Interaction points

The threshold above is decorative, so it emits no points. Return `ChartPoint`
records when custom geometry should participate in focus, tooltips, keyboard
navigation, or selection.

Each point should retain:

- its original datum;
- a stable key;
- semantic x and y values;
- resolved pixel coordinates;
- group identity and color.

For a large painted mark, create the semantic point once and attach that same
object to the scene primitive that paints it:

```ts
import type { SceneRect } from '@tanstack/charts'

const point = interactionPoint(index)
const node: SceneRect = {
  kind: 'rect',
  key: point.key,
  x,
  y,
  width,
  height,
  interaction: { point, affinity: 'x' },
}

return { nodes: [node], points: [point] }
```

Use `x` for vertically oriented marks, `y` for horizontal marks, `xy` for
ordinary two-dimensional proximity, and `geometry` when only exact
containment should focus the mark. The default resolver checks containment
across every mark before applying any fallback. A continuous `polyline` or
`area` may attach all of the semantic samples it represents with
`interaction: { points, affinity }`; containment selects the closest sample
within that primitive.

Keep primitive coordinates local when returning translated groups. Scene
traversal applies nested translation, clipping, facets, and paint order after
layout. Do not calculate a second set of global hit bounds beside the rendered
node.

Omit points for decorative geometry. Do not invent fake interactive data for a
frame, grid, or threshold that should not receive focus.
