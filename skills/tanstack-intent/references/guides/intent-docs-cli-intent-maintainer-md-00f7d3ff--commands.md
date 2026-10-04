# Intent Maintainer — Commands

[Guide and prerequisites](./intent-docs-cli-intent-maintainer-md-00f7d3ff.md) · Release-matched documentation · `@tanstack/intent@0.5.3`.

## Commands

| Command | What it does |
| --- | --- |
| `maintainer setup` | Register existing package skills, create missing planning records, and install repository guidance and CI. |
| `maintainer add <name>` | Create a skill skeleton or register an existing skill in the cumulative record. |
| `maintainer remove <name>` | Retire a registered skill in the planning records without deleting its guidance. |
| `maintainer status` | Show authoring gaps, stale generated files, and pending source reviews. |
| `maintainer sync` | Align tree metadata, package publishing entries, plugin manifests, and consumer install commands. |
| `maintainer review` | Inspect Git changes and record review outcomes interactively or from an annotated JSON report. |
| `maintainer check` | Check skill structure, registration, generated metadata, and recorded reviews locally or in CI. |

The former `scaffold` command is removed. Use `maintainer setup` and `maintainer add` for file creation, and `meta generate-skill` for the authoring procedure.
