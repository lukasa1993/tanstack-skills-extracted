# Installation — Import boundaries

[Guide and prerequisites](./charts-docs-installation-md-6ab2967d.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Import boundaries

Use the package root for ordinary application authoring:

```ts
import { defineChart, lineY, mountChart } from '@tanstack/charts'
```

Use subpath exports when an authored library needs a hard capability boundary:

```ts
import { lineY } from '@tanstack/charts/line'
import { mountChart } from '@tanstack/charts/dom'
import { renderChartSvg } from '@tanstack/charts/svg'
```

Use the universal barrel when definitions and scene compilation must not make
the browser host reachable:

```ts
import {
  createChartRuntime,
  defineChart,
  lineY,
} from '@tanstack/charts/universal'
import type { ChartDefinition } from '@tanstack/charts/types'
```

The root remains the browser-oriented compatibility entry. Subpaths expose the
same contracts behind explicit capability boundaries.

Optional capabilities have explicit entries:

```ts
import { d3Curve } from '@tanstack/charts/d3/shape'
import { renderChartImage } from '@tanstack/charts/export'
import { focusGroupX } from '@tanstack/charts/focus'
import { tooltip } from '@tanstack/charts/tooltip'
import { portal } from '@tanstack/charts/tooltip/portal'
import { mountCanvasChart } from '@tanstack/charts/canvas'
import { mountChartRenderer } from '@tanstack/charts/renderer'
import { polar, radialArc } from '@tanstack/charts/polar'
import { geoShape } from '@tanstack/charts/geo'
```

Canvas remains optional in framework code too:

```tsx
import { Chart as ReactCanvasChart } from '@tanstack/charts/react/canvas'
import { Chart as ReactRendererChart } from '@tanstack/charts/react/core'
import { Chart as OctaneCanvasChart } from '@tanstack/charts/octane/canvas'
import { Chart as OctaneRendererChart } from '@tanstack/charts/octane/core'
```

The default entries are SVG-based. React and Octane currently provide the
optional `/canvas` and `/core` entries.

Polar and geographic marks are intentionally absent from the package root.
Their subpaths keep `d3-shape` and `d3-geo` unreachable from ordinary
Cartesian consumers.
