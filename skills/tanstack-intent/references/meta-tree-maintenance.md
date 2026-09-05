# Meta trees and maintenance

Official Intent meta skills for tree generation and staleness checks.

<a id="source-intent-packages-intent-meta-skill-staleness-check-skill-md"></a>

## SKILL

Source: `intent:packages/intent/meta/skill-staleness-check/SKILL.md`.

## Skill Staleness Check

You are a coding agent. Your job is to evaluate whether intent skills are
stale after upstream source changes, and if so, update them and open PRs.
You act autonomously end-to-end. PRs contain already-updated skill
content, not suggestions.

If nothing needs updating, exit silently. No PR, no notification.

---

### Inputs

Webhook payload from an upstream package repo merge to main:

```json
{
  "package": "@tanstack/query",
  "sha": "abc123",
  "changed_files": ["docs/framework/react/guides/queries.md", "src/query.ts"]
}
```

---

### Step 1 — Match changed files to skills

Read all SKILL.md files under `packages/intent/skills/`. For each skill,
extract `sources` from the frontmatter.

Match `changed_files` from the webhook against `sources` entries across all
skills. Source references use the format `Owner/repo:relative-path` and
support glob patterns.

A skill is a **candidate** if any of its `sources` entries match a changed
file.

If no skills match, exit silently.

#### Using `intent stale`

There is no separate sync script — `intent stale [dir] [--json]` is the real,
existing staleness signal (see `docs/cli/intent-stale.md`). It is **read-only**:
it reports drift, it does not write anything. For a given library:

```bash
intent stale packages/query --json
```

This reports:

- Library version drift (`library_version` in a skill's frontmatter vs the
  currently published version), classified `major`/`minor`/`patch`.
