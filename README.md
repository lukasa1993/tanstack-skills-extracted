# TanStack Skills Extracted

[![skills.sh](https://skills.sh/b/lukasa1993/tanstack-skills-extracted)](https://skills.sh/lukasa1993/tanstack-skills-extracted)

This is an unofficial collection of TanStack agent guides. It is not affiliated with or endorsed by TanStack. It combines published skills, release-matched official documentation, and clearly labeled repository examples into one installable skill per product.

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

Select a product once. Its entry point links to small topic indexes, individual guides, and sections of longer guides. Each guide identifies its source status and package version. Prerequisites and examples stay inside the installed product, so separate subskill selection is unnecessary.

Query includes direct routes for React optimistic updates and Vue reactivity; Form includes React validation. These routes include runnable examples whose types and behavior are checked against named, pinned package versions. Other tasks use the topic and framework indexes.

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

TanStack Query includes release-matched setup and selected task documentation for React, Preact, Vue, Solid, Svelte, Angular, and Lit. Each adapter uses its own published version and repository commit; adapters can have different major versions. Query and Form framework documents are matched to the adapter release that owns them.

Query also preserves the official [Query Intent draft PR](https://github.com/TanStack/query/pull/10879) as separately labeled supplementary guidance. The exporter uses the PR head until the package is published, including when the draft is closed but its official branch remains available. Draft examples do not establish compatibility with another adapter or release.

TanStack Charts is currently pre-alpha. Its skill preserves that warning and uses release-matched documentation instead of unreleased `main` APIs.

## Refresh

Use Node.js 24, Bash, and tar. Authenticate GitHub source requests with `GH_TOKEN`
or `GITHUB_TOKEN` (the Actions workflow supplies its built-in token).

```sh
./extractor.sh --self-test
node --test ./scripts/*.test.mjs
npm ci --prefix acceptance --ignore-scripts --no-audit --no-fund
node scripts/refresh.mjs
```

The refresh runs in a disposable directory, validates navigation, source coverage,
and representative implementations in copied product installations, and
then replaces the generated catalog and `sources.lock.json` together, restoring
the previous files if replacement fails. `--check` builds and validates a candidate
without applying it. The report names the candidate directory.

Source acquisition resolves each mutable URL once per run. npm versions and
archive URLs come from that snapshot; downloads run with bounded concurrency
and npm tarballs must match the registry's SHA-512 integrity. Requests have size
limits, timeouts, and bounded retries for connection failures, rate limits, and
server errors. GitHub credentials are sent only to `api.github.com`.

The source lock records URLs, response status, byte counts, and SHA-256 hashes.
Downloaded bodies live in the ignored `.tanstack-source-cache/`, with their
hashes checked on every read. Fresh runs resolve moving sources again and reuse
immutable archives. An outage never silently substitutes old mutable metadata.

Rebuild the exact saved snapshot without network access:

```sh
node scripts/refresh.mjs --offline --check
```

Offline replay requires the source lock, its downloaded bodies, and the already
installed acceptance dependencies. Actions restores
and saves the source cache, including downloads from failed builds. The
`refresh-diagnostics` artifact contains stage logs, a report, and the run's lock.
After restoring the matching cache, use `--offline --lock path/to/sources.lock.json`
to replay that run. A lock from a failed acquisition may be incomplete; offline
mode reports any missing source explicitly. `TANSTACK_SOURCE_CACHE` selects a
different cache directory. `.tanstack-refresh/` and the cache can be removed when
no refresh is running; removing the cache makes the next online run download again.

Three workflows have separate responsibilities:

- **Validate refresh pipeline** runs pipeline tests, catalog and navigation checks,
  installed-example type and behavior checks, an actual publishing install, and
  actionlint on pushes and pull requests. It installs locked dependencies and uses
  committed guidance. The publishing check uses the same pinned skills CLI as
  production against local release tags, without sending test install telemetry.
- **Refresh extracted skills** checks upstream sources daily on a hosted Ubuntu
  runner with Node 24, validates a candidate (including the publishing install),
  and commits changed generated files plus the source lock. A concurrent edit to
  main rejects the push; rerunning rebuilds against the new main.
- **Publish skills** runs after a successful refresh, or through manual dispatch.
  It selects an immutable catalog commit, reconciles its GitHub release, then
  installs through the verified release tag to report product installs to skills.sh.
  The pinned CLI clones branches and tags; raw commit hashes are not supported.
  Publishing uses current infrastructure code even when the catalog is unchanged.
  Existing releases must point to the expected commit; API failures are not treated
  as missing releases. The installer must copy all 18 products and every file must
  match the selected catalog before a cached success marker is saved. Either job
  can be retried without repeating acquisition. The marker skips repeat installs
  for that commit; cache eviction can cause a repeat report. The CLI's telemetry
  is best-effort and does not confirm skills.sh indexing or provide idempotency.
  After a publishing code fix, manually dispatch **Publish skills** to use the new
  workflow; rerunning an old failed run retains its old workflow definition.

Product ownership is resolved from skill, package, documentation, and library
metadata. Newly published topics without a curated route are preserved under
**Additional official guidance** and reported as warnings. Catalog reorderings
and new library announcements do not invalidate supported products. Contradictory
ownership, missing required products, invalid sources, and broken links still
fail validation. Atomic skills remain hidden from the default picker but
exact-installable; only marker-backed product skills are reported to skills.sh.

The [product contract](DESIGN.md) defines the intended user outcomes and acceptance
criteria. See [acceptance checks](acceptance/README.md) for the tested scenarios,
version coverage, and how to update examples.

## License

Each generated skill records the license from its source package. When the source archive includes a license file, the exporter copies it. The root [LICENSE](LICENSE) applies to the exporter and repository support files.
