# Bundle Size And Performance — Choose a sane representation

[Guide and prerequisites](./charts-docs-guides-bundle-size-and-performance-md-023dab9e.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Choose a sane representation

The fastest way to render too much data is to avoid rendering it:

- bin dense distributions;
- aggregate repeated categories;
- use an envelope or sampled line when individual points are not readable;
- restrict a time chart to a controlled visible window;
- use facets only when each panel remains interpretable;
- virtualize application chrome and lanes when only a subset is visible.

Every visible SVG node carries DOM and paint cost. Canvas removes the
per-element DOM cost, but not scene construction, draw work, interaction-point
memory, or visual overplotting. More marks are justified only when they
communicate more information.

See [Large Data](./charts-docs-guides-large-data-md-937914ac.md#source-charts-docs-guides-large-data-md) for representation thresholds and
interaction policies.
