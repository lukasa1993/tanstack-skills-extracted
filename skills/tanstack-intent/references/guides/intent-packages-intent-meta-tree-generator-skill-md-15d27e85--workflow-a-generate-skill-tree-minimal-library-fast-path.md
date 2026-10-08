# SKILL — Workflow A — Generate skill tree: Minimal library fast path

[Guide and prerequisites](./intent-packages-intent-meta-tree-generator-skill-md-15d27e85.md) · Release-matched documentation · `@tanstack/intent@0.5.5`.

## Workflow A — Generate skill tree: Minimal library fast path


If tasks stand alone, there are no framework adapter packages, and a shared overview would add no necessary guidance, skip the core overview + sub-skill registry pattern. Instead:

- Use **flat structure** — each skill gets its own `skills/[skill-name]/SKILL.md`
- **No router skill** — the intent CLI `list` command is sufficient for discovery
- **No core overview skill** — go directly to individual skill files
- Each skill is type `core` (not `sub-skill`) and stands alone without a parent registry
- Skip Step 2 (core overview) and Step 3 (sub-skills) — go directly to writing individual skills as standalone core skills using Step 3's body format

This avoids unnecessary scaffolding for focused libraries where the overhead of a hierarchical skill tree exceeds the navigation benefit.
