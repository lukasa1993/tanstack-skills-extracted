# Svelte adapter

Svelte-specific setup and behavior.

<a id="source-charts-docs-framework-svelte-adapter-md"></a>

## Adapter

Source: `charts:docs/framework/svelte/adapter.md`.

```sh
pnpm add @tanstack/charts svelte
```

```svelte
<script lang="ts">
  import { defineChart } from '@tanstack/charts'
  import { tooltip } from '@tanstack/charts/tooltip'
  import { Chart } from '@tanstack/charts/svelte'

  const definition = $derived(
    defineChart(createRevenueChart(rows), { tooltip }),
  )
</script>

<Chart
  {definition}
  ariaLabel="Revenue by month"
  aspectRatio={16 / 9}
/>
```

The component uses Svelte 5 callback props and hydration-stable IDs. `class`
and the string `style` prop target the outer host.

### Lifecycle

The component creates one shared adapter controller, forwards reactive props
from an effect, mounts it in `onMount`, and destroys it through the mount
cleanup. Keep stable definitions at module scope. Derive the complete
definition when it captures reactive values.

### SSR and hydration

Svelte server rendering emits the complete `.ts-chart-host`,
`.ts-chart-surface`, and accessible SVG. `initialWidth` controls responsive
server geometry. `$props.id()` supplies the hydration-stable generated
resource prefix. Keep server and browser definitions, formatters, and
dimensions deterministic.

### Presentation and rendering

`class` and the string `style` prop apply to the outer host. `className`
applies to the rendered chart surface. Interaction hooks such as
`onFocusChange` are callback props, not dispatched Svelte events. The package
starts with SVG and can compose marks that use `canvasChartRenderer`. Use
`renderSvg` to replace SVG serialization without replacing the shared host.

Exports: `Chart`, `ChartCommonProps`, `ChartPresentationProps`, `ChartProps`,
`ChartTooltipBodySnippetContext`, `ChartDefinition`, and `ChartPoint`.

### Tooltip body composition

Pass a Svelte 5 `tooltipBody` snippet to render framework-owned content. Call
`defaultBody()` to retain native rows and swatches. The shared host owns focus,
placement, portaling, inert transient state, pinning, and dismissal; Svelte
owns the snippet lifecycle inside the body target.

See the [`Chart` reference](./framework-svelte.md#source-charts-docs-framework-svelte-reference-chart-md), [SSR and hydration](./production.md#source-charts-docs-guides-ssr-and-hydration-md),
and [Chart Definition API](./specifications.md#source-charts-docs-reference-chart-definitions-md).

<a id="source-charts-docs-framework-svelte-reference-chart-md"></a>

## Chart

Source: `charts:docs/framework/svelte/reference/chart.md`.

```svelte
<script lang="ts">
  import { Chart } from '@tanstack/charts/svelte'
</script>
```

The definition infers datum and coordinate types for every callback. Replace
its identity when captured application values change.
It also owns `focus`, `focusRing`, `cursor`, `tooltip`, `svgAnimation`, `keyboard`,
`maxFocusDistance`, and `spatialIndex`.

### Props

| Prop                 | Type                                         | Default               | Meaning                                                             |
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
| `tooltipBody`        | `Snippet<[ChartTooltipBodySnippetContext]>`  | None                  | Composes Svelte content inside the built-in tooltip body            |
| `class`              | `string`                                     | None                  | Extra class on the outer `.ts-chart-host`                           |
| `style`              | `string`                                     | None                  | Outer host declarations applied after adapter sizing                |
| `className`          | `string`                                     | None                  | Extra class on the rendered chart surface                           |

Interaction hooks are Svelte 5 callback props. They are not component events.

```svelte
{#snippet tooltipBody({ points, defaultBody, pinned, dismiss })}
  {@render defaultBody()}
  <SeriesDetail {points} />
  {#if pinned}<button onclick={dismiss}>Close</button>{/if}
{/snippet}

<Chart {definition} ariaLabel="Revenue" {tooltipBody} />
```

The snippet context also includes `content`. Ordering, anchoring, placement,
portaling, and pinning remain in the definition.

### Exported types

`ChartCommonProps` contains the common host and presentation props.
`ChartProps` adds the definition. `ChartPresentationProps` contains `class`
and the string `style`. `ChartTooltipBodySnippetContext` describes the snippet
argument. The package also re-exports `ChartDefinition` and `ChartPoint`.

See the [Svelte adapter](./framework-svelte.md#source-charts-docs-framework-svelte-adapter-md) for lifecycle and SSR behavior,
[Focus and interaction](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md) for
callback semantics, and [Rendering and export](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md)
for custom SVG renderers.
