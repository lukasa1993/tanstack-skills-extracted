# Maintainer workflow

Set up, scaffold, validate, and maintain skills.

<a id="source-intent-docs-cli-intent-hooks-md"></a>

## Intent Hooks

Source: `intent:docs/cli/intent-hooks.md`.

`intent hooks install` installs lifecycle hooks that surface available Intent skills and gate supported edit tools until they observe an Intent guidance check.

```bash
npx @tanstack/intent@latest hooks install [--scope project|user] [--agents copilot,claude,codex|all]
```

### Options

- `--scope <scope>`: hook install scope, either `project` or `user`; defaults to `project`
- `--agents <agents>`: comma-separated hook agents to configure (`copilot`, `claude`, `codex`) or `all`; defaults to `all`

### Behavior

#### Session behavior

- Installs hook behavior without writing an `intent-skills` guidance block.
- Returns a session-start skill catalog as agent context with available `skill-id: description` entries.
- Blocks supported edit tools until the hook observes a recognized `intent list` or `intent load <skill-id>` command. If no listed skill matches the task, the agent can continue without loading one.
- Uses `package.json#intent.skills` and `package.json#intent.exclude` to control which skills appear in the session catalog.

#### Installation behavior

- `--scope project` writes project-local hook config for agents that support it.
- `--scope user` writes user-level agent config and stores runner scripts under `~/.tanstack/intent/hooks`.
- `--agents all` is the default. In project scope, Copilot is skipped because the supported Copilot CLI hook location is user-scoped.
- Run `intent install` separately when you also want to write project guidance.

The hook records a recognized list or load command before that command completes.

Hooks do not verify that:

- The command succeeded.
- The selected skill matched the task.
- The agent received the returned content.
- The model applied the guidance.

