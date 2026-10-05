# Intent Maintainer — Remove a skill

[Guide and prerequisites](./intent-docs-cli-intent-maintainer-md-00f7d3ff.md) · Release-matched documentation · `@tanstack/intent@0.5.4`.

## Remove a skill

<!-- ::start:tabs variant="package-manager" mode="local-install" -->

@tanstack/intent@latest maintainer remove retries

<!-- ::end:tabs -->

Removal retires the skill: its tree entry gets `status: retired` and `skill_spec.md` gains a note to record why the guidance is no longer needed. The command never deletes `SKILL.md`. It prints the path so you can delete the file once its guidance is no longer needed, then run `maintainer sync` and `maintainer review`.

The command refuses while the skill is selected for repository distribution or required by another active skill, and names what to change first. Reselect the remaining skills with `maintainer setup --distribution repo --skill <name>`, or update the dependent skill's prerequisites, then retry.

A skill name is unique within its owning package, so two workspace packages can register the same name. A prerequisite name refers to a skill in the same package. When more than one package registers the name, the command lists those packages; pass `--package <directory>` to select the skill to retire. A name that more than one package registers cannot be selected for repository distribution.
