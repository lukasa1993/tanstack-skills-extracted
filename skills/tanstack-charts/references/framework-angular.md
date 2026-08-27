# Angular adapter

Angular-specific setup and behavior.

<a id="source-charts-docs-framework-angular-adapter-md"></a>

## Adapter

Source: `charts:docs/framework/angular/adapter.md`.

```sh
pnpm add @tanstack/charts @angular/common @angular/core @angular/platform-browser
```

```ts
import { Component } from '@angular/core'
import { Chart } from '@tanstack/charts/angular'
import { defineChart } from '@tanstack/charts'
import { tooltip } from '@tanstack/charts/tooltip'

@Component({
  imports: [Chart],
  template: `<tanstack-chart [options]="chartOptions" />`,
})
export class RevenueChart {
  chartOptions = {
    definition: defineChart(createRevenueChart(rows), { tooltip }),
    ariaLabel: 'Revenue by month',
    aspectRatio: 16 / 9,
  }
}
```

The single `options` input works with immutable values and signals. The
standalone component ships as a partial-compiled Angular package.

### Lifecycle

`ngOnChanges` creates or updates one shared adapter controller.
Angular's `afterNextRender` mounts it into the prerendered surface in the
browser, and `ngOnDestroy` cleans it up. Replace the complete `options` value
when chart state changes; mutating the existing object does not produce an
`OnPush` input change. Callbacks such as `onFocusChange` are functions inside
`options`, not Angular outputs.

### Browser and server status

The verified package contract covers complete SVG server rendering through
Angular's `renderApplication`, browser mount, immutable updates, and teardown.
Angular hydration is not yet part of the adapter's tested public contract.

### Presentation and rendering

`options.class` and the string `options.style` apply to the inner
`.ts-chart-host`; `options.className` applies to the rendered chart surface.
The component starts with SVG and can compose marks that use
`canvasChartRenderer`. Use `renderSvg` to replace SVG serialization without
replacing the shared host.

Exports: `Chart`, `ChartCommonOptions`, `ChartOptions`,
`ChartPresentationOptions`, `ChartTooltipBodyDirective`,
`ChartTooltipBodyRenderContext`, `ChartTooltipBodyTemplateContext`,
`ChartDefinition`, and `ChartPoint`.

### Tooltip body composition

Project an `ng-template` with
`[tanstackChartTooltipBody]="chartOptions.definition"` for Angular-owned
content. The definition binding is the generic type witness for strict template
checking; it does not configure behavior a second time. Render
`tooltip.defaultBody` through `NgTemplateOutlet` to retain native rows and
swatches. The shared host owns focus, placement, portaling, inert transient
state, pinning, and dismissal; Angular owns the embedded-view lifecycle.

See the [`Chart` reference](./framework-angular.md#source-charts-docs-framework-angular-reference-chart-md) and
[Chart Definition API](./specifications-types.md#source-charts-docs-reference-chart-definitions-md).

<a id="source-charts-docs-framework-angular-reference-chart-md"></a>

## Chart

Source: `charts:docs/framework/angular/reference/chart.md`.

```ts
import { Chart } from '@tanstack/charts/angular'
```

`Chart` is a standalone component with selector `tanstack-chart`. Its required
`options` input accepts a chart definition. Replace the definition identity
when captured application values change.
The definition also owns `focus`, `focusRing`, `cursor`, `tooltip`, `svgAnimation`,
`keyboard`, `maxFocusDistance`, and `spatialIndex`.

### `options`

| Option               | Type                                         | Default               | Meaning                                                             |
| -------------------- | -------------------------------------------- | --------------------- | ------------------------------------------------------------------- |
| `definition`         | `ChartDefinition`                            | Required              | Framework-neutral chart definition                                  |
| `ariaLabel`          | `string`                                     | Required              | Accessible chart name                                               |
| `ariaDescription`    | `string`                                     | None                  | Optional accessible description                                     |
| `height`             | `number`                                     | `320` without a ratio | Fixed CSS and scene height                                          |
| `aspectRatio`        | `number`                                     | None                  | Positive width-to-height ratio when height is absent                |
| `width`              | `number`                                     | Responsive            | Fixed CSS and scene width                                           |
| `initialWidth`       | `number`                                     | `640`                 | Initial and server width before responsive measurement              |
| `tabIndex`           | `number`                                     | `0`                   | Surface tab index; `keyboard: false` forces `-1`                    |
| `idPrefix`           | `string`                                     | Generated             | Prefix for renderer-owned document IDs                              |
| `renderSvg`          | `ChartSvgRenderer<TDatum, TXValue, TYValue>` | `renderChartSvg`      | Scene-to-SVG renderer                                               |
| `measureText`        | `ChartTextMeasurer`                          | Host measurer         | Guide text measurement                                              |
| `onFocusChange`      | `(point: ChartPoint \| null) => void`        | None                  | Primary focus callback                                              |
| `onFocusGroupChange` | `(points: readonly ChartPoint[]) => void`    | None                  | Grouped focus callback                                              |
| `onSelect`           | `(point: ChartPoint \| null) => void`        | None                  | Pointer or keyboard activation callback                             |
| `onRender`           | `(context: ChartRenderContext) => void`      | None                  | Default SVG, complete surface, container, and scene after rendering |
| `class`              | `string`                                     | None                  | Extra class on the inner `.ts-chart-host`                           |
| `style`              | `string`                                     | None                  | Inner host declarations applied after adapter sizing                |
| `className`          | `string`                                     | None                  | Extra class on the rendered chart surface                           |

Callbacks are functions inside `options`, not Angular outputs. Replace the
complete `options` value when chart state changes so `OnPush` change detection
delivers an `ngOnChanges` update.

### Tooltip body template

Project a typed tooltip template into the chart:

```html
<tanstack-chart [options]="chartOptions">
  <ng-template [tanstackChartTooltipBody]="chartOptions.definition" let-tooltip>
    <ng-container [ngTemplateOutlet]="tooltip.defaultBody" />
    <series-detail [points]="tooltip.points" />
    @if (tooltip.pinned) {
    <button type="button" (click)="tooltip.dismiss()">Close</button>
    }
  </ng-template>
</tanstack-chart>
```

Import `ChartTooltipBodyDirective` and Angular's `NgTemplateOutlet` beside
`Chart`. The context exposes `points`, `content`, `defaultBody`, `pinned`, and
`dismiss`; named template bindings are also available. Binding the same
definition gives Angular's strict template checker the datum and x/y value
types. Ordering, anchoring, placement, portaling, and pinning remain in the
definition.

### Exported types

`ChartCommonOptions` contains common host and presentation options.
`ChartOptions` adds the definition. `ChartPresentationOptions` contains
`class` and `style`. The package exports `ChartTooltipBodyDirective`,
`ChartTooltipBodyRenderContext`, and `ChartTooltipBodyTemplateContext`. It also
re-exports `ChartDefinition` and `ChartPoint`.

See the [Angular adapter](./framework-angular.md#source-charts-docs-framework-angular-adapter-md) for lifecycle and SSR behavior,
[Focus and interaction](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md) for
callback semantics, and [Rendering and export](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md)
for custom SVG renderers.
