# Adapter

<a id="source-charts-docs-framework-vue-adapter-md"></a>

Release-matched documentation · `@tanstack/charts@0.16.2`.

[Topic index](../framework-vue.md) · [Source provenance](../SOURCES.md)

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

## Lifecycle

The component prerenders through one shared adapter controller, mounts it in
`onMounted`, forwards the latest complete props in `onUpdated`, and destroys it
in `onBeforeUnmount`. Keep stable definitions at module scope. Use `computed`
for definitions that capture reactive values.

## SSR and hydration

Vue SSR emits the complete `.ts-chart-host`, `.ts-chart-surface`, and
accessible SVG. `initialWidth` controls responsive server geometry. Vue's
`useId()` provides a stable generated resource prefix when server and browser
render the same tree. Keep definitions, formatters, and dimensions
deterministic.

## Presentation and rendering

`class` and `style: StyleValue` apply to the outer host. `className` applies to
the rendered chart surface. The component disables general attribute
inheritance; unrelated attributes are not forwarded. It starts with SVG and
can compose marks that use `canvasChartRenderer`. Use `renderSvg` to replace
SVG serialization without replacing the shared host.

Exports: `Chart`, `ChartCommonProps`, `ChartPresentationProps`, `ChartProps`,
`ChartTooltipBodySlotContext`, `ChartDefinition`, and `ChartPoint`.

## Tooltip body composition

Use the `#tooltipBody` scoped slot for Vue-owned content. Render
`<component :is="defaultBody" />` to retain native rows and swatches. The
shared host owns focus, placement, portaling, inert transient state, pinning,
and dismissal; Vue owns the slot lifecycle inside the body target.

See the [`Chart` reference](./charts-docs-framework-vue-reference-chart-md-c55f0cc9.md#source-charts-docs-framework-vue-reference-chart-md), [SSR and hydration](./charts-docs-guides-ssr-and-hydration-md-ff83bc62.md#source-charts-docs-guides-ssr-and-hydration-md),
and [Chart Definition API](./charts-docs-reference-chart-definitions-md-6855d09b.md#source-charts-docs-reference-chart-definitions-md).
