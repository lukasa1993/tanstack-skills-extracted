# Interactions And Selections — Scrollable lanes

[Guide and prerequisites](./charts-docs-guides-interactions-and-selections-md-8a834d6d.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Scrollable lanes

For resource timelines, native horizontal overflow is often better than
capturing the wheel:

- keep the lane label rail fixed;
- let the timeline region scroll;
- preserve viewport-relative geometry after updates;
- keep task details reachable by keyboard;
- avoid clipping axis labels at the scroll boundary.
