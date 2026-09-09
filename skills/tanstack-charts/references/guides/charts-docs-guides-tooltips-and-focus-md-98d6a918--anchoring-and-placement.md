# Tooltips And Focus — Anchoring and placement

[Guide and prerequisites](./charts-docs-guides-tooltips-and-focus-md-98d6a918.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Anchoring and placement

Point anchoring is the stable default for scatterplots, bars, and keyboard
navigation:

```ts
const pointDefinition = defineChart(definition, {
  tooltip: { use: tooltip, anchor: 'point', placement: 'top' },
})
```

Pointer anchoring is useful when a dense mark has a large interactive
primitive. Keyboard focus falls back to the primary point:

```ts
const pointerDefinition = defineChart(definition, {
  tooltip: {
    use: tooltip,
    anchor: 'pointer',
    placement: ['right', 'left', 'bottom', 'top'],
    offset: 12,
  },
})
```

Grouped charts can avoid jumping between series by anchoring to the focused
group's bounding-box center:

```ts
const definition = defineChart({
  marks,
  scales: {
    x: x,
    y: y,
  },

  focus: 'group-x',
  tooltip: {
    use: tooltip,
    anchor: 'group-center',
    placement: ['top', 'right', 'left', 'bottom'],
    sort: 'color-domain',
  },
})
```

Coordinates can be selected independently. This follows the focused x value
while fixing the tooltip to the top of the plot:

```ts
const fixedYDefinition = defineChart(definition, {
  tooltip: {
    use: tooltip,
    anchor: { x: 'value', y: 'plot-top' },
    placement: 'bottom',
    offset: 12,
  },
})
```

A custom resolver covers event ranges, maps, and application-specific
reference positions:

```ts
const customAnchorDefinition = defineChart(definition, {
  tooltip: {
    use: tooltip,
    anchor: (_points, { focus, pointer, plot, surface, scales }) => ({
      x: (scales.x.viewport?.map ?? scales.x.map)(focus.primary.xValue),
      y: plot.y,
    }),
    placement: 'bottom-left',
  },
})
```

Resolvers receive complete focus, pointer, plot, surface, and resolved-scale
state. Resolvers and placement use scene pixels. A nullish or non-finite custom
anchor falls back to the primary point. A placement list uses the first fit,
then the least-overflowing candidate.
