# Intent Review — Status and errors

[Guide and prerequisites](./intent-docs-cli-intent-review-md-9cfadc0a.md) · Release-matched documentation · `@tanstack/intent@0.5.2`.

## Status and errors

| Result | Behavior or next step |
| --- | --- |
| No pending items | `--check` exits `0`. |
| Pending review | `--check` exits nonzero; review and record the remaining items. |
| Missing, empty, or invalid planning document | Restore or repair the record before recording completion. |
| Source or guidance changed after the report | Regenerate `--json` after editing; stale fingerprints are rejected. |
| Missing recorded baseline | Fetch the referenced history, or create and fully resolve an explicit `--base` report to adopt a deliberate available baseline. |
| Missing or option-like explicit base | Pass a reachable commit or ref; explicit bases remain strict and are never inferred. |
| Corrupt review state | Restore or repair the state; Intent does not silently discard it. |
| Existing recording lock | Wait for the current recording. Remove the reported `.intent/review-state.json.lock` only after confirming no recording is running, then regenerate the report and retry. |
| Wrong working tree | Regenerate the report in the repository being reviewed. |
| Git/setup failure | Normal review exits nonzero. `--github-review` writes a failure reminder so the missing evidence stays visible. |
