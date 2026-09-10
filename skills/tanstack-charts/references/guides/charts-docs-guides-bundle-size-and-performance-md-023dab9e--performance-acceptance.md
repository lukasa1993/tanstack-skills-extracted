# Bundle Size And Performance — Performance acceptance

[Guide and prerequisites](./charts-docs-guides-bundle-size-and-performance-md-023dab9e.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Performance acceptance

For each supported feature, keep a reproducible gate for:

- cold render time;
- warm update and reorder time;
- resize time;
- node count;
- interaction latency;
- retained heap after repeated mount/update/destroy;
- smallest relevant production bundle.

Compare at multiple data sizes and identify the first size where the
representation itself stops being sensible. Performance claims should name
the fixture and percentile, not imply one universal winner.

See [Testing and Debugging](./charts-docs-guides-testing-and-debugging-md-84886915.md#source-charts-docs-guides-testing-and-debugging-md) for correctness gates
that must accompany performance results.
