# Intent Review — Overview

[Guide and prerequisites](./intent-docs-cli-intent-review-md-9cfadc0a.md) · Release-matched documentation · `@tanstack/intent@0.5.4`.

`intent review` shows which library skills and planning records need review after source changes. Completed reviews are remembered until their source or guidance changes again.

For the full maintainer pipeline, use [`intent maintainer review`](./intent-docs-cli-intent-maintainer-md-00f7d3ff.md#source-intent-docs-cli-intent-maintainer-md) with `--base`, `--json`, or `--record`. It uses the same source-review implementation and report format described here. `intent maintainer check` combines review with registration, skill validation, distribution, and generated-file checks. The standalone command remains available for review-only checks and generated workflow reminders.

<!-- ::start:tabs variant="package-manager" mode="local-install" -->

```text
@tanstack/intent@latest review [dir] [--base <ref>] [--json] [--check] [--record <report.json>] [--github-review] [--package-label <label>]
```

<!-- ::end:tabs -->

For the normal coding-agent workflow, run [maintainer setup](./intent-docs-cli-intent-maintainer-md-00f7d3ff.md#source-intent-docs-cli-intent-maintainer-md) once. The installed guidance instructs the agent to review guidance and maintain the planning documents before handoff.