- Missing source SHAs recorded in that package's `skills/sync-state.json`
  (a conservative signal — it flags gaps in the stored SHA record, not
  actual remote content differences; see the doc's Notes section).

`intent stale` does not classify "needs regeneration" vs "version bump only"
the way a dedicated sync tool might — that classification is this skill's own
job, done in Step 2 below using the actual source diff, not `intent stale`'s
output alone.

---

### Step 2 — Evaluate each candidate

For each matched skill:

1. Read the current SKILL.md content
2. Fetch the file diff from the triggering commit in the source repo
3. Classify the change:

| Classification        | Criteria                                                                                      | Action                                      |
| --------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **No impact**         | Diff is typo fix, comment change, test-only, or internal refactor with no API/behavior change | Skip — no update needed                     |
| **Version bump only** | Diff changes version numbers, dependency ranges, or metadata but no documented behavior       | Bump `library_version` in frontmatter       |
| **Content update**    | Diff changes API shape, behavior, defaults, types, or patterns that the skill documents       | Rewrite affected sections                   |
| **Breaking change**   | Diff removes, renames, or fundamentally changes an API the skill documents                    | Rewrite + add old pattern as Common Mistake |

#### Two-pass classification

**Pass 1 — Quick scan:** Read the diff summary (files changed, insertions,
deletions). Identify which skill sections could be affected.

**Pass 2 — Detail evaluation:** For each potentially affected section, read
the full diff hunks and compare against the skill content. Determine if the
change actually affects what the skill documents.

This prevents over-updating. A 200-line diff to a source file may only
affect one line of one skill, or none at all.

---

### Step 3 — Update stale skills

For skills classified as needing content updates:

1. Load the generate-skill meta skill
2. Provide it with:
   - The existing SKILL.md content
   - The source diff
   - The current source documentation (fetch the updated file)
3. Use regeneration mode (surgical update, not full rewrite)
4. Validate the updated skill against all checks

For version bump only:

There is no write-capable script for this. Edit `library_version` directly
in each affected skill's frontmatter, then update the recorded SHA(s) for
that library in its `skills/sync-state.json` (see Step 5) to reflect the new
synced state.

---

### Step 4 — Check cross-skill references

After updating skills in Step 3, check for cross-skill staleness:

1. For each skill that was updated, read its `name`
2. Scan all other skills for `requires` entries or `sources` that reference
   the updated skill
3. For each skill that references an updated skill, evaluate whether the
   update makes the referencing skill stale or inconsistent
4. If stale → update using the same process as Step 3
5. If not → skip

This cascade is bounded to **one level**. Skills that reference a
second-order dependency are not automatically re-checked.

---

### Step 5 — Mark skills as synced

There is no write-capable script for this either. After updating a skill,
edit that library's `skills/sync-state.json` directly: update
`library_version` and the affected skill's `skills[skillName].sources_sha`
map with the new source file SHA(s) from the commit that triggered this run.
(That is the real current shape read by `intent stale` — it has no separate
tree-generator SHA or sync-timestamp field, despite what an earlier version
of this doc implied.)

---

### Step 6 — Open PRs

For each skill (or group of skills) that was updated:

1. Create branch: `skill-update/<skill-name>-<short-sha>`
2. Commit updated SKILL.md file(s)
3. Open PR with structured body

#### PR format

**Title:** `skill: update <skill-name> (<package>@<short-sha>)`

**Body:**

```markdown
### Triggered by

Changes to: <list of source files that matched>

### What changed in the source

<summary of the diff — 2–3 sentences max>

### What changed in the skill

<summary of skill edits — which sections were updated and why>

### Cross-skill impact

<list any downstream skills checked; note if PRs were opened for them>

### Review checklist

- [ ] Skill content is accurate
- [ ] Code examples are complete and copy-pasteable
- [ ] No other skills need corresponding updates
- [ ] Under 500 lines
```

#### Grouping PRs

- If multiple skills for the same library are affected by the same commit,
  group them in a single PR
- If a cross-skill update is needed (Step 4), open a separate PR for the
  downstream skill to keep review scopes clean
- Never mix skills from different libraries in the same PR

---

### No-op behavior

Exit silently (no PR, no notification, no issue) when ANY of these are true:

- No changed files match any skill's `sources`
- All matched diffs are classified as "no impact" in Step 2
- `intent stale` reports all skills up-to-date (`All skills up-to-date`, per
  `docs/cli/intent-stale.md`)

---

### Operational notes

#### GitHub API usage

This skill (not a separate script) uses the `gh` CLI directly for GitHub API
access — fetching source diffs in Step 2 and opening PRs in Step 6. It
requires:

- `gh` CLI installed and authenticated
- Read access to upstream TanStack package repos (query, router, db, form,
  table)
- Write access to the intent repo for creating branches and PRs

#### Rate limiting

When checking multiple libraries or many source files, this makes one API
call per source file per skill during Step 2's diff fetch. For large
batches, the GitHub API rate limit (5000 requests/hour for authenticated
users) may apply. There is no batching or response caching in place — if
this becomes an issue, add caching around the diff-fetch step.

#### Manual triggering

Maintainers can run the read-only staleness signal manually, outside the
webhook-triggered flow:

```bash
# Check a specific library
intent stale packages/db

# JSON output
intent stale packages/db --json
```

This only reports drift (version drift, missing source SHAs) — it does not
update `sync-state.json` or open PRs; those remain Step 5 and Step 6 of this
skill's own workflow, done manually as described above.

---

### Constraints

| Rule                                            | Detail                                              |
| ----------------------------------------------- | --------------------------------------------------- |
| Silent when nothing changes                     | No noise — exit cleanly if no updates needed        |
| Surgical updates over full rewrites             | Only change sections affected by the diff           |
| One cascade level                               | Cross-skill checks go one level deep, not recursive |
| PRs scoped to one library                       | Never mix libraries in a single PR                  |
| Version bumps are separate from content updates | A version-only bump doesn't require regeneration    |
| Commit messages include co-author               | Include the coding agent's co-author tag            |

<a id="source-intent-packages-intent-meta-tree-generator-skill-md"></a>

## SKILL

Source: `intent:packages/intent/meta/tree-generator/SKILL.md`.

## Skill Tree Generator

You produce and maintain a tree of SKILL.md files for a library. Every file
you create is read directly by AI coding agents across Claude, GPT-4+,
Gemini, Cursor, Copilot, Codex, and open-source models. Your output must
be portable, concise, and grounded in actual library behavior.

#### Skill types

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

### Workflow A — Generate skill tree

#### Prerequisites

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

#### Scaffold flow output

If the maintainer uses a custom skills root, replace `skills/` in the paths
below with their chosen directory.

For the scaffold workflow, produce a single artifact before writing any
SKILL.md files:

- `skills/_artifacts/skill_tree.yaml`

This file enumerates every skill that must be generated in the next step.
Do not write SKILL.md files yet unless explicitly asked.

Use this format:

```yaml
# skills/_artifacts/skill_tree.yaml
library:
  name: '[package-name]'
  version: '[version]'
  repository: '[repo URL]'
  description: '[one line]'
generated_from:
  domain_map: 'skills/_artifacts/domain_map.yaml'
  skill_spec: 'skills/_artifacts/skill_spec.md'
generated_at: '[ISO date]'

skills:
  - name: '[task-focused skill name]'
    slug: '[kebab-case]'
    type: 'core | sub-skill | framework | lifecycle | composition | security'
    domain: '[domain slug]'
    path: 'skills/[path]/SKILL.md'
    package: '[package directory, e.g. packages/client]' # monorepo only — which package this skill belongs to
    description: '[1–2 sentence agent-facing routing key]'
    requires:
      - '[other skill slugs]' # omit if none
    sources:
      - '[Owner/repo]:docs/[path].md'
      - '[Owner/repo]:src/[path].ts'
    subsystems:
      - '[adapter/backend name]' # omit if none
    references:
      - 'references/[file].md' # omit if none
```

**Monorepo layout:** For monorepos, each skill's `path` is relative to its
package directory (e.g. `packages/client/skills/core/SKILL.md`). Set the
`package` field so generate-skill knows where to write the file. The domain
map artifacts stay at the repo root.

#### Minimal library fast path

If the domain map contains **fewer than 5 skills** and no framework
adapter packages, skip the core overview + sub-skill registry pattern.
Instead:

- Use **flat structure** — each skill gets its own `skills/[skill-name]/SKILL.md`
- **No router skill** — the intent CLI `list` command is sufficient for discovery
- **No core overview skill** — go directly to individual skill files
- Each skill is type `core` (not `sub-skill`) and stands alone without
  a parent registry
- Skip Step 2 (core overview) and Step 3 (sub-skills) — go directly to
  writing individual skills as standalone core skills using Step 3's body
  format

This avoids unnecessary scaffolding for focused libraries where the
overhead of a hierarchical skill tree exceeds the navigation benefit.

#### Step 1 — Plan the file tree

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

#### Steps 2–7 — Write skills

When writing skill files (after the scaffold plan is approved), read
[the skill-writing procedures and templates](https://github.com/TanStack/intent/blob/bffcdabbdb9a55af5a3ba1ff09ece0f7da223eb2/packages/intent/meta/tree-generator/references/write-skills.md).
Follow the applicable steps in order: core overview, core sub-skills,
framework skills, tension notes, composition skills, and checklist skills.
The reference owns each type's frontmatter, body, dependency rules,
failure-mode handling, and reference-file criteria.

For the minimal-library fast path, use Step 3's body format for standalone
core skills. For scaffold-only requests, stop after `skill_tree.yaml`.

#### Step 8 — Validate the complete tree

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

### Workflow B — Update existing skills

When a library version, changelog, migration guide, or accuracy report
requires updating existing skills, read [the update workflow](https://github.com/TanStack/intent/blob/bffcdabbdb9a55af5a3ba1ff09ece0f7da223eb2/packages/intent/meta/tree-generator/references/update-skills.md).
Produce its staleness report, update the affected skills according to the
change category, and write the changelog entry. Apply the constraints below
to every updated file.

### Constraints — verify for every file

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

### Cross-model compatibility

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

---

### Output order

When generating a complete skill tree:

1. Core overview SKILL.md — entry point for the library
2. Core sub-skills in domain order
3. Framework overview SKILL.md for each framework
4. Framework sub-skills
5. Composition skills (if applicable)
6. Security skills (if applicable)
7. references/ files for any skill that needs them
8. CHANGELOG.md entry

When updating:

1. staleness_report.yaml
2. Updated SKILL.md files (core then framework)
3. CHANGELOG.md entry

---
