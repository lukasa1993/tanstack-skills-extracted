# Polar And Radar — Overview

[Guide and prerequisites](./charts-docs-examples-polar-and-radar-md-6fe0ac13.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

Polar geometry is available only from `@tanstack/charts/polar`. The container
owns responsive center, angle, and radius ranges. Its eager `pie` transform
owns value allocation; granular D3 modules still own configured scales, curve
factories, and final arc/path geometry.

```ts
import {
  angleGrid,
  pie,
  polar,
  radialArc,
  radialArea,
  radialDot,
  radialGrid,
  radialLine,
  radialRule,
  radialText,
} from '@tanstack/charts/polar'
```

The package root stays Cartesian-sized when this subpath is not imported.
