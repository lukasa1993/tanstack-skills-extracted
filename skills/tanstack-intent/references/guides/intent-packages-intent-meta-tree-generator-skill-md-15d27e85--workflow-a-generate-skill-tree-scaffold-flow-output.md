# SKILL — Workflow A — Generate skill tree: Scaffold flow output

[Guide and prerequisites](./intent-packages-intent-meta-tree-generator-skill-md-15d27e85.md) · Release-matched documentation · `@tanstack/intent@0.5.0`.

## Workflow A — Generate skill tree: Scaffold flow output


If the maintainer uses a custom skills root, replace `skills/` in the paths below with their chosen directory.

Focused batches use the format below through generate-skill’s [planning record procedure](https://github.com/TanStack/intent/blob/3cf6c146aa36288fba6bc5b7190413d878706756/packages/intent/meta/generate-skill/references/planning-records.md), extending the existing tree with the batch. Reading this format does not start full-library discovery.

For the full-library scaffold workflow, produce a single artifact before writing any SKILL.md files:

- `skills/_artifacts/skill_tree.yaml`

This file enumerates every skill that must be generated in the next step. Do not write SKILL.md files yet unless explicitly asked.

Use this format:

```yaml
# skills/_artifacts/skill_tree.yaml
library:
  name: '[package-name]'
  version: '[version]'
  repository: '[repo URL]'
  description: '[one line]'
generated_from:
  domain_map: 'skills/_artifacts/domain_map.yaml'
  skill_spec: 'skills/_artifacts/skill_spec.md'
generated_at: '[ISO date]'

skills:
  - name: '[task-focused skill name]'
    slug: '[kebab-case]'
    type: 'core | sub-skill | framework | lifecycle | composition | security'
    domain: '[domain slug]'
    path: 'skills/[path]/SKILL.md'
    package: '[package directory, e.g. packages/client]' # monorepo only — which package this skill belongs to
    description: 'Use when [concrete developer tasks or conditions] with [library/framework]. [Adjacent-task boundary, when needed.]'
    purpose: '[Descriptive explanation; emitted as metadata.purpose in SKILL.md.]'
    requires:
      - '[other skill slugs]' # omit if none
    sources:
      - '[Owner/repo]:docs/[path].md'
      - '[Owner/repo]:src/[path].ts'
    subsystems:
      - '[adapter/backend name]' # omit if none
    references:
      - 'references/[file].md' # omit if none
```

**Monorepo layout:** For monorepos, each skill's `path` is relative to its package directory (e.g. `packages/client/skills/core/SKILL.md`). Set the `package` field so generate-skill knows where to write the file. The domain map artifacts stay at the repo root.
