# Preact adapter

Preact-specific setup and behavior.

<a id="source-charts-docs-framework-preact-adapter-md"></a>

## Adapter

Source: `charts:docs/framework/preact/adapter.md`.

Install TanStack Charts and its Preact peer:

```sh
pnpm add @tanstack/charts preact
```

```tsx
import { defineChart } from '@tanstack/charts'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/preact'

export function RevenueChart() {
  const definition = useMemo(
    () => defineChart(createRevenueChart(rows), { tooltip }),
    [rows],
  )

  return (
    <Chart
      definition={definition}
      ariaLabel="Revenue by month"
      aspectRatio={16 / 9}
    />
  )
}
```

`className` and `style` target the outer host. Preact owns that host; the
shared runtime owns the SVG, measurement, interaction, and cleanup. The
adapter emits the initial SVG during SSR and adopts it after mount.

### Lifecycle

The component creates one shared adapter controller, prerenders its initial
SVG, mounts it from a layout effect, forwards complete prop updates, and
destroys it on unmount. Keep stable definitions at module scope. Memoize the
complete definition when it captures component values.

### SSR and hydration

Preact server rendering emits the complete `.ts-chart-host`,
`.ts-chart-surface`, and accessible SVG. `initialWidth` controls responsive
server geometry. The generated `useId()` prefix remains stable when the server
and browser render the same tree. Keep definitions, formatters, and
dimensions deterministic.

### Presentation and rendering

`className` and `style: JSX.CSSProperties` apply to the outer host and are not
forwarded to the chart surface. Custom styles are applied after adapter sizing.
The component starts with SVG and can compose marks that use
`canvasChartRenderer`. Use `renderSvg` to replace SVG serialization without
replacing the shared host.

Exports: `Chart`, `ChartCommonProps`, `ChartPresentationProps`, `ChartProps`,
`ChartTooltipBodyRenderContext`, `ChartDefinition`, and `ChartPoint`.

### Tooltip body composition

```tsx
<Chart
  definition={definition}
  ariaLabel="Revenue"
  renderTooltipBody={({ points, defaultBody, pinned, dismiss }) => (
    <div>
      {defaultBody}
      <SeriesDetail points={points} />
      {pinned ? <button onClick={dismiss}>Close</button> : null}
    </div>
  )}
/>
```

The shared host owns focus, placement, portaling, and dismissal. Preact owns
the returned component lifecycle inside the stable tooltip body target.

See the [`Chart` reference](./framework-preact.md#source-charts-docs-framework-preact-reference-chart-md), [SSR and hydration](./production.md#source-charts-docs-guides-ssr-and-hydration-md),
and [Chart Definition API](./specifications.md#source-charts-docs-reference-chart-definitions-md).

<a id="source-charts-docs-framework-preact-reference-chart-md"></a>

## Chart

Source: `charts:docs/framework/preact/reference/chart.md`.

```tsx
import { Chart } from '@tanstack/charts/preact'
```

The definition infers datum and coordinate types for every callback. Replace
its identity when captured application values change.
It also owns `focus`, `focusRing`, `cursor`, `tooltip`, `svgAnimation`, `keyboard`,
`maxFocusDistance`, and `spatialIndex`.

### Props

| Prop                 | Type                                                            | Default               | Meaning                                                             |
| -------------------- | --------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------- |
| `definition`         | `ChartDefinition`                                               | Required              | Framework-neutral chart definition                                  |
| `ariaLabel`          | `string`                                                        | Required              | Accessible chart name                                               |
| `ariaDescription`    | `string`                                                        | None                  | Optional accessible description                                     |
| `height`             | `number`                                                        | `320` without a ratio | Fixed CSS and scene height                                          |
| `aspectRatio`        | `number`                                                        | None                  | Positive width-to-height ratio when height is absent                |
| `width`              | `number`                                                        | Responsive            | Fixed CSS and scene width                                           |
| `initialWidth`       | `number`                                                        | `640`                 | Initial and server width before responsive measurement              |
| `tabIndex`           | `number`                                                        | `0`                   | Surface tab index; `keyboard: false` forces `-1`                    |
| `idPrefix`           | `string`                                                        | Generated             | Prefix for renderer-owned document IDs                              |
| `renderSvg`          | `ChartSvgRenderer<TDatum, TXValue, TYValue>`                    | `renderChartSvg`      | Scene-to-SVG renderer                                               |
| `measureText`        | `ChartTextMeasurer`                                             | Host measurer         | Guide text measurement                                              |
| `onFocusChange`      | `(point: ChartPoint \| null) => void`                           | None                  | Primary focus callback                                              |
| `onFocusGroupChange` | `(points: readonly ChartPoint[]) => void`                       | None                  | Grouped focus callback                                              |
| `onSelect`           | `(point: ChartPoint \| null) => void`                           | None                  | Pointer or keyboard activation callback                             |
| `onRender`           | `(context: ChartRenderContext) => void`                         | None                  | Default SVG, complete surface, container, and scene after rendering |
| `renderTooltipBody`  | `(context: ChartTooltipBodyRenderContext) => ComponentChildren` | None                  | Composes Preact content inside the built-in tooltip body            |
| `className`          | `string`                                                        | None                  | Extra class on the outer `.ts-chart-host`                           |
| `style`              | `JSX.CSSProperties`                                             | None                  | Outer host styles applied after adapter sizing                      |

Custom outer styles can override the adapter's computed layout. A fixed
`width` prop still controls scene measurement, so do not give `style.width` a
conflicting value.

`renderTooltipBody` receives `points`, `content`, `defaultBody`, `pinned`, and
`dismiss`. Include `defaultBody` to keep the native title, rows, formatting,
and swatches. Ordering, anchoring, placement, portaling, and pinning remain in
the definition.

### Exported types

`ChartCommonProps` contains the common host and presentation props.
`ChartProps` adds the definition. `ChartPresentationProps` contains
`className` and `style`. `ChartTooltipBodyRenderContext` describes composed
tooltip content. The package also re-exports `ChartDefinition` and `ChartPoint`.

See the [Preact adapter](./framework-preact.md#source-charts-docs-framework-preact-adapter-md) for lifecycle and SSR behavior,
[Focus and interaction](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md) for
callback semantics, and [Rendering and export](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md)
for custom SVG renderers.
