# Custom Marks And Renderers — Focus-guide marks

[Guide and prerequisites](./charts-docs-guides-custom-marks-and-renderers-md-88f45847.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Focus-guide marks

A mark that emits only cursor-driven rules, bands, labels, or markers declares that
role explicitly:

```ts
import { resolveCrosshairGuide } from '@tanstack/charts/crosshair'

return {
  id,
  channels: {},
  focusGuideOnly: true,
  render({ chart, surface, scales, theme }) {
    return {
      nodes: [],
      focusGuides: [
        {
          key: id,
          markId: id,
          chart,
          surface,
          x: { style: { stroke: theme.foreground } },
          projectX: (value) => {
            const scale = scales.x
            if (!scale || scale.type === 'none') return undefined
            const position = (scale.viewport?.map ?? scale.map)(value)
            return Number.isFinite(position) ? position : undefined
          },
          resolve: resolveCrosshairGuide,
        },
      ],
    }
  },
}
```

`focusGuideOnly: true` keeps a guide-only mark from becoming the first ordinary
mark used to divide underlays from overlays. `MarkScene.focusGuides` accepts
`MarkFocusGuide`. Its `placement` is optional: omit it for normal mark-order
placement. An explicit `under` or `over` is reserved for composed nested scenes
that must retain placement already resolved inside that composition. Authors
do not need to invent a placement for an ordinary guide mark.

The required `surface` bounds cover the complete chart surface; `chart` covers
the inner plot. Use `chart` for clipped rules and `surface` for labels that must
remain visible. Project semantic guide values through
`scale.viewport?.map ?? scale.map` so a transient viewport translation keeps
the guide aligned with presented content. Each guide's required `resolve`
callback receives the final guide, local focus, pointer, and projected cursor,
then returns one transient scene node or `undefined`. `resolveCrosshairGuide`
provides the built-in rule, band, label, and marker behavior. A custom guide can
supply different policy without adding it to renderer bundles that never use
the guide. A custom renderer receives final `SceneFocusGuide` values after the
compiler has filled in placement. Pass the scene to
`resolveFocusPresentation` instead of calling guide resolvers or resolving mark
order inside the renderer.
