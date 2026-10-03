# Intent Review — Options

[Guide and prerequisites](./intent-docs-cli-intent-review-md-9cfadc0a.md) · Release-matched documentation · `@tanstack/intent@0.5.2`.

## Options

### Comparison and output

| Option | Behavior |
| --- | --- |
| `[dir]` | Locate the Git working tree. The review covers that repository, including its packages. |
| `--base <ref>` | Compare against an available Git commit or ref, such as the actual PR base. |
| `--json` | Print the complete structured report for an agent or script. |
| `--check` | Exit nonzero when review items remain. |

### Recording and reminders

| Option | Behavior |
| --- | --- |
| `--record <report.json>` | Record completed outcomes from an annotated JSON report. |
| `--github-review` | Write `review-items.json`, a `pr-body.md` reminder when needed, and GitHub step output/summary when configured. |
| `--package-label <label>` | Set the library label in generated reminder items. |

`--record` cannot be combined with `--base`, `--json`, or `--check`. `--github-review` cannot be combined with `--record`, `--json`, or `--check`.
