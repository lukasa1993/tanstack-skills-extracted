# Rendering And Export — React Native adapter

[Guide and prerequisites](./charts-docs-reference-rendering-and-export-md-ef854527.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## React Native adapter

The React Native entry selects its native build through the package export
conditions and renders the shared scene with `react-native-svg`.

```ts
import {
  Chart,
  resolveNativePaint,
  type NativeChartRenderContext,
  type NativeChartTooltipRenderContext,
  type NativePaintContext,
  type NativePaintResolver,
} from '@tanstack/charts/react-native'
import {
  tooltip,
  type NativeChartTooltipComponent,
  type NativeChartTooltipExtension,
  type NativeChartTooltipProps,
} from '@tanstack/charts/react-native/tooltip'
```

`NativeChartRenderContext` is passed to `Chart`'s `onRender` callback.
`NativeChartTooltipRenderContext` is passed to a custom tooltip renderer.
`NativeChartTooltipProps` describes the built-in native tooltip component,
whose component and extension contracts are `NativeChartTooltipComponent` and
`NativeChartTooltipExtension`.

Use `resolveNativePaint` as the default `NativePaintResolver`. It resolves
`currentColor`, Canvas system colors, and CSS-variable fallbacks against a
`NativePaintContext`. Pass a custom resolver through `Chart` when the
application owns additional paint tokens.
