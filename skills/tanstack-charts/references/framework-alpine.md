# Alpine adapter

Alpine-specific setup and behavior.

<a id="source-charts-docs-framework-alpine-adapter-md"></a>

## Adapter

Source: `charts:docs/framework/alpine/adapter.md`.

```sh
pnpm add @tanstack/charts alpinejs
```

```ts
import Alpine from 'alpinejs'
import { charts } from '@tanstack/charts/alpine'

Alpine.plugin(charts)
Alpine.start()
```

```html
<div x-data="{ chartOptions }" x-chart="chartOptions"></div>
```

The directive element owns its contents. Alpine effects forward option changes
to the shared host and directive cleanup destroys the runtime.

### Lifecycle

`charts` registers `x-chart`. The directive evaluates its expression inside an
Alpine effect, creates one shared adapter controller, and forwards each
complete `ChartOptions` value. Cleanup destroys the controller, removes the
surface, and restores the element's prior inline layout and host class.

### Browser-only contract

The directive requires Alpine and normal DOM APIs. It does not prerender a
server shell or provide a hydration path. Start it in the browser after
registering `Alpine.plugin(charts)`.

### Presentation and rendering

The directive element itself becomes `.ts-chart-host`; normal HTML class and
style attributes own its presentation. The `className` chart option applies
to the rendered SVG surface. The package exposes the SVG directive only; use
`renderSvg` to replace SVG serialization without replacing the shared host.

Exports: `charts`, `ChartOptions`, `ChartTooltipBodyRenderContext`,
`AlpineChartTooltipBody`, `ChartDefinition`, and `ChartPoint`.

### Tooltip body composition

```ts
const chartOptions = {
  definition,
  ariaLabel: 'Revenue',
  renderTooltipBody({ points, defaultBody, pinned, dismiss }) {
    const body = document.createElement('div')
    body.append(defaultBody)
    body.append(`Focused rows: ${points.length}`)
    if (pinned) {
      const close = document.createElement('button')
      close.textContent = 'Close'
      close.addEventListener('click', dismiss)
      body.append(close)
    }
    return body
  },
}
```

The shared host owns focus, placement, portaling, inert transient state,
pinning, and dismissal. Alpine owns the returned DOM content.

See the [`x-chart` reference](./framework-alpine.md#source-charts-docs-framework-alpine-reference-chart-md) and
[Chart Definition API](./specifications-types.md#source-charts-docs-reference-chart-definitions-md).

<a id="source-charts-docs-framework-alpine-reference-chart-md"></a>

## Chart

Source: `charts:docs/framework/alpine/reference/chart.md`.

```ts
import { charts } from '@tanstack/charts/alpine'
```

Register `charts` with `Alpine.plugin`, then make `x-chart` evaluate to a
complete `ChartOptions` value. Replace the definition identity when captured
application values change.
The definition also owns `focus`, `focusRing`, `cursor`, `tooltip`, `svgAnimation`,
`keyboard`, `maxFocusDistance`, and `spatialIndex`.

### Directive options

| Option               | Type                                                                 | Default                                  | Meaning                                              |
| -------------------- | -------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------- |
| `definition`         | `ChartDefinition`                                                    | Required                                 | Framework-neutral chart definition                   |
| `ariaLabel`          | `string`                                                             | Required                                 | Accessible chart name                                |
| `ariaDescription`    | `string`                                                             | None                                     | Optional accessible description                      |
| `height`             | `number`                                                             | Existing height or `320` without a ratio | Fixed CSS and scene height                           |
| `aspectRatio`        | `number`                                                             | None                                     | Positive width-to-height ratio when height is absent |
| `width`              | `number`                                                             | Existing width or `100%`                 | Fixed CSS and scene width                            |
| `initialWidth`       | `number`                                                             | `640`                                    | Initial width before responsive measurement          |
| `tabIndex`           | `number`                                                             | `0`                                      | Surface tab index; `keyboard: false` forces `-1`     |
| `idPrefix`           | `string`                                                             | Generated                                | Prefix for renderer-owned document IDs               |
| `className`          | `string`                                                             | None                                     | Extra class on the rendered SVG surface              |
| `renderSvg`          | `ChartSvgRenderer<TDatum, TXValue, TYValue>`                         | `renderChartSvg`                         | Scene-to-SVG renderer                                |
| `measureText`        | `ChartTextMeasurer`                                                  | Host measurer                            | Guide text measurement                               |
| `onFocusChange`      | `(point: ChartPoint \| null) => void`                                | None                                     | Primary focus callback                               |
| `onFocusGroupChange` | `(points: readonly ChartPoint[]) => void`                            | None                                     | Grouped focus callback                               |
| `onSelect`           | `(point: ChartPoint \| null) => void`                                | None                                     | Pointer or keyboard activation callback              |
| `onRender`           | `(context: ChartRenderContext) => void`                              | None                                     | Live SVG, container, and scene after rendering       |
| `renderTooltipBody`  | `(context: ChartTooltipBodyRenderContext) => AlpineChartTooltipBody` | None                                     | Returns DOM content for the built-in tooltip body    |

The directive element becomes `.ts-chart-host`; use its normal HTML class and
style attributes for outer presentation. Directive cleanup removes the chart
surface and restores the element's prior inline layout and host class.

`renderTooltipBody` receives `points`, `content`, a `DocumentFragment`
`defaultBody`, `pinned`, and `dismiss`. Return a DOM node, text, number, nested
array, or `null`. Include `defaultBody` to retain the native title, rows,
formatting, and swatches. The directive replaces returned content when focus
changes and removes it when the tooltip closes.

### Exported types

`ChartOptions` includes the definition and host options.
`ChartTooltipBodyRenderContext` and `AlpineChartTooltipBody` describe custom
body composition. The package also re-exports `ChartDefinition` and
`ChartPoint`.

See the [Alpine adapter](./framework-alpine.md#source-charts-docs-framework-alpine-adapter-md) for lifecycle and browser requirements,
[Focus and interaction](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md) for
callback semantics, and [Rendering and export](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md)
for custom SVG renderers.
