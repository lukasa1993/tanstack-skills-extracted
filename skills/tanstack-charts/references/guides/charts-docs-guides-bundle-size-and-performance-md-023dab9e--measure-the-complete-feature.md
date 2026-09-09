# Bundle Size And Performance — Measure the complete feature

[Guide and prerequisites](./charts-docs-guides-bundle-size-and-performance-md-023dab9e.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Measure the complete feature

Compare production bundles that render the same behavior:

- the same chart family and curve;
- the same number and kind of guides;
- the same tooltip and keyboard behavior;
- the same framework adapter;
- the same data preparation;
- the same export or spatial capability, when used.

Report raw, gzip, and Brotli sizes. Record the package manager lockfile,
bundler, minifier, target, and entry source. A root package tarball size or an
unminified source count is not a user bundle measurement.

The [library comparison](./charts-docs-comparison-md-7faf855b.md#source-charts-docs-comparison-md) publishes the current pinned
four-chart, three-tier bundle snapshot and its limits.

The repository's bundle gates use isolated entries so adding a complex mark
cannot silently increase the smallest chart. Polar has separate arc-only, pie
allocation, radial-label, radial-bar, gauge, and scale-backed line/scatter
ceilings; sunburst has an incremental ceiling over the equivalent D3 partition
kernel; geography has its own projected-shape ceiling. The ordinary line,
representative-mark, DOM, and framework entries remain exact byte locks.
