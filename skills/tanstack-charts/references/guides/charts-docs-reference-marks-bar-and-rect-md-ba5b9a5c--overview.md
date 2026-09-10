# Bar And Rect — Overview

[Guide and prerequisites](./charts-docs-reference-marks-bar-and-rect-md-ba5b9a5c.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

Bar marks encode a numeric interval against a categorical or positional
channel. Rect marks encode independent x and y intervals and are the general
primitive for heatmaps, interval blocks, and cells.

```ts
import { barX, barY, cell, group, rect, stack } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
```
