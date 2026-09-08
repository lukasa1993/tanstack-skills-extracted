# Scales And D3 — Full D3 scale semantics

[Guide and prerequisites](./charts-docs-concepts-scales-and-d3-md-690870a4.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Full D3 scale semantics

Replace only the compact factory whose contract is insufficient. Import that
factory directly from `d3-scale`:

- `scaleUtc` and `scaleTime` preserve elapsed-time spacing and calendar ticks.
- `scaleLog`, `scalePow`, and `scaleSymlog` express nonlinear quantitative
  comparisons.
- `scaleSqrt` and `scaleRadial` map magnitude to symbol radius or area.
- `scaleSequential`, `scaleDiverging`, `scaleQuantile`, `scaleQuantize`, and
  `scaleThreshold` express quantitative or stepped color policy.
- D3 `scaleLinear` supports piecewise domains and ranges, nonnumeric range
  interpolation, custom interpolators, and the rest of the complete D3 linear
  contract.

The factory-versus-instance and responsive-range rules do not change after an
upgrade.
