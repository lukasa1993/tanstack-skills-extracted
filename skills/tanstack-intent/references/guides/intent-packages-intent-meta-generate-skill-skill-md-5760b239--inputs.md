# SKILL — Inputs

[Guide and prerequisites](./intent-packages-intent-meta-generate-skill-skill-md-5760b239.md) · Release-matched documentation · `@tanstack/intent@0.4.0`.

## Inputs

You will receive:

If the maintainer uses a custom skills root, replace `skills/` in any paths
below with their chosen directory.

**Monorepo:** When the skill tree entry has a `package` field, write the
SKILL.md into that package's skills directory (e.g.
`packages/client/skills/core/SKILL.md`), not a shared root.

1. **Skill path** — format `library-group/skill-name` (e.g. `tanstack-query/core`,
   `tanstack-router/loaders`, `db/core/live-queries`). This is the skill's
   directory path, and it is where the `SKILL.md` lives. Only its **last
   segment** becomes the frontmatter `name` (a spec-legal leaf): the full path
   is never written into `name`, and `name` must contain no slashes.
2. **Skill description** — what the skill covers and when an agent should load it
3. **Source documentation** — the docs, guides, API references, and/or source
   files to distill from
4. **Domain map entry** (Mode A only) — the skill's entry from `domain_map.yaml`
   including failure modes, subsystems, compositions, and source references

---
