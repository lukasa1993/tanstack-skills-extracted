# Focus And Interaction — Tooltips

[Guide and prerequisites](./charts-docs-reference-focus-and-interaction-md-949b11fe.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Tooltips

Import `tooltip` from `@tanstack/charts/tooltip` and place it on the definition
for the native accessible tooltip. The default is a structured label-value
table. Grouped focus adds a shared-axis heading and one color swatch and value
row per series. Visible axis labels are reused. Numbers use browser locale
formatting; dates use stable UTC ISO formatting.

```ts
interface ChartTooltipOptions<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> {
  className?: string
  portal?: ChartTooltipPortalInput
  items?: readonly ChartTooltipItem<TDatum, TXValue, TYValue>[]
  sort?: ChartTooltipSort<TDatum, TXValue, TYValue>
  anchor?: ChartTooltipAnchor<TDatum, TXValue, TYValue>
  placement?: 'auto' | ChartTooltipPlacement | readonly ChartTooltipPlacement[]
  offset?: number
  content?: (
    points: readonly ChartPoint<TDatum, TXValue, TYValue>[],
    context: ChartTooltipContentContext,
  ) => ChartTooltipContent
  format?: (
    point: ChartPoint<TDatum, TXValue, TYValue>,
    context: ChartTooltipContentContext,
  ) => string
  formatGroup?: (
    points: readonly ChartPoint<TDatum, TXValue, TYValue>[],
    context: ChartTooltipContentContext,
  ) => string
  sticky?: boolean
  visibility?: 'focus' | 'pinned'
}
```

| Option        | Default        | Meaning                                               |
| ------------- | -------------- | ----------------------------------------------------- |
| `className`   | None           | Class appended after `ts-chart-tooltip`               |
| `portal`      | None           | Optional top-layer or fixed-position transport        |
| `items`       | Automatic x/y  | Ordered rows for a single focused point               |
| `sort`        | `visual`       | Grouped row order                                     |
| `anchor`      | `point`        | Preset, per-axis coordinates, or coordinate resolver  |
| `placement`   | `auto`         | Fixed or ordered fallback box placements              |
| `offset`      | `10`           | Scene-pixel gap between anchor and box                |
| `content`     | Automatic rows | Returns a safe title and structured rows              |
| `format`      | None           | Replaces content with primary-point text              |
| `formatGroup` | None           | Replaces content with focused-group text              |
| `sticky`      | `true`         | Enables activation-to-pin and text selection          |
| `visibility`  | `focus`        | Shows on focus or only after activation with `pinned` |

Formatting precedence is `content`, `formatGroup`, `format`, then the default.
The text formatters do not parse HTML, and newlines are preserved. `className`
is appended to `ts-chart-tooltip`.

The default DOM surface inherits these optional CSS variables from the chart
container while retaining its built-in fallback values. A portaled Popover
keeps that ancestry. If the portal fallback moves the tooltip under
`ownerDocument.body`, chart-container-only variables no longer inherit; set
them on the tooltip class or a shared document ancestor instead:

| Variable                           | Controls                    |
| ---------------------------------- | --------------------------- |
| `--ts-chart-tooltip-background`    | Surface background          |
| `--ts-chart-tooltip-color`         | Text color                  |
| `--ts-chart-tooltip-border`        | Complete border declaration |
| `--ts-chart-tooltip-border-radius` | Corner radius               |
| `--ts-chart-tooltip-shadow`        | Box shadow                  |
| `--ts-chart-tooltip-max-width`     | Maximum width               |
| `--ts-chart-tooltip-padding`       | Inner spacing               |
| `--ts-chart-tooltip-font`          | Complete font shorthand     |

Use `className` for content structure or additional selectors. Use the
variables for ordinary surface theming without specificity overrides.

`ChartTooltipContentContext.pinned` is `false` during transient inspection and
`true` after activation. `content`, `format`, `formatGroup`, and item `text`
receive the same context, so either structured or plaintext content can reveal
additional detail when pinned.

### Ordered point items

`items` is an ordered single-point row list. Use `x`, `y`, and `group`
shorthands, a configured channel, a scalar datum field, or derived text:

```ts
const detailedDefinition = defineChart(definition, {
  tooltip: {
    use: tooltip,
    items: [
      {
        channel: 'y',
        label: 'Revenue',
        text: (point) => currency(point.yValue),
      },
      {
        field: 'volume',
        label: 'Volume',
        text: (point) => compact(point.datum.volume),
      },
      {
        id: 'change',
        label: 'Change',
        text: (point) =>
          point.datum.change == null ? null : percent(point.datum.change),
      },
      'x',
      'group',
    ],
  },
})
```

Array order is row order. A nullish datum field or nullish `text` result omits
the row. Adding `group` to `items` renders it as a row instead of the automatic
single-point title. In grouped focus, the shared-axis item supplies the heading
label and text, the opposite-axis item formats values, and the group item
formats series names. `sort` orders those generated series rows. Additional
grouped structure belongs in `content`.

`sort` accepts `visual`, `color-domain`, `focus`, or a typed point comparator.
Visual order follows the marks across the screen: top-to-bottom for an x-group
and left-to-right for a y-group.

### Anchor and placement

`anchor` controls the scene coordinate followed by the box:

- `point` follows the primary focused point.
- `pointer` follows the current pointer and falls back to the point for
  keyboard focus.
- `group-center` uses the center of the focused points' bounding box.
- `{ x, y }` chooses each coordinate from point, pointer, semantic value,
  group center, or a plot edge.
- A resolver receives the focused points plus `{ focus, pointer, plot,
surface, scales }` and returns scene coordinates. A nullish or non-finite
  result falls back to the primary point.

`placement` accepts `auto`, one placement, or an ordered fallback list. The
placements are `top`, `top-right`, `right`, `bottom-right`, `bottom`,
`bottom-left`, `left`, and `top-left`. A single placement is fixed and shifted
inside the surface. A list uses the first placement that fits; if none fits,
it uses the least-overflowing candidate and shifts it inside. `auto` uses
`top`, `bottom`, `right`, then `left`.

```ts
const groupedDefinition = defineChart(definition, {
  tooltip: {
    use: tooltip,
    anchor: { x: 'plot-center', y: 'plot-top' },
    placement: ['top', 'right', 'left', 'bottom'],
    offset: 12,
  },
})
```

Import `portal` from `@tanstack/charts/tooltip/portal` and assign it to the
tooltip's `portal` option when an ancestor clips overflow or creates an
incompatible stacking context. The host opens the tooltip as a manual Popover
in the browser top layer where supported, while retaining its chart DOM
ancestry. If Popover is unavailable or fails, it moves the tooltip directly
under the chart's `ownerDocument` body with fixed high-stack positioning. Both
paths map the scene anchor to viewport coordinates, reposition during scroll,
resize, and content resize, and collide against the viewport instead of the
chart box.

Clicking, Enter, or Space pins the tooltip. The next activation unpins it.
Pressing the pointer outside the chart and tooltip, or pressing `Escape`,
unpins and clears focus. Set `sticky: false` to disable pinning. A display-only
tooltip has `role="status"` and `aria-live="polite"`.

Set `visibility: 'pinned'` for click-or-keyboard detail that should not paint a
transient shell. Focus and inline mark states still update before activation;
the tooltip element and adapter body mount only while pinned.

`content` supports display-only rows. Every framework adapter can compose
native content around those rows while preserving the definition's ordering,
anchor, placement, portal, and pinning behavior. A pinned custom body has
non-modal dialog semantics.
