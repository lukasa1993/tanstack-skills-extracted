# SKILL — Step 1 — Determine skill type

[Guide and prerequisites](./intent-packages-intent-meta-generate-skill-skill-md-5760b239.md) · Release-matched documentation · `@tanstack/intent@0.4.0`.

## Step 1 — Determine skill type

Read the inputs and classify the skill type:

| Type          | When to use                                                |
| ------------- | ---------------------------------------------------------- |
| `core`        | Framework-agnostic concepts, configuration, patterns       |
| `sub-skill`   | A focused sub-topic within a core or framework skill       |
| `framework`   | Framework-specific bindings, hooks, components             |
| `lifecycle`   | Cross-cutting developer journey (getting started, go-live) |
| `composition` | Integration between two or more libraries                  |
| `security`    | Audit checklist or security validation                     |

The skill type determines the frontmatter and body structure. See
tree-generator for the full spec of each type.

---

### Subagent guidance for batch generation

When generating multiple skills, spawn a separate subagent for each skill
(or per-package group). Each subagent receives the domain_map.yaml,
skill_tree.yaml, and the source docs relevant to its skill. This prevents
context bleed between skills and allows parallel generation.

---
