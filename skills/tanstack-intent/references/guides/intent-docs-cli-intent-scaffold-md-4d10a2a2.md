# Intent Scaffold

<a id="source-intent-docs-cli-intent-scaffold-md"></a>

Release-matched documentation · `@tanstack/intent@0.4.0`.

[Topic index](../maintainer-workflow.md) · [Source provenance](../SOURCES.md)

`intent scaffold` prints a phased scaffold prompt for generating skills.

```bash
npx @tanstack/intent@latest scaffold
```

## Behavior

- Prints prompt text to stdout
- Does not create files

## Output

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

## Related

- [intent validate](./intent-docs-cli-intent-validate-md-f634a848.md#source-intent-docs-cli-intent-validate-md)
- [setup commands](./intent-docs-cli-intent-setup-md-7ed6e8de.md#source-intent-docs-cli-intent-setup-md)
