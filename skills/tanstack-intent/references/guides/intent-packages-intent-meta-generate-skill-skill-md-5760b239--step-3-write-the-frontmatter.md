# SKILL — Step 3 — Write the frontmatter

[Guide and prerequisites](./intent-packages-intent-meta-generate-skill-skill-md-5760b239.md) · Release-matched documentation · `@tanstack/intent@0.4.0`.

## Step 3 — Write the frontmatter

### Core skill frontmatter

```yaml
---
name: '[leaf-segment]' # last path segment only — no slashes, must equal the parent dir (skills/tanstack-query/core/ → core)
description: >
  [1–3 sentences. What this skill covers and exactly when an agent should
  load it. Written for the agent — include the keywords an agent would
  encounter when it needs this skill. Dense routing key.]
metadata:
  type: core
  library: '[library]'
  library_version: '[version this targets]'
sources:
  - '[Owner/repo]:docs/[path].md'
  - '[Owner/repo]:src/[path].ts'
---
```

### Sub-skill frontmatter

```yaml
---
name: '[leaf-segment]' # last path segment only — no slashes, must equal the parent dir (skills/tanstack-query/loaders/ → loaders)
description: >
  [1–3 sentences. What this sub-topic covers and when to load it.]
metadata:
  type: sub-skill
  library: '[library]'
  library_version: '[version]'
sources:
  - '[Owner/repo]:docs/[path].md'
---
```

### Framework skill frontmatter

```yaml
---
name: '[framework]' # leaf segment (the framework name) — no slashes, must equal the parent dir (skills/tanstack-query/react/ → react)
description: >
  [1–3 sentences. Framework-specific bindings. Name the hooks, components,
  providers.]
metadata:
  type: framework
  library: '[library]'
  framework: '[react | vue | solid | svelte | angular]'
  library_version: '[version]'
requires:
  - '[library]/core'
sources:
  - '[Owner/repo]:docs/framework/[framework]/[path].md'
---
```

### Frontmatter rules

- `name` is the spec-legal leaf segment — lowercase letters, numbers, and
  hyphens only — and matches the skill's parent directory. It carries no
  slashes; the namespace lives in the skill's directory path instead.
- Intent-specific scalars (`type`, `library`, `library_version`, `framework`)
  live under the `metadata` map. The Agent Skills spec permits only `name`,
  `description`, `license`, `compatibility`, `metadata`, and `allowed-tools`
  at the top level, so emitting these scalars at the top level fails
  validation.
- `description` must be written so the agent loads this skill at the right
  time — not too broad (triggers on everything) and not too narrow (never
  triggers). Pack with function names, option names, concept keywords.
- `sources` uses the format `Owner/repo:relative-path`. Glob patterns are
  supported (e.g. `TanStack/query:docs/framework/react/guides/*.md`).
- `metadata.library_version` is the version of the source library this skill
  targets.
- `requires` lists skills that must be loaded before this one.

---
