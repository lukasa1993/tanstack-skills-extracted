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

Use Node.js 24, Bash, and tar. Authenticate GitHub source requests with `GH_TOKEN`
or `GITHUB_TOKEN` (the Actions workflow supplies its built-in token).

```sh
./extractor.sh --self-test
node --test ./scripts/*.test.mjs
node scripts/refresh.mjs
```

The refresh runs in a disposable directory, validates the entire candidate, and
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

Offline replay requires both the lock and its downloaded bodies. Actions restores
and saves the source cache, including downloads from failed builds. The
`refresh-diagnostics` artifact contains stage logs, a report, and the run's lock.
After restoring the matching cache, use `--offline --lock path/to/sources.lock.json`
to replay that run. A lock from a failed acquisition may be incomplete; offline
mode reports any missing source explicitly. `TANSTACK_SOURCE_CACHE` selects a
different cache directory. `.tanstack-refresh/` and the cache can be removed when
no refresh is running; removing the cache makes the next online run download again.

Three workflows have separate responsibilities:

- **Validate refresh pipeline** runs tests, catalog checks, and actionlint on pushes
  and pull requests. These checks do not depend on live upstream content.
- **Refresh extracted skills** checks upstream sources daily on a hosted Ubuntu
  runner with Node 24, validates a candidate, and commits changed generated files
  plus the source lock. A concurrent edit to main rejects the push; rerunning
  rebuilds against the new main.
- **Publish skills** runs after a successful refresh, or through manual dispatch.
  It selects an immutable catalog commit and independently reconciles its GitHub
  release and reports product installs to skills.sh. Either job can be retried
  without repeating acquisition. Existing releases must point to the expected
  commit; API failures are not treated as missing releases. Indexing installs
  from the selected commit instead of following a moving branch. A cached success
  marker skips repeat index reports for that commit; cache eviction can cause a
  repeat report, since the installer has no idempotency API.

Product ownership is resolved from skill, package, documentation, and library
metadata. Newly published topics without a curated route are preserved under
**Additional official guidance** and reported as warnings. Catalog reorderings
and new library announcements do not invalidate supported products. Contradictory
ownership, missing required products, invalid sources, and broken links still
fail validation. Atomic skills remain hidden from the default picker but
exact-installable; only marker-backed product skills are reported to skills.sh.

## License

Each generated skill records the license from its source package. When the source archive includes a license file, the exporter copies it. The root [LICENSE](LICENSE) applies to the exporter and repository support files.
