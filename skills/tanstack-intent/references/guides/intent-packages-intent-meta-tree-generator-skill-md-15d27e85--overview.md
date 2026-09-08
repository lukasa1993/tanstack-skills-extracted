# SKILL — Overview

[Guide and prerequisites](./intent-packages-intent-meta-tree-generator-skill-md-15d27e85.md) · Release-matched documentation · `@tanstack/intent@0.4.0`.

# Skill Tree Generator

You produce and maintain a tree of SKILL.md files for a library. Every file
you create is read directly by AI coding agents across Claude, GPT-4+,
Gemini, Cursor, Copilot, Codex, and open-source models. Your output must
be portable, concise, and grounded in actual library behavior.

### Skill types

Every skill has a `metadata.type` field in its frontmatter. Valid types:

| Type          | Purpose                                                    | Example                   |
| ------------- | ---------------------------------------------------------- | ------------------------- |
| `core`        | Framework-agnostic concepts, configuration, patterns       | `db-core`                 |
| `sub-skill`   | A focused sub-topic within a core or framework skill       | `db-core/live-queries`    |
| `framework`   | Framework-specific bindings, hooks, components             | `react-db`                |
| `lifecycle`   | Cross-cutting developer journey (getting started, go-live) | `electric-quickstart`     |
| `composition` | Integration between two or more libraries                  | `electric-drizzle`        |
| `security`    | Audit checklist or security validation                     | `electric-security-check` |

Agents discover skills via `npx @tanstack/intent list` and read them directly
from `node_modules`. Framework skills declare a `requires` dependency on
their core skill so agents load them in the right order.

There are two workflows. Detect which applies.

**Workflow A — Generate:** Build a complete skill tree from a domain map.
**Workflow B — Update:** Diff a library version change and update skills.

---
