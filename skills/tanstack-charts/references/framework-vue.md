# Vue adapter

Vue-specific setup and behavior.

<a id="source-charts-docs-framework-vue-adapter-md"></a>

## Adapter

Source: `charts:docs/framework/vue/adapter.md`.

```sh
pnpm add @tanstack/charts vue
```

```vue
<script setup lang="ts">
import { defineChart } from '@tanstack/charts'
import { tooltip } from '@tanstack/charts/tooltip'
import { computed } from 'vue'
import { Chart } from '@tanstack/charts/vue'

const definition = computed(() =>
  defineChart(createRevenueChart(rows.value), { tooltip }),
)
</script>

<template>
  <Chart
    :definition="definition"
    aria-label="Revenue by month"
    :aspect-ratio="16 / 9"
    @focus-change="focused = $event"
  />
</template>
```

Vue prop updates call the shared host after each component update. `class` and
`style` target the outer host. Vue SSR renders the initial SVG.

### Lifecycle

The component prerenders through one shared adapter controller, mounts it in
`onMounted`, forwards the latest complete props in `onUpdated`, and destroys it
in `onBeforeUnmount`. Keep stable definitions at module scope. Use `computed`
for definitions that capture reactive values.

### SSR and hydration

Vue SSR emits the complete `.ts-chart-host`, `.ts-chart-surface`, and
accessible SVG. `initialWidth` controls responsive server geometry. Vue's
`useId()` provides a stable generated resource prefix when server and browser
render the same tree. Keep definitions, formatters, and dimensions
deterministic.

### Presentation and rendering

`class` and `style: StyleValue` apply to the outer host. `className` applies to
the rendered chart surface. The component disables general attribute
inheritance; unrelated attributes are not forwarded. It starts with SVG and
can compose marks that use `canvasChartRenderer`. Use `renderSvg` to replace
SVG serialization without replacing the shared host.

Exports: `Chart`, `ChartCommonProps`, `ChartPresentationProps`, `ChartProps`,
`ChartTooltipBodySlotContext`, `ChartDefinition`, and `ChartPoint`.

### Tooltip body composition

Use the `#tooltipBody` scoped slot for Vue-owned content. Render
`<component :is="defaultBody" />` to retain native rows and swatches. The
shared host owns focus, placement, portaling, inert transient state, pinning,
and dismissal; Vue owns the slot lifecycle inside the body target.

See the [`Chart` reference](./framework-vue.md#source-charts-docs-framework-vue-reference-chart-md), [SSR and hydration](./production.md#source-charts-docs-guides-ssr-and-hydration-md),
and [Chart Definition API](./specifications.md#source-charts-docs-reference-chart-definitions-md).

<a id="source-charts-docs-framework-vue-reference-chart-md"></a>

## Chart

Source: `charts:docs/framework/vue/reference/chart.md`.

```ts
import { Chart } from '@tanstack/charts/vue'
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
| `class`              | `string`                                     | None                  | Extra class on the outer `.ts-chart-host`                           |
| `style`              | `StyleValue`                                 | None                  | Outer host style                                                    |
| `className`          | `string`                                     | None                  | Extra class on the rendered chart surface                           |

In templates, camel-cased props may use kebab case: `aria-label`,
`initial-width`, and `on-focus-change` map to `ariaLabel`, `initialWidth`, and
`onFocusChange`. Listener syntax such as `@focus-change="handleFocus"` supplies
the callback prop. The component does not forward unrelated attributes.

### Tooltip body slot

The optional `#tooltipBody` scoped slot receives `points`, `content`,
`defaultBody`, `pinned`, and `dismiss`:

```vue
<Chart :definition="definition" aria-label="Revenue">
  <template #tooltipBody="{ points, defaultBody, pinned, dismiss }">
    <component :is="defaultBody" />
    <SeriesDetail :points="points" />
    <button v-if="pinned" type="button" @click="dismiss">Close</button>
  </template>
</Chart>
```

`defaultBody` is a zero-argument Vue functional component containing the
native title, rows, formatting, and swatches. Ordering, anchoring, placement,
portaling, and pinning remain in the definition.

### Exported types

`ChartCommonProps` contains the common host and presentation props.
`ChartProps` adds the definition. `ChartPresentationProps` contains `class`
and `style`. `ChartTooltipBodySlotContext` describes the scoped slot. The
package also re-exports `ChartDefinition` and `ChartPoint`.

See the [Vue adapter](./framework-vue.md#source-charts-docs-framework-vue-adapter-md) for lifecycle and SSR behavior,
[Focus and interaction](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md) for
callback semantics, and [Rendering and export](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md)
for custom SVG renderers.
