# Tooltips And Focus — Angular focus

[Guide and prerequisites](./charts-docs-guides-tooltips-and-focus-md-98d6a918.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Angular focus

Use `focusGroupAngle` for the radial equivalent of `group-x`:

```ts
import { defineChart, type ChartDefinition } from '@tanstack/charts'
import { focusGroupAngle } from '@tanstack/charts/polar'
import { tooltip } from '@tanstack/charts/tooltip'

declare const radialDefinition: ChartDefinition

const interactiveDefinition = defineChart(radialDefinition, {
  focus: focusGroupAngle,
  tooltip,
})
```

The nearest radial ray selects the semantic angle, the closest radius becomes
primary, and the tooltip receives one point per series at that angle. The
strategy uses the same finite `maxFocusDistance` policy as axis grouping.
Ordinary pie and donut charts can keep default nearest focus: `radialArc`
attaches the exact painted slice geometry, including the donut hole.

Default `primary` and `group` presentation follows the canonical focused scene
points. Equal x/y/series values in another facet do not implicitly paint a
second focus marker. To synchronize a visual cursor across facets without
turning those mirrors into additional selected data, add an ordinary focus
mark with `whenFocused(..., { match: 'x' })` or `match: 'y'`. The tooltip and
focus callback still receive the resolver's primary point or explicit focus
group.

```ts
whenFocused(bandX(rows, { x: 'date' }), { match: 'x' })
whenFocused(bandY(rows, { y: 'value' }), { match: 'y' })
```

These are presentation filters, not alternate selection strategies. The first
paints a vertical band wherever the focused x value exists; the second paints a
horizontal band wherever the focused y value exists. `whenFocused` can only
reveal geometry already emitted by its authored mark. It cannot move one
stable band between values.

Use the data-less `crosshair` mark when one renderer-native guide should follow
the active focus instead of revealing authored geometry for a matching datum:

```ts group=focused-crosshair env=charts file=/src/chart.ts entry
import { defineChart, lineY } from '@tanstack/charts'
import { crosshair } from '@tanstack/charts/crosshair'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scalePoint } from '@tanstack/charts/scales/point'
import { tooltip } from '@tanstack/charts/tooltip'
import { rows } from './data'

export default defineChart({
  marks: [
    lineY(rows, {
      x: 'week',
      y: 'value',
      points: true,
      stroke: '#2563eb',
      strokeWidth: 2.5,
    }),
    crosshair({ x: { label: true }, y: false }),
  ],
  scales: {
    x: { scale: () => scalePoint<string>().padding(0.2) },
    y: { scale: scaleLinear, grid: true, axis: { label: 'Active users' } },
  },

  focus: 'nearest-x',
  maxFocusDistance: Number.POSITIVE_INFINITY,
  tooltip,
})
```

```ts group=focused-crosshair file=/src/data.ts collapsed
export const rows = [
  { week: 'May 4', value: 820 },
  { week: 'May 11', value: 960 },
  { week: 'May 18', value: 1_140 },
  { week: 'May 25', value: 1_280 },
  { week: 'Jun 1', value: 1_210 },
  { week: 'Jun 8', value: 1_390 },
]
```

The vertical rule follows pointer and keyboard focus. The infinite distance is
an explicit continuous-snapping policy; keep the finite default when empty
space should clear focus.

`crosshair` defaults to both axis rules with no labels or marker. Setting
`band: true` or a band options object replaces that axis rule; axes with zero
bandwidth emit no band. Guides are clipped to the plot and labels are clamped
to the surface. They do not change nearest-point selection, add hit targets,
or suppress the primary focus ring. Use `focusRing: false` only when authored
cursor geometry deliberately replaces the ring. See
[Focus and Interaction](./charts-docs-reference-focus-and-interaction-md-949b11fe.md#source-charts-docs-reference-focus-and-interaction-md)
for the complete band paint contract and controlled cursor behavior.

[Open the stacked cursor-band catalog case](https://tanstack.com/charts/catalog/119-stacked-bar-band-cursor/).
