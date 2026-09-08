# Intent Exclude

<a id="source-intent-docs-cli-intent-exclude-md"></a>

Release-matched documentation · `@tanstack/intent@0.4.0`.

[Topic index](../consumer-workflow.md) · [Source provenance](../SOURCES.md)

`intent exclude` manages `package.json#intent.exclude` entries.

```bash
npx @tanstack/intent@latest exclude [list|add|remove] [pattern] [--json]
```

## Options

- `--json`: print the configured exclude patterns as JSON

## Actions

1. `list` (default): print current excludes
2. `add <pattern>`: append one exclude pattern
3. `remove <pattern>`: remove one exclude pattern

## Examples

```bash
npx @tanstack/intent@latest exclude
npx @tanstack/intent@latest exclude list --json
npx @tanstack/intent@latest exclude add @tanstack/router#experimental-*
npx @tanstack/intent@latest exclude remove @tanstack/router#experimental-*
```

## Behavior

- Reads and writes the current working directory `package.json`
- Creates `intent.exclude` when missing
- Keeps existing excludes and appends new patterns in order
- Validates pattern syntax before writing
- Refuses invalid `package.json` structures for `intent` and `intent.exclude`

## Related

- [Configuration](./intent-docs-concepts-configuration-md-138c87c1.md#source-intent-docs-concepts-configuration-md)
- [intent list](./intent-docs-cli-intent-list-md-4aea1d54.md#source-intent-docs-cli-intent-list-md)
- [intent load](./intent-docs-cli-intent-load-md-40c79fd4.md#source-intent-docs-cli-intent-load-md)
