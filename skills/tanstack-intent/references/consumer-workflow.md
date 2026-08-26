# Consumer workflow

Install, list, load, and use skills.

<a id="source-intent-docs-cli-intent-exclude-md"></a>

## Intent Exclude

Source: `intent:docs/cli/intent-exclude.md`.

`intent exclude` manages `package.json#intent.exclude` entries.

```bash
npx @tanstack/intent@latest exclude [list|add|remove] [pattern] [--json]
```

### Options

- `--json`: print the configured exclude patterns as JSON

### Actions

1. `list` (default): print current excludes
2. `add <pattern>`: append one exclude pattern
3. `remove <pattern>`: remove one exclude pattern

### Examples

```bash
npx @tanstack/intent@latest exclude
npx @tanstack/intent@latest exclude list --json
npx @tanstack/intent@latest exclude add @tanstack/router#experimental-*
npx @tanstack/intent@latest exclude remove @tanstack/router#experimental-*
```

### Behavior

- Reads and writes the current working directory `package.json`
- Creates `intent.exclude` when missing
- Keeps existing excludes and appends new patterns in order
- Validates pattern syntax before writing
- Refuses invalid `package.json` structures for `intent` and `intent.exclude`

### Related

- [Configuration](./trust-configuration.md#source-intent-docs-concepts-configuration-md)
- [intent list](./consumer-workflow.md#source-intent-docs-cli-intent-list-md)
- [intent load](./consumer-workflow.md#source-intent-docs-cli-intent-load-md)

<a id="source-intent-docs-cli-intent-install-md"></a>

## Intent Install

Source: `intent:docs/cli/intent-install.md`.

`intent install` creates or updates an `intent-skills` guidance block in a project guidance file.

```bash
npx @tanstack/intent@latest install [--map] [--dry-run] [--print-prompt] [--global] [--global-only] [--no-notices]
```

### Options

#### Guidance output

- `--map`: write explicit task-to-skill mappings instead of lightweight loading guidance
- `--dry-run`: print the generated block without writing files
- `--print-prompt`: print the agent setup prompt instead of writing files

#### Mapping scan scope

- `--global`: include global packages after project packages when `--map` is passed
- `--global-only`: install mappings from global packages only when `--map` is passed
- `--no-notices`: suppress non-critical notices on stderr

### Behavior

#### Default guidance

- Writes lightweight skill loading guidance by default.
- Creates `AGENTS.md` when no managed block exists.
- Updates an existing managed block in a supported config file.
- Preserves all content outside the managed block.
- Verifies the managed block before reporting success.

#### Mapping mode

- Scans packages and writes compact `id`, `run`, and `for` mappings only when `--map` is passed.
- Surfaces packages permitted by `package.json#intent.skills` in `--map` mode. See [Configuration](./trust-configuration.md#source-intent-docs-concepts-configuration-md).
- Skips reference, meta, maintainer, and maintainer-only skills in `--map` mode.
- Writes compact skill identities and runnable guidance commands instead of local file paths in `--map` mode.
- Prints `No intent-enabled skills found.` and does not create a config file when `--map` finds no actionable skills.

Supported config files: `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`.

### Default output

The default block tells agents to discover skills and load matching guidance on demand:

```markdown
<!-- intent-skills:start -->
## Skill Loading

Before editing files for a substantial task:
- Run `npx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->
```

### Mapping output

`--map` writes compact skill identities and commands:

```yaml
<!-- intent-skills:start -->
# TanStack Intent - before editing files, run the matching guidance command.
tanstackIntent:
  - id: "@tanstack/query#fetching"
    run: "npx @tanstack/intent@latest load @tanstack/query#fetching"
    for: "Query data fetching patterns"
<!-- intent-skills:end -->
```

- `id`: portable skill identity in `<package>#<skill>` format
- `run`: package-manager-aware command agents should run before editing
- `for`: task-routing phrase for agents
- The block does not store `load` paths, absolute paths, or package-manager-internal paths

### Status messages

| Result | Message |
| --- | --- |
| Mapping created | `Created AGENTS.md with 1 mapping.` |
| Mappings updated | `Updated AGENTS.md with 2 mappings.` |
| Mappings unchanged | `No changes to AGENTS.md; 2 mappings already current.` |
| Guidance created | `Created AGENTS.md with skill loading guidance.` |
| Guidance unchanged | `No changes to AGENTS.md; skill loading guidance already current.` |
| Placement tip | `Tip: Keep the intent-skills block near the top of AGENTS.md so agents read it before task-specific instructions.` |
| No actionable skills in `--map` mode | `No intent-enabled skills found.` |

To suppress trust and migration notices in automation, pass `--no-notices`.

### Related

- [intent list](./consumer-workflow.md#source-intent-docs-cli-intent-list-md)
- [intent load](./consumer-workflow.md#source-intent-docs-cli-intent-load-md)
- [intent hooks](./maintainer-workflow.md#source-intent-docs-cli-intent-hooks-md)
- [Quick Start for Consumers](./consumer-workflow.md#source-intent-docs-getting-started-quick-start-consumers-md)

<a id="source-intent-docs-cli-intent-list-md"></a>

## Intent List

Source: `intent:docs/cli/intent-list.md`.

`intent list` discovers skill-enabled packages and prints available skills.

```bash
npx @tanstack/intent@latest list [--json] [--debug] [--global] [--global-only] [--show-hidden] [--no-notices]
```

### Options

#### Output

- `--json`: print JSON instead of text output
- `--debug`: print discovery debug details to stderr
- `--no-notices`: suppress non-critical notices on stderr; the acknowledged-risk notice for `intent.skills: ["*"]` remains visible

#### Scan scope

- `--global`: include global packages after project packages
- `--global-only`: list global packages only
- `--show-hidden`: show unlisted hidden skill sources when run outside an agent session

### What you get

#### Selection

- Scans project and workspace dependencies for intent-enabled packages and skills
- Surfaces packages permitted by `package.json#intent.skills` (see [Allowlist](#allowlist))
- Includes global packages only when `--global` or `--global-only` is passed
- Excludes packages and skills matched by package.json `intent.exclude`

When both local and global packages are scanned, local packages take precedence. `SOURCE` shows whether the selected package came from local discovery or explicit global scanning.

#### Text output

- Summary line with package count and skill count
- Package table columns: `PACKAGE`, `SOURCE`, `VERSION`, `SKILLS`
- Skill tree grouped by package
- Discovery warnings (`⚠ ...`) on stdout
- `No intent-enabled packages found.` when no packages are discovered

Policy notices (`ℹ ...`) are written to stderr.

### JSON output

`--json` prints an adapter-friendly skill list:

```json
{
  "skills": [
    {
      "use": "@tanstack/query#fetching",
      "packageName": "@tanstack/query",
      "packageRoot": "/path/to/project/node_modules/@tanstack/query",
      "packageVersion": "5.0.0",
      "packageSource": "local",
      "skillName": "fetching",
      "description": "Query data fetching patterns",
      "type": "skill (optional)",
      "framework": "react (optional)"
    }
  ],
  "packages": [
    {
      "name": "@tanstack/query",
      "version": "5.0.0",
      "source": "local",
      "packageRoot": "/path/to/project/node_modules/@tanstack/query",
      "skillCount": 1
    }
  ],
  "hiddenSourceCount": 1,
  "hiddenSources": [
    {
      "name": "hidden-package",
      "skillCount": 1
    }
  ],
  "warnings": ["string"],
  "conflicts": [
    {
      "packageName": "string",
      "chosen": {
        "version": "string",
        "packageRoot": "string"
      },
      "variants": [
        {
          "version": "string",
          "packageRoot": "string"
        }
      ]
    }
  ]
}
```

When the same package exists both locally and globally and global scanning is enabled, `intent list` prefers the local package.
When project `node_modules` exists, `intent list` scans it. In Yarn PnP projects without usable `node_modules`, `intent list` uses Yarn's PnP API.

### Allowlist

`package.json#intent.skills` is the allowlist that decides which discovered packages are surfaced. Only listed packages contribute skills.

```json
{
  "intent": {
    "skills": ["@tanstack/query", "workspace:@scope/internal"]
  }
}
```

Each entry is one source:

- `@scope/pkg` or `pkg`: an npm package reachable through the dependency tree.
- `workspace:@scope/pkg`: a package in the current workspace.
- `@scope/*` or `workspace:@scope/*`: every discovered package of that kind whose name matches the pattern.
- `git:<host>/<repo>#<ref>`: reserved, and not yet supported.

The list as a whole has three special forms:

- **Absent** (no `intent.skills` key): every discovered package is surfaced, with a deprecation notice printed to stderr on each run until you set `intent.skills`. This is the upgrade path for existing projects. A future version will require an explicit allowlist.
- **Empty** (`"skills": []`): no package is surfaced, with an info notice printed to stderr.
- **Wildcard** (`"skills": ["*"]`): every discovered package is surfaced, with an acknowledged-risk notice printed to stderr. This exact trust-all entry is distinct from a scoped package pattern such as `@tanstack/*`.

A package that ships skills but is not listed or matched by a pattern is dropped. When packages are dropped this way, Intent prints one policy notice naming them so you can opt in. In agent sessions, hidden sources are reported by count only; run `intent list --show-hidden` outside the agent session to review candidates. An exact entry or pattern that matches no discovered package is reported as well. Package patterns support `*` wildcards. Matching uses both package name and source kind. See [Configuration](./trust-configuration.md#source-intent-docs-concepts-configuration-md) and [Trust model](./trust-configuration.md#source-intent-docs-concepts-trust-model-md).

### Excludes

Package excludes are hard filters for packages that should not be used in a repo, applied after the allowlist.
Intent reads `intent.exclude` arrays from package.json files while walking from the workspace or project root to the current working directory.
Manage persistent excludes with `intent exclude add|remove|list`.

```json
{
  "intent": {
    "exclude": ["@tanstack/*devtools*", "@tanstack/router#experimental-*"]
  }
}
```

A pattern without `#` excludes a whole package. A pattern with `#` excludes a single skill (`@scope/pkg#search-params`), and the skill segment may itself be a glob (`@scope/pkg#experimental-*`). A pattern may cross package boundaries at skill granularity (`*#experimental-*`). The `#*` shortcut (`@scope/pkg#*`) excludes the whole package. Only exact names and `*` wildcards are supported on each segment. Bare package-name patterns keep working unchanged.

An excluded package never triggers the unlisted-source notice, because an exclude is an explicit decision rather than an oversight.

### Common errors

- Scanner failures are printed as errors
- Deno projects without `node_modules` are unsupported

<a id="source-intent-docs-cli-intent-load-md"></a>

## Intent Load

Source: `intent:docs/cli/intent-load.md`.

`intent load` loads a compact skill identity from the current install and prints the matching `SKILL.md` content.

```bash
npx @tanstack/intent@latest load <package>#<skill> [--path] [--json] [--debug] [--global] [--global-only]
```

### Options

- `--path`: print the resolved skill path instead of the file content
- `--json`: print structured JSON with metadata and content
- `--debug`: print resolution debug details to stderr
- `--global`: load from project packages first, then global packages
- `--global-only`: load from global packages only

### What you get

#### Resolution

- Validates `<package>#<skill>` before scanning
- Scans project-local packages by default
- Includes global packages only when `--global` or `--global-only` is passed
- Checks the target package name against `package.json#intent.skills` before resolution, then enforces its source kind after resolution
- Refuses before scanning when the target package or skill matches `intent.exclude`

#### Selection

- Prefers local packages when `--global` is used and the same package exists locally and globally
- Accepts an unambiguous short skill name when a package-prefixed skill exists

#### Output

- Prints raw `SKILL.md` content by default
- Prints the scanner-reported path when `--path` is passed
- Prints debug details to stderr when `--debug` is passed

A successful load proves that Intent resolved the selected skill under current policy and returned its content. It does not prove that the skill was relevant to the task, reached an agent's active context, or was followed correctly. See [Lifecycle boundaries](./trust-configuration.md#source-intent-docs-concepts-trust-model-md).

The package can be scoped or unscoped. The skill can include slash-separated sub-skill names.

Examples:

```bash
npx @tanstack/intent@latest load @tanstack/query#fetching
npx @tanstack/intent@latest load @tanstack/query#core/fetching
npx @tanstack/intent@latest load @tanstack/router-core#auth-and-guards
npx @tanstack/intent@latest load some-lib#core --path
```

### JSON output

`--json` prints:

```json
{
  "package": "@tanstack/query",
  "skill": "fetching",
  "path": "node_modules/@tanstack/query/skills/fetching/SKILL.md",
  "packageRoot": "node_modules/@tanstack/query",
  "source": "local",
  "version": "5.0.0",
  "content": "---\nname: fetching\n---\n\n...",
  "warnings": []
}
```

### Common errors

#### Invalid skill identity

- Missing separator: `Invalid skill use "@tanstack/query": expected <package>#<skill>.`
- Empty package: `Invalid skill use "#core": package is required.`
- Empty skill: `Invalid skill use "@tanstack/query#": skill is required.`

#### Resolution failures

- Missing package: `Cannot resolve skill use "...": package "..." was not found.`
- Missing skill: `Cannot resolve skill use "...": skill "..." was not found in package "...".`
- Skill suggestion: `Did you mean @tanstack/router-core#router-core/auth-and-guards?`

#### Policy refusals

- Unlisted package: `Cannot load skill use "...": package "..." is not listed in intent.skills.`
- Excluded package: `Cannot load skill use "...": package "..." is excluded by Intent configuration.`
- Excluded skill: `Cannot load skill use "...": skill "..." is excluded by Intent configuration.`

### Related

- [intent list](./consumer-workflow.md#source-intent-docs-cli-intent-list-md)
- [intent install](./consumer-workflow.md#source-intent-docs-cli-intent-install-md)
- [Trust model](./trust-configuration.md#source-intent-docs-concepts-trust-model-md)
- [Configuration](./trust-configuration.md#source-intent-docs-concepts-configuration-md)

<a id="source-intent-docs-getting-started-quick-start-consumers-md"></a>

## Quick Start Consumers

Source: `intent:docs/getting-started/quick-start-consumers.md`.

### 1. Run install

```bash
npx @tanstack/intent@latest install
```

This command creates or updates skill-loading guidance for your agent.

Examples use `npx` for npm projects. In pnpm, Yarn, or Bun projects, use the matching runner: `pnpm dlx`, `yarn dlx`, or `bunx`.

The command:

1. Checks for existing `intent-skills` guidance in your config files (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, etc.)
2. Writes lightweight instructions for skill discovery and loading
3. Preserves content outside the managed block
4. Verifies the managed block before reporting success

If an `intent-skills` block already exists, Intent updates that file in place.
If no block exists, `AGENTS.md` is the default target.

Intent creates guidance like:

```markdown
<!-- intent-skills:start -->
## Skill Loading

Before editing files for a substantial task:
- Run `pnpm dlx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm dlx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->
```

Intent detects the package manager when generating this block, so the runner may be `npx`, `pnpm dlx`, `yarn dlx`, or `bunx`.

To enforce loading guidance before edits in supported agents, opt in to hooks:

```bash
npx @tanstack/intent@latest hooks install
```

Project-scoped hooks are installed for Claude Code and Codex. `intent install` can write project guidance to `.github/copilot-instructions.md`, but GitHub Copilot CLI hook enforcement is user-scoped, so configure it explicitly:

```bash
npx @tanstack/intent@latest hooks install --scope user --agents copilot
```

Cursor and generic `AGENTS.md` agents use the guidance block only.

Hooks return the available Intent skill catalog as context for supported agent sessions and keep the edit gate active until they observe a supported `intent load` command.

Hooks do not verify that:

- The command succeeded.
- The skill matched the task.
- The agent applied the guidance.

To control what appears in the session catalog, configure `intent.skills` and `intent.exclude` in `package.json`.

### 2. Choose which packages' skills to use

`package.json#intent.skills` is an allowlist of the packages whose skills you want surfaced.

```json
{
  "intent": {
    "skills": ["@tanstack/*"]
  }
}
```

List the packages or `*` package patterns you trust. Intent then surfaces skills from matching packages and leaves the rest out. See the [source entries](./trust-configuration.md#source-intent-docs-concepts-configuration-md) in Configuration for the forms an entry can take, and [Trust model](./trust-configuration.md#source-intent-docs-concepts-trust-model-md) for why the allowlist exists.

### 3. Use skills in your workflow

Load a skill when it matches the task:

```bash
npx @tanstack/intent@latest load @tanstack/react-query#core
```

This prints the skill content for the installed package version.

Intent cannot guarantee that an agent selected the correct skill or followed its guidance. See [Lifecycle boundaries](./trust-configuration.md#source-intent-docs-concepts-trust-model-md).

If you want explicit task-to-skill mappings in your agent config, opt in:

```bash
npx @tanstack/intent@latest install --map
```

### 4. Keep skills up-to-date

```bash
npm update @tanstack/react-query
```

Skills version with library releases. Updating a library also updates its packaged skills, so the skill version matches the installed code. If a package is installed both locally and globally and global scanning is enabled, Intent prefers the local version.

List the installed skills:

```bash
npx @tanstack/intent@latest list
```

Use `--json` for machine-readable output:

```bash
npx @tanstack/intent@latest list --json
```

Global package scanning is opt-in:

```bash
npx @tanstack/intent@latest list --global
```

You can also check if any skills reference outdated source documentation:

```bash
npx @tanstack/intent@latest stale
```
