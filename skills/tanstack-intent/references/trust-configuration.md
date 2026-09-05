# Trust, configuration, and registry

Trust boundaries, configuration, registry, and overview.

<a id="source-intent-docs-concepts-configuration-md"></a>

## Configuration

Source: `intent:docs/concepts/configuration.md`.

Configure Intent in the `intent` object in `package.json`:

- **`skills`** permits packages or individual skills.
- **`exclude`** blocks packages or skills after permissions are evaluated.

```json
{
  "intent": {
    "skills": [
      "@tanstack/query",
      "@acme/*",
      "@tanstack/start#routing",
      "workspace:@scope/internal"
    ],
    "exclude": ["@tanstack/router#experimental-*"]
  }
}
```

### Configuration inheritance

| Key | Inheritance rule |
| --- | --- |
| `intent.skills` | Uses the nearest non-null declaration between the current directory and the workspace or project root. A nearer declaration replaces its parent; omitted or null values inherit. |
| `intent.exclude` | Combines arrays from the root through the current directory, then adds excludes passed by the caller. |

### `intent.skills`

`intent.skills` is a package-source and skill allowlist. A permitted package or skill can:

- Appear in `list` and `stale`.
- Resolve through `load`.
- Contribute mappings to `install --map`.

Default `install` helps configure permissions on first use. See [Existing projects](#existing-projects) for how it handles saved or inherited configuration, and [Trust model](./trust-configuration.md#source-intent-docs-concepts-trust-model-md) for the trust boundaries.

Package selectors permit current and future skills in the package. Exact selectors use `<package>#<skill>` and permit only that skill. If both match, the package selector takes precedence. `intent.exclude` is applied afterward and can still block either choice.

#### Source entries

Each array entry names one source:

| Entry | Kind | Meaning |
| ----- | ---- | ------- |
| `@scope/pkg` or `pkg` | npm | An npm package reachable through the dependency tree, direct or transitive. |
| `@scope/pkg#skill` | npm | One exact skill in an npm package. |
| `workspace:@scope/pkg` | workspace | A package in the current workspace. |
| `workspace:@scope/pkg#skill` | workspace | One exact skill in a workspace package. |
| `@scope/*` | npm | Every discovered npm package whose name matches the pattern. |
| `workspace:@scope/*` | workspace | Every discovered workspace package whose name matches the pattern. |
| `git:<host>/<repo>#<ref>` | git | Reserved. Not yet supported, and rejected until a future version adds it. |

##### Validation rules

- Exact selectors require a non-empty package name and a non-empty skill name without wildcards.
- Package patterns support `*`, including scoped patterns such as `@tanstack/*`. Patterns cannot be combined with an exact skill selector.
- Source kinds must match: bare selectors permit npm sources; `workspace:` selectors permit workspace sources.
- `git:` entries are rejected, including entries containing `#` for a Git ref.

A malformed entry fails the whole command. Intent reports every bad entry at once.

#### Special forms

| Form | Result | Notice |
| --- | --- | --- |
| **Absent:** no effective `intent.skills` key | Discovery commands surface every discovered package as migration behavior. | Deprecation notice until you configure permissions. |
| **Empty:** `"skills": []` | Surfaces no packages. | Info notice on stderr. |
| **Wildcard:** `"skills": ["*"]` | Permits every discovered package across scopes and source kinds, broader than `@tanstack/*`. | Acknowledged-risk notice: unvetted skills may reach your agent. |

All policy notices go to stderr. Exclusions still apply to these forms.

##### Discovery notices

| Situation | Notice |
| --- | --- |
| Discovered package is not permitted | Human output names omitted packages in one notice. Agent sessions receive only hidden package and skill counts. |
| Configured package was not discovered | Reports that the package was not discovered. |
| Package was explicitly excluded | No unlisted-source notice. |

#### Existing projects

Run `intent list` to see which packages the current policy surfaces.

| Current configuration | Default `intent install` behavior |
| --- | --- |
| Saved or inherited `intent.skills` | Updates guidance only. Keeps permissions unchanged and does not prompt. |
| No effective `intent.skills` | Starts interactive permission setup. Non-TTY execution fails without writes. |

First-run setup offers **Enable all**, **Choose packages or scopes**, and **Choose individual skills**, followed by one confirmation before saving to the nearest owning `package.json` and installing guidance.

- **Compact rules:** Enable all saves `"*"`; package choices save names such as `"@tanstack/ai"`; explicit scope choices save patterns such as `"@tanstack/*"`. These rules include future matching skills and packages. Individual choices save exact names such as `"@tanstack/ai#skill"`.
- **Optional skill review:** choose **Review individual skills** at confirmation, then pick which selected packages to inspect. Leave the list empty to keep all selected skills. Only those packages open individual skill lists; unchecking a skill covered by a broad rule adds an exclusion. Existing and inherited exclusions stay in force.
- **Changing instructions:** access choices do not record approval of specific content. Skills can change with dependency updates; update notifications are not available yet.
- **Empty selection:** explicitly confirms disabling all skills with `[]`. Empty or fully excluded discovery writes nothing, so setup can be retried.

For example, enabling a scope and unchecking one skill saves:

```json
{
  "intent": {
    "skills": ["@tanstack/*"],
    "exclude": ["@tanstack/ai#skill"]
  }
}
```

This permits matching npm packages, including future additions, except the excluded skill. Selecting several packages individually never silently expands to a scope rule.

See [Default install](./consumer-workflow.md#source-intent-docs-cli-intent-install-md) for picker controls and cancellation behavior.

#### Suppressing notices temporarily

Use `--no-notices` to suppress non-critical notices on stderr for one run:

```bash
npx @tanstack/intent@latest list --no-notices
npx @tanstack/intent@latest install --map --no-notices
```

For CI or wrapper scripts, set `INTENT_NO_NOTICES=1` to suppress notices without changing command arguments.

Discovery and resolution warnings are separate from policy notices and are not suppressed by these options. The acknowledged-risk notice for `"skills": ["*"]` also remains visible when other notices are suppressed.

### `intent.exclude`

`intent.exclude` removes packages or individual skills after the allowlist resolves.

Use `intent exclude` to manage this list from the CLI:

```bash
npx @tanstack/intent@latest exclude add @tanstack/router#experimental-*
npx @tanstack/intent@latest exclude remove @tanstack/router#experimental-*
npx @tanstack/intent@latest exclude list
```

```json
{
  "intent": {
    "exclude": ["@tanstack/*devtools*", "@tanstack/router#experimental-*"]
  }
}
```

#### Exclusion patterns

| Pattern | Excludes |
| --- | --- |
| `@scope/pkg` | The whole package. |
| `@scope/pkg#search-params` | One named skill. |
| `@scope/pkg#experimental-*` | Matching skills in one package. |
| `*#experimental-*` | Matching skills across packages. |
| `@scope/pkg#*` | The whole package, using the `#*` shortcut. |

Each segment supports exact names and `*` wildcards only. Excludes apply to both npm and workspace sources with matching names, regardless of source kind.

<a id="source-intent-docs-concepts-trust-model-md"></a>

## Trust Model

Source: `intent:docs/concepts/trust-model.md`.

Skills contain instructions for an agent. Choosing which packages can supply those instructions is a trust decision, controlled by the `intent.skills` allowlist.

### Explicit sources

A package ships skills in a `skills/` directory. Discovery finds every installed package that has one, including transitive dependencies. Discovery does not grant trust.

When configured, `package.json#intent.skills` controls which discovered skills can surface through the CLI and agent integrations:

- **Package entries** enable skills from matching packages, including skills added later.
- **Exact skill entries** enable only the named skill; its instructions can still change.
- **Source kinds stay separate:** `foo` permits an npm source; `workspace:foo` permits a workspace source. Their wildcard patterns remain kind-specific. The exact `*` entry permits every discovered npm and workspace source.

Enabling a source does not record approval of its specific instructions. Skill content can change when dependencies update, and Intent does not yet track or notify you about those changes.

Trust does not propagate to dependencies. A dependency that ships skills needs its own matching entry. Intent omits unlisted packages and reports them so you can opt in or ignore them.

#### Projects without an allowlist

The gate is opt-in today. Without an effective `intent.skills` declaration, discovery commands still surface every discovered package and print a deprecation notice to stderr. A future version will require an explicit allowlist. See [Special forms](./trust-configuration.md#source-intent-docs-concepts-configuration-md).

Default `intent install` handles this state through interactive permission setup.

#### Invalid policy files

Intent stops policy-controlled listing, loading, and installation when a policy `package.json` cannot be read, contains invalid JSON, or is not a JSON object. The error names the file. Repair or restore that file, then retry the command.

This also applies while finding the workspace root: an unreadable or malformed ancestor `package.json` cannot be skipped, because it may contain inherited restrictions. Repair or restore the named manifest before retrying.

Workspace discovery checks ancestors up to the first workspace declaration or Git repository boundary (`.git` directory or worktree file), including that directory's manifest. It does not inspect manifests above that boundary. Without either boundary, an invalid ancestor stops discovery even if the nearest package is intended to be standalone; Intent cannot determine from an unreadable manifest whether it owns workspace policy. A nested Git repository is treated as a separate project.

### First-run permission review

When no effective policy exists, `intent install` follows this flow:

1. **Discover:** summarize npm and workspace skill counts. Descriptions and exclusions are available through optional inspection.
2. **Choose:** enable all sources, choose packages or scopes, or select individual skills. Package and scope selections stay compact and include future matching skills. A whole scope requires an explicit selection.
3. **Confirm once:** show the current skill count, saved rules, and destination file. Optional individual review opens skill lists only for the selected packages you choose to inspect. It can add exclusions while retaining broad rules; unreviewed packages keep their selection. Only affirmative confirmation saves permissions and exclusions atomically, then installs guidance. An empty selection explicitly confirms disabling all skills.

| Outcome | Files changed |
| --- | --- |
| No skills discovered, or all excluded | None. |
| Cancel any prompt | None. |
| Run first-time setup without a TTY | None; the command fails. |
| Save permissions, then fail to write or verify guidance | Confirmed permissions remain saved; the guidance failure is reported separately. |

The completion summary reports skills available under the saved policy. It does not prove that an agent loaded or applied them. See [Default install](./consumer-workflow.md#source-intent-docs-cli-intent-install-md) for picker controls and permission choices.

### Revisiting permissions

Run `intent install --review` to revisit current permissions. Existing decisions are retained until you confirm changes. The review can add permission rules, remove selected rules, and add individual exclusions under broader rules. Existing exclusions continue to win.

A review inside a workspace starts with inherited permissions. Confirmed edits create a local override; an unchanged review preserves inheritance. This reviews permission configuration, not whether skill content has changed. See [Review existing permissions](./consumer-workflow.md#source-intent-docs-cli-intent-install-md).

### Static discovery

Intent reads package data as files. It never imports, requires, or executes the code of a discovered package to find or load a skill. Adding a package to your dependency tree cannot run that package's code through Intent.

One exception is sanctioned: in Yarn Plug'n'Play projects, Intent loads Yarn's PnP runtime (`.pnp.cjs`) to map package identities to readable locations. It loads no package entry points, bins, lifecycle scripts, or other package-provided JavaScript. An ESLint rule enforces this invariant in the discovery code.

### Lifecycle boundaries

Intent uses six lifecycle stages in order. It can observe the first three and its side of delivery. Activation and application depend on agent behavior.

| State | Meaning | Observable by Intent |
| --- | --- | --- |
| **1. Available** | Intent discovered the skill from an installed or workspace package. | Yes. |
| **2. Permitted** | Project policy allows the package and skill to surface. `intent.exclude` can remove a package or skill after `intent.skills` permits its source. | Yes. |
| **3. Loaded** | A supported load path resolved the skill and returned its content. | Yes. |
| **4. Delivered** | Intent placed guidance where an agent integration can access it, such as a managed guidance block or session hook context. | Intent can confirm its output, not agent receipt. |
| **5. Activated** | The agent selected or received the skill for a particular task. | No. |
| **6. Applied** | The model followed the skill correctly. | No. |

A hook observing an `intent load` command does not prove that the command succeeded, that the skill was relevant, or that the model used its guidance.

### Unsupported sources

The `git:` source kind is reserved. Intent parses and validates the shape, then rejects it until a future version can pin the resolved ref and content hash. A git entry never loads silently.

<a id="source-intent-docs-overview-md"></a>

## Overview

Source: `intent:docs/overview.md`.

`@tanstack/intent` is a CLI for shipping and consuming Agent Skills as package artifacts.

Skills are markdown documents that teach AI coding agents how to use your library correctly. Intent versions them with your releases and ships them inside npm packages. It discovers skills from project and workspace dependencies, then provides commands and guidance for loading them.

### What Intent does

Intent provides tooling for two workflows:

**For consumers:**

- Discover skills from your project and workspace dependencies
- Control which packages' skills are surfaced with an allowlist
- Add lightweight skill loading guidance to your agent config
- Add session catalogs and edit gates for supported agents
- Use skills packaged with installed library versions

**For maintainers (library teams):**

- Scaffold skills through AI-assisted domain discovery
- Validate SKILL.md format and packaging
- Ship skills in the same release pipeline as code
- Review version, source, artifact, and package coverage signals

### How it works

#### Discovery and installation

Use the runner for your package manager:

| Tool | Pattern                                      |
| ---- | -------------------------------------------- |
| npm  | `npx @tanstack/intent@latest <command>`      |
| pnpm | `pnpm dlx @tanstack/intent@latest <command>` |
| Yarn | `yarn dlx @tanstack/intent@latest <command>` |
| Bun  | `bunx @tanstack/intent@latest <command>`     |

```bash
npx @tanstack/intent@latest list
```

Scans the current project's installed dependencies for intent-enabled packages, including `node_modules`, workspace dependencies, and Yarn PnP projects without `node_modules`. You can narrow which packages are surfaced with `package.json#intent.skills`. See the [Trust model](./trust-configuration.md#source-intent-docs-concepts-trust-model-md) and [Configuration](./trust-configuration.md#source-intent-docs-concepts-configuration-md) for how the allowlist works.
Global package scanning is explicit; pass `--global` to include global packages or `--global-only` to ignore local packages.
When both local and global packages are scanned, local packages take precedence.

```bash
npx @tanstack/intent@latest install
```

Creates or updates lightweight `intent-skills` guidance in your config files (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, etc.). Existing guidance is updated in place; otherwise `AGENTS.md` is the default target. Pass `--map` to opt in to explicit task-to-skill mappings.

```bash
npx @tanstack/intent@latest hooks install
```

Installs session catalogs and edit gates for supported agents. Project-scoped hooks are available for Claude Code and Codex. GitHub Copilot CLI project guidance can live in `.github/copilot-instructions.md`, while blocking hooks are user-scoped. Cursor and generic `AGENTS.md` agents use guidance only. See [intent hooks](./maintainer-workflow.md#source-intent-docs-cli-intent-hooks-md) for what hooks can observe.

```bash
npx @tanstack/intent@latest load @tanstack/query#fetching
```

Loads the matching `SKILL.md` content for the installed package version. Pass `--path` when you need the resolved skill file path for debugging.

#### Scaffolding and validation

```bash
npx @tanstack/intent@latest scaffold
```

Guides your agent through domain discovery, tree generation, and skill authoring with interactive maintainer interviews.

```bash
npx @tanstack/intent@latest validate
```

Enforces SKILL.md format rules and packaging requirements before publish.

#### Staleness tracking

```bash
npx @tanstack/intent@latest stale
```

Reports version drift and source, artifact, or package coverage signals that may require skill review.

<a id="source-intent-docs-registry-md"></a>

## Registry

Source: `intent:docs/registry.md`.

The [Agent Skills Registry](https://tanstack.com/intent/registry) automatically discovers and indexes npm packages that ship Agent Skills. There's no manual submission process — publish skills in your package and the registry picks them up.

### How discovery works

The registry periodically searches npm for packages with the `tanstack-intent` keyword. When it finds one, it downloads the tarball, extracts every `skills/**/SKILL.md` file, and indexes the contents. Each new version you publish gets indexed automatically.

### Ship skills in 4 steps

#### 1. Generate skills

Tell your AI coding agent to run:

```bash
npx @tanstack/intent@latest scaffold
```

This walks the agent through domain discovery, skill tree generation, and skill creation. You review at each stage. Skills land in a `skills/` directory at your package root — each as a `SKILL.md` file in its own subdirectory.

#### 2. Validate

```bash
npx @tanstack/intent@latest validate
```

Catches structural issues, missing frontmatter, and broken source references before you publish.

#### 3. Add the keyword

Add `"tanstack-intent"` to the `keywords` array in your `package.json`:

```json
{
  "keywords": ["tanstack-intent"]
}
```

This is how the registry finds your package on npm.

#### 4. Publish

```bash
npm publish
```

The registry discovers your package on its next sync cycle. Your skills, version history, and download stats appear on the registry automatically.

### Keeping skills current

Skills derived from docs drift when docs change. Two commands keep them honest:

```bash
npx @tanstack/intent@latest stale
```

Flags skills whose source docs have changed since the skill was last updated.

```bash
npx @tanstack/intent@latest setup
```

Copies CI workflow templates into your repo so validation and staleness checks run in GitHub Actions. Catch drift before it ships.

### Requesting a library

If you use a library that doesn't ship skills yet, the best path is to open an issue on that library's repo pointing them here. The maintainer is the right person to author and own skills for their tool — they know the intent behind the API better than anyone.

You can also point them to the [Agent Skills spec](https://agentskills.io) and the [TanStack Intent overview](https://tanstack.com/intent/latest/docs/overview) for context.
