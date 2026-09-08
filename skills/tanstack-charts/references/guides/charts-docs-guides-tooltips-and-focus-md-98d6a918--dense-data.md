# Tooltips And Focus — Dense data

[Guide and prerequisites](./charts-docs-guides-tooltips-and-focus-md-98d6a918.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Dense data

Linear nearest-point search is deliberately small. For many independently
focusable points, pass a `ChartSpatialIndexFactory` built with an optional
spatial dependency. The factory also receives the resolved scene when it needs
primitive bounds rather than point anchors. The host rebuilds the index when
the scene changes.

See [Large Data](./charts-docs-guides-large-data-md-937914ac.md#source-charts-docs-guides-large-data-md) before adding an index: when many rows share
the same pixels, a bounded representation is usually more useful than faster
search over every raw point.
