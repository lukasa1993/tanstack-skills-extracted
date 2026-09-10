# Focus And Interaction — Crosshair guides

[Guide and prerequisites](./charts-docs-reference-focus-and-interaction-md-949b11fe.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Crosshair guides

`crosshair` is a data-less presentation mark. It follows the chart's resolved
focus state without adding scale values or pointer targets:

```ts
import { crosshair, defineChart, lineY } from '@tanstack/charts'

const definition = defineChart({
  marks: [
    lineY(rows, { x: 'date', y: 'value', color: 'series' }),
    crosshair({
      x: { label: true },
      y: false,
      strokeDasharray: '4 4',
    }),
  ],
  scales: {
    x: { scale: scaleUtc },
    y: { scale: scaleLinear },
  },

  focus: 'group-x',
  maxFocusDistance: Number.POSITIVE_INFINITY,
})
```

The x guide is vertical and the y guide is horizontal. Both default to
enabled; labels and the intersection marker default to disabled. Shared rule
options apply to both axes, and an axis object can override them. A label uses
the matching resolved tick label when available, falls back to the semantic
value, and accepts a `format` callback. Labels are clamped to the chart surface
and rendered with a configurable halo. Rules and the optional marker are
clipped to the plot. For difference intervals such as stacked bars and areas,
the label formats the plotted `x2` or `y2` endpoint so it matches the guide;
tooltip formatting still reports the interval difference.

`crosshair<TXValue, TYValue>(options = {})` accepts these top-level options:

| Option   | Default                   | Meaning                                      |
| -------- | ------------------------- | -------------------------------------------- |
| `id`     | `crosshair-${markIndex}`  | Stable mark and guide identity               |
| `x`      | `true`                    | Vertical rule or categorical band            |
| `y`      | `true`                    | Horizontal rule or categorical band          |
| `marker` | `false`                   | Marker at the resolved x/y intersection      |
| `motion` | No mark-specific override | Optional guide spring or tween configuration |

The shared rule options apply to both axes. The same fields on an axis object
override the shared value for that axis:

| Rule option       | Default          | Meaning                            |
| ----------------- | ---------------- | ---------------------------------- |
| `stroke`          | Chart foreground | Rule color                         |
| `strokeOpacity`   | `0.35`           | Rule stroke opacity                |
| `strokeWidth`     | `1`              | Nonnegative rule width             |
| `strokeDasharray` | None             | SVG-compatible stroke dash pattern |

An x or y axis object adds two options:

| Axis option | Default | Meaning                                       |
| ----------- | ------- | --------------------------------------------- |
| `label`     | `false` | `true` for defaults or a label options object |
| `band`      | `false` | `true` for defaults or a band options object  |

On a categorical axis, `band` replaces that axis rule with a plot-spanning
cursor band centered on the focused value:

```ts
marks: [
  crosshair({
    x: {
      band: {
        inset: 0,
        radius: 3,
        fill: '#64748b',
        fillOpacity: 0.16,
      },
      label: true,
    },
    y: false,
  }),
  barY(rows, {
    x: 'period',
    y: 'value',
    color: 'series',
    inset: 4,
  }),
  crosshair({
    x: false,
    y: { strokeDasharray: '4 4', label: true },
  }),
]
```

The first guide is an underlay because it precedes the bars; the second is an
overlay. With a bar inset of 4 and band inset of 0, the cursor extends exactly
4 pixels beyond each bar edge. Its x label shows the focused period; the y rule
label shows the focused stack endpoint. Use separate crosshair marks whenever
axes need different placement.

| Band option     | Default          | Meaning                                                                  |
| --------------- | ---------------- | ------------------------------------------------------------------------ |
| `inset`         | `0`              | Pixels removed from both scale-band edges; negative values create outset |
| `radius`        | None             | Corner radius                                                            |
| `fill`          | Chart foreground | Fill color                                                               |
| `fillOpacity`   | `0.12`           | Fill opacity                                                             |
| `stroke`        | None             | Optional outline color                                                   |
| `strokeOpacity` | None             | Optional outline opacity                                                 |
| `strokeWidth`   | None             | Optional nonnegative outline width                                       |
| `opacity`       | None             | Opacity applied to the complete band                                     |

`band: true` uses those defaults. Band geometry uses the resolved scale
bandwidth, spans the plot in the other direction, and remains clipped to the
plot. A continuous scale or any other axis with zero bandwidth emits no band.
The axis label can still be enabled because `band` replaces only the rule.

Label options control formatting and paint outside the plot:

| Label option    | Default                                        |
| --------------- | ---------------------------------------------- |
| `format`        | Matching scale tick label, then semantic value |
| `offset`        | `8`                                            |
| `fill`          | Chart foreground                               |
| `fillOpacity`   | None                                           |
| `stroke`        | `var(--ts-chart-crosshair-label-halo, Canvas)` |
| `strokeOpacity` | None                                           |
| `strokeWidth`   | `3`                                            |
| `opacity`       | None                                           |
| `fontSize`      | `11`                                           |
| `fontWeight`    | None                                           |

Marker options control the resolved x/y intersection marker:

| Marker option   | Default                                         |
| --------------- | ----------------------------------------------- |
| `radius`        | `4`                                             |
| `fill`          | `var(--ts-chart-crosshair-marker-fill, Canvas)` |
| `fillOpacity`   | None                                            |
| `stroke`        | Focused point color, then guide or theme color  |
| `strokeOpacity` | None                                            |
| `strokeWidth`   | `2`                                             |
| `opacity`       | None                                            |

Pass semantic axis types to `crosshair` when TypeScript should check label
formatters independently from the surrounding definition:

```ts
crosshair<Date, number>({
  x: { label: { format: (value) => value.toISOString() } },
  y: { label: { format: (value) => value.toFixed(1) } },
})
```

Mark order controls placement. Put `crosshair(...)` before the first ordinary
mark for an underlay, or after it for an overlay. The default primary focus
ring still composes with the crosshair; set `focusRing: false` only when the
crosshair marker or other authored geometry deliberately replaces it.

The guide is `aria-hidden`. Pointer and keyboard users reach the same focus
state through the chart root, callbacks, and optional tooltip. `motion` on the
crosshair controls its keyed rules, bands, labels, and marker when the
definition is mounted with the optional motion renderer. Active guide
placements remain visible through keyed scene updates so restored focus
animates from the previous geometry.
