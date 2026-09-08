# Polar — `polar`

[Guide and prerequisites](./charts-docs-reference-marks-polar-md-29a92849.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## `polar`

```ts
function polar(options: PolarOptions): ChartMark
```

| Option        | Type                    | Default       | Meaning                                                        |
| ------------- | ----------------------- | ------------- | -------------------------------------------------------------- |
| `id`          | `string`                | Layer-derived | Stable container ID                                            |
| `className`   | `string`                | None          | Class added beside `ts-chart__polar`                           |
| `marks`       | `readonly PolarMark[]`  | Required      | Radial marks rendered in order                                 |
| `guides`      | `readonly PolarGuide[]` | `[]`          | Background/foreground guide layers around marks                |
| `scales`      | `PolarScales`           | Required      | Reserved `angle` and `radius` entries plus optional named ones |
| `startAngle`  | `number`                | `0`           | Start of the available angular range in radians                |
| `endAngle`    | `number`                | `2π`          | End of the available angular range in radians                  |
| `inset`       | `number`                | `0`           | Pixels removed from the maximum centered radius                |
| `radiusRatio` | `number`                | `1`           | Multiplier applied to the radius after inset                   |
| `renderer`    | `ChartMarkRenderer`     | Host renderer | Renderer for the complete polar container                      |

The default angular range is a complete circle. Angles use D3's radial
convention: zero is at twelve o'clock and positive values move clockwise.

`scales.angle` and `scales.radius` accept compatible factories with
mark-inferred domains or configured instances with fixed domains. Use `null`
when no child mark uses that channel. `nice` applies after inference. TanStack
supplies responsive ranges without mutating an instance. An omitted `wrap`
closes a complete revolution without adding a duplicate semantic category,
but preserves both endpoints of a partial range. Set it explicitly to override
that behavior.

`PolarRadiusOptions.range` overrides the default `[0, radius]` pixel range on
the copied radius scale. Each endpoint is a nonnegative pixel length or a
`PolarLength` callback, so concentric layouts can resolve physical ranges from
the final radius:

```ts
const radiusOptions = {
  scale: scaleLinear().domain([0, maximum]),
  range: [({ radius }) => radius * 0.2, ({ radius }) => radius],
}
```

The range is re-resolved on resize and never mutates the authored D3 scale.

`PolarLayoutContext` contains `chart`, `centerX`, `centerY`, `radius`,
`startAngle`, `endAngle`, and resolved position scales under `scales`. Each
`PolarResolvedScale` exposes its `id`, `channel`, semantic `domain`, responsive
`map`, `ticks`, and `bandwidth`. A `PolarLength` is either a pixel length or a
callback of the layout context. Use a callback for radii that must remain
proportional during resize.

Additional entries support independent angle or radius mappings. Declare the
entry's channel, then bind a radial mark to its ID:

```ts
polar({
  scales: {
    angle: { scale: categoryScale },
    radius: { scale: percentScale },
    target: {
      channel: 'radius',
      scale: targetScale,
    },
  },
  marks: [
    radialLine(actual, { angle: 'metric', radius: 'value' }),
    radialLine(target, {
      angle: 'metric',
      radius: 'value',
      radiusScale: 'target',
    }),
  ],
})
```

`radialLine`, `radialArea`, `radialDot`, `radialText`, `radialRule`, and both
radial bar marks use `angleScale` and `radiusScale`. Omitted bindings use the
reserved `angle` and `radius` entries. `radialArc` uses authored angular and
radial geometry instead of positional scale bindings.

All radial mark option objects also accept `renderer?: ChartMarkRenderer`.
Use `canvasChartRenderer` to paint one radial mark with Canvas while sibling
marks and guide labels stay in SVG. Setting `renderer` on the outer `polar`
options moves the complete polar container, including its guides, to that
renderer.

The outer chart uses `scales: { x: null, y: null }`. Cartesian axes do not
participate in the internal polar scales.
