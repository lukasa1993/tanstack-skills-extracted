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

`intent install` confirms skill-source permissions on first use, then creates or updates an `intent-skills` guidance block in a project guidance file.

```bash
npx @tanstack/intent@latest install [--map] [--dry-run] [--print-prompt] [--global] [--global-only] [--no-notices]
```

### Options

#### Permission review

- `--review`: review current skill permissions interactively, then update guidance

#### Guidance output

- `--map`: write explicit task-to-skill mappings instead of lightweight loading guidance
- `--dry-run`: print the generated block without writing files
- `--print-prompt`: print the agent setup prompt instead of writing files

#### Mapping scan scope

- `--global`: include global packages after project packages when `--map` is passed
- `--global-only`: install mappings from global packages only when `--map` is passed
- `--no-notices`: suppress non-critical notices on stderr

### Behavior

#### Default install

If `intent.skills` is already configured, including through workspace inheritance, `install` only updates guidance. It does not prompt or change `package.json`. Run `intent install --review` to change permissions.

Otherwise, first-run setup requires an interactive terminal. Non-TTY execution fails before discovery or writes. Node.js 20.12.0 or newer is required.

##### First-run flow

1. **Choose what to enable.** Pick **Enable all**, **Choose packages or scopes**, or **Choose individual skills**. Package and skill lists support search.
2. **Confirm once.** Check the current skill count, saved rules, and destination file. Choose **Continue with all selected skills** to save, **Review individual skills** to inspect specific packages, or **Cancel**. Cancel is selected by default.
3. **Finish** with verified guidance, available skill and package counts, and a command to list those skills.

Descriptions, exclusions, and information about skill updates are optional choices on the setup screen.

##### What gets enabled

| Choice | Saved rule | Includes future additions? |
| --- | --- | --- |
| Enable all | `"*"` | All npm and workspace sources. |
| A package | `"@tanstack/ai"` | New skills in that package. |
| A whole scope | `"@tanstack/*"` | New npm packages and skills in that scope. |
| An individual skill | `"@tanstack/ai#skill"` | Only that skill name. |

Workspace choices use the `workspace:` prefix. Scope rules are saved only when explicitly selected; choosing several packages does not grant access to the whole scope.

**Review individual skills** lists only packages covered by your selection. Choose the packages you want to review, or leave the list empty to continue with all selected skills. Each chosen package opens its own skill list; other packages keep their selection. Unchecking a skill covered by a package, scope, or all-sources rule keeps the broad rule and adds that skill to `intent.exclude`. Existing exclusions always win and cannot be enabled through the picker.

Skill instructions can change when dependencies update. Enabling access does not freeze content or record approval of specific instructions. Update notifications are not available yet.

Selecting nothing requires explicit confirmation before writing `[]` to disable all skills. Unchecking every current skill under a broad rule excludes those skills; the rule still covers future additions.

##### Files and retry behavior

Permissions go in the nearest owning `package.json`. Inside a workspace package, this is that package's file. The update preserves formatting and uses an atomic replacement; if the file changes after preview, Intent stops and asks you to retry.

After permissions are saved, Intent updates an existing managed guidance block in a supported config file, or creates one in `AGENTS.md`. Content outside the block is preserved, and the block is verified before success is reported.

- **No skills found, or all excluded:** explains how to retry and writes nothing. Empty discovery does not create a deny-all policy.
- **Decline or cancel a prompt:** writes neither permissions nor guidance.
- **`--dry-run`:** performs discovery and selection, previews permissions and guidance, and writes neither file.


#### Review existing permissions

```bash
npx @tanstack/intent@latest install --review
```

Review starts from the current `intent.skills` rules. Continue with them, add packages/scopes/individual skills, remove explicit rules, or review individual skills within enabled packages. Existing rules stay intact unless you change them, including rules for packages or skills that are **not discovered**. Removing a rule requires unchecking it; Intent never removes it automatically.

