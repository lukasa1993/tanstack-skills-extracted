# Polar And Radar — Production checks

[Guide and prerequisites](./charts-docs-examples-polar-and-radar-md-6fe0ac13.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Production checks

- Keep angle for cyclic order or part-to-whole intervals.
- Use native `pie` output rather than reimplementing angle accumulation.
- Let marks infer identity from source IDs or unique positions; supply a key
  when neither is available.
- Preserve original values for tooltips and accessible summaries.
- Keep radar dimension domains, directions, and units explicit.
- Verify labels around the full circumference at narrow widths.
- Prefer aligned bars or dots when precise comparison is the primary task.
