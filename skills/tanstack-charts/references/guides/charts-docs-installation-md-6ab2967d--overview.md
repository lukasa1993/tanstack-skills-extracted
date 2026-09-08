# Installation — Overview

[Guide and prerequisites](./charts-docs-installation-md-6ab2967d.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

These docs follow unreleased `main`, the official Alpha line. The latest
published release is TanStack Charts `0.16.0`; use its
[release-source docs](https://github.com/TanStack/charts/tree/258ed39382b09843f98e6f48a2e9d4d0bd3f1d41/docs)
for the exact surface. Alpha releases use regular `0.x` versions and may break
APIs between minor releases. Install TanStack Charts in each application that
authors chart definitions:

```sh
pnpm add @tanstack/charts
```

Add the selected framework peers when the application uses an adapter subpath:

```sh
# React
pnpm add @tanstack/charts react react-dom

# React Native
pnpm add @tanstack/charts react@^19.2.3 react-native@^0.86.0 react-native-svg@^15.15.4

# Preact
pnpm add @tanstack/charts preact

# Vue
pnpm add @tanstack/charts vue

# Solid
pnpm add @tanstack/charts solid-js

# Svelte
pnpm add @tanstack/charts svelte

# Angular
pnpm add @tanstack/charts @angular/core @angular/platform-browser

# Lit
pnpm add @tanstack/charts lit

# Alpine
pnpm add @tanstack/charts alpinejs

# Octane
pnpm add @tanstack/charts octane
```

Definitions and marks come from the package root. Adapter subpaths connect the
shared runtime to a framework lifecycle while preserving separate module-graph
boundaries for tree shaking.

Optional capabilities use exact subpaths from the same package:

```ts
import { contour } from '@tanstack/charts/spatial/contour'
import { focusGuideX } from '@tanstack/charts/focus/guide'
import { brushX } from '@tanstack/charts/interaction/brush'
import { continuousCursor } from '@tanstack/charts/interaction/cursor'
import { handleX } from '@tanstack/charts/interaction/handle'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { zoomX } from '@tanstack/charts/interaction/zoom'
import { interactiveColorLegend } from '@tanstack/charts/legend'
import { keyedSelection, whenSelected } from '@tanstack/charts/selection'
import { forceLayout } from '@tanstack/charts/network/force'
import { sankeyDiagram } from '@tanstack/charts/network/sankey'
import { treeLayout } from '@tanstack/charts/hierarchy/tree'
import { treemap } from '@tanstack/charts/hierarchy/treemap'
import { sunburst } from '@tanstack/charts/hierarchy/sunburst'
```

The algorithm-backed subpaths own their `d3-contour`, `d3-force`,
`d3-sankey`, `d3-hierarchy`, `d3-brush`, `d3-zoom`, and `d3-selection`
implementations. The continuous cursor uses resolved scale inversion and adds
no D3 dependency. The scale handle uses the shared candidate-axis kernel and
also adds no D3 dependency. Install a corresponding D3 module in the
application only when application source imports it directly.

Eager transforms also have exact subpaths when a library needs a narrow import:

```ts
import { fold } from '@tanstack/charts/transform/fold'
```

`fold` is implemented by TanStack Charts and does not require an application
D3 dependency.
