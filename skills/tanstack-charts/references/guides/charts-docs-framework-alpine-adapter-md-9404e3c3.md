# Adapter

<a id="source-charts-docs-framework-alpine-adapter-md"></a>

Release-matched documentation · `@tanstack/charts@0.16.0`.

[Topic index](../framework-alpine.md) · [Source provenance](../SOURCES.md)

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

## Lifecycle

`charts` registers `x-chart`. The directive evaluates its expression inside an
Alpine effect, creates one shared adapter controller, and forwards each
complete `ChartOptions` value. Cleanup destroys the controller, removes the
surface, and restores the element's prior inline layout and host class.

## Browser-only contract

The directive requires Alpine and normal DOM APIs. It does not prerender a
server shell or provide a hydration path. Start it in the browser after
registering `Alpine.plugin(charts)`.

## Presentation and rendering

The directive element itself becomes `.ts-chart-host`; normal HTML class and
style attributes own its presentation. The `className` chart option applies
to the rendered chart surface. The directive starts with SVG and can compose
marks that use `canvasChartRenderer`. Use `renderSvg` to replace SVG
serialization without replacing the shared host.

Exports: `charts`, `ChartOptions`, `ChartTooltipBodyRenderContext`,
`AlpineChartTooltipBody`, `ChartDefinition`, and `ChartPoint`.

## Tooltip body composition

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

See the [`x-chart` reference](./charts-docs-framework-alpine-reference-chart-md-f52f25f9.md#source-charts-docs-framework-alpine-reference-chart-md) and
[Chart Definition API](./charts-docs-reference-chart-definitions-md-6855d09b.md#source-charts-docs-reference-chart-definitions-md).
