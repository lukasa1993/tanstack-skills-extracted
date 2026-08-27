# Lit adapter

Lit-specific setup and behavior.

<a id="source-charts-docs-framework-lit-adapter-md"></a>

## Adapter

Source: `charts:docs/framework/lit/adapter.md`.

```sh
pnpm add @tanstack/charts lit
```

Register the element once:

```ts
import { defineChartElement } from '@tanstack/charts/lit'

defineChartElement()
```

Pass chart options as a property:

```ts
import { defineChart } from '@tanstack/charts'
import { tooltip } from '@tanstack/charts/tooltip'

html`<tanstack-chart
  .options=${{
    definition: defineChart(createRevenueChart(rows), { tooltip }),
    ariaLabel: 'Revenue by month',
  }}
></tanstack-chart>`
```

The element uses light DOM so it inherits application fonts and chart theme
variables. Use a custom tag name with `defineChartElement('revenue-chart')`.

### Lifecycle

The element prerenders through one shared adapter controller, mounts after its
first update, forwards replacement `options` values, and destroys the mounted
host when disconnected. Reconnecting the same element mounts the controller
again. Assign options as a property; chart configuration is not reflected to
HTML attributes.

### Browser and server status

The verified package contract covers browser registration, update,
disconnect, and reconnect behavior. Lit SSR and hydration are not yet part of
the adapter's tested public contract. Call `defineChartElement` only where
`customElements` is available.

### Presentation and rendering

`options.class` and the string `options.style` apply to the inner
`.ts-chart-host`; `options.className` applies to the rendered chart surface.
The custom element starts with SVG and can compose marks that use
`canvasChartRenderer`. Use `renderSvg` to replace SVG serialization without
replacing the shared host.

Exports: `Chart`, `defineChartElement`, `ChartCommonProps`,
`ChartPresentationProps`, `ChartProps`, `ChartTooltipBodyRenderContext`,
`ChartDefinition`, and `ChartPoint`.

### Tooltip body composition

Set `options.renderTooltipBody` to return any Lit-renderable value. Include its
`defaultBody` `TemplateResult` to retain native rows and swatches. The shared
host owns focus, placement, portaling, inert transient state, pinning, and
dismissal; Lit owns the rendered template lifecycle.

See the [`Chart` reference](./framework-lit.md#source-charts-docs-framework-lit-reference-chart-md) and
[Chart Definition API](./specifications-types.md#source-charts-docs-reference-chart-definitions-md).

<a id="source-charts-docs-framework-lit-reference-chart-md"></a>

## Chart

Source: `charts:docs/framework/lit/reference/chart.md`.

```ts
import { Chart, defineChartElement } from '@tanstack/charts/lit'
```

`defineChartElement()` registers `Chart` as `tanstack-chart`. Pass the complete
chart value through the element's `options` property, not HTML attributes.
Replace the definition identity when captured application values change.
The definition also owns `focus`, `focusRing`, `cursor`, `tooltip`, `svgAnimation`,
`keyboard`, `maxFocusDistance`, and `spatialIndex`.

### `options`

| Option               | Type                                                  | Default               | Meaning                                                             |
| -------------------- | ----------------------------------------------------- | --------------------- | ------------------------------------------------------------------- |
| `definition`         | `ChartDefinition`                                     | Required              | Framework-neutral chart definition                                  |
| `ariaLabel`          | `string`                                              | Required              | Accessible chart name                                               |
| `ariaDescription`    | `string`                                              | None                  | Optional accessible description                                     |
| `height`             | `number`                                              | `320` without a ratio | Fixed CSS and scene height                                          |
| `aspectRatio`        | `number`                                              | None                  | Positive width-to-height ratio when height is absent                |
| `width`              | `number`                                              | Responsive            | Fixed CSS and scene width                                           |
| `initialWidth`       | `number`                                              | `640`                 | Initial width before responsive measurement                         |
| `tabIndex`           | `number`                                              | `0`                   | Surface tab index; `keyboard: false` forces `-1`                    |
| `idPrefix`           | `string`                                              | Generated             | Prefix for renderer-owned document IDs                              |
| `renderSvg`          | `ChartSvgRenderer<TDatum, TXValue, TYValue>`          | `renderChartSvg`      | Scene-to-SVG renderer                                               |
| `measureText`        | `ChartTextMeasurer`                                   | Host measurer         | Guide text measurement                                              |
| `onFocusChange`      | `(point: ChartPoint \| null) => void`                 | None                  | Primary focus callback                                              |
| `onFocusGroupChange` | `(points: readonly ChartPoint[]) => void`             | None                  | Grouped focus callback                                              |
| `onSelect`           | `(point: ChartPoint \| null) => void`                 | None                  | Pointer or keyboard activation callback                             |
| `onRender`           | `(context: ChartRenderContext) => void`               | None                  | Default SVG, complete surface, container, and scene after rendering |
| `renderTooltipBody`  | `(context: ChartTooltipBodyRenderContext) => unknown` | None                  | Composes Lit content inside the built-in tooltip body               |
| `class`              | `string`                                              | None                  | Extra class on the inner `.ts-chart-host`                           |
| `style`              | `string`                                              | None                  | Inner host declarations applied after adapter sizing                |
| `className`          | `string`                                              | None                  | Extra class on the rendered chart surface                           |

```ts
const options = {
  definition,
  ariaLabel: 'Revenue',
  renderTooltipBody: ({ points, defaultBody, pinned, dismiss }) => html`
    ${defaultBody}
    <series-detail .points=${points}></series-detail>
    ${pinned ? html`<button @click=${dismiss}>Close</button>` : nothing}
  `,
}
```

The context also exposes resolved `content`. `defaultBody` is a
`TemplateResult`. Ordering, anchoring, placement, portaling, and pinning remain
in the definition.

### Registration and exported types

`defineChartElement(tagName = 'tanstack-chart')` is idempotent for an already
registered tag. Importing `Chart` directly supports explicit custom-element
registration.

`ChartCommonProps` contains common host and presentation props. `ChartProps`
adds the definition. `ChartPresentationProps` contains `class` and `style`.
`ChartTooltipBodyRenderContext` describes composed tooltip content. The
package also re-exports `ChartDefinition` and `ChartPoint`.

See the [Lit adapter](./framework-lit.md#source-charts-docs-framework-lit-adapter-md) for lifecycle and browser behavior,
[Focus and interaction](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md) for
callback semantics, and [Rendering and export](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md)
for custom SVG renderers.
