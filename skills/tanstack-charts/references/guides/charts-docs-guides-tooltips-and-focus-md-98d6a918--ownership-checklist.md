# Tooltips And Focus — Ownership checklist

[Guide and prerequisites](./charts-docs-guides-tooltips-and-focus-md-98d6a918.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Ownership checklist

- Use chart-owned focus for datum inspection.
- Choose two-dimensional, nearest-axis, or grouped-axis semantics explicitly.
- Keep a finite distance unless continuous snapping is intended.
- Use `crosshair` for a single focus-driven guide; use `whenFocused` to reveal
  existing data-bound geometry.
- Share semantic cursor state through `createChartCursor`, not copied pixels.
- Use native plaintext formatting for the 90% case.
- Use the `portal` extension where clipped ancestors or stacking contexts can
  hide the tooltip.
- Use the adapter's tooltip-body composition surface for framework content;
  use focus callbacks for separate application-owned surfaces.
- Give keyboard and pointer users equivalent state and selection.
- Keep interactive content pinned and dismissible.
- Let framework lifecycle destroy nested charts and external listeners with
  their owner.

### Active series

Grouped tooltip rows follow their chart positions by default: top to bottom
for x focus, and left to right for y focus. The primary hovered or
keyboard-focused point gets a bold row with a shaded background in DOM tooltips, even when
several series share a color.

For custom structured content, set each row's `active` field by comparing its
point with `context.primaryPoint`:

```ts
content: (points, context) => ({
  rows: points.map((point) => ({
    label: point.groupLabel,
    value: context.formatY(point.yValue),
    color: point.color,
    active: point === context.primaryPoint,
  })),
})
```

Rows expose `data-active="true"` or `data-active="false"` for custom styling.

The default emphasis uses CSS variables, so you can restyle it without
replacing the tooltip body. Set `tooltip.className` to scope the overrides:

```css
.downloads-tooltip {
  --ts-chart-tooltip-active-row-font-weight: 600;
  --ts-chart-tooltip-active-row-background: transparent;
  --ts-chart-tooltip-active-row-border-radius: 0;
  --ts-chart-tooltip-active-row-shadow: none;
}
```

Set `active: false` in custom structured content to disable the highlight.
For complete control over markup and styling, use your adapter's tooltip-body
composition surface. Structured `content.rows` retain their `active` state
for your renderer to use. Body render callbacks also receive `primaryPoint`,
independent of the sorted `points` list.
