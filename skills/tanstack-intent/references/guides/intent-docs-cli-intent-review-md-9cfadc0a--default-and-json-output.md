# Intent Review — Default and JSON output

[Guide and prerequisites](./intent-docs-cli-intent-review-md-9cfadc0a.md) · Release-matched documentation · `@tanstack/intent@0.5.3`.

## Default and JSON output

Text output shows the pending count and up to 20 items, with changed paths, unresolved problems, and the next step. Use `--json` for the full report.

| JSON field | Meaning |
| --- | --- |
| `schemaVersion` | Report format version; currently `1`. |
| `root`, `head`, `base` | Working-tree identity and compared Git revisions. |
| `recording` | Accepted `outcomes`, the narrower `planningOutcomes`, the `required` fields (`outcome`, `reason`, `evidence`), and the `command` that records the report. `--record` ignores this block. |
| `items` | Pending skill, planning, and source review items. |
| Item `id`, `kind`, `path` | Stable item identity, category, and location. |
| Item `changedFiles` | Paths changed since the relevant comparison. Can be empty for initial review. |
| Item `snapshot`, `fingerprint` | Current content hashes and item fingerprint used when recording. |
| Item `problems` | Unresolved evidence that prevents recording completion. |
