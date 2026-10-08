# Intent Maintainer — Setup

[Guide and prerequisites](./intent-docs-cli-intent-maintainer-md-00f7d3ff.md) · Release-matched documentation · `@tanstack/intent@0.5.5`.

## Setup

Run from a Git working tree containing the library's package manifest:

<!-- ::start:tabs variant="package-manager" mode="local-install" -->

@tanstack/intent@latest maintainer setup

<!-- ::end:tabs -->

Setup preserves existing documents and repository instructions and copies the [CI workflow](./intent-docs-cli-intent-setup-md-7ed6e8de.md#source-intent-docs-cli-intent-setup-md) when it is missing. Standalone packages use `skills/_artifacts/`; monorepos share `_artifacts/` at the repository root. An existing custom location is retained. If several locations exist, select one with `--artifacts <repository-relative-directory>`.

The three records have separate jobs:

| Record | Owns |
| --- | --- |
| `domain_map.yaml` | Domains, developer tasks, supported failure modes, and knowledge gaps. |
| `skill_spec.md` | Coverage, maintainer decisions, check results, and batch history. |
| `skill_tree.yaml` | Skill identities, owning packages, paths, source mappings, prerequisites, and the distribution choice. |

Generated skeletons remain unfinished. Author their contents and remove the `intent:needs-authoring` marker after completing that work. A successful setup command does not mean the skills are ready to publish.

Setup automatically registers valid, Git-visible `skills/**/SKILL.md` files in the root package and workspace packages, preserving their content. It skips dependencies, hidden agent directories, and paths that [`review.ignore`](./intent-docs-cli-intent-review-md-9cfadc0a.md#source-intent-docs-cli-intent-review-md) matches. It also skips invalid skills and conflicting names, and reports each one. Domains come from `metadata.domain`, the existing domain map, a parent directory under `skills/`, or `uncategorized`; review that placeholder and complete task coverage. For custom locations outside `skills/`, use `maintainer add --path`. Repeating setup preserves existing registrations and workflow files. Reviewers can use [interactive review](./intent-docs-cli-intent-review-md-9cfadc0a.md#source-intent-docs-cli-intent-review-md) in a human terminal; CI uses the noninteractive checks.
