# Octane adapter

Octane-specific setup and behavior.

<a id="source-charts-docs-framework-octane-adapter-md"></a>

## Adapter

Source: `charts:docs/framework/octane/adapter.md`.

`@tanstack/charts/octane` is the native TSRX lifecycle and SSR adapter around
`@tanstack/charts`. Definitions, scenes, responsive layout, rendering,
interaction, and animation remain framework-neutral.

### Public exports

```ts
export { Chart } from '@tanstack/charts/octane'

export type {
  ChartCommonProps,
  ChartProps,
  ChartTooltipBodyRenderContext,
  ChartDefinition,
  ChartPoint,
} from '@tanstack/charts/octane'
```

Choose Canvas or an application-supplied renderer through an explicit
subpath:

```tsx
import { Chart as CanvasChart } from '@tanstack/charts/octane/canvas'
import { Chart as RendererChart } from '@tanstack/charts/octane/core'
```

The default `Chart` remains SVG-based. `CanvasChart` selects the optional
built-in renderer; `RendererChart` requires a `renderer` prop. A definition
can still import `canvasChartRenderer` and assign it to selected marks, which
makes the default component render an ordered mixed surface.

The package export map supplies a browser build for browser bundlers and a
separate Node build for the `node` condition.

### Render lifecycle

The adapter creates one `ChartRuntime` for each component instance and asks the
selected renderer for initial markup in TSRX. After layout:

1. `useLayoutEffect` mounts the shared DOM host into the existing chart surface
2. the initial runtime is passed through
3. a later layout effect forwards memoized host options
4. subsequent Octane updates call `host.update`; a new definition identity
   rebuilds the scene
5. cleanup destroys the host and all browser-owned behavior

The inner chart surface is memoized after its first output. The shared host
paints later scenes directly into the selected surface. Memoize definitions
that capture component values with `useMemo`; module-scope definitions need no
component memoization.

### SSR and hydration

The default Node target renders the complete `.ts-chart-host`,
`.ts-chart-surface`, and accessible SVG at `initialWidth`. The browser target
hydrates the same structure before mounting the host.

The Canvas entry renders a deterministic named root and five `aria-hidden`
canvases on the server: one hidden stable base bitmap and four live paint
layers. It paints no server pixels. The browser adopts the elements, paints
after mount, and attaches the same focus, keyboard, tooltip, and selection
host.

A default chart with selected Canvas marks emits one mixed root containing
ordered SVG markup and Canvas shells. SVG marks are visible in the server
response, Canvas pixels appear after mount, and the browser adopts every child
surface.

Keep data, definitions, scale domains, custom renderers, and dimensions
deterministic between server and browser. The adapter generates a sanitized
resource prefix from Octane's `useId()` when `idPrefix` is absent.

`tabIndex` defaults to `0` on both targets. `keyboard: false` forces it to
`-1`.

The default SVG renderer emits gradients and clipping on both targets. Custom
serializers must preserve the same resources; see
[Rendering and export](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md).

### Sizing and layout

The rendered structure is:

```text
.ts-chart-host
  .ts-chart-surface
    svg.ts-chart | div.ts-chart-canvas | div.ts-chart-layers
```

The outer host uses `position: relative`.

| Props                               | Outer host behavior             | Scene behavior                  |
| ----------------------------------- | ------------------------------- | ------------------------------- |
| no `width`, fixed `height`          | `width: 100%`; fixed height     | container width × fixed height  |
| fixed `width` and `height`          | fixed CSS dimensions            | same fixed scene dimensions     |
| fixed `width` and `aspectRatio`     | fixed width and CSS ratio       | fixed width divided by ratio    |
| positive `aspectRatio`, no `height` | `width: 100%`; CSS aspect ratio | measured width divided by ratio |
| neither `height` nor `aspectRatio`  | `width: 100%`; `height: 320px`  | measured width × 320            |