**Inspect access and descriptions** shows whether each current candidate is permitted by a matching rule or blocked by the allowlist or `intent.exclude`. Searchable lists show at most six options at a time; descriptions appear on request. Package and scope rules continue to cover future matching skills. Adding a skill already covered by an existing rule does not add a redundant permission.

Unchecking a skill covered by a broader rule adds an exclusion. Existing exclusions stay in effect and cannot be removed through this picker; use [`intent exclude`](./consumer-workflow.md#source-intent-docs-cli-intent-exclude-md) from the directory containing the exclusion to remove one.

The confirmation previews the destination, additions, removals, and new exclusions. Choose **Show exact proposed configuration** in the review menu for complete arrays. Canceling writes neither permissions nor guidance. `--review --dry-run` walks through review and prints the preview without saving either file.

In a workspace, inherited permissions are the starting selection. If you change them, confirmation creates an override in the nearest owning `package.json`; it does not edit the ancestor. Continuing unchanged preserves inheritance. Inherited exclusions still apply. If a policy manifest changes during review, the command stops and asks you to retry.

Review requires a terminal and cannot be combined with `--map`, `--print-prompt`, `--global`, or `--global-only`. With no effective policy, `--review` opens first-run setup. Plain `install` retains its guidance-only behavior for configured projects.

Review scans local candidates once and reuses that result throughout the prompts and completion counts. It compares current permissions with proposed edits. It does **not** detect newly discovered skills relative to an earlier run, content changes, hashes, or delivery drift. Permissions and guidance results are reported separately; a guidance failure after saving does not undo confirmed permissions.

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
| Permissions updated | `Permissions: updated package.json.` |
| Permissions canceled | `Permissions: canceled.` |
| Guidance result after setup | `Guidance: created AGENTS.md.` |
| Guidance failure after setup | `Guidance: failed: <error>` |
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

`intent list` discovers skill-enabled packages and shows the skills available under the project's permissions and exclusions. It does not change permissions or write guidance.

```bash
npx @tanstack/intent@latest list [--json] [--debug] [--global] [--global-only] [--show-hidden] [--no-notices]
```

### Options

#### Output

- `--json`: print structured skills, packages, and diagnostics instead of text output
- `--debug`: print discovery details to stderr, including scan counts and package.json reads
- `--show-hidden`: include a hidden-source summary in text output when run outside an agent session
- `--no-notices`: suppress non-critical notices in text mode; the notice for `intent.skills: ["*"]` remains visible

#### Scan scope

- `--global`: include global packages after project packages
- `--global-only`: list global packages only

### Behavior

#### Default list

Intent scans project and workspace dependencies, applies `package.json#intent.skills`, then removes packages and skills matched by `intent.exclude`. It uses project `node_modules` when available and Yarn's PnP API in PnP projects without usable `node_modules`.

Global packages are scanned only with `--global` or `--global-only`. When both local and global copies of a package are found, the local copy takes precedence. Version conflicts show the chosen package and other discovered versions and paths.

Run [intent install](./consumer-workflow.md#source-intent-docs-cli-intent-install-md) to configure permissions on first use. Listing skills does not open the install picker.

#### Which skills appear

The nearest configured `intent.skills` list applies, including inherited workspace permissions. Each entry enables a package, a package pattern, or one exact skill:

| Saved rule | Skills included | Includes future additions? |
| --- | --- | --- |
| `"*"` | All discovered npm and workspace sources. | All packages and skills. |
| `"@tanstack/query"` | All skills in that npm package. | New skills in the package. |
| `"@tanstack/*"` | All skills in matching npm packages. | New matching packages and skills. |
| `"@tanstack/query#fetching"` | The `fetching` skill in that package. | Only that skill name. |
| `"workspace:@scope/internal"` | All skills in that workspace package. | New skills in the package. |

Workspace patterns and individual skills also use the `workspace:` prefix, such as `workspace:@scope/*` and `workspace:@scope/internal#testing`. Package patterns support `*`; individual-skill entries require an exact package and skill name. Git sources are not supported.

- **No configured list:** all discovered sources appear, with a migration notice. This is the existing-project upgrade path; a future version will require explicit permissions.
- **An empty list (`[]`):** no sources are permitted, with an informational notice.
- **All sources (`["*"]`):** all discovered sources appear, with a notice that unvetted skills may enter agent guidance.

Permissions select sources and skill names. They do not freeze skill content when dependencies update. See [Configuration](./trust-configuration.md#source-intent-docs-concepts-configuration-md) and [Trust model](./trust-configuration.md#source-intent-docs-concepts-trust-model-md).

#### Exclusions

`intent.exclude` takes precedence over permissions. Intent combines exclusions from package.json files between the workspace or project root and the current directory.

| Exclusion | Effect |
| --- | --- |
| `@tanstack/*devtools*` | Excludes matching packages. |
| `@tanstack/query#experimental-*` | Excludes matching skills in that package. |
| `*#experimental-*` | Excludes matching skills across packages. |
| `@tanstack/query#*` | Excludes the whole package. |

Only exact names and `*` wildcards are supported. Excluded packages do not trigger unlisted-source notices. Manage exclusions with [intent exclude](./consumer-workflow.md#source-intent-docs-cli-intent-exclude-md).

#### Hidden sources

Packages outside an explicit allowlist are omitted from the available catalog. In a human session, a policy notice names them; `--show-hidden` adds their names and skill counts to the text output. This does not enable them.

In agent sessions, hidden sources are reported by count only. `--show-hidden` cannot reveal their identities there; run it outside the agent session to review candidates. A configured package or package pattern that was not discovered also produces a notice.

### Default output

Text output includes:

- A summary with package and skill counts.
- A package table with `PACKAGE`, `SOURCE`, `VERSION`, and `SKILLS` columns.
- A skill tree grouped by package, with descriptions and commands to load each skill.
- Version conflicts and discovery warnings, when present.

Load commands use the detected package manager and preserve the selected global scan scope. `SOURCE` distinguishes local discovery from explicit global scanning.

Text output and discovery warnings go to stdout. Policy notices and `--debug` details go to stderr.

### JSON output

`--json` prints a structured catalog to stdout. This example shows one available skill with no hidden sources or diagnostics; paths and package metadata vary by project:

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
      "type": "core",
      "framework": "react"
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
  "hiddenSourceCount": 0,
  "hiddenSources": [],
  "warnings": [],
  "notices": [],
  "conflicts": []
}
```

| Field | Meaning |
| --- | --- |
| `skills` | Available skills. `use` is the portable `<package>#<skill>` identity; `type` and `framework` are optional. |
| `packages` | Selected packages, their source and location, and permitted skill counts. |
| `hiddenSourceCount` | Number of packages hidden by the explicit allowlist. |
| `hiddenSources` | Objects with `name` and `skillCount` in human sessions, even without `--show-hidden`. Always empty in agent sessions. |
| `warnings` | Discovery warnings. |
| `notices` | Policy and migration notices. `--no-notices` does not remove these from JSON. |
| `conflicts` | Objects with `packageName`, `chosen`, and `variants`. Each chosen or variant entry contains `version` and `packageRoot`. |

JSON includes diagnostics in the object instead of printing separate warning or notice blocks. `--debug` still writes to stderr. Treat identifiers as data when constructing commands; JSON does not contain shell-escaped arguments.

### Status messages

| Result | Message or behavior |
| --- | --- |
| No selected packages | `No intent-enabled packages found.` |
| Available catalog | `<package count> intent-enabled packages, <skill count> skills` followed by the table and tree. |
| Version conflicts | `Version conflicts:` followed by the chosen version and other discovered locations. |
| Hidden-source review | `Hidden skill sources:` followed by names and skill counts in a human session. |
| Hidden-source review in an agent session | `Hidden skill sources are not revealed in agent sessions. Run this command outside the agent session to review candidates.` |
| Discovery warnings | `Warnings:` followed by `⚠` messages on stdout in text mode. |
| Policy notices | `Notices:` followed by `ℹ` messages on stderr in text mode. |

### Common errors

- **Invalid permissions or unreadable policy files:** Intent stops and reports the problem. Fix the reported package.json or `intent.skills` entry before retrying.
- **Unsupported runnable identifier:** generated commands accept only ASCII letters, numbers, `_`, `.`, `/`, `@`, `#`, and `-`. Identifiers cannot start with `#`; leading and trailing whitespace is rejected rather than trimmed. Rename the package or skill to generate runnable guidance. `--json` can still expose permitted identifiers as data.
- **Unreadable or out-of-package skill metadata:** discovery skips skill files whose real path cannot be resolved or lies outside the package root, with a warning. It checks the opened file's identity before reading and uses that descriptor for the full metadata read, including large frontmatter, so later pathname replacement cannot redirect the read. Symlinks within the resolved package root remain supported.
- **Deno without `node_modules`:** this discovery mode is unsupported.

### Related

- [intent install](./consumer-workflow.md#source-intent-docs-cli-intent-install-md)
- [intent load](./consumer-workflow.md#source-intent-docs-cli-intent-load-md)
- [intent exclude](./consumer-workflow.md#source-intent-docs-cli-intent-exclude-md)
- [Configuration](./trust-configuration.md#source-intent-docs-concepts-configuration-md)
- [Trust model](./trust-configuration.md#source-intent-docs-concepts-trust-model-md)

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

Run this in an interactive terminal. On first use, Intent helps you choose which installed packages and skills your agent may use, then creates or updates skill-loading guidance.

Examples use `npx` for npm projects. In pnpm, Yarn, or Bun projects, use the matching runner: `pnpm dlx`, `yarn dlx`, or `bunx`.

1. **Choose what to enable.** Pick **Enable all**, **Choose packages or scopes**, or **Choose individual skills**. Package and skill lists support search.
2. **Confirm and finish.** Check the saved rules and destination `package.json`. Choose **Continue with all selected skills** to save, or **Review individual skills** to pick which selected packages to inspect before confirming. Intent writes permissions and guidance, verifies the guidance, and shows a command to list available skills.

**Enable all** saves `"*"`. A package choice saves `"@tanstack/ai"`; a whole scope saves `"@tanstack/*"`. These rules include future matching skills. Individual choices use `"@tanstack/ai#skill"`. Unchecking a skill during review adds an exclusion while keeping its broad rule.

Skill instructions can change when dependencies update. Update notifications are not available yet. See **About skill access and updates** in the installer for details.

Selecting nothing requires explicit confirmation to disable all skills. If no skills are found, or all are excluded, Intent explains the next step and leaves permissions and guidance unchanged. Install a package that ships skills or review your exclusions, then run `install` again.

Canceling before confirmation writes neither file. `--dry-run` previews the flow without writing. First-run setup requires a terminal; noninteractive execution fails without writes when permissions have not been configured.

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

### 2. Review the saved permissions

`install` saves your choices in `package.json#intent.skills`, an allowlist of packages or individual skills. It uses the nearest `package.json` that owns the directory where you ran the command.

```json
{
  "intent": {
    "skills": ["@tanstack/react-query#core"]
  }
}
```

When permissions already exist, including inherited workspace permissions, `install` preserves them and only updates guidance. To change your choices, edit the owning `intent.skills` declaration. You can also use `*` package patterns such as `@tanstack/*`. Existing `intent.exclude` rules still take precedence. See the [source entries](./trust-configuration.md#source-intent-docs-concepts-configuration-md) in Configuration and the [Trust model](./trust-configuration.md#source-intent-docs-concepts-trust-model-md).

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
