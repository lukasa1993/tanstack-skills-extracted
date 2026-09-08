# Layout Axes And Coordinates — Axis guide options

[Guide and prerequisites](./charts-docs-concepts-layout-axes-and-coordinates-md-371d3a9a.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Axis guide options

Each axis combines a required scale factory or instance with optional guide controls:

```ts
const x = {
  scale: xScale,
  grid: false,
  axis: {
    ticks: {
      count: 6,
      format: (date: Date) => monthFormatter.format(date),
    },
    tickLabels: { rotate: -30 },
    label: { text: 'Month', offset: 12 },
  },
}
```

| Option            | Purpose                                              |
| ----------------- | ---------------------------------------------------- |
| `axis`            | Configure the axis or hide it with `false`           |
| `axis.line`       | Show or hide the baseline                            |
| `axis.ticks`      | Configure candidates, stubs, padding, and formatting |
| `axis.tickLabels` | Configure label rotation and collision thinning      |
| `axis.label`      | Configure the axis title and offset                  |
| `grid`            | Draw grid lines at semantic candidates               |
| `reverse`         | Reverse the responsive range                         |

The y grid defaults to visible and the x grid defaults to hidden when `grid` is omitted.

Candidate generation and label layout are separate. Choose at most one of
`axis.ticks.count`, `axis.ticks.spacing`, and `axis.ticks.values`. Grid lines
and tick stubs use the generated candidates; label thinning does not remove
either. `axis.ticks.size: 0` removes stubs while retaining labels and grid
lines.

Rotation and thinning are independent. Thinning is enabled by default and
uses measured rotated bounds:

```ts
const x = {
  scale: xScale,
  axis: {
    ticks: { spacing: 80 },
    tickLabels: {
      rotate: -35,
      thin: { minGap: 8, priority: 'ends', keep: importantDates },
    },
  },
}
```

Hard-kept labels are retained even when they collide. Values absent from the
candidate set add labels only.

Hide one guide without removing its scale:

```ts
const x = {
  scale: xScale,
  axis: false,
}
```

Hide every axis and grid while keeping scales for marks:

```ts
const chart = defineChart({
  marks,
  guides: false,
  scales: {
    x: { scale: xScale },
    y: { scale: yScale },
  },
})
```

Set a reserved scale to `null` only when no mark uses that dimension. For
example, a `ruleY`-only chart uses `scales: { x: null, y: { scale: yScale } }`.
