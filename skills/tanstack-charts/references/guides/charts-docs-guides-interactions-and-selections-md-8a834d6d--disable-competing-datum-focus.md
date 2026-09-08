# Interactions And Selections — Disable competing datum focus

[Guide and prerequisites](./charts-docs-guides-interactions-and-selections-md-8a834d6d.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Disable competing datum focus

When a gesture has no datum inspection at all, disable chart-owned focus explicitly:

```ts
import { focusDisabled } from '@tanstack/charts/focus/disabled'

const gestureDefinition = defineChart(definition, {
  focus: focusDisabled,
  keyboard: false,
})

mountChart(element, {
  definition: gestureDefinition,
  ariaLabel: 'Selectable monthly range',
  onRender: mountBrushOverlay,
})
```

This prevents an application-owned gesture from competing with the host's
point marker and tooltip. First-party host controls such as `brushX` and
`zoomX` isolate their own events.

Use `pointer: false` plus the interaction controller when the application owns
the gesture but the chart should still own datum focus. `focusDisabled` does
not remove keyboard accessibility from application-owned controls.
A definition `cursor` in `free` mode already owns the host pointer path and
does not require `pointer: false` or `focusDisabled`.
