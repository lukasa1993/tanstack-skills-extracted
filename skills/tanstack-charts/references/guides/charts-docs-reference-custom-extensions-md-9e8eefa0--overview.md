# Custom Extensions — Overview

[Guide and prerequisites](./charts-docs-reference-custom-extensions-md-9e8eefa0.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

TanStack Charts exposes narrow inversion-of-control boundaries around its
scene compiler. Prefer composition with built-in marks first. Add an extension
when the chart requires geometry or behavior that cannot be expressed without
distorting its data model.
