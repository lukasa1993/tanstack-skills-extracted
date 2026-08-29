# Solid adapter

Solid-specific setup and behavior.

<a id="source-charts-docs-framework-solid-adapter-md"></a>

## Adapter

Source: `charts:docs/framework/solid/adapter.md`.

```sh
pnpm add @tanstack/charts solid-js
```

```tsx
import { defineChart } from '@tanstack/charts'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/solid'

const definition = createMemo(() =>
  defineChart(createRevenueChart(rows()), { tooltip }),
)

;<Chart
  definition={definition()}
  ariaLabel="Revenue by month"
  aspectRatio={16 / 9}
/>
```

Reactive props update the shared host without replacing its SVG. `class` and
`style` target the outer host. The component renders the initial SVG during
Solid SSR.

### Lifecycle

The component creates one shared adapter controller, forwards reactive props
from `createEffect`, mounts it in `onMount`, and destroys it in `onCleanup`.
Keep stable definitions at module scope. Use `createMemo` for definitions that
capture reactive values.

### SSR and hydration

Solid SSR emits the complete `.ts-chart-host`, `.ts-chart-surface`, and
accessible SVG. `initialWidth` controls responsive server geometry.
`createUniqueId()` supplies the generated resource prefix. Keep server and
browser definitions, formatters, and dimensions deterministic.

### Presentation and rendering

`class` and `style: JSX.CSSProperties` apply to the outer host. `className`
applies to the rendered chart surface. Custom outer styles are spread after
adapter sizing. The component starts with SVG and can compose marks that use
`canvasChartRenderer`. Use `renderSvg` to replace SVG serialization without
replacing the shared host.

Exports: `Chart`, `ChartCommonProps`, `ChartPresentationProps`, `ChartProps`,
`ChartTooltipBodyRenderContext`, `ChartDefinition`, and `ChartPoint`.

### Tooltip body composition

```tsx
<Chart
  definition={definition()}
  ariaLabel="Revenue"
  renderTooltipBody={(tooltip) => (
    <div>
      {tooltip.defaultBody}
      <SeriesDetail points={tooltip.points} />
      <Show when={tooltip.pinned}>
        <button onClick={tooltip.dismiss}>Close</button>
      </Show>
    </div>
  )}
/>
```

Read the context through `tooltip` instead of destructuring it so Solid tracks
focused points and pinned state. The shared host owns focus, placement,
portaling, and dismissal; Solid owns the returned component lifecycle.

See the [`Chart` reference](./framework-solid.md#source-charts-docs-framework-solid-reference-chart-md), [SSR and hydration](./production.md#source-charts-docs-guides-ssr-and-hydration-md),
and [Chart Definition API](./specifications.md#source-charts-docs-reference-chart-definitions-md).

<a id="source-charts-docs-framework-solid-reference-chart-md"></a>

## Chart

Source: `charts:docs/framework/solid/reference/chart.md`.

```tsx
import { Chart } from '@tanstack/charts/solid'
```

The definition infers datum and coordinate types for every callback. Replace
its identity when captured application values change.
It also owns `focus`, `focusRing`, `cursor`, `tooltip`, `svgAnimation`, `keyboard`,
`maxFocusDistance`, and `spatialIndex`.

### Props

| Prop                 | Type                                                      | Default               | Meaning                                                             |
| -------------------- | --------------------------------------------------------- | --------------------- | ------------------------------------------------------------------- |
| `definition`         | `ChartDefinition`                                         | Required              | Framework-neutral chart definition                                  |
| `ariaLabel`          | `string`                                                  | Required              | Accessible chart name                                               |
| `ariaDescription`    | `string`                                                  | None                  | Optional accessible description                                     |
| `height`             | `number`                                                  | `320` without a ratio | Fixed CSS and scene height                                          |
| `aspectRatio`        | `number`                                                  | None                  | Positive width-to-height ratio when height is absent                |
| `width`              | `number`                                                  | Responsive            | Fixed CSS and scene width                                           |
| `initialWidth`       | `number`                                                  | `640`                 | Initial and server width before responsive measurement              |
| `tabIndex`           | `number`                                                  | `0`                   | Surface tab index; `keyboard: false` forces `-1`                    |
| `idPrefix`           | `string`                                                  | Generated             | Prefix for renderer-owned document IDs                              |
| `renderSvg`          | `ChartSvgRenderer<TDatum, TXValue, TYValue>`              | `renderChartSvg`      | Scene-to-SVG renderer                                               |
| `measureText`        | `ChartTextMeasurer`                                       | Host measurer         | Guide text measurement                                              |
| `onFocusChange`      | `(point: ChartPoint \| null) => void`                     | None                  | Primary focus callback                                              |
| `onFocusGroupChange` | `(points: readonly ChartPoint[]) => void`                 | None                  | Grouped focus callback                                              |
| `onSelect`           | `(point: ChartPoint \| null) => void`                     | None                  | Pointer or keyboard activation callback                             |
| `onRender`           | `(context: ChartRenderContext) => void`                   | None                  | Default SVG, complete surface, container, and scene after rendering |
| `renderTooltipBody`  | `(context: ChartTooltipBodyRenderContext) => JSX.Element` | None                  | Composes Solid content inside the built-in tooltip body             |
| `class`              | `string`                                                  | None                  | Extra class on the outer `.ts-chart-host`                           |
| `style`              | `JSX.CSSProperties`                                       | None                  | Outer host styles applied after adapter sizing                      |
| `className`          | `string`                                                  | None                  | Extra class on the rendered chart surface                           |

`renderTooltipBody` receives `points`, `content`, `defaultBody`, `pinned`, and
`dismiss`. Include `defaultBody` to keep the native title, rows, formatting,
and swatches. Ordering, anchoring, placement, portaling, and pinning remain in
the definition. Read fields from the callback context instead of destructuring
its parameter so Solid tracks focused-point and pinned-state changes.

### Exported types

`ChartCommonProps` contains the common host and presentation props.
`ChartProps` adds the definition. `ChartPresentationProps` contains `class`
and `style`. `ChartTooltipBodyRenderContext` describes composed tooltip
content. The package also re-exports `ChartDefinition` and `ChartPoint`.

See the [Solid adapter](./framework-solid.md#source-charts-docs-framework-solid-adapter-md) for lifecycle and SSR behavior,
[Focus and interaction](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md) for
callback semantics, and [Rendering and export](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md)
for custom SVG renderers.