Hook output is an edit gate and observation signal, not proof of activation or correct agent behavior. See [Lifecycle boundaries](./trust-configuration.md#source-intent-docs-concepts-trust-model-md).

### Hook support

| Agent | Project scope | User scope | Hooks installed |
| --- | --- | --- | --- |
| Claude Code | `.claude/settings.json` | `~/.claude/settings.json` | `SessionStart` skill catalog plus `PreToolUse` edit gate |
| Codex | `.codex/hooks.json` | `~/.codex/hooks.json` | `SessionStart` skill catalog plus `PreToolUse` edit gate; Codex hook interception is not a complete security boundary |
| GitHub Copilot CLI | Guidance via `.github/copilot-instructions.md`; blocking hooks are not project-scoped | `$COPILOT_HOME/hooks/hooks.json` or `~/.copilot/hooks/hooks.json` | `SessionStart` skill catalog plus `PreToolUse` edit gate in user scope |
| Cursor | Guidance only | Guidance only | Use `AGENTS.md` or Cursor rules; no blocking hook is installed |
| Generic `AGENTS.md` agents | Guidance only | Guidance only | Use the `intent-skills` guidance block; no blocking hook is installed |

`.github/copilot-instructions.md` is a supported project guidance target for `intent install`. GitHub Copilot CLI hook enforcement uses the user-scoped Copilot hooks directory because that is the supported hook location.

Codex requires users to review and trust non-managed hooks before they run. If Codex reports hooks awaiting review, open its hook browser and trust the generated Intent hook.

### Status messages

- Hook installed: `Installed Intent hooks for claude (project) in .claude/settings.json.`
- Hook skipped: `Skipped Intent hooks for copilot: project scope is not supported; use --scope user`

### Related

- [intent install](./consumer-workflow.md#source-intent-docs-cli-intent-install-md)
- [intent list](./consumer-workflow.md#source-intent-docs-cli-intent-list-md)
- [intent load](./consumer-workflow.md#source-intent-docs-cli-intent-load-md)

<a id="source-intent-docs-cli-intent-meta-md"></a>

## Intent Meta

Source: `intent:docs/cli/intent-meta.md`.

`intent meta` lists bundled meta-skills or prints one meta-skill file.

```bash
npx @tanstack/intent@latest meta
npx @tanstack/intent@latest meta <name>
```

### Arguments

- `<name>` is a meta-skill directory under `node_modules/@tanstack/intent/meta/`
- Rejected values: any name containing `..`, `/`, or `\\`

### Output

- Without `<name>`:
  - one line per meta-skill
  - `name` + description from frontmatter
  - description is normalized and truncated to 60 characters
- With `<name>`:
  - Markdown from `meta/<name>/SKILL.md`
  - relative links within the package resolve from the caller's directory, using absolute paths when needed
  - reference files remain separate and are read only when their linked procedure is needed

### Common errors

- Meta directory not found
- Invalid `<name>` format
- Unknown `<name>` (message suggests running `npx @tanstack/intent meta`)
- Read failure for target `SKILL.md`

<a id="source-intent-docs-cli-intent-scaffold-md"></a>

## Intent Scaffold

Source: `intent:docs/cli/intent-scaffold.md`.

`intent scaffold` prints a phased scaffold prompt for generating skills.

```bash
npx @tanstack/intent@latest scaffold
```

### Behavior

- Prints prompt text to stdout
- Does not create files

### Output

The printed prompt defines three ordered phases:

1. `domain-discovery`
2. `tree-generator`
3. `generate-skill`

Each phase includes a stop gate before continuing.

The prompt also includes a post-generation checklist:

- Run `npx @tanstack/intent@latest validate` and fix issues
- Commit generated `skills/` and `skills/_artifacts/`
- Ensure `@tanstack/intent` is in `devDependencies`
- Run setup commands as needed:
  - `npx @tanstack/intent@latest edit-package-json`
  - `npx @tanstack/intent@latest setup`

### Related

- [intent validate](./maintainer-workflow.md#source-intent-docs-cli-intent-validate-md)
- [setup commands](./maintainer-workflow.md#source-intent-docs-cli-intent-setup-md)

<a id="source-intent-docs-cli-intent-setup-md"></a>

## Intent Setup

Source: `intent:docs/cli/intent-setup.md`.

Intent exposes publishing setup as two commands.

```bash
npx @tanstack/intent@latest edit-package-json
npx @tanstack/intent@latest setup
```

### Commands

- `edit-package-json`: add or normalize `package.json` entries needed to publish skills
- `setup`: copy workflow templates to `.github/workflows`
- `setup-github-actions`: legacy alias for `setup`

### What each command changes

#### `edit-package-json`

- Requires a valid `package.json` in the current directory
- Ensures `keywords` includes `tanstack-intent`
- Ensures `files` includes required publish entries
- Preserves existing indentation

#### `setup`

- Copies the `check-skills.yml` workflow template from `@tanstack/intent/meta/templates/workflows` to `.github/workflows`
- Applies variable substitution (`PACKAGE_NAME`, `PACKAGE_LABEL`, `PAYLOAD_PACKAGE`, `REPO`, `DOCS_PATH`, `SRC_PATH`, `WATCH_PATHS`)
- Detects the workspace root in monorepos and writes repo-level workflows there
- Skips files that already exist at the destination

### Required `files` entries

`edit-package-json` enforces different `files` sets based on package location:

- Monorepo package: `skills`
- Non-monorepo package: `skills`, `!skills/_artifacts`

### Common errors

- Missing or invalid `package.json` when running `edit-package-json`
- Missing template source when running `setup`

### Notes

- `setup` skips existing files
- `check-skills.yml` validates skills on PRs and opens review PRs from release/manual runs
- To adopt updated workflow templates, delete or move the old generated workflow files first, then rerun `setup`
- If your repo has an older generated `validate-skills.yml`, remove it after adopting the current `check-skills.yml`; PR validation now lives in `check-skills.yml`
- In monorepos, run `setup` from either the repo root or a package directory; Intent writes workflows to the workspace root

### Related

- [intent validate](./maintainer-workflow.md#source-intent-docs-cli-intent-validate-md)
- [intent scaffold](./maintainer-workflow.md#source-intent-docs-cli-intent-scaffold-md)

<a id="source-intent-docs-cli-intent-stale-md"></a>

## Intent Stale

Source: `intent:docs/cli/intent-stale.md`.

`intent stale` reports whether shipped skills may need review.

```bash
npx @tanstack/intent@latest stale [--json]
```

### Options

- `--json`: print JSON array of staleness reports

### Behavior

#### Scope

- Checks the current package by default
- From a monorepo root, checks workspace packages that ship skills and also reports public workspace packages with no skill or artifact coverage
- Applies the `package.json#intent.skills` allowlist when falling back to installed dependencies; workspace packages are first-party and checked regardless. See [Configuration](./trust-configuration.md#source-intent-docs-concepts-configuration-md).
- When `dir` is provided, scopes the check to the targeted package or skills directory
- Computes one staleness report per package

#### Coverage

- Reads repo-root `_artifacts/*domain_map.yaml` and `_artifacts/*skill_tree.yaml` when present
- Flags public workspace packages that are not represented by generated skills or artifact coverage
- Skips workspace packages with `"private": true`

#### Output and workflow state

- Prints text output by default or JSON with `--json`
- Prints a non-failing workflow update reminder when `.github/workflows/check-skills.yml` is missing the current `intent-workflow-version` stamp
- If no packages are found, prints `No intent-enabled packages found.`

Artifact coverage ignores can be recorded in `_artifacts/*skill_tree.yaml` or `_artifacts/*domain_map.yaml`:

```yaml
coverage:
  ignored_packages:
    - '@tanstack/internal-tooling'
    - name: packages/devtools-fixture
      reason: test fixture only
```

Ignored packages are excluded from missing coverage signals. Private workspace packages are excluded automatically.

### JSON report schema

`--json` outputs an array of reports:

```json
[
  {
    "library": "string",
    "currentVersion": "string | null",
    "skillVersion": "string | null",
    "versionDrift": "major | minor | patch | null",
    "skills": [
      {
        "name": "string",
        "reasons": ["string"],
        "needsReview": true
      }
    ],
    "signals": [
      {
        "type": "missing-package-coverage",
        "library": "string",
        "subject": "string",
        "reasons": ["string"],
        "needsReview": true,
        "packageName": "string",
        "packageRoot": "string"
      }
    ]
  }
]
```

Report fields:

| Field | Meaning |
| --- | --- |
| `library` | Package name |
| `currentVersion` | Latest version from npm registry, or `null` if unavailable |
| `skillVersion` | `library_version` from skills, or `null` |
| `versionDrift` | `major`, `minor`, `patch`, or `null` |
| `skills` | Per-skill checks |
| `signals` | Artifact and workspace coverage checks |

Skill fields:

- `name`
- `reasons`: one or more staleness reasons
- `needsReview`: boolean (`true` when reasons exist)

Reason generation:

- `version drift (<skillVersion> → <currentVersion>)`
- `new source (<path>)` when a declared source has no stored sync SHA
- artifact parse warnings, unresolved artifact skill paths, source drift, artifact library version drift, and missing workspace package coverage

### Text output

- Report header format: `<library> (<skillVersion> → <currentVersion>) [<versionDrift> drift]`
- When no skill reasons exist: `All skills up-to-date`
- Otherwise: one warning line per stale skill or review signal (`⚠ <name>: <reason1>, <reason2>, ...`)

### Common errors

- Package scan failure: prints a scanner error
- Registry fetch failures do not crash command; `currentVersion` may be `null`

### Notes

- Source staleness checking is conservative: it flags missing source SHAs in sync-state, not remote content differences.

### Related

- [intent list](./consumer-workflow.md#source-intent-docs-cli-intent-list-md)

<a id="source-intent-docs-cli-intent-validate-md"></a>

## Intent Validate

Source: `intent:docs/cli/intent-validate.md`.

`intent validate` checks `SKILL.md` files and artifacts for structural problems.

```bash
npx @tanstack/intent@latest validate [<dir>] [--github-summary] [--fix] [--check]
```

### Arguments

- `<dir>`: directory containing skills; default is `skills`
- Relative paths are resolved from the current working directory

### Options

- `--github-summary`: write a GitHub Actions step summary when `GITHUB_STEP_SUMMARY` is set
- `--check`: fail if any `SKILL.md` has fixable frontmatter migrations pending, without writing files
- `--fix`: rewrite fixable `SKILL.md` frontmatter migrations, then validate the result

### Frontmatter migration fixes

Use `--check` in CI to detect mechanical frontmatter migrations that have not been applied:

```bash
npx @tanstack/intent@latest validate --check
```

Use `--fix` locally to apply the mechanical frontmatter migrations:

```bash
npx @tanstack/intent@latest validate --fix
```

`--fix` only rewrites unambiguous frontmatter migrations:

- `name` values are rewritten to the parent directory leaf when the parent directory is already a legal skill name
- Top-level string fields `type`, `library`, `library_version`, and `framework` are moved under `metadata`

`--fix` does not rewrite authoring-judgment validation errors:

- Missing or invalid `description`
- Length-limit failures
- Invalid `metadata` shape or non-string `metadata` values
- Missing `requires` for framework skills
- Artifact validation failures

### Validation checks

#### File structure

- Frontmatter delimiter and structure are valid
- YAML frontmatter parses successfully
- Required fields exist: `name`, `description`
- `name` is a single leaf segment matching the skill's parent directory (no slashes); the namespace is carried by the directory path
- `name` uses only lowercase letters, numbers, and hyphens and is at most 64 characters

#### Field rules

- Only spec top-level keys are allowed (`name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`); Intent-specific scalars (`type`, `library`, `library_version`, `framework`) must live under `metadata`
- `metadata`, when present, is a mapping of string values
- `description` length is at most 1024 characters
- `type: framework` requires `requires` to be an array
- Total file length is at most 500 lines

#### Artifacts

When `<dir>/_artifacts` exists, Intent also checks:

- Required files: `domain_map.yaml`, `skill_spec.md`, `skill_tree.yaml`
- Required files must be non-empty
- `.yaml` artifacts must parse successfully

### Packaging warnings

Packaging warnings are always computed from `package.json` in the current working directory:

- `@tanstack/intent` missing from `devDependencies`
- Missing `tanstack-intent` in keywords array
- Missing `files` entries when `files` array exists:
  - `skills`
  - `!skills/_artifacts`

Warnings are informational; they are printed on both pass and fail paths.

### Common errors

- Missing target directory: `Skills directory not found: <abs-path>`
- No skill files discovered: `No SKILL.md files found`
- Validation failures: aggregated file-specific errors and count

### Related

- [intent scaffold](./maintainer-workflow.md#source-intent-docs-cli-intent-scaffold-md)
- [setup commands](./maintainer-workflow.md#source-intent-docs-cli-intent-setup-md)

<a id="source-intent-docs-getting-started-quick-start-maintainers-md"></a>

## Quick Start Maintainers

Source: `intent:docs/getting-started/quick-start-maintainers.md`.

Get started scaffolding, validating, and shipping skills for your library.

### Install

<!-- ::start:tabs variant="package-manager" mode="dev-install" -->
react: @tanstack/intent
solid: @tanstack/intent
vue: @tanstack/intent
svelte: @tanstack/intent
angular: @tanstack/intent
lit: @tanstack/intent
<!-- ::end:tabs -->

Or run commands without installing:

```bash
npx @tanstack/intent@latest scaffold
```

---

### Initial Setup (With Agent)

#### 1. Scaffold skills

Start the scaffolding process **with your AI agent**:

```bash
npx @tanstack/intent@latest scaffold
```

This prints a comprehensive prompt that walks you and your agent through three phases:

**Phase 1: Domain Discovery**
- Scans your documentation, source code, and GitHub issues
- Conducts an interactive interview to surface implicit knowledge
- Produces `domain_map.yaml` and `skill_spec.md` artifacts

**Phase 2: Tree Generation**
- Designs a skill taxonomy based on the domain map
- Creates a hierarchical skill structure
- Produces `skill_tree.yaml` artifact

**Phase 3: Skill Generation**
- Writes complete SKILL.md files for each skill
- Includes patterns, failure modes, and API references
- Validates against the Intent specification

> [!NOTE]
> Plan for multiple review rounds and regular context compaction. The agent scans documentation, recent issues, and discussions, then asks targeted questions about implicit knowledge and common failure modes. Provide concrete patterns, pitfalls, and real-world usage problems to improve the generated skills.

#### 2. Validate skills

After scaffolding, validate that all SKILL.md files are well-formed:

```bash
npx @tanstack/intent@latest validate
```

This checks skill structure:

- Valid YAML frontmatter in every SKILL.md
- Required fields (`name`, `description`) are present
- Skill `name` is a leaf segment matching its parent directory
- Description length <= 1024 characters
- Line count limits (500 lines max per skill)

It also checks Intent metadata and artifacts:

- Intent-specific scalars (`type`, `library`, `library_version`, `framework`) live under `metadata`, not at the top level
- Framework skills have a `requires` array
- Required artifact files exist and are non-empty; YAML artifacts parse successfully

#### 3. Commit skills and artifacts

Commit both generated skills and the artifacts used to create them:

```
skills/
  core/SKILL.md
  react/SKILL.md
  _artifacts/
    domain_map.yaml
    skill_spec.md
    skill_tree.yaml
```

Artifacts enforce a consistent skill structure across versions, making it easier to audit, refresh, or extend the skill set without starting from scratch.

---

### Publish Configuration

#### 4. Configure your package for publishing

Run these commands to prepare your package for skill publishing:

```bash
# Update package.json with required fields
npx @tanstack/intent@latest edit-package-json

# Copy the CI workflow template
npx @tanstack/intent@latest setup
```

**What these do:**

- `edit-package-json` adds:
  - `tanstack-intent` keyword (used for package detection and registry discovery)
  - `files` array entries for `skills/`
  - For single packages: also adds `!skills/_artifacts` to exclude artifacts from npm
  - For monorepos: skips the artifacts exclusion (artifacts live at repo root)
- `setup` copies `check-skills.yml` to `.github/workflows/` for automated validation and staleness checking

`setup` does not overwrite existing workflow files. To pick up newer generated workflows, delete or move the old generated files in `.github/workflows/`, then rerun `npx @tanstack/intent@latest setup`.

If your repo already has an older generated `validate-skills.yml`, remove it after adopting the current `check-skills.yml`; PR validation now runs from `check-skills.yml`.

#### 5. Ship skills with your package

Skills ship inside your npm package. When you publish:

```bash
npm publish
```

Consumers who install your library automatically get the skills. They discover local installed skills with `intent list`, add loading guidance with `intent install`, and load matching skills with `intent load`.

**Version alignment:**
- Skills version with your library releases
- `intent load` returns skill content from the installed package version
- Packaging code and skills together keeps their versions aligned

---

### Ongoing Maintenance (Manual or Agent-Assisted)

#### 6. Set up the CI workflow

After running `setup`, you'll have `check-skills.yml` in `.github/workflows/`:

**check-skills.yml** (runs on PRs touching skills/artifacts, release, or manual trigger)

Validation:

- Validates SKILL.md frontmatter and structure
- Ensures files stay under 500 lines
- Automatically detects stale skills and coverage gaps after you publish a new release

Review handoff:

- Opens one grouped review PR with an agent-friendly prompt
- Includes the reason each skill or package was flagged
- Requires you to copy the prompt into Claude Code, Cursor, or your agent to update skills

#### 7. Update stale skills

When you publish a new release, `check-skills.yml` automatically opens a PR flagging skills that need review.

Manually check which skills need updates with:

```bash
npx @tanstack/intent@latest stale
```

When run from a package, this checks that package's shipped skills. When run from a monorepo root, it checks workspace packages with skills and flags public workspace packages missing skill or `_artifacts` coverage.

This detects:
- **Version drift** — skill targets an older library version than currently installed
- **New sources** — sources declared in frontmatter that weren't tracked before
- **Artifact drift** — `_artifacts` entries that no longer match generated skills
- **Missing package coverage** — public workspace packages not represented by generated skills or artifact coverage

If a public workspace package is intentionally out of scope for skills, record that decision in repo-root `_artifacts`:

```yaml
coverage:
  ignored_packages:
    - '@tanstack/internal-tooling'
    - name: packages/devtools-fixture
      reason: test fixture only
```

Private workspace packages are skipped automatically.

**Prepare the update:**

1. Review the PR opened by `check-skills.yml`
2. Copy the agent prompt from the PR description
3. Paste it into Claude Code, Cursor, or your coding agent
4. The agent reads the stale skills and updates them based on library changes

**Finish the update:**

5. Run `npx @tanstack/intent@latest validate` locally to verify
6. Commit and merge the PR

> [!NOTE]
> Skills are updated through agent assistance, not full automation. The workflow detects what's stale and provides the prompt — your agent handles the actual updates.

Use `--json` output for CI integration or scripting.

#### 8. Maintain and iterate

As your library evolves:

1. **When APIs change:** Update relevant SKILL.md files with new patterns
2. **When docs change:** Run `intent stale` to identify affected skills
3. **When issues are filed:** Check if the failure mode should be added to "Common Mistakes"
4. **After major releases:** Consider re-running domain discovery to catch new patterns

> [!TIP]
> Create GitHub issue labels matching your skill names (`skill:core`, `skill:react`). When users file issues, tag them with the relevant skill label to track which areas need the most improvement.
