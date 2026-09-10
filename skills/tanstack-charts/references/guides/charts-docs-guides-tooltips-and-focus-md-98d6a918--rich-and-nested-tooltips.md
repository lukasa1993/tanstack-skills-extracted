# Tooltips And Focus — Rich and nested tooltips

[Guide and prerequisites](./charts-docs-guides-tooltips-and-focus-md-98d6a918.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Rich and nested tooltips

Framework adapters can replace only the tooltip body while the shared host
continues to own focus, ordering, anchoring, placement, portal coordinates,
and dismissal. This React example places a nested pie beside the native rows:

```tsx
import { Chart as TooltipChart } from '@tanstack/charts/react/tooltip'

export function RevenueChart() {
  return (
    <TooltipChart
      definition={definition}
      ariaLabel="Revenue by series"
      renderTooltipBody={({ points, defaultBody, pinned, dismiss }) => (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 8rem',
            gap: 12,
          }}
        >
          <div>{defaultBody}</div>
          <div>
            <SeriesPie points={points} />
            {pinned ? (
              <button type="button" onClick={dismiss}>
                Close
              </button>
            ) : null}
          </div>
        </div>
      )}
    />
  )
}
```

The nested component is an ordinary chart built from the focused group:

```tsx
import * as React from 'react'
import { defineChart, type ChartPoint } from '@tanstack/charts'
import { polar, radialArc } from '@tanstack/charts/polar'
import { Chart } from '@tanstack/charts/react'
import { pie } from 'd3-shape'

interface RevenueRow {
  date: Date
  series: string
  value: number
}

type RevenuePoint = ChartPoint<RevenueRow, Date, number>

function SeriesPie({ points }: { points: readonly RevenuePoint[] }) {
  const pieDefinition = React.useMemo(() => {
    const slices = pie<RevenuePoint>()
      .sort(null)
      .value((point) => Math.max(0, point.yValue))(points)

    return defineChart({
      marks: [
        polar({
          inset: 2,
          marks: [
            radialArc(slices, {
              key: (slice) => slice.data.key,
              fill: (slice) => slice.data.color ?? 'CanvasText',
            }),
          ],
          scales: {
            angle: null,
            radius: null,
          },
        }),
      ],
      guides: false,
      scales: {
        x: null,
        y: null,
      },

      keyboard: false,
    })
  }, [points])

  return (
    <Chart
      definition={pieDefinition}
      width={128}
      height={96}
      ariaLabel="Series share at the focused date"
    />
  )
}
```

`defaultBody` is the native title, rows, formatting, and swatches in the
adapter's native composition form. Render it as-is, wrap it, or omit it.
`points` preserves the grouped series order selected by `tooltip.sort`;
`content` exposes the same safe model when a different layout is needed.
`pinned` distinguishes transient inspection from interactive content, and
`dismiss()` clears the tooltip and returns focus to the chart when focus was
inside the body.

A custom body is inert while transient, so a display-only nested chart can stay
visible but cannot receive pointer or keyboard input. Render controls only when
`pinned` is true. The pinned body becomes a non-modal dialog; its controls
still need useful labels and intentional focus order. The adapter updates
framework content with focused-point changes and unmounts it when the tooltip
is dismissed or the parent chart unmounts.

For pin-only detail, configure `visibility: 'pinned'` in the definition. The
host then suppresses both the transient shell and the adapter body instead of
requiring the framework renderer to return an empty element.

| Adapter                      | Native body composition                            |
| ---------------------------- | -------------------------------------------------- |
| React, Preact, Solid, Octane | `renderTooltipBody` prop                           |
| Vue                          | `#tooltipBody` scoped slot                         |
| Svelte                       | `tooltipBody` snippet prop                         |
| Angular                      | `[tanstackChartTooltipBody]="definition"` template |
| Lit                          | `options.renderTooltipBody`                        |
| Alpine                       | `options.renderTooltipBody` returning DOM content  |

Each receives `points`, `content`, `defaultBody`, `pinned`, and `dismiss`.
Composition stays beside the component, slot, template, or directive options;
the framework-neutral definition still owns every tooltip behavior.

The [Interactive Charts examples](./charts-docs-examples-interactive-charts-md-2668d57c.md#source-charts-docs-examples-interactive-charts-md) and
[Polar and Radar Charts](./charts-docs-examples-polar-and-radar-md-6fe0ac13.md#source-charts-docs-examples-polar-and-radar-md) show the
two pieces of the nested pie pattern.
