# TanStack Skills Extracted

[![skills.sh](https://skills.sh/b/lukasa1993/tanstack-skills-extracted)](https://skills.sh/lukasa1993/tanstack-skills-extracted)

This is an unofficial mirror of TanStack agent guidance. It is not affiliated with or endorsed by TanStack. It extracts the skills that TanStack publishes and synthesizes product skills from version-matched official documentation when a product has no upstream skill.

The exporter inspects published `@tanstack/*` packages and official documentation. It converts nested skills to the flat Agent Skills format, groups them by product and task, removes exact duplicate guidance, validates links, records source provenance, and preserves upstream licenses.

## Install

Run the interactive installer:

```sh
npx skills add lukasa1993/tanstack-skills-extracted
```

The normal picker shows exactly 18 product skills in five practical groups:

- Framework: Start and Router.
- Data and state: Query, DB, Store, and AI.
- UI and UX: Table, Charts, Form, Hotkeys, Markdown, and Highlight.
- Performance: Virtual and Pacer.
- Tooling: Devtools, Config, CLI, and Intent.

Select a product once. Its skill routes to the relevant thematic guidance and framework adapter without requiring separate subskill selection.

Install a product without the interactive picker:

```sh
npx skills add lukasa1993/tanstack-skills-extracted --skill tanstack-query
npx skills add lukasa1993/tanstack-skills-extracted --skill tanstack-table
```

All extracted skills remain available by exact name, but stay hidden from the normal picker. Install one directly with:

```sh
npx skills add lukasa1993/tanstack-skills-extracted --skill tanstack-react-table-getting-started
```

Existing installations get changed skills with:

```sh
npx skills update
```

## Source notes

TanStack Form, Charts, Intent, Virtual, Pacer, Hotkeys, Store, and Config do not currently publish complete product skills. Their product skills are synthesized from version-matched official documentation and package metadata.

TanStack Query is different: its source is the official [Query Intent draft PR](https://github.com/TanStack/query/pull/10879), not a published npm package. The exporter uses the PR head until the package is published, including when the draft is closed but its official branch remains available.

TanStack Charts is currently pre-alpha. Its skill preserves that warning and uses release-matched documentation instead of unreleased `main` APIs.

## Refresh

```sh
./extractor.sh --self-test
node --test ./scripts/*.test.mjs
./extractor.sh skills
node ./scripts/fetch-doc-sources.mjs
node ./scripts/build-groups.mjs
node ./scripts/validate-catalog.mjs
gh skill publish --dry-run
```

The GitHub Actions workflow checks npm, official documentation, and the Query draft once each day. It rebuilds the extracted atomic sources and the 18 product skills. Product ownership is resolved from authoritative skill, package, documentation, and library metadata. Newly published topics without a curated route are preserved under **Additional official guidance** and reported as warnings; contradictory ownership or invalid source data still fails validation. Atomic skills remain hidden from the default picker but exact-installable. The workflow commits only changed generated output and reports only marker-backed product skills to skills.sh.

## License

Each generated skill records the license from its source package. When the source archive includes a license file, the exporter copies it. The root [LICENSE](LICENSE) applies to the exporter and repository support files.
