# SKILL — Constraints — verify for every file

[Guide and prerequisites](./intent-packages-intent-meta-tree-generator-skill-md-15d27e85.md) · Release-matched documentation · `@tanstack/intent@0.4.0`.

## Constraints — verify for every file

| Check                                       | Rule                                                                                |
| ------------------------------------------- | ----------------------------------------------------------------------------------- |
| Under 500 lines per SKILL.md                | Move excess to references/; also create references for content depth                |
| Real imports in every code block            | Exact package, correct adapter                                                      |
| No external concept explanations            | No "TypeScript is...", no "React hooks are..." — library-specific concepts are fine |
| No marketing prose                          | First body line is heading, code, or dependency note                                |
| Complete code blocks                        | Every block works without modification                                              |
| Common Mistakes are silent                  | Not obvious compile errors                                                          |
| Common Mistakes are library-specific        | Not generic TS/React mistakes                                                       |
| Common Mistakes are sourced                 | Traceable to doc or source                                                          |
| Core skills are framework-agnostic          | No hooks, no components, no providers                                               |
| Framework skills have `requires`            | Lists core dependency                                                               |
| Framework skills open with dependency note  | First prose line references core                                                    |
| Composition skills require all dependencies | Lists all core + framework skills                                                   |
| `name` matches parent directory             | `name: search-params` → `router-core/search-params/SKILL.md`                        |
| `library_version` in every frontmatter      | Which version the skill targets                                                     |
| Cross-skill failures duplicated             | Each listed skill gets the failure mode                                             |
| Tensions cross-referenced                   | Tension notes in each involved skill point to the other                             |
| Skills ship with packages                   | `"skills"` in package.json `files` array                                            |
| Checklist skills use audit template         | Security/go-live skills use checklist body, not standard body                       |

---
