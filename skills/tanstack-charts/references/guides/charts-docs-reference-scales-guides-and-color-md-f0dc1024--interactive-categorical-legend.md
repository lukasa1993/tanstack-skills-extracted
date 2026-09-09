# Scales Guides And Color — Interactive categorical legend

[Guide and prerequisites](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Interactive categorical legend

```ts
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { interactiveColorLegend } from '@tanstack/charts/legend'

interactiveColorLegend({
  visible: controlledSignal(visibleSeries, setVisibleSeries),
  placement: 'bottom',
  ariaLabel: 'Series visibility',
})
```

```ts
interface InteractiveColorLegendChange<TValue extends ChartKey> {
  type: 'toggle'
  value: TValue
  visible: boolean
}

interface InteractiveColorLegendItemContext {
  visible: boolean
}

interface InteractiveColorLegendOptions<TValue extends ChartKey> {
  visible: ControlledSignal<
    readonly TValue[],
    InteractiveColorLegendChange<TValue>
  >
  placement?: 'top' | 'bottom'
  ariaLabel?: string
  itemWidth?: number
  format?: (value: TValue) => string
  itemAriaLabel?: (
    value: TValue,
    context: InteractiveColorLegendItemContext,
  ) => string
  emptyLabel?: string
}
```

The application owns the current visible-value snapshot and handles each
proposed replacement. The legend owns domain-ordered toggling, responsive
layout, and native browser buttons. It filters series geometry and focus points
after scale resolution, so hidden values remain in categorical and positional
domains. A mark participates when its categorical `color` channel establishes
series identity without a separate `z` channel.

The DOM hosts replace the scene fallback with native `button` elements. Static
SVG output retains a noninteractive visual fallback. This control is not yet
implemented by the React Native host.
