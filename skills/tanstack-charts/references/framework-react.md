# React adapter

React-specific setup and behavior.

<a id="source-charts-docs-framework-react-adapter-md"></a>

## Adapter

Source: `charts:docs/framework/react/adapter.md`.

`@tanstack/charts/react` is a thin lifecycle and SSR adapter around
`@tanstack/charts`. Chart definitions, scale resolution, guide layout, scenes,
rendering, animation, and interaction remain in the framework-neutral core.

### Public exports

```ts
export { Chart } from '@tanstack/charts/react'

export type {
  ChartCommonProps,
  ChartProps,
  ChartDefinition,
  ChartPoint,
} from '@tanstack/charts/react'
```

Choose Canvas or an application-supplied renderer through an explicit
subpath:

```tsx
import { Chart as CanvasChart } from '@tanstack/charts/react/canvas'
import { Chart as RendererChart } from '@tanstack/charts/react/core'
```

`CanvasChart` selects the optional built-in renderer. `RendererChart` requires
a `renderer` prop. The default `Chart` remains SVG-based, so importing the
default adapter does not pull Canvas into its module graph. A definition can
still import `canvasChartRenderer` and assign it to selected marks, which makes
the default component render an ordered mixed surface.

The base entries render the built-in tooltip without the React tooltip-body
bridge. Import from the optional tooltip entry when passing
`renderTooltipBody`:

```tsx
import {
  Chart,
  CanvasChart,
  RendererChart,
  type ChartTooltipBodyRenderContext,
} from '@tanstack/charts/react/tooltip'
```

Existing `renderTooltipBody` users should move the default component import
from `@tanstack/charts/react` to `@tanstack/charts/react/tooltip`. For Canvas
or an application renderer, replace the aliased `Chart` import from `/canvas`
or `/core` with `CanvasChart` or `RendererChart` from `/tooltip`.

Use the re-exported definition and point types only when an application API
needs an explicit annotation. Ordinary component use is inferred.

### Render lifecycle

The adapter creates one `ChartRuntime` per mounted component and asks the
selected renderer for its initial markup during React render. After commit:

1. a layout effect mounts the shared DOM host into the existing chart surface
2. the same runtime is passed to the host
3. a second layout effect forwards the latest complete host options
4. later React commits call `host.update`; a new definition identity rebuilds
   the scene
5. effect cleanup destroys the host and runtime-owned browser behavior

The chart surface is memoized after its first render. Scene changes are painted
by the shared host rather than by rebuilding the surface through React.
Memoize definitions that capture component values with `useMemo`; module-scope
definitions need no component memoization.

React batching may omit intermediate application states. Every committed prop
set forwarded to the host remains declarative and complete.

### SSR and hydration

The default SVG entry emits:

- the outer `.ts-chart-host` div
- a `.ts-chart-surface` div
- the complete accessible shared SVG at `initialWidth`

The client renders the same initial structure, then the layout effect adopts
and reconciles that SVG. There is no placeholder-only server mode.

The Canvas entry emits the same outer structure with a named Canvas root and
five `aria-hidden` canvases: one hidden stable base bitmap and four live paint
layers. It does not paint pixels on the server. The client adopts those
elements, paints after mount, and attaches the same focus, keyboard, tooltip,
and selection host.

A default chart with selected Canvas marks emits one mixed root containing
ordered SVG markup and Canvas shells. SVG marks are visible in the server
response, Canvas pixels appear after mount, and the client adopts every child
surface.

Use deterministic data, scale domains, definitions, dimensions, and custom
renderers on server and client. The adapter generates a sanitized `idPrefix`
from `React.useId()` when one is not supplied, keeping document resources
stable through hydration.

`tabIndex` defaults to `0` on both server and client. `keyboard: false` forces
it to `-1`.

The default SVG renderer emits gradients and clipping on both server and
client. Custom serializers must preserve the same resources. See
[Rendering and export](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md).

### Sizing and layout

The adapter renders two nested containers:

