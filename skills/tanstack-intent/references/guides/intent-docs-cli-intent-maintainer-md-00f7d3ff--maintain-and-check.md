# Intent Maintainer — Maintain and check

[Guide and prerequisites](./intent-docs-cli-intent-maintainer-md-00f7d3ff.md) · Release-matched documentation · `@tanstack/intent@0.5.4`.

## Maintain and check

<!-- ::start:tabs variant="package-manager" mode="local-install" -->

@tanstack/intent@latest maintainer status
@tanstack/intent@latest maintainer sync
@tanstack/intent@latest maintainer review --interactive

<!-- ::end:tabs -->

Status accepts `--json` and an actual Git comparison base with `--base <ref>`. Sync copies descriptions, purpose, sources, and prerequisites from the registered skills into the tree. It also adds the package discovery keyword and includes each skill directory in existing `files` allowlists. An absent allowlist stays absent, preserving npm's default contents. Sync prints each path it synchronized, or `Nothing to synchronize.` when every file is current, and labels the consumer install commands when repository distribution is selected. Inspect the actual packed archive in the library's release checks.

`maintainer review --interactive` is the human path. It walks each pending item in the terminal, shows the current guidance and changed files, and records the chosen outcomes with reason and evidence. It requires a terminal outside CI.

After checking every pending item, agents and scripts can record one shared conclusion with `maintainer review --unchanged "<reason>"` or `maintainer review --updated "<reason>"`. Use the [one-command review](./intent-docs-cli-intent-review-md-9cfadc0a.md#source-intent-docs-cli-intent-review-md) only when that conclusion covers every item. Use the JSON path for different outcomes or evidence per item. Generate the report and save it under `.intent/`, which `maintainer setup` created:

<!-- ::start:tabs variant="package-manager" mode="local-install" -->

```text
@tanstack/intent@latest maintainer review --json > .intent/review.json
```

<!-- ::end:tabs -->

Annotate the completed items, then record the report and run the combined check:

<!-- ::start:tabs variant="package-manager" mode="local-install" -->

@tanstack/intent@latest maintainer review --record .intent/review.json
@tanstack/intent@latest maintainer check

<!-- ::end:tabs -->

The report's `recording` block lists the allowed outcomes, the narrower planning outcomes, the required fields, and the record command. `--record` rejects a report that annotates none of its items. The [source-review reference](./intent-docs-cli-intent-review-md-9cfadc0a.md#source-intent-docs-cli-intent-review-md) describes the report format, fingerprints, baseline recovery, and the [Intent-owned paths](./intent-docs-cli-intent-review-md-9cfadc0a.md#source-intent-docs-cli-intent-review-md) that unmapped-change review skips by default. `maintainer review` supports its `--base`, `--json`, `--record`, `--interactive`, `--unchanged`, and `--updated` options. The standalone `review` command also remains available for workflow reminder output and review-only checks.

`maintainer check --base <pull-request-base>` runs the same maintainer checks in CI. It validates the workspace's default skill directories together with custom registered roots in one run, including code examples and relative links. Add `--github-summary` to write the headline, authoring issues, files to sync, and pending review items to the GitHub Actions step summary after the validation section; the generated workflow passes it. The flag belongs to `check` alone. It does not publish, install consumer skills, or certify that an agent's recorded conclusion is correct. Missing task evidence remains a review responsibility. Repository validation protects the source tree; it does not execute an authoring model in CI.
