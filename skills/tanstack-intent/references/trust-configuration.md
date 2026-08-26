# Trust, configuration, and registry

Trust boundaries, configuration, registry, and overview.

<a id="source-intent-docs-concepts-configuration-md"></a>

## Configuration

Source: `intent:docs/concepts/configuration.md`.

Intent reads consumer configuration from the `intent` object in `package.json`. Two keys control which discovered skills Intent surfaces: `skills` (the allowlist) and `exclude` (the blocklist).

```json
{
  "intent": {
    "skills": ["@tanstack/query", "workspace:@scope/internal"],
    "exclude": ["@tanstack/router#experimental-*"]
  }
}
```

### Configuration inheritance

- **`intent.skills`:** Intent uses the nearest non-null declaration between the current working directory and the workspace or project root. A nearer declaration replaces its parent. An omitted or null value inherits the nearest parent declaration.
- **`intent.exclude`:** Intent combines arrays from the root through the current working directory, then adds excludes passed by the caller.

### `intent.skills`

`intent.skills` is a package-source allowlist. A permitted package can:

- Appear in `list` and `stale`.
- Resolve through `load`.
- Contribute mappings to `install --map`.

The default `install` command writes generic loading guidance without scanning packages. See [Trust model](./trust-configuration.md#source-intent-docs-concepts-trust-model-md) for the reasoning and lifecycle boundaries.

The allowlist permits packages, not individual skills. An entry containing `#` is invalid; use `intent.exclude` for skill-specific filtering.

#### Source entries

Each array entry names one source:

| Entry | Kind | Meaning |
| ----- | ---- | ------- |
| `@scope/pkg` or `pkg` | npm | An npm package reachable through the dependency tree, direct or transitive. |
| `workspace:@scope/pkg` | workspace | A package in the current workspace. |
| `@scope/*` | npm | Every discovered npm package whose name matches the pattern. |
| `workspace:@scope/*` | workspace | Every discovered workspace package whose name matches the pattern. |
| `git:<host>/<repo>#<ref>` | git | Reserved. Not yet supported, and rejected until a future version adds it. |

A malformed entry fails the whole command, and every bad entry is reported at once. Package patterns support `*` wildcards, including scoped patterns such as `@tanstack/*`. Intent matches both the package name and source kind: a bare entry permits only an npm source, and a `workspace:` entry permits only a workspace source.

#### Special forms

| Form | Result | Notice |
| --- | --- | --- |
| **Absent:** no `intent.skills` key | Surfaces every discovered package as an upgrade path for existing projects. A future version will require an explicit allowlist. | Deprecation notice on stderr on each run until you set `intent.skills`. |
| **Empty:** `"skills": []` | Surfaces no packages. | Info notice on stderr. |
| **Wildcard:** `"skills": ["*"]` | Surfaces every discovered package across package scopes and source kinds. This is broader than a pattern such as `@tanstack/*`. | Acknowledged-risk notice on stderr because unvetted skills may reach your agent. |

A package that ships skills but is not listed is dropped. In human output, Intent adds one policy notice naming packages dropped this way so you can opt in. Agent sessions receive only the hidden package and skill counts. A listed package that was not discovered is reported as a notice as well.

#### Existing projects

Run `intent list` to see which packages the current policy surfaces.

A project without `intent.skills` uses the absent form: Intent surfaces every discovered package and prints its deprecation notice. Add an allowlist to permit specific sources before a future version requires one.

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

Pattern grammar:

- A pattern without `#` excludes a whole package: `@scope/pkg`.
- A pattern with `#` excludes a single skill: `@scope/pkg#search-params`.
- The skill segment may be a glob: `@scope/pkg#experimental-*`.
- A pattern may cross package boundaries at skill granularity: `*#experimental-*`.
- The `#*` shortcut excludes the whole package: `@scope/pkg#*`.

Only exact names and `*` wildcards are supported on each segment. Excludes are source-kind agnostic, so a package pattern excludes matching npm and workspace sources. An excluded package does not trigger the unlisted-source notice, because an exclude is an explicit decision.

<a id="source-intent-docs-concepts-trust-model-md"></a>

## Trust Model

Source: `intent:docs/concepts/trust-model.md`.

Intent discovers skills from your dependencies and can surface permitted skills through its CLI and agent integrations. A skill is instructions an agent follows, so the set of packages allowed to contribute skills is a trust decision. Intent makes that decision explicit through the `intent.skills` allowlist.

### Explicit sources

A package ships skills in a `skills/` directory. Discovery finds every installed package that has one, including transitive dependencies. Discovery does not grant trust.

`package.json#intent.skills` is the gate. A discovered package contributes skills only when an exact entry or `*` pattern in the allowlist matches its package name and source kind. An unlisted package is dropped, and Intent reports it so you can opt in or ignore it.

The gate is opt-in today. A project with no `intent.skills` key still surfaces every discovered package, and Intent prints a deprecation notice to stderr on each run until you set `intent.skills`. A future version will require an explicit allowlist. See the [special forms](./trust-configuration.md#source-intent-docs-concepts-configuration-md) in Configuration.

Trust does not propagate. A listed package may depend on another package that ships skills, but that dependency stays unlisted unless another entry matches it. A bare entry such as `foo` permits an npm source, while `workspace:foo` permits a workspace source. Their wildcard forms remain kind-specific. The exact `*` entry permits every discovered npm and workspace source.

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