```text
.ts-chart-host
  .ts-chart-surface
    svg.ts-chart | div.ts-chart-canvas | div.ts-chart-layers
```

The outer host has `position: relative`.

| Props                               | Outer host behavior             | Scene behavior                  |
| ----------------------------------- | ------------------------------- | ------------------------------- |
| no `width`, fixed `height`          | `width: 100%`; fixed height     | container width × fixed height  |
| fixed `width` and `height`          | fixed CSS width and height      | same fixed scene dimensions     |
| fixed `width` and `aspectRatio`     | fixed width and CSS ratio       | fixed width divided by ratio    |
| positive `aspectRatio`, no `height` | `width: 100%`; CSS aspect ratio | measured width divided by ratio |
| neither `height` nor `aspectRatio`  | `width: 100%`; `height: 320px`  | measured width × 320            |

`initialWidth` defaults to `640` and controls the initial/server scene when
`width` is absent. A fixed `height` takes precedence over `aspectRatio`.
Nonpositive and nonfinite ratios fall back to the default height.

The DOM host observes responsive width and measures the inherited container
font. Its exact fallback and relayout behavior is documented in
[DOM host](./rendering-composition-reference.md#source-charts-docs-reference-dom-host-md).

### `className` and `style`

React-specific presentation props apply to the outer `.ts-chart-host`:

```tsx
<Chart
  definition={definition}
  ariaLabel="Revenue"
  className="dashboard-chart"
  style={{ minHeight: 240, color: 'var(--foreground)' }}
/>
```

- `className` is appended after `ts-chart-host`.
- `style` is `React.CSSProperties`.
- custom style fields override the adapter's computed position, width, height,
  and aspect ratio because they are spread last.

Do not give `style.width` a value that conflicts with a fixed `width` prop. The
style controls the outer CSS box, while the prop continues to lock the scene
width.

Core renderer `className` options apply to a surface when calling it directly.
The React adapter's `className` intentionally owns the outer element instead.

### Tooltip body composition

The components from `@tanstack/charts/react/tooltip` accept
`renderTooltipBody`, which mounts React content into the built-in tooltip
surface. Its context provides `points`, `content`, `defaultBody`, `pinned`,
and `dismiss`. Composing `defaultBody` keeps the core title, rows, formatting,
and swatches; arbitrary React content can sit beside it.

The shared host owns a stable body mount target and releases it when the
tooltip is hidden, custom rendering is disabled, or the chart is destroyed.
React owns the rendered component lifecycle. A custom body is inert while
transient, so display-only content can remain visible but controls should
render only while `pinned` is true. Adding the `portal` extension to the
tooltip options promotes the whole surface above clipped ancestors without
changing this React API.

For pin-only detail, set `visibility: 'pinned'` in the definition. The shared
host then mounts the native surface and React body only after activation.

### Definition identity

Define a fixed chart outside component render:

```tsx
import { defineChart } from '@tanstack/charts'

const definition = defineChart({
  marks: [],
  scales: {
    x: null,
    y: null,
  },
})
```

For live state, memoize the complete definition against the values it captures.
Definition identity is the application update boundary; see
[Chart Definition API](./specifications.md#source-charts-docs-reference-chart-definitions-md).

### Callback freshness

Every committed prop set is forwarded to the host. Focus, grouped focus,
selection, and render callbacks therefore use the latest committed functions.
Callback types are inferred from the definition's marks.

### Core boundary

The adapter does not redefine:

- marks or chart specs
- scale selection and data-preparation ownership
- tooltip and focus semantics
- animation and reconciliation
- custom marks or renderers

Use [Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md) for the injected primitive
boundary and the [core reference](./specifications.md#source-charts-docs-reference-index-md) for those APIs.

<a id="source-charts-docs-framework-react-quick-start-md"></a>

## Quick Start

Source: `charts:docs/framework/react/quick-start.md`.

Install TanStack Charts and its React peers:

```sh
pnpm add @tanstack/charts react react-dom
pnpm add -D @types/react @types/react-dom
```

The shared [Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md) page explains the
compact scale families and when a chart needs D3 instead.

### Define a chart

Definitions are ordinary framework-independent TypeScript:

```tsx group=react-quick-start env=charts-react file=/src/App.tsx entry
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { barY, defineChart } from '@tanstack/charts'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/react'
import { alphabet } from './data'

const percent = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
})

const letterFrequencyChart = defineChart({
  marks: [
    barY(alphabet, {
      x: 'letter',
      y: 'frequency',
    }),
  ],
  scales: {
    x: {
      scale: () => scaleBand().padding(0.18),
    },
    y: {
      scale: scaleLinear,
      nice: true,
      grid: true,
      axis: {
        label: 'Frequency',
        ticks: { format: (value) => percent.format(value) },
      },
    },
  },

  tooltip,
})

export default function App() {
  return (
    <Chart
      definition={letterFrequencyChart}
      height={320}
      ariaLabel="English letter frequencies"
    />
  )
}
```

```ts group=react-quick-start file=/src/data.ts collapsed
export interface AlphabetRow {
  letter: string
  frequency: number
}

export const alphabet: readonly AlphabetRow[] = [
  { letter: 'E', frequency: 0.12702 },
  { letter: 'T', frequency: 0.09056 },
  { letter: 'A', frequency: 0.08167 },
  { letter: 'O', frequency: 0.07507 },
  { letter: 'I', frequency: 0.06966 },
]
```

The definition infers the original row and semantic x/y types. Do not add
component generics or cast the definition.

### Responsive sizing

Use a fixed height with responsive width:

```tsx
<Chart
  definition={letterFrequencyChart}
  height={320}
  ariaLabel="English letter frequencies"
/>
```

Or give the host a proportional box:

```tsx
<Chart
  definition={letterFrequencyChart}
  aspectRatio={16 / 9}
  initialWidth={720}
  ariaLabel="English letter frequencies"
/>
```

The outer element fills its available width when `width` is absent. The
adapter server-renders with `initialWidth`, then the shared DOM host measures
the actual container after hydration. See
[React adapter](./framework-react.md#source-charts-docs-framework-react-adapter-md).

### Memoize live definitions

When a chart captures component values, memoize the complete definition:

```tsx
import { useMemo } from 'react'

interface LetterFrequencyInput {
  rows: readonly AlphabetRow[]
  accent: string
}

export function LiveLetterFrequency({ rows, accent }: LetterFrequencyInput) {
  const definition = useMemo(() => {
    return defineChart({
      marks: [
        barY(rows, {
          x: 'letter',
          y: 'frequency',
          fill: accent,
        }),
      ],
      scales: {
        x: {
          scale: () => scaleBand().padding(0.18),
        },
        y: {
          scale: scaleLinear,
          nice: true,
        },
      },

      svgAnimation: true,
      tooltip,
    })
  }, [rows, accent])

  return (
    <Chart
      definition={definition}
      height={320}
      ariaLabel="Filtered English letter frequencies"
    />
  )
}
```

The dependency list owns application invalidation. The definition identity
tells the chart host when captured values changed. See
[Chart Definition API](./specifications.md#source-charts-docs-reference-chart-definitions-md).

### Interaction callbacks

Callback types flow from the marks:

```tsx
<Chart
  definition={letterFrequencyChart}
  height={320}
  ariaLabel="English letter frequencies"
  onFocusChange={(point) => {
    if (point) {
      console.log(point.datum.letter, point.yValue)
    }
  }}
  onSelect={(point) => {
    if (point) openLetter(point.datum.letter)
  }}
/>
```

The built-in tooltip is optional. Grouped focus, formatting, keyboard behavior,
and application-owned interaction are documented in
[Focus and interaction](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md).

### Render React tooltip content

Keep `Chart` from `@tanstack/charts/react` when the built-in tooltip is enough.
To pass `renderTooltipBody`, switch the component import to the optional React
tooltip entry:

```tsx
import { Chart } from '@tanstack/charts/react/tooltip'

;<Chart
  definition={letterFrequencyChart}
  height={320}
  ariaLabel="English letter frequencies"
  renderTooltipBody={({ defaultBody, pinned, dismiss }) => (
    <>
      {defaultBody}
      {pinned ? <button onClick={dismiss}>Close</button> : null}
    </>
  )}
/>
```

Existing `renderTooltipBody` users should migrate the component import from
`@tanstack/charts/react` to `@tanstack/charts/react/tooltip`. The definition
still uses `tooltip` from `@tanstack/charts/tooltip`.

Continue with the [React adapter](./framework-react.md#source-charts-docs-framework-react-adapter-md) for lifecycle and SSR, the
[`Chart` reference](./framework-react.md#source-charts-docs-framework-react-reference-chart-md) for every prop, or the
[core API reference](./specifications.md#source-charts-docs-reference-index-md) for definitions, marks, scales,
and rendering.

<a id="source-charts-docs-framework-react-reference-chart-md"></a>

## Chart

Source: `charts:docs/framework/react/reference/chart.md`.

```tsx
import { Chart } from '@tanstack/charts/react'
```

The supplied definition infers the datum, semantic x/y values, and callbacks.

```ts
function Chart<
  TDatum,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>(props: ChartProps<TDatum, TXValue, TYValue>): React.JSX.Element
```

### Renderer entry points

The default entry uses SVG. The optional entries keep other renderer code
explicit:

```tsx
import { Chart as CanvasChart } from '@tanstack/charts/react/canvas'
import { Chart as RendererChart } from '@tanstack/charts/react/core'

const canvasChart = (
  <CanvasChart definition={definition} ariaLabel="Weekly revenue" />
)
const rendererChart = (
  <RendererChart
    definition={definition}
    renderer={myRenderer}
    ariaLabel="Weekly revenue"
  />
)
```

The Canvas `Chart` accepts the same adapter props except `renderSvg`. Its
`onRender` receives `ChartRendererRenderContext`. The `/core`
`Chart` also requires `renderer: ChartRenderer`; use it for application-owned
surfaces. Both entries export `ChartCommonProps`, `ChartProps`,
`ChartDefinition`, and `ChartPoint`.

These base entries render the built-in tooltip without React tooltip-body
composition.

### Definition props

| Prop         | Default  | Meaning                                                                       |
| ------------ | -------- | ----------------------------------------------------------------------------- |
| `definition` | Required | Framework-independent definition; identity is the application update boundary |

See [Chart Definition API](./specifications.md#source-charts-docs-reference-chart-definitions-md).

The definition owns `focus`, `focusRing`, `cursor`, `maxFocusDistance`,
`spatialIndex`, `svgAnimation`, `keyboard`, and `tooltip`. Adapters do not override
them.

Add the `portal` extension to the definition's tooltip options to escape
clipping and local stacking contexts. The adapter still receives no portal
override.

### Accessibility and sizing

| Prop              | Type                  | Default                    | Meaning                                                |
| ----------------- | --------------------- | -------------------------- | ------------------------------------------------------ |
| `ariaLabel`       | `string`              | Required                   | Accessible surface name                                |
| `ariaDescription` | `string`              | None                       | Optional surface description                           |
| `tabIndex`        | `number`              | `0`                        | Surface tab index while keyboard behavior is enabled   |
| `height`          | `number`              | `320` without aspect ratio | Fixed CSS and scene height                             |
| `aspectRatio`     | `number`              | None                       | Positive width-to-height ratio when height is absent   |
| `width`           | `number`              | Responsive                 | Fixed CSS and scene width                              |
| `initialWidth`    | `number`              | `640`                      | Initial and server width before responsive measurement |
| `className`       | `string`              | None                       | Extra class on the outer `ts-chart-host` div           |
| `style`           | `React.CSSProperties` | None                       | Outer host styles, applied after adapter sizing styles |

See [Sizing and layout](./framework-react.md#source-charts-docs-framework-react-adapter-md).

### Callbacks

| Prop                 | Type                                      | Default | Meaning                                                              |
| -------------------- | ----------------------------------------- | ------- | -------------------------------------------------------------------- |
| `onFocusChange`      | `(point: ChartPoint \| null) => void`     | None    | Primary focus callback                                               |
| `onFocusGroupChange` | `(points: readonly ChartPoint[]) => void` | None    | Grouped focus callback                                               |
| `onSelect`           | `(point: ChartPoint \| null) => void`     | None    | Click and keyboard activation callback                               |
| `onRender`           | `(context: ChartRenderContext) => void`   | None    | Inner host, default SVG, complete surface, and scene after rendering |

See [Focus and interaction](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md) for
the behavior and complete callback values.

### Tooltip body

Import the drop-in component from the optional tooltip entry to use
`renderTooltipBody`:

```tsx
import {
  Chart,
  CanvasChart,
  RendererChart,
} from '@tanstack/charts/react/tooltip'
```

| Prop                | Type                                                    | Default | Meaning                                          |
| ------------------- | ------------------------------------------------------- | ------- | ------------------------------------------------ |
| `renderTooltipBody` | `(context: ChartTooltipBodyRenderContext) => ReactNode` | None    | Composes React content inside the native surface |

```ts
interface ChartTooltipBodyRenderContext<
  TDatum,
  TXValue extends ChartValue,
  TYValue extends ChartValue,
> {
  points: readonly ChartPoint<TDatum, TXValue, TYValue>[]
  content: ChartTooltipContent | string
  defaultBody: React.ReactNode
  pinned: boolean
  dismiss: () => void
}
```

`defaultBody` preserves native headings, rows, formatting, and swatches.
`points` follows the definition's focus and tooltip sort policy. Render
interactive content only when `pinned` is true; transient tooltips do not
accept pointer input. `dismiss()` clears the tooltip and restores chart focus
when focus was inside its body.

Set `tooltip.visibility: 'pinned'` on the definition when the React body itself
should mount only after activation. Returning `null` is not needed to suppress
a transient native shell.

Existing users of this prop should move `Chart` from
`@tanstack/charts/react` to `@tanstack/charts/react/tooltip`. Replace
`Chart as CanvasChart` from `/canvas` or `Chart as RendererChart` from `/core`
with the corresponding named component from `/tooltip`. Ordering, anchoring,
placement, portaling, and sticky behavior remain in the chart definition.

### Rendering and layout extensions

| Prop          | Type                                         | Default                     | Meaning                                      |
| ------------- | -------------------------------------------- | --------------------------- | -------------------------------------------- |
| `idPrefix`    | `string`                                     | Generated from `useId()`    | Prefix for renderer-owned document resources |
| `renderSvg`   | `ChartSvgRenderer<TDatum, TXValue, TYValue>` | `renderChartSvg`            | Scene-to-SVG renderer                        |
| `measureText` | `ChartTextMeasurer`                          | DOM inherited-font measurer | Guide glyph measurement                      |

See [Rendering and export](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md) and
[Scales, guides, and color](./runtime-scales-reference.md#source-charts-docs-reference-scales-guides-and-color-md).

### Exported prop types

The base entries export `ChartCommonProps` and `ChartProps`. The `/tooltip`
entry exports its extended `ChartCommonProps`, `ChartProps`,
`RendererChartCommonProps`, `RendererChartProps`, `CanvasChartCommonProps`,
`CanvasChartProps`, `ChartTooltipBodyRenderProps`, and
`ChartTooltipBodyRenderContext`.

```ts
interface ChartCommonProps<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> {
  // every common prop listed above
}

type ChartProps<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> = ChartCommonProps<TDatum, TXValue, TYValue> & {
  definition: ChartDefinition<TDatum, TXValue, TYValue>
}
```

The package also re-exports `ChartDefinition` and `ChartPoint`. Prefer
inference at the component call site. Memoize definitions that capture
component values; see [Types](./types.md#source-charts-docs-reference-types-md).