`initialWidth` defaults to `640`. A fixed `height` takes precedence over
`aspectRatio`; nonpositive and nonfinite ratios fall back to the default
height. Responsive measurement and inherited font relayout are shared with the vanilla
[DOM host](./rendering-composition-reference.md#source-charts-docs-reference-dom-host-md).

### `class` and `style`

Octane-specific presentation props apply to the outer host:

```tsx
<Chart
  definition={definition}
  ariaLabel="Revenue"
  class="dashboard-chart"
  style={{
    minHeight: 240,
    color: 'var(--foreground)',
  }}
/>
```

- `class` is appended after `ts-chart-host`.
- `style` is `Record<string, string | number | undefined>`.
- styles are spread after adapter sizing, so they can override position,
  width, height, or aspect ratio.

Do not conflict a fixed `width` prop with `style.width`. The style changes the
outer CSS box while the prop continues to lock scene measurement.

The core renderer's `className` option applies to a directly rendered surface,
not the Octane outer host.

### Definition and option identity

Keep fixed definitions outside component execution. Keep one dynamic
definition stable until a captured application value changes.

The adapter memoizes host options from semantic props. Callback functions are
held in refs, so changing only a callback does not rebuild the option object
and the live wrapper still calls the latest function.

Definition identity is core behavior; see
[Chart Definition API](./specifications-types.md#source-charts-docs-reference-chart-definitions-md).

### Tooltip body composition

`renderTooltipBody` portals Octane output into the core-owned tooltip body. Its
context contains `points`, `content`, `defaultBody`, `pinned`, and `dismiss`.
Include `defaultBody` to retain native rows and swatches. The shared host owns
focus, placement, portaling, inert transient state, pinning, and dismissal;
Octane owns the returned component lifecycle.

### Core boundary

The adapter does not redefine chart grammar or data algorithms. Read
[Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md) for injected primitives and
the [core API reference](./specifications-types.md#source-charts-docs-reference-index-md) for marks, interaction,
renderers, and extension contracts.

<a id="source-charts-docs-framework-octane-quick-start-md"></a>

## Quick Start

Source: `charts:docs/framework/octane/quick-start.md`.

Install TanStack Charts and its Octane peer:

```sh
pnpm add @tanstack/charts octane
```

The shared [Scales](./chart-grammar.md#source-charts-docs-concepts-scales-and-d3-md) page explains the
compact scale families and when a chart needs D3 instead.

### Define and render a chart

Definitions are framework-independent and can be shared with any adapter:

```tsx group=octane-quick-start env=charts-octane file=/src/App.tsrx entry
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { barY, defineChart } from '@tanstack/charts'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/octane'
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

```ts group=octane-quick-start file=/src/data.ts collapsed
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

The definition infers the row, scale, and callback types. Normal TSRX authoring
does not need `Chart` generics or casts.

### Responsive sizing

Use `height` for a fixed-height responsive chart:

```tsx
<Chart
  definition={letterFrequencyChart}
  height={320}
  ariaLabel="English letter frequencies"
/>
```

Use `aspectRatio` when height should follow width:

```tsx
<Chart
  definition={letterFrequencyChart}
  aspectRatio={16 / 9}
  initialWidth={720}
  ariaLabel="English letter frequencies"
/>
```

The server scene uses `initialWidth`, then the shared host measures the actual
container after hydration. See
[Octane adapter](./framework-octane.md#source-charts-docs-framework-octane-adapter-md).

### Memoize live definitions

```tsx
import { useMemo } from 'octane'

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
  })

  return (
    <Chart
      definition={definition}
      height={320}
      ariaLabel="Filtered English letter frequencies"
    />
  )
}
```

Octane tracks the values read by `useMemo`. Definition identity tells the chart
host when captured values changed. See
[Chart Definition API](./specifications-types.md#source-charts-docs-reference-chart-definitions-md).

### Interaction callbacks

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

Grouped focus, tooltip formatting, keyboard behavior, and application-owned
interaction are documented in
[Focus and interaction](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md).

Continue with the [Octane adapter](./framework-octane.md#source-charts-docs-framework-octane-adapter-md) for lifecycle and SSR, the
[`Chart` reference](./framework-octane.md#source-charts-docs-framework-octane-reference-chart-md) for every prop, or the
[core API reference](./specifications-types.md#source-charts-docs-reference-index-md).

<a id="source-charts-docs-framework-octane-reference-chart-md"></a>

## Chart

Source: `charts:docs/framework/octane/reference/chart.md`.

```tsx
import { Chart } from '@tanstack/charts/octane'
```

The supplied definition infers the datum, semantic x/y values, and callbacks:

```ts
function Chart<
  TDatum,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>(props: ChartProps<TDatum, TXValue, TYValue>): unknown
```

The definition owns `focus`, `focusRing`, `cursor`, `tooltip`, `svgAnimation`,
`keyboard`, `maxFocusDistance`, and `spatialIndex`.

### Renderer entry points

The default entry uses SVG. The optional entries keep other renderer code
explicit:

```tsx
import { Chart as CanvasChart } from '@tanstack/charts/octane/canvas'
import { Chart as RendererChart } from '@tanstack/charts/octane/core'

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

The Canvas `Chart` accepts the common interaction and sizing props except
`renderSvg`. Its `onRender` receives `ChartRendererRenderContext`. The `/core`
`Chart` also requires `renderer: ChartRenderer`. Both entries export
`ChartCommonProps`, `ChartProps`, `ChartTooltipBodyRenderContext`,
`ChartDefinition`, and `ChartPoint`.

### Definition props

| Prop         | Default  | Meaning                                                                       |
| ------------ | -------- | ----------------------------------------------------------------------------- |
| `definition` | Required | Framework-independent definition; identity is the application update boundary |

See [Chart Definition API](./specifications-types.md#source-charts-docs-reference-chart-definitions-md).

### Accessibility and sizing

| Prop              | Type                                            | Default                    | Meaning                                              |
| ----------------- | ----------------------------------------------- | -------------------------- | ---------------------------------------------------- |
| `ariaLabel`       | `string`                                        | Required                   | Accessible surface name                              |
| `ariaDescription` | `string`                                        | None                       | Optional surface description                         |
| `tabIndex`        | `number`                                        | `0`                        | Surface tab index while keyboard behavior is enabled |
| `height`          | `number`                                        | `320` without aspect ratio | Fixed CSS and scene height                           |
| `aspectRatio`     | `number`                                        | None                       | Positive width-to-height ratio when height is absent |
| `width`           | `number`                                        | Responsive                 | Fixed CSS and scene width                            |
| `initialWidth`    | `number`                                        | `640`                      | Initial and server width                             |
| `class`           | `string`                                        | None                       | Extra class on the outer `ts-chart-host` element     |
| `style`           | `Record<string, string \| number \| undefined>` | None                       | Outer host styles applied after adapter sizing       |

See [Sizing and layout](./framework-octane.md#source-charts-docs-framework-octane-adapter-md).

### Focus, tooltip, and callbacks

| Prop                 | Type                                                     | Default | Meaning                                                              |
| -------------------- | -------------------------------------------------------- | ------- | -------------------------------------------------------------------- |
| `onFocusChange`      | `(point: ChartPoint \| null) => void`                    | None    | Primary focus callback                                               |
| `onFocusGroupChange` | `(points: readonly ChartPoint[]) => void`                | None    | Grouped focus callback                                               |
| `onSelect`           | `(point: ChartPoint \| null) => void`                    | None    | Click and keyboard activation callback                               |
| `onRender`           | `(context: ChartRenderContext) => void`                  | None    | Inner host, default SVG, complete surface, and scene after rendering |
| `renderTooltipBody`  | `(context: ChartTooltipBodyRenderContext) => OctaneNode` | None    | Composes Octane content inside the built-in tooltip body             |

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

The context also exposes the resolved `content`. Ordering, anchoring,
placement, portaling, and pinning remain in the definition. The prop is
available from the default, `/canvas`, and `/core` entries.

See [Focus and interaction](./interaction-motion-reference.md#source-charts-docs-reference-focus-and-interaction-md).

### Rendering and layout extensions

| Prop          | Type                                         | Default                     | Meaning                                |
| ------------- | -------------------------------------------- | --------------------------- | -------------------------------------- |
| `idPrefix`    | `string`                                     | Generated from `useId()`    | Prefix for renderer-owned resource IDs |
| `renderSvg`   | `ChartSvgRenderer<TDatum, TXValue, TYValue>` | `renderChartSvg`            | Scene-to-SVG renderer                  |
| `measureText` | `ChartTextMeasurer`                          | DOM inherited-font measurer | Guide glyph measurement                |

See [Rendering and export](./rendering-composition-reference.md#source-charts-docs-reference-rendering-and-export-md) and
[Scales, guides, and color](./runtime-scales-reference.md#source-charts-docs-reference-scales-guides-and-color-md).

### Exported prop types

The adapter exports `ChartCommonProps`, `ChartProps`, and
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
component values; see [Types](./specifications-types.md#source-charts-docs-reference-types-md).
