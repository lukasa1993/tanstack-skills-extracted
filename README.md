# TanStack Skills Extracted

[![skills.sh](https://skills.sh/b/lukasa1993/tanstack-skills-extracted)](https://skills.sh/lukasa1993/tanstack-skills-extracted)

This is an unofficial mirror of the agent skills that TanStack publishes. It is not affiliated with or endorsed by TanStack. Until `@tanstack/query-intent` reaches npm, the mirror also tracks TanStack's official [Query Intent draft PR](https://github.com/TanStack/query/pull/10879).

The exporter inspects every published `@tanstack/*` package and the official Query draft source. It converts nested skills to the flat Agent Skills format. It also updates skill IDs and file references, validates the result, records source provenance, and preserves the upstream license.

## Install

Run the interactive installer:

```sh
npx skills add lukasa1993/tanstack-skills-extracted
```

Select `TanStack Query`, `TanStack Table`, or another library group to select every skill for that library. You can also select individual skills.

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

The GitHub Actions workflow checks npm and the official Query draft once each day. It rebuilds the page and installer groups. It commits and publishes only when the generated output changes.

## License

Each generated skill records the license from its source package. When the source archive includes a license file, the exporter copies it. The root [LICENSE](LICENSE) applies to the exporter and repository support files.
