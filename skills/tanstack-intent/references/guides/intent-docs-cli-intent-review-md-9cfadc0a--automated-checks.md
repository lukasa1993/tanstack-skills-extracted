# Intent Review — Automated checks

[Guide and prerequisites](./intent-docs-cli-intent-review-md-9cfadc0a.md) · Release-matched documentation · `@tanstack/intent@0.5.4`.

## Automated checks

The optional version 4 [setup workflow](./intent-docs-cli-intent-setup-md-7ed6e8de.md#source-intent-docs-cli-intent-setup-md) connects review to PRs and releases:

| Trigger | Check |
| --- | --- |
| Pull request with maintainer guidance or review state | `maintainer check --base <PR-base-sha>` |
| Release/manual run with review state | `review --github-review` |
| Release/manual run without review state | Existing `stale --github-review` fallback |

This catches skipped review recording and missing planning documents. It does not run an authoring model in CI. Your coding agent handles the reminder using the same maintainer procedure.
