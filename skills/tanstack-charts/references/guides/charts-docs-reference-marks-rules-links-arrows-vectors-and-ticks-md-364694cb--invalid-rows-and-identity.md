# Rules Links Arrows Vectors And Ticks — Invalid rows and identity

[Guide and prerequisites](./charts-docs-reference-marks-rules-links-arrows-vectors-and-ticks-md-364694cb.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Invalid rows and identity

Links, arrows, vectors, and ticks skip rows with any invalid required
positional value. Links and arrows require all four endpoints. Stable `key`
channels are especially important for independent segments because keyed
reconciliation otherwise falls back to row index.
