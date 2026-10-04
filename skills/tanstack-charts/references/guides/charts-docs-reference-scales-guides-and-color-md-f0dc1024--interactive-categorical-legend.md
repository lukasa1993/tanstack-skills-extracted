# Scales Guides And Color — Interactive categorical legend

[Guide and prerequisites](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md) · Release-matched documentation · `@tanstack/charts@1.0.0`.

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
  hover?: 'series' | false
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
series identity without a separate `z` channel. Dot marks also participate when
`z` supplies their series and default color, with no separate `color` channel.

The DOM hosts replace the scene fallback with native `button` elements. Static
SVG output retains a noninteractive visual fallback. This control is not yet
implemented by the React Native host.

Set `hover: 'series'` to match inline mark states against the series under the
pointer or on the focused legend button. Its state context has `source:
'legend'`, and `matches('series')` identifies the emphasized category. Leaving
or blurring restores the chart's interaction styling. Hidden series do not
receive emphasis.

Emphasis matches semantic series, not rendered color strings. Line and area
marks can establish a series through categorical `color`. For dot marks, use
`z: 'series'` to establish series ownership; `z` also supplies the default
color channel, so a second `color: 'series'` is unnecessary. A color-only dot
can vary its paint while remaining outside any semantic series.

Legend emphasis does not set interaction focus, show a tooltip, move a
crosshair, or activate `whenFocused` geometry. Existing pinned focus and its
tooltip stay in place. Tick-label opacity still sees the real interaction
focus. Static SVG remains noninteractive. A custom renderer must declare
`supportsStateFocus: true` and honor the fourth `paintFocus` argument's
`stateFocus`, otherwise requesting emphasis throws.
