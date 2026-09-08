# Tooltips And Focus — Automatic tooltip mapping

[Guide and prerequisites](./charts-docs-guides-tooltips-and-focus-md-98d6a918.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Automatic tooltip mapping

The default `tooltip` extension renders labeled rows for the focused point.
Grouped focus uses the shared axis value as a heading and renders one row and
color swatch per series. Visible axis labels carry into the tooltip. Numbers
use the user's locale and dates use stable UTC ISO formatting.

Rect and link endpoints display as ranges. Bars and areas with an explicit
baseline display the interval length, so a stacked segment reports its own
value instead of the cumulative endpoint.

Order built-in channels, datum fields, and derived text for a single focused
point:

```ts
const definition = defineChart({
  marks,
  scales: {
    x: x,
    y: y,
  },

  tooltip: {
    use: tooltip,
    items: [
      {
        channel: 'y',
        label: 'Revenue',
        text: (point) => currency(point.yValue),
      },
      {
        field: 'status',
        label: 'Status',
      },
      {
        id: 'change',
        label: 'Change',
        text: (point, { pinned }) =>
          pinned && point.datum.change != null
            ? percent(point.datum.change)
            : null,
      },
      'x',
    ],
  },
})
```

Array order is row order. A nullish field or `text` result omits the row.
Item `text`, `content`, `format`, and `formatGroup` callbacks receive `pinned`,
which is `false` during transient inspection and `true` after click, Enter, or
Space.
Use it to keep the transient tooltip compact and reveal detailed rows when the
same tooltip is pinned.
Grouped focus keeps its shared-axis heading and series rows. By default, rows
follow the marks top-to-bottom for an x-group and left-to-right for a y-group.
Override that with `sort: 'color-domain'`, `sort: 'focus'`, or a typed
comparator. Use channel items to format their heading, series names, and values.
Use `content` when a grouped tooltip needs additional columns or nested
sections.

Customize plaintext content with typed formatters:

```ts
const formattedDefinition = defineChart(definition, {
  tooltip: {
    use: tooltip,
    format(point, { pinned }) {
      const suffix = pinned ? ' · pinned' : ''
      return `${point.datum.label}: ${point.datum.value.toLocaleString()}${suffix}`
    },
  },
})
```

For grouped focus:

```ts
const groupedDefinition = defineChart(definition, {
  tooltip: {
    use: tooltip,
    formatGroup(points, { pinned }) {
      const date = points[0]?.xValue
      const heading =
        date instanceof Date ? date.toLocaleDateString() : String(date ?? '')

      return [
        pinned ? `${heading} · pinned` : heading,
        ...points.map(
          (point) =>
            `${point.groupLabel}: ${point.datum.value.toLocaleString()}`,
        ),
      ].join('\n')
    },
  },
})
```

Formatting precedence is `content`, `formatGroup`, `format`, then the automatic
content. All three callbacks receive the same `ChartTooltipContentContext`.
`content` returns safe title and row data. `format` and `formatGroup` return
plain text; returning HTML does not create DOM.

Add `className` to style the native HTML surface. Clicking pins the current
tooltip for text selection. A later click or Escape unpins it. Set
`sticky: false` to disable pinning.

Set `visibility: 'pinned'` when focus should style the chart without opening a
transient tooltip. Click, Enter, or Space can still pin the focused point; only
the pinned surface and adapter body are mounted. The default is
`visibility: 'focus'`.
