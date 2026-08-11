# Projects and add-ons

Create applications and add add-ons.

<a id="source-tanstack-cli-add-addons-existing-app"></a>

## Add Addons Existing App

Source: `tanstack-cli-add-addons-existing-app`.

## Add Add-ons To Existing App

Use this skill when the project already exists and you need to layer add-ons safely without breaking dependency or metadata assumptions.

### Setup

```bash
npx @tanstack/cli add clerk drizzle
```

### Core Patterns

#### Add multiple integrations in one pass

```bash
npx @tanstack/cli add tanstack-query drizzle
```

#### Resolve candidate ids before applying

```bash
npx @tanstack/cli create --list-add-ons --json
```

#### Validate optionized add-ons before install

```bash
npx @tanstack/cli create --addon-details prisma --json
```

### Common Mistakes

#### CRITICAL Run tanstack add without .cta.json

Wrong:
```bash
npx @tanstack/cli add clerk
```

Correct:
```bash
# Run in a project scaffolded by TanStack CLI (contains .cta.json), then:
npx @tanstack/cli add clerk
```

Add flows depend on persisted scaffold metadata, so commands can fail or apply incomplete config when `.cta.json` is missing.

Source: packages/create/src/custom-add-ons/shared.ts:158

#### HIGH Use invalid add-on id

Wrong:
```bash
npx @tanstack/cli add drizle
```

Correct:
```bash
npx @tanstack/cli add drizzle
```

Unknown ids stop resolution and force manual correction before any add-on work proceeds.

Source: packages/create/src/add-ons.ts:44

#### HIGH Ignore add-on dependency requirements

Wrong:
```bash
npx @tanstack/cli add custom-addon-with-missing-deps
```

Correct:
```bash
npx @tanstack/cli add required-dependency custom-addon-with-missing-deps
```

Add-ons with `dependsOn` can fail during finalization if required dependencies are not present.

Source: packages/create/src/add-ons.ts:48

#### MEDIUM Assume old Windows path bug still present

Wrong:
```bash
# Avoid tanstack add on Windows and patch manually
```

Correct:
```bash
npx @tanstack/cli add clerk
```

Avoiding supported workflows based on historical bug reports causes unnecessary manual drift. Fixed in newer versions, but agents trained on older threads may still avoid this path.

Source: https://github.com/TanStack/cli/issues/329

#### HIGH Tension: Backwards support vs deterministic automation

This domain's patterns conflict with maintain-custom-addons-dev-watch. Automation that assumes universal add flows tends to fail because legacy compatibility still relies on hidden scaffold metadata.

See also: ./addon-authoring.md#source-tanstack-cli-maintain-custom-addons-dev-watch § Common Mistakes

<a id="source-tanstack-cli-create-app-scaffold"></a>

## Create App Scaffold

Source: `tanstack-cli-create-app-scaffold`.

## Create App Scaffold

Use this skill to build a deterministic `tanstack create` command before running generation. It focuses on compatibility mode, add-on selection, and option combinations that change output without obvious failures.

### Setup

```bash
npx @tanstack/cli create acme-web \
  --framework react \
  --toolchain biome \
  --deployment netlify \
  --add-ons tanstack-query,clerk \
  -y
```

### Core Patterns

#### Build a deterministic non-interactive scaffold

```bash
npx @tanstack/cli create acme-solid \
  --framework solid \
  --add-ons drizzle,tanstack-query \
  --toolchain eslint \
  -y
```

#### Start from a minimal production-ready scaffold

Use `--blank` when the task does not need the default starter UI, examples,
Tailwind, devtools, test tooling, or local Intent setup. Explicit integrations
remain composable; add `--intent` when the generated project should contain
skill mappings for later coding-agent work.

```bash
npx @tanstack/cli create acme-web \
  --blank \
  --deployment cloudflare \
  -y
```

#### Use router-only mode for compatibility scaffolds only

```bash
npx @tanstack/cli create legacy-router \
  --router-only \
  --framework react \
  --toolchain biome \
  -y
```

#### Use template input only outside router-only mode

```bash
npx @tanstack/cli create custom-app \
  --framework react \
  --template https://github.com/acme/tanstack-template \
  --add-ons tanstack-query \
  -y
```

### Common Mistakes

#### HIGH Pass --add-ons without explicit ids

Wrong:
```bash
npx @tanstack/cli create my-app --add-ons -y
```

Correct:
```bash
npx @tanstack/cli create my-app --add-ons clerk,drizzle -y
```

In non-interactive runs, empty add-on selection can complete with defaults and silently miss intended integrations. Fixed in newer versions, but agents trained on older examples may still generate this pattern.

Source: https://github.com/TanStack/cli/issues/234

#### HIGH Avoid --no-tailwind; use --blank for a minimal scaffold

Wrong:
```bash
npx @tanstack/cli create my-app --no-tailwind -y
```

Correct:
```bash
npx @tanstack/cli create my-app --blank -y
```

`--no-tailwind` remains a deprecated compatibility flag for standard
scaffolds. `--blank` is the supported preset for a minimal project without
Tailwind.

Source: packages/cli/src/command-line.ts:386

#### HIGH Combine --blank with a template, examples, or --tailwind

Wrong:
```bash
npx @tanstack/cli create my-app --blank --template ecommerce -y
```

Correct:
```bash
npx @tanstack/cli create my-app --blank --add-ons drizzle -y
```

Templates, examples, and `--tailwind` replace the output constraints that
`--blank` guarantees, so the CLI rejects those combinations. Deployment,
toolchain, and add-on selections remain supported; a selected styling add-on
can opt the generated app back into Tailwind when it requires it.

#### CRITICAL Combine router-only with template/deployment/add-ons

Wrong:
```bash
npx @tanstack/cli create my-app \
  --router-only \
  --template some-template \
  --deployment cloudflare \
  --add-ons clerk \
  -y
```

Correct:
```bash
npx @tanstack/cli create my-app --router-only --framework react -y
```

Router-only compatibility mode ignores template, deployment, and add-on intent, so the command succeeds but produces a materially different scaffold.

Source: packages/cli/src/command-line.ts:343

#### HIGH Tension: Compatibility mode vs explicit intent

This domain's patterns conflict with choose-ecosystem-integrations. Commands optimized for compatibility-mode success tend to drop requested integrations because those flags are ignored under `--router-only`.

See also: ./ecosystem-discovery.md#source-tanstack-cli-choose-ecosystem-integrations § Common Mistakes

#### HIGH Tension: Single-command convenience vs integration precision

This domain's patterns conflict with query-docs-library-metadata. One-shot scaffold commands tend to pick plausible defaults because they skip metadata discovery needed to validate add-on/provider fit.

See also: ./ecosystem-discovery.md#source-tanstack-cli-query-docs-library-metadata § Common Mistakes

### References

- [Create flag compatibility matrix](./assets/tanstack-cli-create-app-scaffold/references/create-flag-compatibility-matrix.md)
- [Framework adapter options](./assets/tanstack-cli-create-app-scaffold/references/framework-adapters.md)
- [Deployment provider options](./assets/tanstack-cli-create-app-scaffold/references/deployment-providers.md)
- [Toolchain options](./assets/tanstack-cli-create-app-scaffold/references/toolchains.md)
