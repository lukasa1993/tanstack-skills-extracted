# TanStack Skills Extracted

[![skills.sh](https://skills.sh/b/lukasa1993/tanstack-skills-extracted)](https://skills.sh/lukasa1993/tanstack-skills-extracted)

This is an unofficial mirror of the agent skills that TanStack publishes in its npm packages. It is not affiliated with or endorsed by TanStack.

The exporter finds published `@tanstack/*` packages with the `tanstack-intent` keyword. It converts their nested skills to the flat Agent Skills format. It also updates skill IDs and file references, validates the result, and preserves the upstream license.

## Install

List the available skills:

```sh
npx skills add lukasa1993/tanstack-skills-extracted --list
```

Install one skill:

```sh
npx skills add lukasa1993/tanstack-skills-extracted --skill tanstack-react-table-getting-started
```

Install one group, such as all React Table skills:

```sh
npx skills add lukasa1993/tanstack-skills-extracted/groups/react-table --skill '*'
```

The interactive installer also has selectable group headers. Available group paths are `tanstack-ai`, `tanstack-db`, `table-core`, `react-table`, `angular-table`, `solid-table`, `svelte-table`, `vue-table`, `lit-table`, `ember-table`, `markdown`, `highlight`, and `table-tools`.

Existing installations get changed skills with:

```sh
npx skills update
```

## Refresh

```sh
./extractor.sh --self-test
./extractor.sh skills
node ./scripts/build-groups.mjs
gh skill publish --dry-run
```

The GitHub Actions workflow checks npm once each day. It rebuilds the page groups, installer groups, and group paths. It commits and publishes only when the generated output changes.

## License

Each generated skill records the license from its source npm package. When the npm tarball includes a license file, the exporter copies it. The root [LICENSE](LICENSE) applies to the exporter and repository support files.
