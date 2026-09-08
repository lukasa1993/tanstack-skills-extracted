# SKILL — Workflow A — Generate skill tree: Step 8 — Validate the complete tree

[Guide and prerequisites](./intent-packages-intent-meta-tree-generator-skill-md-15d27e85.md) · Release-matched documentation · `@tanstack/intent@0.4.0`.

## Workflow A — Generate skill tree: Step 8 — Validate the complete tree


Run every check before outputting. Fix any failures before proceeding.

| Check                                             | Rule                                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Every skill from domain_map has a SKILL.md        | No orphaned skills                                                                          |
| Core/framework split is clean                     | No framework hooks in core skills                                                           |
| Every framework skill has `requires`              | Links to its core skill                                                                     |
| Framework skill opens with dependency note        | "builds on [core]" prose line                                                               |
| Every skill under 500 lines                       | Move excess to references/                                                                  |
| Every code block has real imports                 | Exact package name, correct adapter                                                         |
| No concept explanations                           | No "TypeScript is...", no "React hooks are..."                                              |
| No marketing prose                                | First body line is heading or dependency note                                               |
| Every code block is complete                      | Works without modification when pasted                                                      |
| Common Mistakes are silent                        | Not obvious compile errors                                                                  |
| Common Mistakes are library-specific              | Not generic TS/React mistakes                                                               |
| Common Mistakes are sourced                       | Every mistake traceable to doc or source                                                    |
| Core skills reference framework skills            | "For React usage, see..."                                                                   |
| Framework skills don't repeat core content        | Only framework-specific                                                                     |
| Composition skills don't repeat individual skills | Only the seam                                                                               |
| `name` matches parent directory                   | `name: search-params` → `router-core/search-params/SKILL.md`                                |
| `sources` filled in sub-skills                    | At least one repo:path per sub-skill                                                        |
| Cross-skill failures in all relevant files        | Failure modes with multiple `skills` appear in each listed SKILL.md                         |
| Tensions noted in affected skills                 | Each tension has notes in all involved domain skills                                        |
| Framework domains decomposed per-package          | No single skill covering multiple framework adapters                                        |
| Adapter-heavy domains have references             | 3+ adapters/backends → one reference file per adapter                                       |
| Dense API surfaces in references                  | >10 distinct patterns → reference file, not inline                                          |
| Checklist skills use audit body                   | Security/go-live skills use checklist template, not Setup → Core Patterns → Common Mistakes |

---
