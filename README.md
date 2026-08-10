# TanStack Skills Extracted

[![skills.sh](https://skills.sh/b/lukasa1993/tanstack-skills-extracted)](https://skills.sh/lukasa1993/tanstack-skills-extracted)

This is an unofficial mirror of the agent skills that TanStack publishes in its npm packages. It is not affiliated with or endorsed by TanStack.

The exporter finds published `@tanstack/*` packages with the `tanstack-intent` keyword. It converts their nested skills to the flat Agent Skills format. It also updates skill IDs and file references, validates the result, and preserves the upstream license.

## Install

Run the interactive installer:

```sh
npx skills add lukasa1993/tanstack-skills-extracted
```

Select a group header, such as `React Table`, to select all skills in that group. You can also select individual skills.

Install one skill without the interactive picker:

```sh
npx skills add lukasa1993/tanstack-skills-extracted --skill tanstack-react-table-getting-started
```

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

The GitHub Actions workflow checks npm once each day. It rebuilds the page and installer groups. It commits and publishes only when the generated output changes.

## License

Each generated skill records the license from its source npm package. When the npm tarball includes a license file, the exporter copies it. The root [LICENSE](LICENSE) applies to the exporter and repository support files.
