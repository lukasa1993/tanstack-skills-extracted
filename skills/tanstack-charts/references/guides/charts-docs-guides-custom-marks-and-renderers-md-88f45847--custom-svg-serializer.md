# Custom Marks And Renderers — Custom SVG serializer

[Guide and prerequisites](./charts-docs-guides-custom-marks-and-renderers-md-88f45847.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Custom SVG serializer

A `ChartSvgRenderer` accepts the complete `ChartScene` and accessible SVG
options:

```ts
const renderSvg: ChartSvgRenderer<Row, Date, number> = (scene, options) => {
  return serializeMySvg(scene, options)
}
```

Pass it through `renderSvg` on the vanilla host or any default SVG framework
adapter. Preserve:

- the accessible label and description;
- stable `data-ts-key` identity when DOM reconciliation should reuse nodes;
- the focus marker contract when chart-owned focus remains enabled;
- scoped IDs through `idPrefix`;
- deterministic server output.

The default `renderChartSvg` already emits declared gradients and group clips.
The compatible `renderChartSvgWithResources` export remains available when an
explicit resource serializer name is useful.

Mounted SVG surfaces also call the selected serializer when focus guides are
painted. That call contains a single `focus-guide-layer:under` or
`focus-guide-layer:over` group in `scene.nodes`; preserve its keyed `<g>` and
apply the same paint, clipping, and resource-ID rules as the base scene.
