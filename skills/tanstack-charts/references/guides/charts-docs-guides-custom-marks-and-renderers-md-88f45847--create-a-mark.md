# Custom Marks And Renderers — Create a mark

[Guide and prerequisites](./charts-docs-guides-custom-marks-and-renderers-md-88f45847.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Create a mark

`createMark` is the normal extension boundary:

<!-- docs-example: custom-mark typecheck -->

```ts
import { createMark } from '@tanstack/charts'

interface ThresholdDatum {
  id: string
  value: number
}

const threshold = createMark<ThresholdDatum, never, number>(({ markIndex }) => {
  const id = `threshold-${markIndex}`
  const datum: ThresholdDatum = { id: 'target', value: 75 }

  return {
    id,
    channels: {
      y: {
        scale: 'y',
        values: [datum.value],
      },
    },
    render({ chart, scales, theme }) {
      const y = scales.y.map(datum.value)
      return {
        nodes: [
          {
            kind: 'rule',
            key: datum.id,
            x1: chart.x,
            x2: chart.x + chart.width,
            y1: y,
            y2: y,
            style: {
              stroke: theme.foreground,
              strokeOpacity: 0.55,
            },
          },
        ],
      }
    },
  }
})
```

`initialize` materializes channels for one scene build. `render` receives the
required full `surface` bounds, inner `chart` plot bounds, scales, theme, color
resolver, and text layout tools.

Pass a mark renderer as the third argument when the custom mark should select
its own surface:

```ts
import { canvasChartRenderer } from '@tanstack/charts/canvas'

const denseThresholds = createMark<ThresholdDatum, never, number>(
  initializeThresholds,
  undefined,
  canvasChartRenderer,
)
```

The second argument remains the optional mark motion definition. A custom mark
can pass both motion and a renderer, and neither changes the other's meaning.
The selected renderer still decides whether it consumes that motion policy.
Built-in marks expose the same renderer choice in their option object. A DOM
renderer used this way must implement `ChartLayerRenderer`, including
`compose(defaultRenderer)`, so one compositor can own the ordered child
surfaces. `canvasChartRenderer` provides that composition.

When a custom mark emits data labels, an optional `layoutLabels(context)` can
return those positioned `SceneLabel` nodes before render so unlocked margins
contain them. Keep that method pure because responsive layout may call it more
than once; the final `render` call still happens once.

For layout that genuinely requires final scales or plot bounds, return
`resolveLayout(context)` instead of an initial render. It may derive
screen-space bins, collisions, or topology and returns the final channels,
labels, states, and render closure. Positional domains still come from the
channels materialized by `initialize`; resolved channels can contribute to
color inference. The bounded margin solver may call the layout repeatedly, so
it must be pure and deterministic.

Available scene nodes:

- `group`;
- `rule`;
- `polyline`;
- `area`;
- `dot`;
- `rect`;
- `label`.

Every node requires a deterministic key.
