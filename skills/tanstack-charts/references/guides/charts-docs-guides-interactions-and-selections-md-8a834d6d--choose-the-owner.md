# Interactions And Selections — Choose the owner

[Guide and prerequisites](./charts-docs-guides-interactions-and-selections-md-8a834d6d.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Choose the owner

Use native chart focus for:

- nearest-point inspection;
- grouped axis tooltips;
- snapped crosshairs;
- synchronized focus cursors;
- keyboard point navigation;
- point activation.

Use a first-party controlled chart control for:

- categorical series visibility through `interactiveColorLegend`;
- semantic point selection through `keyedSelection`;
- an unsnapped numeric or temporal plot position through `continuousCursor`;
- one ordered scale value through `handleX`;
- a scale-bound horizontal range through `brushX`;
- a controlled numeric or temporal x window through `zoomX`;
- other controls that explicitly accept a `ControlledSignal`.

Use controlled application state for:

- shared cursor-controller identity and programmatic cursor values;
- accepted brush, zoom, and pan domains;
- focus-and-context windows;
- synchronized-view layout and domain policy;
- scrollable resource lanes;
- playback timing and play/pause controls;
- editable intervals;
- rich pinned tooltips.

See [Tooltips and Focus](./charts-docs-guides-tooltips-and-focus-md-98d6a918.md#source-charts-docs-guides-tooltips-and-focus-md) for chart-owned datum inspection.
