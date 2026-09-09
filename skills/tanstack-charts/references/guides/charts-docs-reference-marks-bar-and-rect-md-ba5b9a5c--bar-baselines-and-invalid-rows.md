# Bar And Rect — Bar baselines and invalid rows

[Guide and prerequisites](./charts-docs-reference-marks-bar-and-rect-md-ba5b9a5c.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Bar baselines and invalid rows

Implicit stacks include zero in inferred quantitative domains. Explicit
endpoints contribute their authored bounds. The configured scale still owns
its semantic domain.

Rows are skipped when their category, baseline, or endpoint is invalid.
Negative and reversed intervals are supported because geometry uses the
minimum mapped endpoint and absolute length.
