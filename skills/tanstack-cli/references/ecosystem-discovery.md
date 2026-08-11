# Ecosystem and discovery

Choose integrations and query library metadata.

<a id="source-tanstack-cli-choose-ecosystem-integrations"></a>

## Choose Ecosystem Integrations

Source: `tanstack-cli-choose-ecosystem-integrations`.

This skill requires familiarity with scaffold and discovery workflows. Read `create-app-scaffold` and `query-docs-library-metadata` first.

## Choose Ecosystem Integrations

Use this skill at the seam between user requirements and valid CLI integration choices.

### Setup

```bash
npx @tanstack/cli ecosystem --json
npx @tanstack/cli create --list-add-ons --json
```

### Core Patterns

#### Map partner intent to add-on ids explicitly

```bash
npx @tanstack/cli ecosystem --category database --json
npx @tanstack/cli create --list-add-ons --json
```

#### Inspect option surfaces before final provider choice

```bash
npx @tanstack/cli create --addon-details drizzle --json
npx @tanstack/cli create --addon-details prisma --json
```

#### Enforce one choice per exclusive category

```bash
npx @tanstack/cli create my-app \
  --framework react \
  --add-ons clerk,drizzle \
  --deployment cloudflare \
  -y
```

### Common Mistakes

#### HIGH Treat ecosystem partner id as add-on id

Wrong:
```bash
npx @tanstack/cli add <partner-id-from-ecosystem>
```

Correct:
```bash
npx @tanstack/cli ecosystem --json
npx @tanstack/cli create --list-add-ons --json
npx @tanstack/cli add <mapped-addon-id>
```

`ecosystem` includes partners that are not directly installable add-ons, so direct reuse of partner ids can fail late in add/apply flows.

Source: tanstack ecosystem --json output + tanstack create --list-add-ons --json output

#### HIGH Skip addon-details before choosing provider

Wrong:
```bash
npx @tanstack/cli create my-app --add-ons prisma -y
```

Correct:
```bash
npx @tanstack/cli create --addon-details prisma --json
npx @tanstack/cli create my-app --add-ons prisma -y
```

Optionized providers can default silently, producing the wrong data-layer stack for the requested integration.

Source: tanstack create --addon-details prisma --json

#### HIGH Select multiple exclusive integrations together

Wrong:
```bash
npx @tanstack/cli create my-app --add-ons clerk,workos -y
```

Correct:
```bash
npx @tanstack/cli create my-app --add-ons clerk -y
```

Exclusive categories permit only one active choice, so multi-select commands can drop or replace intended providers.

Source: packages/create/src/frameworks/*/*/info.json

#### CRITICAL Assume router-only supports deployment integration

Wrong:
```bash
npx @tanstack/cli create my-app --router-only --deployment cloudflare -y
```

Correct:
```bash
npx @tanstack/cli create my-app --router-only -y
```

Router-only mode ignores deployment integration, so the command succeeds without applying the intended ecosystem target.

Source: packages/cli/src/command-line.ts:349

#### HIGH Tension: Compatibility mode vs explicit intent

This domain's patterns conflict with create-app-scaffold. Integration planning tends to over-assume command intent is preserved, but compatibility mode silently strips integration flags.

See also: ./projects-addons.md#source-tanstack-cli-create-app-scaffold § Common Mistakes

#### HIGH Tension: Single-command convenience vs integration precision

This domain's patterns conflict with query-docs-library-metadata. Integration choices tend to drift when discovery metadata is skipped in favor of one-shot scaffold commands.

See also: ./ecosystem-discovery.md#source-tanstack-cli-query-docs-library-metadata § Common Mistakes

### References

- [Authentication providers](./assets/tanstack-cli-choose-ecosystem-integrations/references/authentication-providers.md)
- [Data layer providers](./assets/tanstack-cli-choose-ecosystem-integrations/references/data-layer-providers.md)
- [Deployment targets](./assets/tanstack-cli-choose-ecosystem-integrations/references/deployment-targets.md)

<a id="source-tanstack-cli-query-docs-library-metadata"></a>

## Query Docs Library Metadata

Source: `tanstack-cli-query-docs-library-metadata`.

## Query Docs And Library Metadata

Use this skill to collect authoritative context before code generation or integration selection.

### Setup

```bash
npx @tanstack/cli libraries --json
```

### Core Patterns

#### Resolve valid library ids before doc fetch

```bash
npx @tanstack/cli libraries --json
```

#### Fetch a specific docs page with explicit version

```bash
# Syntax: tanstack doc <library-id> <path> [--docs-version <version>]
npx @tanstack/cli doc router framework/react/guide/routing
npx @tanstack/cli doc router framework/react/guide/routing --docs-version latest
```

#### Search docs for implementation targets

```bash
npx @tanstack/cli search-docs "server functions" --library start --json
```

### Common Mistakes

#### HIGH Use invalid library id/version/path for doc fetch

Wrong:
```bash
# Wrong: --library and --version are not flags on doc; path must not include /docs/ prefix
npx @tanstack/cli doc --library router --version latest --path /docs/framework/react/guide/routing
```

Correct:
```bash
# Step 1: resolve a valid library id
npx @tanstack/cli libraries --json
# Step 2: fetch using positional args — library id then doc path (no /docs/ prefix)
npx @tanstack/cli doc router framework/react/guide/routing
```

`doc` takes `<library>` and `<path>` as positional arguments (not flags), and the path must not include a leading `/docs/` segment. Use `--docs-version` (not `--version`) to pin a specific version.

Source: packages/cli/src/cli.ts:746

#### MEDIUM Rely on deprecated create alias for discovery

Wrong:
```bash
npx create-tsrouter-app --list-add-ons
```

Correct:
```bash
npx @tanstack/cli create --list-add-ons --json
```

Legacy alias workflows can produce confusing outputs that do not match current CLI discovery behavior. Fixed in newer versions, but agents trained on older examples may still generate this pattern.

Source: https://github.com/TanStack/cli/issues/93

#### HIGH Tension: Single-command convenience vs integration precision

This domain's patterns conflict with create-app-scaffold and choose-ecosystem-integrations. Skipping discovery to run one-shot scaffold commands tends to lock in plausible defaults that miss architecture constraints.

See also: ./projects-addons.md#source-tanstack-cli-create-app-scaffold § Common Mistakes

### References

- [Discovery command output schemas](./assets/tanstack-cli-query-docs-library-metadata/references/discovery-command-output-schemas.md)
