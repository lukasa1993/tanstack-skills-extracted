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

## Current evidence and gaps

The September 8, 2026 catalog contains 18 product skills and 229 extracted skills.
Its product guides draw on extracted skills and 312 official documents.

- The installer exposes the 18 product skills, and extracted skills remain
  available by exact name. This supports the intended install experience.
- Some individual task references exceed 80 KiB. Charts has approximately
  126,000 words across task references. Total coverage is substantial, but these
  measurements do not establish efficient retrieval for an individual task.
- Query sends all listed frameworks to one shared framework reference. That
  reference contains substantial React guidance, and the router explicitly asks
  agents to translate draft examples through the installed adapter. Framework
  coverage needs a task-based assessment.
- Existing checks cover source integrity, provenance, links, catalog membership,
  formatting, and pipeline behavior. They do not demonstrate that an agent can
  implement a representative task correctly using the installed skill.
- The workflow redesign adds authenticated acquisition, reproducible inputs,
  staged replacement, and independent publishing. These support maintenance and
  recovery. They are not sufficient evidence of product quality.

## Acceptance scenarios for further changes

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
