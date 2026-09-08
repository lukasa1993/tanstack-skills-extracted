# Tooltips And Focus — Escaping clipped containers

[Guide and prerequisites](./charts-docs-guides-tooltips-and-focus-md-98d6a918.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Escaping clipped containers

Keep tooltip layering with the chart definition:

```ts
import { portal } from '@tanstack/charts/tooltip/portal'

const definition = defineChart({
  marks,
  scales: {
    x: x,
    y: y,
  },

  focus: 'group-x',
  tooltip: {
    use: tooltip,
    portal,
    anchor: 'group-center',
    placement: ['right', 'left', 'bottom', 'top'],
  },
})
```

The `portal` extension opens the tooltip as a manual Popover in the browser top
layer where supported. It remains a DOM descendant of the chart, so inherited
styles, ancestor selectors, and chart-scoped CSS custom properties continue to
work. If Popover is unavailable or fails, the host moves the tooltip directly
under the chart's `ownerDocument` body with fixed high-stack positioning. Both
paths escape `overflow: hidden` and local stacking contexts, use viewport
collision bounds, and reposition after scroll, viewport resize, or content
resize. Omitting `portal` keeps ordinary absolute positioning inside the chart.

For consistent fallback styling, target `tooltip.className` from a
document-level stylesheet and define required CSS custom properties on that
class or a shared document ancestor.
