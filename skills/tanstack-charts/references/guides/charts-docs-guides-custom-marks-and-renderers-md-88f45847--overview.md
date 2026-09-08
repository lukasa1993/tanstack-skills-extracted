# Custom Marks And Renderers — Overview

[Guide and prerequisites](./charts-docs-guides-custom-marks-and-renderers-md-88f45847.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

Use a custom mark when a visualization fits the shared scene model but is not
expressible as a useful composition of built-in Cartesian, polar, or
geographic marks.

Use a custom renderer when the same chart scene needs a different mounted
surface. Use a custom SVG serializer when only SVG markup or resources differ.

Neither extension should reach into private scene compiler state.
