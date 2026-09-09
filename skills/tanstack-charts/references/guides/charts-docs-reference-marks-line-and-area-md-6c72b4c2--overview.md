# Line And Area — Overview

[Guide and prerequisites](./charts-docs-reference-marks-line-and-area-md-6c72b4c2.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

Line and area marks consume an iterable directly. Channels may be compatible
field names or accessors. Rows whose required positional value is null,
undefined, invalid, or nonfinite create gaps instead of connecting across
missing data.

```ts
import {
  areaX,
  areaY,
  defineChart,
  lineX,
  lineY,
  stack,
} from '@tanstack/charts'
```
