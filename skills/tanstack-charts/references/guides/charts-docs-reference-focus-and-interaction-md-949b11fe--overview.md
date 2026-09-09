# Focus And Interaction — Overview

[Guide and prerequisites](./charts-docs-reference-focus-and-interaction-md-949b11fe.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

The DOM hosts, framework adapters, and React Native `Chart` provide point-level
interaction from each mark's emitted `ChartPoint` values and rendered scene
primitives. The defaults cover geometry-aware pointer or responder focus,
linear keyboard or accessibility navigation, activation, and an optional
built-in tooltip. Definitions own these policies; adapters mount them and report
events.
