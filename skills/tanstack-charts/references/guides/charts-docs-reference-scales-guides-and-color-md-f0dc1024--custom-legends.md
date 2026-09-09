# Scales Guides And Color — Custom legends

[Guide and prerequisites](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Custom legends

`ChartColorLegend` separates layout from rendering:

```ts
interface ChartColorLegend {
  height(itemCount: number, context: ChartColorLegendContext): number
  placement?: 'top' | 'bottom'
  render(context: ChartColorLegendContext): SceneNode
}
```

`height` returns the reserved pixel height before chart bounds are finalized.
Both callbacks receive the resolved colors, plot and legend bounds, theme, and
full chart size. `render` returns one keyed
[scene node](./charts-docs-reference-runtime-and-scene-md-e3fcc593.md#source-charts-docs-reference-runtime-and-scene-md). Browser host controls are an
advanced extension boundary used by `interactiveColorLegend`; ordinary custom
legends should remain renderer-neutral scene output.
