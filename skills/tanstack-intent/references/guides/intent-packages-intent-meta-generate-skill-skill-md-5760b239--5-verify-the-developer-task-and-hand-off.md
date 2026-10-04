# SKILL — 5. Verify the developer task and hand off

[Guide and prerequisites](./intent-packages-intent-meta-generate-skill-skill-md-5760b239.md) · Release-matched documentation · `@tanstack/intent@0.5.3`.

## 5. Verify the developer task and hand off

For new guidance and updates that change a recommended behavior, follow [task quality checks](https://github.com/TanStack/intent/blob/9e6e5ed8e03ae0f3e0be71cd764c9afb96aec67d/packages/intent/meta/generate-skill/references/task-quality.md). Create or reuse a representative task and executable checks in the repository's existing test setup. A successful structural check is not evidence that a consumer can complete the task.

For new or changed descriptions, also follow [discovery checks](https://github.com/TanStack/intent/blob/9e6e5ed8e03ae0f3e0be71cd764c9afb96aec67d/packages/intent/meta/generate-skill/references/task-quality.md#check-discovery-separately). Keep activation evidence separate from task correctness.

Run `npm exec --no -- intent validate <skills-root>` with the actual owning package's skill directory (or the repository's installed `intent`). Fix errors without weakening validation. Keep every SKILL.md within the 500-line limit. Review packaging warnings separately; they do not require installing dependencies or changing publishing configuration during authoring.

Check that every reference and prerequisite resolves, every changed claim matches the cited source/version, and examples use actual supported APIs. Exercise the relevant example or package check where available. Intent's structural validation does not prove semantic correctness or agent behavior. If a check cannot run, report it as not verified with the reason.

Inspect the actual `SKILL.md` output and matching tree entry before handoff: the description makes the use conditions clear, purpose explains the skill, and both stay within supported behavior. Check migrated purpose text against the pre-edit description and preserve established purpose on later updates. Do not imply stronger guarantees to attract more requests. Check that references have reading conditions and independently discoverable tasks justify any new skills.

Verify all three planning documents against the resulting skills and prior record, then record completed skill and planning outcomes using the [source review procedure](https://github.com/TanStack/intent/blob/9e6e5ed8e03ae0f3e0be71cd764c9afb96aec67d/packages/intent/meta/generate-skill/references/source-review.md), then inspect the final diff for unrelated edits and run `git diff --check` for touched files. Return the changed library behavior, affected skill/reference paths, all three planning document paths and their changes or justified no-op, source/version evidence, structural and task-check results, and any remaining maintainer decision. Distinguish updated guidance, verified no change, and missing evidence for each reviewed task. Report whether a fresh consumer session completed the representative task; if that check could not run, mark it unverified rather than treating the authoring session as independent evidence. The result is ready for maintainer review when the task is usable end to end and those checks pass.

Track the handoff gates explicitly: skills and task checks verified; all three planning documents reconciled; review outcomes recorded; `maintainer check` run and any pending work reported. Do not finish after writing the files while leaving these gates unchecked.

Stop at the reviewable diff. Commits, labels, workflow/dependency installation, and publishing are separate actions requiring the maintainer's request.
