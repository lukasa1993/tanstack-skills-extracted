# SKILL — Pre-Deploy Summary

[Guide and prerequisites](./intent-packages-intent-meta-generate-skill-skill-md-5760b239.md) · Release-matched documentation · `@tanstack/intent@0.4.0`.

## Pre-Deploy Summary

- [ ] [Verification 1]
- [ ] [Verification 2]

```

---

## Step 5 — Validate

Run every check before outputting. Fix any failures.

| Check | Rule |
|-------|------|
| Under 500 lines | Move excess to references/ |
| Real imports in every code block | Exact package name, correct adapter |
| No external concept explanations | No "TypeScript is...", no "React hooks are..." |
| No marketing prose | No "powerful", "elegant", "best-in-class" |
| Every code block is complete | Works without modification when pasted |
| Common Mistakes are silent | Not obvious compile errors |
| Common Mistakes are library-specific | Not generic TS/React mistakes |
| Common Mistakes are sourced | Traceable to doc or source |
| `name` is the leaf, matches parent dir | `db/core/live-queries/SKILL.md` → name: `live-queries` (no slashes) |
| `sources` filled for sub-skills | At least one Owner/repo:path |
| Framework skills have `requires` | Lists core dependency |
| Framework skills open with dependency note | First prose line references core |
| Description is a dense routing key | Not a human summary — agent-facing |

---

## Step 6 — Output

Before generating, ask the maintainer: "Would you like to review each skill
individually before I generate the next one, or should I generate all skills
and you review them together?" Respect their preference.

Output the complete SKILL.md file content. If reference files are needed,
output those as well with their relative paths.

If generating multiple skills in a batch (e.g. all skills for a library),
output in this order:

1. Core overview SKILL.md
2. Core sub-skills in domain order
3. Framework overview SKILL.md for each framework
4. Framework sub-skills
5. Composition skills
6. Security/checklist skills
7. Reference files

---

## Regeneration mode

When regenerating a stale skill (triggered by skill-staleness-check):

1. Read the existing SKILL.md and the source diff that triggered staleness
2. Scan GitHub issues and discussions opened since the skill was last
   generated (use `library_version` or file timestamps as the baseline).
   Look for new failure modes, resolved confusion, or changed patterns
   related to this skill's topic. Apply the same search strategy from
   Step 2b but scoped to the time window since last generation.
3. Determine which sections are affected by the source change AND by
   any new issue/discussion findings
4. Update only affected sections — preserve all other content
5. If a breaking change occurred, add the old pattern as a new Common
   Mistake entry (wrong/correct pair)
6. If issues/discussions reveal new failure modes not in the existing
   skill, add them to Common Mistakes with issue URLs as sources
7. Bump `library_version` in frontmatter
8. Validate the complete file against Step 5 checks

Do not rewrite the entire skill for a minor source change. Surgical
updates preserve review effort and reduce diff noise.

---

## Constraints

| Rule | Detail |
|------|--------|
| Match the library's framework support | Generate framework skills only for adapters the library actually provides. If the library supports only React, only generate React examples. If it supports multiple frameworks, generate one skill per adapter. |
| All imports use real package names | `@tanstack/react-query`, not `react-query` |
| No placeholder code | No `// ...`, `[your value]`, or `...rest`. Idiomatic framework patterns like `{children}` or `{props.title}` in JSX are not placeholders — they are real code and are acceptable. |
| Agent-first writing | Only write what the agent cannot already know |
| Examples are minimal | No unnecessary boilerplate or wrapper components |
| Failure modes are high-value | Focus on plausible-but-broken, not obvious errors |

---

## Cross-model compatibility

Output is consumed by all major AI coding agents. To ensure consistency:

- Markdown with YAML frontmatter — universally parsed
- No XML tags in generated skill content
- Code blocks use triple backticks with language annotation
- Section boundaries use ## headers
- Descriptions are keyword-packed for routing
- Examples show concrete values, never placeholders
- Positive instructions ("Use X") over negative ("Don't use Y")
- Critical info at start or end of sections (not buried in middle)
- Each SKILL.md is self-contained except for declared `requires`

```
