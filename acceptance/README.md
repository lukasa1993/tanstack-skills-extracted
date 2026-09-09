# Installed-skill acceptance

Install the locked dependencies with Node 24, then run:

```sh
npm ci --prefix acceptance --ignore-scripts --no-audit --no-fund
node scripts/validate-guidance.mjs
npm test --prefix acceptance
node --test acceptance/publish.test.mjs
```

`TANSTACK_BUILD_ROOT` can select a candidate catalog. Refresh sets it automatically
and requires both navigation and behavioral checks before promotion.

The publishing test runs the locked skills CLI through the production publishing
script against local lightweight and annotated release tags. It installs all 18
products, compares every copied file with the catalog, and checks the remote-source
telemetry payload without sending it to skills.sh. The fixture advances main after
tagging to catch accidental installs from a moving branch. Missing tags, wrong
commits, and different installed content must fail without saving a success marker.
CI runs it on committed output; refresh runs it on the candidate before promotion.

The runner copies the entire Query and Form product folders into temporary,
independent installations, compiles the examples reached through their task
routes with TypeScript, and executes those shipped files. Repository examples
are maintained in `scripts/examples/`, copied by the builder, and labeled
separately from official source text. The examples are MIT licensed.

| Scenario | Behavior checked |
| --- | --- |
| React Query optimistic edit | Optimistic UI, cancellation of an earlier fetch, immutable snapshots, rollback after failure, server reconciliation after success/failure, pending state until reconciliation, and no invented list when cache is absent. The example requires one edit at a time. |
| Vue Query reactivity | Both refs and getters select new queries, results stay in independent cache entries, and reactive `enabled` prevents and resumes fetching. |
| React Form validation | Empty and malformed values cannot submit, field errors are visible and clear on correction, and a valid submission disables the button until completion. |

`scripts/validate-guidance.mjs` independently verifies that all 18 products are
self-contained, every source has a reachable guide, and prerequisites, sections,
and examples remain reachable. Product entry points and topic indexes have a
12 KiB limit. The three representative reading paths have a 24 KiB limit for the
entry point, task guide, largest section choice, and example combined. Other
guides use a 12 KiB splitting target, with larger indivisible source sections
retained to preserve code examples and their explanations.

Behavioral coverage is limited to the exact packages in `package.json` and the
example manifest. It does not certify every framework, every upstream snippet,
or autonomous agent performance. Daily documentation refreshes can advance
beyond these test versions; examples retain their explicit tested-version labels.
When updating a test version, update the dependency and lockfile, the matching
`testedPackages` in `scripts/examples/manifest.json`, and regenerate the catalog.
Checks reject drift between the test dependencies, manifest, and shipped examples.
