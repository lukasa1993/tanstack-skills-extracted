# Custom Marks And Renderers — Custom renderer

[Guide and prerequisites](./charts-docs-guides-custom-marks-and-renderers-md-88f45847.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Custom renderer

A full renderer implements `ChartRenderer` and returns a `ChartSurface`:

```ts
import { mountChartRenderer } from '@tanstack/charts/renderer'

const host = mountChartRenderer(container, {
  definition,
  renderer: myRenderer,
  ariaLabel: 'Threshold history',
})
```

The renderer owns server shell markup, its mounted element, scene painting,
focus painting, and cleanup. It can implement `clientToScene` when controlled
pointer gestures need client-coordinate conversion; the interaction controller
returns `null` when that optional capability is absent. The host retains
sizing, runtime, keyboard, tooltip, selection, and focus-strategy behavior.
Keep `prerender` deterministic and make `mount` adopt compatible server markup.

A composed surface exposes its child surfaces from back to front through
`ChartSurface.layers`. Its `element` remains the single accessible,
interactive root. `defaultElement` identifies the topmost element owned by the
host's default renderer. SVG-oriented `onRender` callbacks keep `svg` for
compatibility and also receive the complete `surface`, so application code can
inspect a mixed chart without treating the composition root as an SVG.

If `paintFocus` resolves and paints inline mark-state geometry, return that
destination `ChartScene`. The host will use it for subsequent pointer hits;
returning nothing preserves base-scene interaction for simpler renderers.
Call `resolveFocusPresentation(scene, focus, pointer, cursor)` to obtain the
authored and crosshair nodes for the renderer's underlay and overlay surfaces.

If the renderer animates point geometry, implement `getPresentationPoints`
and `subscribePresentationPoints`. This keeps stationary pointer focus,
keyboard focus, and tooltip anchors aligned with the painted frame.

Use the public `resolveFocusScene` and `focusedSceneNodes` helpers when a
custom surface supports authored focus layers. They keep normal filtered marks
and `whenFocused(..., { retarget: true })` compositions on the same
renderer-neutral selection path as the built-in surfaces.

Use `ChartRendererRenderContext.surface` instead of assuming `onRender` exposes
an SVG element. Framework consumers pass `renderer` through
`@tanstack/charts/react/core` or `@tanstack/charts/octane/core`.
