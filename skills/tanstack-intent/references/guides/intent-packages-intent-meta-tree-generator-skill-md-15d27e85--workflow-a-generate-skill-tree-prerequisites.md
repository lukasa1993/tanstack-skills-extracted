# SKILL — Workflow A — Generate skill tree: Prerequisites

[Guide and prerequisites](./intent-packages-intent-meta-tree-generator-skill-md-15d27e85.md) · Release-matched documentation · `@tanstack/intent@0.4.0`.

## Workflow A — Generate skill tree: Prerequisites


You need one of:

- `skills/_artifacts/domain_map.yaml` and `skills/_artifacts/skill_spec.md`
  from domain-discovery
- Raw library documentation and source code (run a compressed domain
  discovery first)

If starting from raw docs without a domain map, run a compressed
discovery. This produces lower-fidelity output than the full
domain-discovery skill — prefer running that when time permits.

1. Build a concept inventory (every export, config key, constraint, warning)
2. Group into capability domains using work-oriented names (let library complexity drive the count — 2–3 for focused libraries, more for large frameworks)
3. Enumerate 10–20 task-focused skills from the intersection of domains
   and developer tasks
4. Extract 3+ failure modes per skill (plausible, silent, grounded)
5. Proceed to Step 1 below
