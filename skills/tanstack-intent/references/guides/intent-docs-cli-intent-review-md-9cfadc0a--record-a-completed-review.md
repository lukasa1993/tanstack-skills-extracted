# Intent Review — Record a completed review

[Guide and prerequisites](./intent-docs-cli-intent-review-md-9cfadc0a.md) · Release-matched documentation · `@tanstack/intent@0.5.4`.

## Record a completed review

### Interactive review

For a human terminal, run the interactive command from the library repository:

<!-- ::start:tabs variant="package-manager" mode="local-install" -->

@tanstack/intent@latest maintainer review --interactive

<!-- ::end:tabs -->

Inspect each item's current guidance and changed files, choose an outcome, and supply the reason and actual evidence. The changes view compares tracked files with the displayed Git base and includes untracked content. Use `--base <available-commit>` for a specific comparison. Edit and test guidance before starting; changes during review invalidate the affected outcomes.

Choose **Leave pending** when more work is needed. Items with unresolved source mappings or planning problems cannot be completed. The final preview lists the proposed outcomes and evidence. Confirmation records through the same fingerprint checks as `--record`; cancellation records nothing. Evidence text is stored, not executed or independently verified.

Interactive review requires a terminal outside CI and cannot be combined with `--json` or `--record`. A zero exit status means the interaction completed, not that all review items were resolved. Use `intent maintainer check --base <available-commit>` as the read-only CI gate. JSON reports and the manual procedure below remain available to agents and scripts.

### Record all pending items

After inspecting all pending items and running the relevant checks, record one conclusion in one command:

<!-- ::start:tabs variant="package-manager" mode="local-install" -->

```text
@tanstack/intent@latest maintainer review --unchanged "Checked retries and cancellation against the updated implementation; the guidance remains accurate."
@tanstack/intent@latest maintainer review --updated "Updated the affected examples and planning records, then checked them against the source."
```

<!-- ::end:tabs -->

Choose one command. `--unchanged` records `no-change`; `--updated` records `updated`. The reason is required and applies to every pending item. Intent records each item's current changed paths and head revision as evidence and applies the same fingerprint and unresolved-problem checks as JSON recording. The command fails when nothing is pending or any item cannot be recorded. It does not assess the guidance or run the checks for you.

These flags belong to `maintainer review`, accept `--base`, and cannot be combined with each other, `--json`, `--record`, or `--interactive`. Use a JSON report when items need different conclusions or more detailed evidence.

### JSON review

The installed maintainer procedure handles these steps. For manual use:

1. Review the pending items, edit guidance and planning records as needed, and run the relevant checks.
2. Regenerate the report after those edits. Save it outside source paths, such as under `.intent/`, which the maintainer commands create:

<!-- ::start:tabs variant="package-manager" mode="local-install" -->

```text
@tanstack/intent@latest review --json > .intent/review.json
```

<!-- ::end:tabs -->

3. Add an outcome, reason, and evidence to each item you completed. Preserve the report's identities, baseline, and fingerprints. The report's `recording` block lists the accepted values.
4. Record the report and check remaining work:

<!-- ::start:tabs variant="package-manager" mode="local-install" -->

@tanstack/intent@latest review --record .intent/review.json
@tanstack/intent@latest review --check

<!-- ::end:tabs -->

### Outcomes

| Outcome | Meaning | Clears the item? |
| --- | --- | --- |
| `updated` | Guidance or planning records were corrected and checked. | Yes, with current fingerprints and resolved evidence. |
| `no-change` | The existing content was checked and remains accurate. | Yes, with a reason and evidence. |
| `out-of-scope` | A skill or source item is outside the reviewed guidance scope. | Yes, with a reason and evidence. Not accepted for planning records. |
| `unresolved` | Required evidence or a decision is still missing. | No. |
| No outcome | The item has not been reviewed. | No. |

For example, add these fields to an existing report item; this is not a complete report:

```json
{
  "outcome": "no-change",
  "reason": "Only the internal cache changed; the documented retry bound and errors remain the same.",
  "evidence": ["src/request.ts", "test/request.test.ts: passed"]
}
```

For a planning item, the reason and evidence must cover all three documents. Preserve prior tasks, decisions, and future work when extending them with a new batch.

`--record` rejects a report that annotates none of its items. The error names the required fields and points to `intent maintainer review --interactive`; a report with zero items still records its baseline.

### Saved state

`--record` writes `.intent/review-state.json` containing the baseline, source/guidance hashes, reviewed revision, outcomes, reasons, and evidence, creating the directory when it is missing. It does not commit, publish, or change skill versions. `.intent/` is reserved for Intent's working files and is excluded from unmapped-change items: review state and working reports, `.intent/skill-distribution.json` written by `maintainer sync`, and the temporary `.intent/maintainer.lock` and `.intent/review-state.json.lock` that serialize writes.

Identical recorded content suppresses repeat reminders. Later edits reopen review. The saved state does not replace the planning documents, execute evidence strings, or verify the truth of a recorded conclusion.
