# Product intent and design criteria

This is the working product contract, inferred from the repository's install flow
and its evolution from extracted skills to curated product skills. Changes to the
refresh system should be evaluated against this contract before choosing tools,
jobs, caches, or source-fetching strategies.

## Intended outcome

A developer installs a TanStack product skill once. An agent can then find
trustworthy guidance for the developer's task, framework, and installed package
version, with a manageable amount of reading. Keeping that guidance current
should require little routine maintainer intervention.

## What the product must deliver

- **Simple discovery:** a clear product-level picker and stable install names.
  Upstream package layout should not become the user's navigation problem.
- **Useful task routing:** a short entry point that leads to the relevant
  prerequisites, framework adapter, and task guidance. The quantity of copied
  documentation is not a measure of usefulness.
- **Source fidelity:** preserve upstream meaning, attribution, and licenses.
  Distinguish released guidance, documentation-derived guidance, and drafts.
  An official repository location alone does not establish compatibility with
  the installed release.
- **Honest coverage:** a listed framework needs an actionable route. Cross-framework
  translation requirements and missing guidance must be visible.
- **Controlled context use:** preserve source material while making individual
  tasks navigable without reading broad, unrelated collections of guidance.
- **Maintainable freshness:** discover upstream changes, validate their effect on
  the installed skills, and publish useful updates. Keep the last validated
  catalog available when a new candidate cannot be produced.

## Implemented behavior and evidence

The September 8, 2026 catalog contains 18 product skills and 229 extracted skills.
Its product guides now draw on extracted skills and 362 official documents.

- The installer exposes the 18 product skills, and extracted skills remain
  available by exact name. This supports the intended install experience.
- Topic references are small indexes, with separate guides and sections of longer
  guides. This replaces references that previously exceeded 80 KiB. Sources,
  licenses, and exact-deduplication records remain available; splitting does not
  truncate code examples or split fenced blocks.
- Query has separate release-matched routes for all seven listed adapters.
  Svelte and Lit use their own release versions, which differ from Query Core.
  Draft guidance remains supplementary and visibly labeled. Form documents also
  use their owning adapter's release commit.
- Every source must have a reachable route inside its installed product.
  Entry points and topic indexes have a 12 KiB limit. Representative task paths
  have a 24 KiB reading limit, including an example and one section choice.
- Six behavior checks execute the actual bundled examples in copied Query and
  Form installations, using pinned packages and TypeScript checking. These
  complement source integrity, provenance, links, catalog, and pipeline checks.
- The refresh requires navigation and behavior checks before promoting a
  candidate. Source acquisition or validation failures preserve the previous
  catalog. A Git-history test verifies that unrelated metadata and maintainer
  documentation changes preserve the release and indexing identity.

## Acceptance scenarios

| Scenario | Evidence to collect |
| --- | --- |
| Install one product | The picker is understandable; the installation includes every required local reference. |
| Add optimistic updates to a React Query project | The route reaches the relevant prerequisites and mutation guidance; examples agree with the tested installed version. |
| Implement a reactive query in a Vue project | The route supplies actionable Vue guidance and makes any React-only examples or draft assumptions explicit. |
| Add validation to a React Form project | The route reaches the needed validation guidance; record the amount of unrelated content the agent must read. |
| Upstream adds a skill or adapter | Preserve the source and report any routing or coverage gap without silently claiming support. |
| A source fetch fails | Existing published skills remain usable; the refresh reports what could not be verified. |
| An unrelated package changes | Its metadata change alone does not cause a new skill release or a repeat index report. |

Representative implementation scenarios should use small projects with pinned
package versions and meaningful checks of their behavior. Passing directory,
link, or file-size checks is complementary evidence, not a substitute.

The current suite establishes those properties for three representative paths,
not all tasks or frameworks, and does not measure an autonomous agent's ability
to follow the guides. Other upstream examples retain their source status without
an implied execution guarantee. See [the acceptance suite](acceptance/README.md)
for exact scope and version maintenance. New scenarios should expand this
evidence when a routing, framework, or compatibility change requires it.

## How to make design decisions

For each proposed change, identify the user or maintainer outcome it improves,
the evidence of the current gap, and how the resulting behavior will be checked.
Reconsider existing source, packaging, and publishing choices when they conflict
with those outcomes. Infrastructure changes such as runner selection also need
an operational reason; they do not follow automatically from an HTTP failure.

The working scope is curated guides backed by official sources, including
documentation for gaps. A decision to become a strict upstream mirror would
change the source policy and product acceptance criteria, and should precede
further architectural changes.
