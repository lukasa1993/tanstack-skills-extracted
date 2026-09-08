# SKILL — Workflow A — Generate skill tree: Step 1 — Plan the file tree

[Guide and prerequisites](./intent-packages-intent-meta-tree-generator-skill-md-15d27e85.md) · Release-matched documentation · `@tanstack/intent@0.4.0`.

## Workflow A — Generate skill tree: Step 1 — Plan the file tree


From the domain map, each entry in the `skills` list becomes a SKILL.md
file. The `type` field on each skill (`core`, `framework`, `lifecycle`,
`composition`) determines where it goes. Determine the file tree:

**Core vs framework decision:**

| Content                                        | Goes in... |
| ---------------------------------------------- | ---------- |
| Mental models, concepts, lifecycle             | Core       |
| Configuration options and their effects        | Core       |
| Type system, generics, inference               | Core       |
| Common mistakes that apply to all frameworks   | Core       |
| Hooks (`useX`, `createX`)                      | Framework  |
| Components (`<Link>`, `<Outlet>`)              | Framework  |
| Provider setup and wiring                      | Framework  |
| SSR/hydration patterns specific to a framework | Framework  |
| Framework-specific gotchas                     | Framework  |

If a library has no framework adapters (e.g. Store, DB), produce only
core skills.

**Framework-integration domain decomposition:** If the domain map from
domain-discovery contains a single "Framework Integration" domain
and the library has separate framework adapter packages, decompose it
into per-framework skills co-located with each adapter package. Do not
produce a single monolithic framework-integration skill that covers
React, Vue, Solid, etc. in one file.

**Adapter-heavy domains:** When a domain covers multiple backends or
adapters with distinct config interfaces (e.g. 5 sync adapters, 3
database drivers), keep one SKILL.md for the shared patterns but
produce one reference file per adapter with its specific config,
setup, and gotchas. The SKILL.md covers what's common; each
`references/[adapter].md` covers what's unique.

**Flat vs nested structure:**

Choose the structure that matches how the domain map's skills are shaped.

Use **nested** (`[lib]-core/[domain]/SKILL.md`) when:

- Developer tasks cluster cleanly into 3–5 conceptual domains
- The library has a clear core + framework adapter split
- Skills build on each other in a layered way

Use **flat** (`skills/[skill-name]/SKILL.md`) when:

- Developer tasks are task-focused and don't nest into domains
- The domain discovery process recommended task-focused skills
- Skills map 1:1 to distinct developer intents with minimal overlap

Both are valid. The domain map's `type` field and structure will signal
which fits. When in doubt, prefer flat — it's simpler and each skill
is independently discoverable.

**Nested structure:**

```
skills/
├── [lib]-core/                   # Core skill for the library
│   ├── SKILL.md                  # Core overview + sub-skill registry
│   ├── [domain-1]/
│   │   └── SKILL.md             # Core sub-skill
│   ├── [domain-2]/
│   │   └── SKILL.md
│   └── references/              # Optional overflow content
│       └── options.md
├── react-[lib]/                  # React framework skill
│   ├── SKILL.md                  # React overview + sub-skill registry
│   ├── [domain-1]/
│   │   └── SKILL.md             # React-specific sub-skill
│   └── references/
├── solid-[lib]/                  # Solid framework skill (if applicable)
│   └── SKILL.md
├── vue-[lib]/                    # Vue framework skill (if applicable)
│   └── SKILL.md
```

**Flat structure:**

```
skills/
├── [lib]-shapes/                 # Task-focused skill
│   ├── SKILL.md
│   └── references/
│       └── shape-options.md
├── [lib]-auth/                   # Another task skill
│   └── SKILL.md
├── [lib]-proxy/
│   └── SKILL.md
├── [lib]-quickstart/             # Lifecycle skill
│   └── SKILL.md
├── [lib]-go-live/                # Lifecycle skill
│   └── SKILL.md
├── [lib]-drizzle/                # Composition skill
│   └── SKILL.md
```

**Router skill:** A router skill (lightweight entry point with a decision
table) is optional. If the intent CLI provides `list` and `show`
commands, agents can discover skills directly without a router. Only
create a router skill if the skill set is large enough (15+) that
browsing the list is insufficient, or if the nested structure needs
an entry point to guide agents to the right sub-skill. Libraries with
fewer than 5 skills should never have a router skill.

**Source repository layout for npm distribution:**

Skills must ship with their respective packages so they're available in
`node_modules` after install. In a monorepo, co-locate skills with the
package they document:

```
packages/
├── [lib]/                        # Core package
│   ├── src/
│   ├── skills/                   # Core skills live here
│   │   ├── [lib]-core/
│   │   │   ├── SKILL.md
│   │   │   └── [domain]/SKILL.md
│   │   └── compositions/        # Composition skills with co-used libs
│   └── package.json             # Add "skills" to files array
├── react-[lib]/                  # React adapter package
│   ├── src/
│   ├── skills/                   # React framework skills live here
│   │   └── react-[lib]/
│   │       └── SKILL.md
│   └── package.json             # Add "skills" to files array
```

Run `npx @tanstack/intent@latest edit-package-json` to wire each package's `package.json`
automatically (adds `"skills"`, `"bin"`, and `"!skills/_artifacts"` to the
`files` array, and adds the `bin` entry if missing).
