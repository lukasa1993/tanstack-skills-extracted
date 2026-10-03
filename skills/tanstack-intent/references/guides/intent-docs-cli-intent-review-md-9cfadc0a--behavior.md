# Intent Review — Behavior

[Guide and prerequisites](./intent-docs-cli-intent-review-md-9cfadc0a.md) · Release-matched documentation · `@tanstack/intent@0.5.2`.

## Behavior

### What appears in a review

| Item | Why it appears | What to do |
| --- | --- | --- |
| Skill (`skill`) | No recorded review, changed source, or changed skill/reference content. | Compare the guidance with the source and update it when needed. |
| Planning records (`planning`) | The domain map, spec, or tree needs initial review, or its source/skill evidence changed. | Reconcile all three documents, preserving earlier decisions and remaining work. |
| Unmapped change (`source`) | A changed file is outside declared skill sources and not an [ignored path](./intent-docs-cli-intent-review-md-9cfadc0a.md#ignored-paths), or a skill was removed. | Decide whether existing guidance, a new skill, or an exclusion is appropriate. |

An unmapped file does not automatically require a new skill. A planning review can be needed even when nobody edited the planning documents.

### Comparison scope

Git and an initial commit are required. The default command is read-only.

| Setting | Comparison |
| --- | --- |
| Explicit `--base` | The commit selected by that ref. |
| Existing review state | The first recorded baseline, plus each item's recorded content hashes. |
| No review state | Each tracked skill uses the commit that introduced it to identify subsequent mapped-source changes. New skills still require an initial review; repository-wide unmapped changes use `HEAD`. |

Items without a recorded review use their introducing commit even when repository review state exists, unless you pass `--base`. Planning records use the commit that introduced their `skill_tree.yaml`.

The comparison includes committed changes since the base and staged, unstaged, and untracked files visible to Git. Renames appear as removals and additions. It reviews final working-tree content; a partially staged index is not separately certified.

Recorded hashes detect later edits even when a review happened before a commit. The state retains hashes rather than earlier source text. Default review fails closed when its stored baseline is no longer available; it does not infer a replacement from rewritten history.

### Recover an unavailable baseline

A squash merge, shallow clone, or history rewrite can remove the commit stored as the review baseline. Choose an available commit that covers the changes you intend to review, then create an explicit-base report:

<!-- ::start:tabs variant="package-manager" mode="local-install" -->

```text
@tanstack/intent@latest review --base <available-commit> --json > .intent/review.json
```

<!-- ::end:tabs -->

Review and resolve every item in that report, then record it:

<!-- ::start:tabs variant="package-manager" mode="local-install" -->

@tanstack/intent@latest review --record .intent/review.json

<!-- ::end:tabs -->

When the previous stored baseline is unavailable, recording this fully resolved explicit-base report adopts the report's base as the new durable baseline. An empty report can also adopt the new base because it records that the selected comparison has no pending items. A partial report, an omitted or `unresolved` outcome, unresolved source or planning evidence, or a changed fingerprint cannot replace the missing baseline. When the stored baseline is still available, recording an explicit-base report does not replace it.

> [!WARNING] Select the recovery base deliberately
> The selected base sets the Git comparison boundary. Fetch missing history when possible. Otherwise choose a reachable commit old enough to include every intended change; a base that is too recent can omit earlier unreviewed changes.

### Source mappings

Discovery covers first-party `skills/**/SKILL.md` files in the repository and its packages, custom roots containing `_artifacts/`, exact paths declared in the skill tree, and previously reviewed skill paths. An unrelated `SKILL.md` elsewhere does not automatically become a library skill. Review excludes `node_modules`, even without a Git ignore rule.

| Source entry | Resolution |
| --- | --- |
| `src/request.ts` | Relative to the owning package, including skills in custom directories. |
| `owner/repository:src/request.ts` | Relative to the Git root; the repository identity must match the origin or root package metadata. |
| `src/**/*.ts` | Git glob syntax: `*`, `?`, character classes, and `**`. |

Brace expansion and extglobs are unsupported. Ignored files, submodules, external source repositories, and symbolic links require manual review. Missing or unsupported mappings remain unresolved.

### Ignored paths

Files that Intent writes or that carry no library guidance do not appear as unmapped changes. The default list covers the agent instruction files (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`), `.claude-plugin/**`, `.cursor-plugin/**`, `.github/workflows/check-skills.yml`, `.intent/**`, `**/package.json`, and the lockfiles (`pnpm-lock.yaml`, `package-lock.json`, `npm-shrinkwrap.json`, `yarn.lock`, `bun.lock`).

The list only stops these paths from surfacing as unmapped changes. A skill that lists one of them in `sources` still tracks it.

Add repository-specific patterns under `review.ignore` in `skill_tree.yaml`:

```yaml
review:
  ignore:
    - "docs/**"
    - "examples/**/package.json"
```

Entries use the same Git glob syntax as source mappings. An entry that is not a non-empty string fails review with the path of the tree file.

### Required planning documents

The maintainer workflow keeps a cumulative record across batches:

| Document | Records |
| --- | --- |
| `domain_map.yaml` | Domains, developer tasks, relationships, failure modes, and gaps. |
| `skill_spec.md` | Readable coverage, maintainer decisions, batch history, and remaining work. |
| `skill_tree.yaml` | Skill identities, paths, package placement, prerequisites, and source mappings. |

Review finds existing planning locations from these filenames, including custom directories. Without one, installed maintainer guidance requires `_artifacts/` at a monorepo root or `skills/_artifacts/` for a standalone library. Previously recorded locations remain required if their files are deleted.

All three files must be present, nonempty, readable, and visible to Git. Each YAML document must contain an object with a `skills` array. Missing or invalid records remain unresolved.

The planning snapshot includes the documents and the discovered skill/source evidence. Changes reopen planning review without reopening an otherwise unchanged individual skill. The check establishes file presence, YAML shape, and reviewed content hashes; the agent and maintainer still assess whether the written record is accurate and complete.
