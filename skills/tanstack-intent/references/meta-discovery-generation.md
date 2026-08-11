# Meta discovery and generation

Official Intent meta skills for domain discovery and skill generation.

<a id="source-intent-packages-intent-meta-domain-discovery-skill-md"></a>

## SKILL

Source: `intent:packages/intent/meta/domain-discovery/SKILL.md`.

## Domain Discovery & Maintainer Interview

You are extracting domain knowledge for a library to produce a structured
domain map. Your job is not to summarize documentation — it is to build a
deep understanding of the library first, then use that understanding to
surface the implicit knowledge that maintainers carry but docs miss.

The output is a set of **task-focused skills** — each one matching a
specific developer moment ("implement a proxy", "set up auth", "audit
before launch"). Domains are an intermediate conceptual grouping you use
during analysis; the final skills emerge from the intersection of domains
and developer tasks.

There are five phases. Always run them in order — unless the lightweight
path applies (see below).

1. **Quick scan** — orient yourself (autonomous)
2. **High-level interview** — extract the maintainer's task map
3. **Deep read** — fill in failure modes and detail (autonomous)
4. **Detail interview** — gap-targeted questions, AI-agent failures
5. **Finalize artifacts**

#### Lightweight path (small libraries)

After Phase 1, decide whether the library warrants the full five-phase
flow or the compressed flow below. This is a judgment call — lean toward
full discovery unless the library is obviously small (single-purpose
utility, 2–3 distinct developer tasks max). Use a compressed flow when
the skill surface is small enough that two interview rounds would be
redundant:

1. **Phase 1** — Quick scan (same as full flow)
2. **Phase 2+4 combined** — Single interview round. Combine the
   high-level task map questions (Phase 2) with gap-targeted and
   AI-agent-specific questions (Phase 4) into one interview session
   of 4–8 questions total. Skip the draft-review step since the skill
   set is small enough to confirm in one pass.
3. **Phase 3** — Deep read (same as full flow, but scope is smaller)
4. **Phase 5** — Finalize artifacts (same as full flow)

The lightweight path produces identical output artifacts (domain_map.yaml
and skill_spec.md). It just avoids two separate interview rounds when the
library is small enough that one round covers everything.

#### Hard rules — interview phases are mandatory and interactive

These rules override any other reasoning. No exceptions.

1. **Phases 2 and 4 are interactive interviews conducted with the
   maintainer.** You must ask the questions specified in each sub-section
   and wait for the maintainer's response before continuing. Documentation,
   source code, and other automated analysis are NOT substitutes for the
   maintainer's answers.
2. **Every question in Phases 2 and 4 must be asked as an open-ended
   question and sent as a message to the maintainer.** You must then
   STOP and WAIT for their reply. Do not answer your own questions. Do
   not infer answers from documentation. Do not skip questions because
   you believe you already know the answer.
3. **Never ask factual questions you can answer by searching the
   codebase.** Before asking any question, determine whether the answer
   is a deterministic fact (how many X exist, what versions are
   supported, which files implement Y) or a judgment call (which ones
   matter, what should we prioritize, what do developers struggle with).
   Factual questions must be answered by searching the code — grep,
   glob, read files. Only ask the maintainer for priorities, opinions,
   trade-offs, and implicit knowledge that cannot be found in code or
   docs. Asking the maintainer a question whose answer is sitting in
   the codebase wastes their time and erodes trust in the process.
4. **Do not convert open-ended questions into multiple-choice,
   yes/no, or confirmation prompts.** The question templates in each
   sub-section are open-ended by design. Present them as open-ended
   questions. The maintainer's unprompted answers surface knowledge that
   pre-structured options suppress.
5. **Minimum question counts are enforced.** Each sub-section specifies
   a question count range (e.g. "2–4 questions"). You must ask at least
   the minimum number. Asking zero questions in any sub-section is a
   protocol violation.
6. **STOP gates are mandatory.** At the boundaries marked `── STOP ──`
   below, you must halt execution and wait for the maintainer's response
   or acknowledgment before proceeding. Do not continue past a STOP gate
   in the same message.
7. **If the maintainer asks to skip an interview phase**, explain the
   value of the phase and what will be lost. Proceed with skipping only
   if they confirm a second time.
8. **Rich documentation makes interviews MORE valuable, not less.**
   When docs are comprehensive, the interview surfaces what docs miss:
   implicit knowledge, AI-specific failure modes, undocumented tradeoffs,
   and the maintainer's prioritization of what matters most. Never
   rationalize skipping interviews because documentation is thorough.

---

### Phase 1 — Quick scan (autonomous, ~10 minutes)

Orient yourself in the library. You are building a structural map, not
reading exhaustively yet.

#### 1a — Read orientation material

1. **README** — vocabulary, mental model, what the library does
2. **Getting started / quickstart** — the happy path
3. **Package structure** — if monorepo, identify which packages are
   client-facing vs internal. Focus on the 2–3 packages most relevant
   to skill consumers (usually client SDKs and primary framework adapters)
4. **AGENTS.md or .cursorrules** — if the library already has agent
   guidance, read it. This is high-signal for what the maintainer
   considers important
5. **All in-repo documentation** — list every `.md` file in the `docs/`
   directory (and any other documentation directories like `guides/`,
   `reference/`, `wiki/`). Read every file. This is NOT the exhaustive
   external doc reading from Phase 3 — this is reading what the
   maintainer committed to the repository, which is fast and
   high-signal. In-repo docs often contain migration guides, backward
   compatibility notes, architecture decisions, and other context that
   prevents you from asking factual questions the docs already answer.
   Do not sample a subset — read them all before the first interview.

#### 1b — Read peer dependency constraints

Check `package.json` for `peerDependencies` and `peerDependenciesMeta`.
For each major peer dependency (React, Vue, Svelte, Next.js, etc.):

1. Note the version range required
2. Read the peer's docs for integration constraints that affect this
   library: SSR/hydration rules, component lifecycle boundaries,
   browser-only APIs, singleton patterns, connection limits
3. Log framework-specific failure modes — these are the highest-impact
   failure modes and cannot be discovered from the library's own source

Examples of peer-dependency-driven failure modes:

- SSR: calling browser-only APIs during server render
- React: breaking hook rules in library wrapper components
- Connection limits: opening multiple WebSocket connections per tab
- Singleton patterns: creating multiple client instances in dev mode

#### 1c — Note initial impressions

Log (but do not group yet):

- What the library does in one sentence
- The core abstractions a developer interacts with
- Which frameworks it supports
- Any existing skill files, agent configs, or intents
- Whether the library is a monorepo and which packages matter
- Peer dependency constraints — read `peerDependencies` and
  `peerDependenciesMeta` from each client-facing package.json to
  understand version ranges and optional integrations early

Present your initial impressions to the maintainer as a brief summary
(3–5 bullets). This orients them on what you found and primes them for
the interview.

**── STOP ── Do not proceed to Phase 2 until the maintainer has
acknowledged your summary or responded.**

---

### Phase 2 — High-level interview (interactive — requires maintainer)

The maintainer's mental model of developer tasks IS the skill map. Your
job in this phase is to extract it — not to propose your own structure.

You must ask the questions below to the maintainer and wait for their
responses. Do not infer answers from documentation or source code.

#### Rules for Phase 2

1. One topic per message for open-ended questions. You may batch 2–3
   yes/no or short-confirmation questions together.
2. Ask each question as written (you may adapt phrasing to context, but
   keep questions open-ended — never convert to multiple-choice).
3. Wait for the maintainer's response after each question before asking
   the next.
4. Take notes silently. Do not summarize back unless asked.
5. If the maintainer gives a short answer, probe deeper before moving on.

#### 2a — Developer tasks (2–4 questions)

Start with the maintainer's view of what developers do:

> "Walk me through what a developer actually does with your library —
> not the elevator pitch, but the tasks they come to you for help with,
> from first install through production."

Follow up to enumerate distinct tasks:

> "If you listed every distinct thing a developer asks an agent to help
> with using your library, what would that list look like? I'm thinking
> things like 'set up the client', 'implement auth', 'debug sync issues'
> — each one a separate moment where they'd want focused guidance."

For monorepo libraries, also ask about cross-package tasks:

> "Are there tasks that touch multiple packages in your monorepo? For
> example, a getting-started flow that requires imports from both the
> client and server packages? I want to make sure skills that span
> package boundaries are captured correctly."

#### 2b — Developer journeys (1–2 questions)

Surface lifecycle/journey skills that cross-cut task areas:

> "Are there developer journeys that cut across multiple features?
> For example: a getting-started guide, a go-to-production checklist,
> a migrate-from-v4 walkthrough. Which of these exist in your docs
> or would be valuable as standalone skills?"

#### 2c — Composition and ecosystem (1–3 questions)

> "Which other libraries does yours compose with most often? Are there
> integration patterns important enough to warrant their own skill —
> for example, using your library with [framework/ORM/router]?"

> "Are there tasks that developers might expect your library to handle,
> but that are actually handled by a companion library? Which tasks
> should we explicitly exclude from your library's skills?"

#### 2d — Exclude experimental features (1 question)

> "Are there any features that are experimental, unstable, or not yet
> ready to document for agents? We'll exclude these from the skill set."

#### 2e — Confirm initial skill map

Synthesize what you heard into a proposed skill list and present it:

> "Based on what you've told me, here's my proposed skill list:
> [enumerate skills with one-line descriptions]. Does this match how
> you think about your library? What would you add, remove, or rename?"

**── STOP ── Do not proceed to Phase 3 until the maintainer has
reviewed and confirmed (or corrected) the skill list.**

---

### Phase 3 — Deep read (autonomous)

You now have the maintainer's task map. Read docs and source to fill
each skill area with concrete content — failure modes, code patterns,
gotchas.

#### Reading order

Read in this order. Each step builds context for the next.

Before starting, list every file in the docs directory (and subdirectories).
Use this list as a checklist — every narrative file must be read. Do not
sample a subset and extrapolate.

1. **Narrative guides** — read as many as needed to build confidence in
   your understanding. Prioritize getting-started, migration, and guides
   covering the skill areas from Phase 2. Skip exhaustive reading of large
   online-only doc sets.
2. **Migration guides** — highest-yield source for failure modes; every
   breaking change is exactly what agents trained on older versions produce
3. **API reference** — scan for exports, type signatures, option shapes
4. **Changelog for major versions** — API renames, removed exports,
   behavioral changes
5. **GitHub issues and discussions** — this is one of the highest-yield
   sources for failure modes and skill content. Docs describe intended
   behavior; issues reveal actual behavior and real developer confusion.

   **How to search.** Use `gh search issues` and `gh search prs` (or the
   GitHub web search UI) against the library's repo. Run multiple passes:
   - **High-engagement issues:** sort by reactions or comments to find the
     problems that affect the most developers. These are skill-worthy
     even if already fixed — agents trained on older data still hit them.
   - **Label-based scans:** look for labels like `bug`, `question`,
     `documentation`, `breaking-change`, `good first issue`, `FAQ`,
     `help wanted`. Each label category yields different signal:
     - `bug` + `closed` → failure modes with known fixes (wrong/correct pairs)
     - `question` → developer confusion that skills should preempt
     - `breaking-change` → migration-boundary mistakes
   - **Keyword searches:** search for the skill's primary APIs, hooks,
     and config options by name. E.g. `useQuery stale` or `hydration SSR`.
   - **Recent vs. historical:** scan the last 6–12 months of open issues
     for current pain points. Then scan older closed issues for patterns
     that are now fixed but still appear in agent training data.

   **GitHub Discussions** are equally important when the repo uses them.
   Discussions surface "how do I..." patterns and architectural questions
   that issues don't capture. Search the Discussions tab (or use
   `gh api` to query discussions) for:
   - Unanswered or long-thread questions (signal: docs are insufficient)
   - Threads marked as "Answered" with a non-obvious solution (skill content)
   - Recurring themes across multiple threads (systemic confusion)

   **What to extract from issues/discussions:**
   - Frequently reported confusion patterns → candidate failure modes
   - Workarounds that developers use before a fix ships → "wrong pattern"
     examples that agents will reproduce
   - Recurring "how do I X with Y" threads → composition skill candidates
   - Misunderstandings about defaults or config → skill content gaps
   - Feature requests with many upvotes that change API design → signals
     of where the API surface is unintuitive
   - What users are implicitly arguing for architecturally — not just
     "people are confused about X" but "users keep expecting X to work
     like Y, which reveals a tension between [design force] and
     [design force]"

   **What NOT to extract:** one-off bugs already fixed, feature requests
   unrelated to current API surface, issues about build tooling or CI
   that don't affect library usage patterns.

   **Fallback.** If no web access is available, check for FAQ.md,
   TROUBLESHOOTING.md, docs/faq, or KNOWN_ISSUES.md as proxies. Also
   scan the repo's `.github/ISSUE_TEMPLATE/` for hints about common
   issue categories.

6. **Source code** — verify ambiguities from docs, check defaults, find
   assertions and invariant checks. For monorepos, read the 2–3 core
   packages deeply. For adapter packages, read one representative adapter
   deeply, then scan others for deviations from the pattern.

#### What to log

Produce a flat concept inventory. One item per line. No grouping yet.

Log every:

- Named concept, abstraction, or lifecycle stage
- Public export: function, hook, class, type, constant
- Configuration key, its type, and its default value
- Constraint or invariant (especially any enforced by `throw` or assertion)
- Doc callout: any "note", "warning", "caution", "important", "avoid", "do not"
- Dual API: any place the library has two ways to do the same thing (old/new,
  verbose/shorthand, lower-level/higher-level)
- Environment branch: any place behavior depends on SSR/CSR, dev/prod,
  framework, bundler, or config flag
- Type gap: any type documented as accepting X but source shows X | Y or
  rejects a subtype of X
- Source assertion: any `if (!x) throw`, `invariant()`, or `assert()` with
  the error message text
- Issue/discussion pattern: any recurring confusion, workaround, or
  misunderstanding surfaced from GitHub issues or discussions — note the
  issue/discussion URL, the core misunderstanding, and whether it's
  resolved or still active

#### What to extract from migration guides specifically

For each breaking change between major versions:

```
Old pattern: [code that agents trained on older versions will produce]
New pattern: [current correct code]
What changed: [one sentence — the specific mechanism]
Version boundary: [e.g. "v4 → v5"]
```

These become high-priority failure modes.

#### 3a — Group concepts into domains

Move concept inventory items into groups. Two items belong together when:

- A developer reasons about them together when solving a problem
- Solving one correctly requires understanding how the other works
- They share a lifecycle, configuration scope, or architectural tradeoff
- Getting one wrong tends to produce bugs in the other

Let library complexity drive the domain count — a focused library may need
only 2–3 domains, while a large framework may need 7+. Validate by asking:
"Would a developer working on a single feature need to load skills from
multiple domains? If so, merge those domains." These are conceptual
groupings, not the final skills.

Do not create a group for:

- A single hook, function, or class
- A single doc or reference page
- "Miscellaneous", "Advanced", or "Other"
- Configuration knobs that only affect another group's behavior

Name each domain as work being performed, not what the library provides.

**Validation step:** After grouping, check each domain by asking:
"Would a developer working on a single feature need to load skills from
multiple domains?" If yes, merge those domains. Group by developer tasks
(what they're trying to accomplish), not by architecture (how the library
is organized internally). For example, prefer "writing data" over
"producer lifecycle" — the former matches a developer's intent, the latter
matches the codebase structure.

#### 3b — Map domains × tasks → skills

Merge your conceptual domains with the maintainer's task list from
Phase 2. Each skill should match a specific developer moment while
carrying the conceptual depth of its parent domain(s).

A skill is well-shaped when:

- A developer would ask for it by name ("help me set up sync")
- It covers enough for the agent to complete the task end-to-end
- It doesn't require loading 3 other skills to be useful

Some domains produce multiple skills (a broad domain like "data access"
might yield "live-queries", "mutations", "offline-sync"). Some tasks
span domains (a "go-live" checklist touches security, performance, and
configuration). Both are fine.

Also consider:

- **Lifecycle/journey skills** — if the library's docs include a
  quickstart guide, go-to-production checklist, or migration path,
  suggest these as standalone skills. Don't force them if the docs
  don't have the material.
- **Composition skills** — when peer deps or examples show consistent
  co-usage with another library, output a full skill for the
  integration, not a footnote on a domain.

#### 3c — Flag subsystems within skills

Check each skill area for internal diversity. A skill may be
conceptually unified but contain multiple independent subsystems with
distinct config interfaces — for example, 5 sync adapters that all
solve "connectivity" but each with unique setup, options, and failure
modes.

For each skill, ask: "Does this cover 3+ backends, adapters, drivers,
or providers with distinct configuration surfaces?" If yes, list them
as `subsystems`. These tell the skill-tree-generator to produce
per-subsystem reference files.

Also flag dense API surfaces — if a topic has >10 distinct operators,
option shapes, or patterns (e.g. query operators, schema validation
rules), note it as a `reference_candidates` entry.

#### 3d — Extract failure modes

For each skill, extract failure modes that pass all three tests:

- **Plausible** — An agent would generate this because it looks correct
  based on the library's design, a similar API, or an older version
- **Silent** — No immediate crash; fails at runtime or under specific conditions
- **Grounded** — Traceable to a specific doc page, source location, or issue

**Where to find them:**

| Source               | What to extract                                                      |
| -------------------- | -------------------------------------------------------------------- |
| Migration guides     | Every breaking change → old pattern is the wrong code                |
| Doc callouts         | Any "note", "warning", "avoid" with surrounding context              |
| Source assertions    | `throw` and `invariant()` messages describe the failure              |
| Default values       | Undocumented or surprising defaults that cause wrong behavior        |
| Type precision       | Source type more restrictive than docs imply                         |
| Environment branches | `typeof window`, SSR flags, `NODE_ENV` — behavior differs silently   |
| GitHub issues        | Recurring bug reports with workarounds → wrong/correct code pairs    |
| GitHub discussions   | "How do I…" threads with non-obvious answers → missing skill content |

Target 3 failure modes per skill minimum. Complex skills target 5–6.

**Code patterns.** Every failure mode should include `wrong_pattern` and
`correct_pattern` fields with short code snippets (3–10 lines each).
The wrong pattern is what an agent would generate; the correct pattern
is the fix. These feed directly into SKILL.md Common Mistakes sections
as wrong/correct code pairs. If the failure mode is purely conceptual
(e.g. an architectural choice) rather than a code pattern, omit both
fields and explain in `mechanism` instead.

**Cross-skill failure modes.** Some failure modes belong to multiple
skills. A developer doing SSR work and a developer doing state management
both need to know about "stale state during hydration" — they load
different skills but need the same advice. When a failure mode spans
skills, list all relevant skill slugs in its `skills` field. The
skill-tree-generator will write it into every corresponding SKILL file.

List a cross-skill failure mode once, under its primary skill. Set
the `skills` field to all skill slugs it applies to. Do not duplicate
the entry in the YAML — the skill-tree-generator handles duplication
into multiple SKILL files at generation time.

#### 3e — Identify cross-skill tensions

Look for places where design forces between skills conflict. A tension
is not a failure mode — it's a structural pull where optimizing for one
task makes another harder. Examples:

- "Getting-started simplicity conflicts with production operational safety"
- "Type-safety strictness conflicts with rapid prototyping flexibility"
- "SSR correctness requires patterns that hurt client-side performance"

Tensions are where agents fail most because they optimize for one task
without seeing the tradeoff. Each tension should name the skills in
conflict, describe the pull, and state what an agent gets wrong when it
only considers one side.

Target 2–4 tensions. If you find none, the skills may be too isolated —
revisit whether you're missing cross-connections.

#### 3f — Map cross-references

Beyond tensions (conflicts) and shared failure modes, identify skills
that illuminate each other without conflicting. A cross-reference means:
"an agent loading skill A would produce better code if it knew about
skill B." These become "See also" pointers in the generated SKILL.md
files.

For each pair, note:

- Which skill references which (can be bidirectional)
- Why awareness of the other skill improves output

Examples:

- A quickstart skill references the security checklist ("after setup, audit")
- A state management skill references an SSR skill ("state hydration
  requires understanding SSR lifecycle")
- A data writing skill references a data reading skill ("writes affect
  how queries invalidate")

Output these in the `cross_references` section of domain_map.yaml.

#### 3g — Identify gaps

For each skill, explicitly list what you could NOT determine from docs
and source alone. These become interview questions in Phase 4.

Common gaps:

- "Docs describe X but don't explain when you'd choose X over Y"
- "Migration guide mentions this changed but doesn't say what the old
  behavior was"
- "Source has an assertion here but no doc explains what triggers it"
- "GitHub issues show confusion about X but docs don't address it"
- "I found two patterns for doing X — unclear which is current/preferred"

#### 3h — Discover composition targets

Scan `package.json` for peer dependencies, optional dependencies, and
`peerDependenciesMeta`. Scan example directories and integration tests
for import patterns. For each frequently co-used library, log:

- Library name and which features interact
- Whether it's a required or optional integration
- Any example code showing the integration pattern

These become targeted composition questions in Phase 4e.

#### 3i — Produce the draft

Write the full `domain_map.yaml` (format in Output Artifacts below) with
a `status: draft` field. Flag every gap in the `gaps` section.

Present the draft to the maintainer before starting Phase 4:

> "I've read the docs and source for [library] and produced a draft with
> [N] skills and [M] failure modes. I've flagged [K] specific gaps where
> I need your input."

Include the full draft domain_map.yaml in your message so the maintainer
can review it. Also include a checklist of all docs files you read.

**── STOP ── Do not proceed to Phase 4 until the maintainer has
reviewed the draft and responded. Their response to the draft informs
the detail interview questions.**

---

### Phase 4 — Detail interview (interactive — requires maintainer)

You have the maintainer's task map and a deep read. The interview now
fills gaps, validates your understanding, and surfaces implicit knowledge.

You must ask the questions below to the maintainer and wait for their
responses. Do not infer answers from documentation or source code —
even for gaps you think you can answer from your reading.

#### Rules for Phase 4

1. One topic per message for open-ended questions. You may batch 2–3
   yes/no or short-confirmation questions together.
2. Ask each question as written (you may adapt phrasing to context, but
   keep questions open-ended — never convert to multiple-choice).
3. Each question must reference something specific from your reading.
4. Wait for the maintainer's response after each question before asking
   the next.
5. If the maintainer gives a short answer, probe deeper before moving on.
6. Take notes silently. Do not summarize back unless asked.

#### 4a — Draft review (2–3 questions)

Start by confirming or correcting your skill list and failure modes:

> "Here's the skill list I've built from our earlier conversation plus
> the deep read: [list skills with brief descriptions]. Does this still
> match your thinking? Anything to add, remove, or rename?"

Follow up on any corrections. Then:

> "I identified [M] failure modes from the docs and migration guides. Are
> there important ones I missed — especially patterns that look correct
> but fail silently?"

#### 4b — Gap-targeted questions (3–8 questions)

For each gap flagged in Phase 3g, ask a specific question. These are not
generic — they reference what you found:

**Instead of:** "What do developers get wrong?"
**Ask:** "I noticed the migration guide from v4 to v5 changed how [X] works,
but the docs don't show the old pattern. Do agents still commonly generate
the v4 pattern? What does it look like?"

**Instead of:** "Are there surprising interactions?"
**Ask:** "The source throws an invariant error if [X] is called before [Y],
but the docs don't mention ordering. How often do developers hit this?"

**Instead of:** "What's different in SSR vs client?"
**Ask:** "I found a `typeof window` check in [file] that changes behavior
for [feature]. What goes wrong when developers test only in the browser
and deploy with SSR?"

Adapt from this bank of gap-targeted question templates:

- "I found two patterns for [X] in the docs — [pattern A] and [pattern B].
  Which is current, and does the old one still work?"
- "The source defaults [config option] to [value], which seems surprising
  for [reason]. Is this intentional? Do developers need to override it?"
- "GitHub issues show [N] reports of confusion about [X]. What's the
  underlying misunderstanding?"
- "I couldn't find docs for how [feature A] interacts with [feature B].
  What should an agent know about using them together?"
- "The API reference shows [type signature], but the guide examples use
  a different shape. Which is accurate?"
- "I found [N] GitHub issues/discussions where developers struggled with
  [X]. The common workaround seems to be [Y] — is that the recommended
  approach, or is there a better pattern that should be documented?"
- "GitHub discussions show developers repeatedly asking how to combine
  [feature A] with [feature B]. Is there an intended integration pattern,
  or is this a gap in the current API?"

#### 4c — AI-agent-specific failure modes (2–4 questions)

These target mistakes that AI coding agents make but human developers
typically don't. Agent-specific failures are often the highest-value
findings — in testing, maintainer answers to these questions produced
the most critical failure modes.

- "What mistakes would an AI coding agent make that a human developer
  wouldn't? Think about: hallucinating APIs that don't exist, defaulting
  to language primitives instead of library abstractions, choosing the
  wrong adapter or integration path."
- "When an agent generates code using your library, what's the first
  thing you'd check? What pattern would make you immediately say
  'an AI wrote this'?"
- "Are there parts of your API where the naming or design is misleading
  enough that an agent with no prior context would pick the wrong
  approach? What would it pick, and what should it pick instead?"
- "Are there features where the docs are comprehensive for human
  developers but would still mislead an agent? For example, features
  that require understanding unstated context, or where the 'obvious'
  approach from reading the API surface is wrong."

#### 4d — Implicit knowledge extraction (3–5 questions)

These surface knowledge that doesn't appear in any docs:

- "What does a senior developer using your library know that a mid-level
  developer doesn't — something that isn't written down anywhere?"
- "Are there patterns that work fine for prototyping but are dangerous
  in production? What makes them dangerous?"
- "What question do you answer most often in Discord or GitHub issues
  that the docs technically cover but people still miss?"
- "Is there anything you'd change about the API design if you could break
  backwards compatibility? What's the current workaround?"

#### 4e — Composition questions (if library interacts with others)

Use what you discovered in Phase 3h. For each integration target
identified from peer dependencies and example code, ask targeted
questions:

- "I see [library] is a peer dependency and [N] examples import it
  alongside yours. What's the most common integration mistake?"
- "When developers use [your library] with [other library], are there
  patterns that only matter when both are present?"
- "I found [specific integration pattern] in the examples. Is this the
  recommended approach, or is there a better way that isn't documented?"

---

### Phase 5 — Finalize artifacts

Merge interview findings into the draft. For each interview answer:

1. If it confirms a skill or failure mode — no action needed
2. If it corrects something — update the map
3. If it adds a new failure mode — add it with source "maintainer interview"
4. If it reveals a new skill — add it
5. If it fills a gap — remove from gaps section

Validate the domain_map.yaml by parsing it with a YAML parser. Check for
duplicate keys, invalid syntax, and structural correctness. Fix any issues
before presenting the final artifact.

Update `status: draft` to `status: reviewed`.

---

### Output artifacts

If the maintainer uses a custom skills root, replace `skills/` in the paths
below with their chosen directory.

**Monorepo layout:** For monorepos, domain map artifacts go at the REPO ROOT
(e.g. `_artifacts/domain_map.yaml`) since they describe the whole library.
Skills are generated per-package later by the tree-generator and generate-skill
steps.

#### 1. skills/\_artifacts/domain_map.yaml

```yaml
# domain_map.yaml
# Generated by skill-domain-discovery
# Library: [name]
# Version: [version this map targets]
# Date: [ISO date]
# Status: [draft | reviewed]

library:
  name: '[package-name]'
  version: '[version]'
  repository: '[repo URL]'
  description: '[one line]'
  primary_framework: '[React | Vue | Svelte | framework-agnostic]'

domains:
  - name: '[work-oriented domain name]'
    slug: '[kebab-case]'
    description: '[conceptual grouping — what a developer is reasoning about]'

skills:
  - name: '[task-focused skill name]'
    slug: '[kebab-case]'
    domain: '[parent domain slug]'
    description: '[what a developer is doing — matches a specific task/moment]'
    type: '[core | framework | lifecycle | composition]'
    packages: # required for monorepo; omit for single-package libraries
      - '[primary package name]'
      - '[secondary package name, if skill spans multiple packages]'
    covers:
      - '[API/hook/concept 1]'
      - '[API/hook/concept 2]'
    tasks:
      - '[example task 1]'
      - '[example task 2]'
      - '[example task 3]'
    subsystems: # omit if skill has no independent subsystems
      - name: '[adapter/backend name]'
        package: '[npm package if separate]'
        config_surface: '[brief description of unique config]'
    reference_candidates: # omit if no dense API surfaces
      - topic: '[e.g. query operators, schema validation]'
        reason: '[e.g. >10 distinct operators with signatures]'
    failure_modes:
      - mistake: '[5-10 word phrase]'
        mechanism: '[one sentence]'
        wrong_pattern: | # the code an agent would incorrectly generate
          [short code snippet showing the mistake]
        correct_pattern: | # the code that should be generated instead
          [short code snippet showing the fix]
        source: '[doc page, source file, issue link, or maintainer interview]'
        priority: '[CRITICAL | HIGH | MEDIUM]'
        status: '[active | fixed-but-legacy-risk | removed]'
        version_context: "[e.g. 'Fixed in v5.2 but agents trained on older code still generate this']"
        skills: ['[this-skill-slug]'] # list all skills this belongs to; omit if single-skill
    compositions:
      - library: '[other library name]'
        skill: '[composition skill name if applicable]'

tensions:
  - name: '[short phrase describing the pull]'
    skills: ['[skill-slug-a]', '[skill-slug-b]']
    description: '[what conflicts — one sentence]'
    implication: '[what an agent gets wrong when it only considers one side]'

cross_references:
  - from: '[skill-slug]'
    to: '[skill-slug]'
    reason: '[why loading one skill benefits from awareness of the other]'

gaps:
  - skill: '[skill slug]'
    question: '[what still needs input]'
    context: '[why this matters]'
    status: '[open | resolved]'
```

#### 2. skills/\_artifacts/skill_spec.md

A human-readable companion document. Follow this structure:

```markdown
# [Library Name] — Skill Spec

[2–3 sentences: what this library is, what problem it solves. Factual,
not promotional.]

## Domains

| Domain | Description           | Skills                  |
| ------ | --------------------- | ----------------------- |
| [name] | [conceptual grouping] | [skill-1, skill-2, ...] |

## Skill Inventory

| Skill  | Type                                   | Domain   | What it covers | Failure modes |
| ------ | -------------------------------------- | -------- | -------------- | ------------- |
| [name] | [core/framework/lifecycle/composition] | [domain] | [list]         | [count]       |

## Failure Mode Inventory

### [Skill name] ([count] failure modes)

| #   | Mistake  | Priority | Source                 | Cross-skill?             |
| --- | -------- | -------- | ---------------------- | ------------------------ |
| 1   | [phrase] | CRITICAL | [doc/source/interview] | [other skill slugs or —] |

[Repeat table for each skill.]

## Tensions

| Tension        | Skills              | Agent implication       |
| -------------- | ------------------- | ----------------------- |
| [short phrase] | [slug-a] ↔ [slug-b] | [what agents get wrong] |

## Cross-References

| From   | To     | Reason                                    |
| ------ | ------ | ----------------------------------------- |
| [slug] | [slug] | [why awareness of one improves the other] |

## Subsystems & Reference Candidates

| Skill  | Subsystems                     | Reference candidates       |
| ------ | ------------------------------ | -------------------------- |
| [slug] | [adapter1, adapter2, ...] or — | [topic needing depth] or — |

## Remaining Gaps

| Skill  | Question                 | Status |
| ------ | ------------------------ | ------ |
| [slug] | [what still needs input] | open   |

[Omit this section if all gaps were resolved in the interview.]

## Recommended Skill File Structure

- **Core skills:** [list which skills are framework-agnostic]
- **Framework skills:** [list per-framework skills needed]
- **Lifecycle skills:** [list journey/lifecycle skills if applicable]
- **Composition skills:** [list integration seams needing composition skills]
- **Reference files:** [list skills needing references/ based on subsystems
  or dense API surfaces]

## Composition Opportunities

| Library | Integration points | Composition skill needed?     |
| ------- | ------------------ | ----------------------------- |
| [name]  | [what interacts]   | [yes/no — if yes, skill name] |
```

---

### Constraints

| Check                                 | Rule                                                                       |
| ------------------------------------- | -------------------------------------------------------------------------- |
| Quick scan before interview           | Never interview without at least reading README and package structure      |
| High-level interview before deep read | The maintainer's task map informs what you read deeply                     |
| **Interview phases are interactive**  | Phases 2 and 4 require sending questions to the maintainer and waiting     |
| **Docs are not a substitute**         | Documentation cannot replace maintainer answers — even comprehensive docs  |
| **Open-ended questions stay open**    | Never convert interview questions to multiple-choice or yes/no             |
| **Minimum question counts enforced**  | Each sub-section's minimum count must be met; zero questions = violation   |
| **STOP gates are mandatory**          | Do not proceed past a STOP gate without maintainer response                |
| Batch only confirmations              | Yes/no questions may batch 2–3; open-ended questions get their own message |
| Questions reference findings          | No generic questions — cite what you found                                 |
| Skills are task-focused               | Each skill matches a developer moment, not a conceptual area               |
| 3+ failure modes per skill            | Complex skills target 5–6                                                  |
| Every failure mode sourced            | Doc page, source file, issue link, or maintainer interview                 |
| Gaps are explicit                     | Unknown areas flagged, not guessed                                         |
| No marketing prose                    | Library description is factual, not promotional                            |
| domain_map.yaml is valid YAML         | Parseable by any YAML parser                                               |
| Draft before detail interview         | Present draft for review before Phase 4                                    |
| **Draft reviewed before Phase 4**     | Maintainer must acknowledge or respond to draft before detail interview    |
| Agent-specific failures probed        | Always ask AI-agent-specific questions in Phase 4c                         |
| Compositions discovered from code     | Scan peer deps and examples before asking composition questions            |
| Cross-skill failure modes tagged      | Failure modes spanning skills list all relevant slugs                      |
| Tensions identified                   | 2–4 cross-skill tensions; if none found, revisit skill boundaries          |
| Subsystems flagged                    | Skills with 3+ adapters/backends list them as subsystems                   |
| Dense surfaces flagged                | Topics with >10 patterns noted as reference_candidates                     |
| Lifecycle skills considered           | Suggest journey skills when docs have the material                         |
| Cross-references mapped               | Skills that illuminate each other get "See also" pointers                  |
| **All docs files read**               | List docs directory contents and read every narrative file — no sampling   |

---

### Cross-model compatibility notes

This skill is designed to produce consistent results across Claude, GPT-4+,
Gemini, and open-source models. To achieve this:

- All instructions use imperative sentences, not suggestions
- Interview phases use explicit STOP gates to prevent models from
  continuing autonomously past interactive checkpoints
- Hard rules at the top override any model tendency to rationalize
  skipping interactive phases when documentation is available
- Open-ended questions are explicitly protected from conversion to
  multiple-choice or confirmation prompts, which models default to
  when they have enough context to pre-populate answers
- Output formats use YAML (universally parsed) and Markdown tables
  (universally rendered)
- Examples use concrete values, not placeholders like "[your value here]"
- Section boundaries use Markdown headers (##) for navigation and --- for
  phase separation
- No model-specific features (no XML tags in output, no tool_use assumptions)

<a id="source-intent-packages-intent-meta-generate-skill-skill-md"></a>

## SKILL

Source: `intent:packages/intent/meta/generate-skill/SKILL.md`.

## Skill Generation

You are generating a SKILL.md file for the `@tanstack/intent` agent skills
repo. Skills in this repo are written for coding agents (Claude Code, Cursor,
Copilot, Warp Oz, Codex), not for human readers. Your output will be loaded
into an agent's context window and used to guide code generation.

There are two modes. Detect which applies.

**Mode A — Generate from domain map:** A `domain_map.yaml` and `skill_spec.md`
exist. Generate the skill specified by name from these artifacts plus the
source documentation they reference.

**Mode B — Generate from raw docs:** No domain map exists. Generate directly
from source documentation provided as input.

---

### Inputs

You will receive:

If the maintainer uses a custom skills root, replace `skills/` in any paths
below with their chosen directory.

**Monorepo:** When the skill tree entry has a `package` field, write the
SKILL.md into that package's skills directory (e.g.
`packages/client/skills/core/SKILL.md`), not a shared root.

1. **Skill path** — format `library-group/skill-name` (e.g. `tanstack-query/core`,
   `tanstack-router/loaders`, `db/core/live-queries`). This is the skill's
   directory path, and it is where the `SKILL.md` lives. Only its **last
   segment** becomes the frontmatter `name` (a spec-legal leaf): the full path
   is never written into `name`, and `name` must contain no slashes.
2. **Skill description** — what the skill covers and when an agent should load it
3. **Source documentation** — the docs, guides, API references, and/or source
   files to distill from
4. **Domain map entry** (Mode A only) — the skill's entry from `domain_map.yaml`
   including failure modes, subsystems, compositions, and source references

---

### Step 1 — Determine skill type

Read the inputs and classify the skill type:

| Type          | When to use                                                |
| ------------- | ---------------------------------------------------------- |
| `core`        | Framework-agnostic concepts, configuration, patterns       |
| `sub-skill`   | A focused sub-topic within a core or framework skill       |
| `framework`   | Framework-specific bindings, hooks, components             |
| `lifecycle`   | Cross-cutting developer journey (getting started, go-live) |
| `composition` | Integration between two or more libraries                  |
| `security`    | Audit checklist or security validation                     |

The skill type determines the frontmatter and body structure. See
skill-tree-generator for the full spec of each type.

---

#### Subagent guidance for batch generation

When generating multiple skills, spawn a separate subagent for each skill
(or per-package group). Each subagent receives the domain_map.yaml,
skill_tree.yaml, and the source docs relevant to its skill. This prevents
context bleed between skills and allows parallel generation.

---

### Step 2 — Extract content from sources

**Line budget:** Each SKILL.md must stay under 500 lines. Before writing,
estimate the content size. If a skill has 5+ failure modes, 3+ primary
patterns, and subsystem details, proactively plan reference files during
extraction — don't wait until the skill exceeds the limit.

Read through the source documentation. Extract only what a coding agent
cannot already know:

#### What to extract

- **API shapes** — function signatures, hook parameters, option objects,
  return types. Use the actual TypeScript types from source.
- **Setup patterns** — minimum viable initialization code
- **Primary patterns** — the 2–4 most important usage patterns
- **Configuration** — defaults that matter, options that change behavior
- **Failure modes** — patterns that look correct but break. Prioritize:
  - Migration-boundary mistakes (old API that agents trained on older data produce)
  - Silent failures (no crash, wrong behavior)
  - Framework-specific gotchas (hydration, hook rules, provider ordering)
- **Constraints and invariants** — ordering requirements, lifecycle rules,
  things enforced by runtime assertions
- **Issue/discussion-sourced patterns** — real developer mistakes and
  confusion surfaced from GitHub issues and discussions (see below)

#### 2b — Scan GitHub issues and discussions

Before writing the skill body, search the library's GitHub repo for issues
and discussions relevant to THIS skill's topic. This step is important for
both initial generation and regeneration — issue discussions reveal
failure modes that docs miss.

**Search strategy:**

1. Search issues for the skill's primary APIs, hooks, and config options
   by name (e.g. `useQuery invalidation`, `createRouter middleware`)
2. Filter to high-signal threads: sort by reactions/comments, focus on
   closed bugs with workarounds and open questions with long threads
3. Search Discussions (if the repo uses them) for "how do I…" threads
   related to the skill's topic
4. Check for issues labeled `bug`, `question`, `breaking-change` that
   mention concepts this skill covers

**What to incorporate:**

- **Recurring bug workarounds** → add as Common Mistakes entries with
  wrong/correct code pairs. Cite the issue URL in the `Source` field.
- **Frequently asked questions** → if the answer is non-obvious, add it
  to Core Patterns or as a dedicated pattern section
- **Misunderstandings about defaults** → add to Common Mistakes with the
  incorrect assumption as the "wrong" pattern
- **Resolved issues that changed behavior** → if the old behavior is
  still in agent training data, add as a migration-boundary mistake

**What NOT to incorporate:**

- One-off bugs already fixed with no broader pattern
- Feature requests for APIs that don't exist yet
- Issues about tooling, CI, or build that don't affect library usage
- Stale threads (>2 years old) about behavior that has fundamentally changed

**Fallback:** If no web access is available, check for FAQ.md,
TROUBLESHOOTING.md, or docs/faq in the repo. Also check whether the
domain_map.yaml already contains issue-sourced failure modes from
domain-discovery — use those directly.

#### What NOT to extract

- TypeScript basics, React hooks concepts, general web dev knowledge
- Marketing copy, motivational prose, "why this library is great"
- Exhaustive API tables (move these to `references/` if needed)
- Content that duplicates another skill (reference it instead)

---

### Step 3 — Write the frontmatter

#### Core skill frontmatter

```yaml
---
name: '[leaf-segment]' # last path segment only — no slashes, must equal the parent dir (skills/tanstack-query/core/ → core)
description: >
  [1–3 sentences. What this skill covers and exactly when an agent should
  load it. Written for the agent — include the keywords an agent would
  encounter when it needs this skill. Dense routing key.]
metadata:
  type: core
  library: '[library]'
  library_version: '[version this targets]'
sources:
  - '[Owner/repo]:docs/[path].md'
  - '[Owner/repo]:src/[path].ts'
---
```

#### Sub-skill frontmatter

```yaml
---
name: '[leaf-segment]' # last path segment only — no slashes, must equal the parent dir (skills/tanstack-query/loaders/ → loaders)
description: >
  [1–3 sentences. What this sub-topic covers and when to load it.]
metadata:
  type: sub-skill
  library: '[library]'
  library_version: '[version]'
sources:
  - '[Owner/repo]:docs/[path].md'
---
```

#### Framework skill frontmatter

```yaml
---
name: '[framework]' # leaf segment (the framework name) — no slashes, must equal the parent dir (skills/tanstack-query/react/ → react)
description: >
  [1–3 sentences. Framework-specific bindings. Name the hooks, components,
  providers.]
metadata:
  type: framework
  library: '[library]'
  framework: '[react | vue | solid | svelte | angular]'
  library_version: '[version]'
requires:
  - '[library]/core'
sources:
  - '[Owner/repo]:docs/framework/[framework]/[path].md'
---
```

#### Frontmatter rules

- `name` is the spec-legal leaf segment — lowercase letters, numbers, and
  hyphens only — and matches the skill's parent directory. It carries no
  slashes; the namespace lives in the skill's directory path instead.
- Intent-specific scalars (`type`, `library`, `library_version`, `framework`)
  live under the `metadata` map. The Agent Skills spec permits only `name`,
  `description`, `license`, `compatibility`, `metadata`, and `allowed-tools`
  at the top level, so emitting these scalars at the top level fails
  validation.
- `description` must be written so the agent loads this skill at the right
  time — not too broad (triggers on everything) and not too narrow (never
  triggers). Pack with function names, option names, concept keywords.
- `sources` uses the format `Owner/repo:relative-path`. Glob patterns are
  supported (e.g. `TanStack/query:docs/framework/react/guides/*.md`).
- `metadata.library_version` is the version of the source library this skill
  targets.
- `requires` lists skills that must be loaded before this one.

---

### Step 4 — Write the body

#### Standard body (core, sub-skill, framework)

Follow this section order exactly:

**1. Dependency note** (framework and sub-skills only)

```markdown
This skill builds on [parent-skill]. Read it first for foundational concepts.
```

**2. Setup**

A complete, copy-pasteable code block showing minimum viable usage.

- Real package imports with exact names (`@tanstack/react-query`, not `react-query`)
- No `// ...` or `[your code here]` — complete and runnable
- No unnecessary boilerplate — include exactly the context needed
- For framework skills: framework-specific setup (provider, hook wiring)
- For core skills: framework-agnostic setup (no hooks, no components)

**3. Core Patterns** (or "Hooks and Components" for framework skills)

2–4 patterns. For each:

- One-line heading: what it accomplishes
- Complete code block
- One sentence of explanation only if not self-explanatory

**4. Common Mistakes**

Minimum 3 entries. Complex skills target 5–6. Format:

````markdown
### [PRIORITY] [What goes wrong — 5–8 word phrase]

Wrong:

```[lang]
// code that looks correct but isn't
```
````

Correct:

```[lang]
// code that works
```

[One sentence: the specific mechanism by which the wrong version fails.]

Source: [doc page or source file:line]

````

Priority levels:
- **CRITICAL** — Breaks in production. Security risk or data loss.
- **HIGH** — Incorrect behavior under common conditions.
- **MEDIUM** — Incorrect under specific conditions or edge cases.

Every mistake must be:
- **Plausible** — an agent would generate it
- **Silent** — no immediate crash
- **Grounded** — traceable to a doc page, source file, or issue

If the domain map includes failure modes with a `skills` list naming
multiple skills, include those failure modes in every SKILL file listed.

**5. References** (only when needed)

```markdown
## References

- [Full option reference](references/options.md)
````

Create reference files when the skill would exceed 500 lines, when the
domain covers 3+ independent adapters/backends, or when a topic has >10
distinct API patterns.

#### Checklist body (security, go-live, audit)

Use when the primary action is "check these things" not "learn patterns":

````markdown
# [Library Name] — [Security | Go-Live] Checklist

Run through each section before [deploying | releasing].

## [Category] Checks

### Check: [what to verify]

Expected:

```[lang]
// correct configuration
```
````

Fail condition: [what indicates this check failed]
Fix: [one-line remediation]

### Common Security Mistakes

[Wrong/correct pairs, same format as standard Common Mistakes]

### Pre-Deploy Summary

- [ ] [Verification 1]
- [ ] [Verification 2]

```

---

## Step 5 — Validate

Run every check before outputting. Fix any failures.

| Check | Rule |
|-------|------|
| Under 500 lines | Move excess to references/ |
| Real imports in every code block | Exact package name, correct adapter |
| No external concept explanations | No "TypeScript is...", no "React hooks are..." |
| No marketing prose | No "powerful", "elegant", "best-in-class" |
| Every code block is complete | Works without modification when pasted |
| Common Mistakes are silent | Not obvious compile errors |
| Common Mistakes are library-specific | Not generic TS/React mistakes |
| Common Mistakes are sourced | Traceable to doc or source |
| `name` is the leaf, matches parent dir | `db/core/live-queries/SKILL.md` → name: `live-queries` (no slashes) |
| `sources` filled for sub-skills | At least one Owner/repo:path |
| Framework skills have `requires` | Lists core dependency |
| Framework skills open with dependency note | First prose line references core |
| Description is a dense routing key | Not a human summary — agent-facing |

---

## Step 6 — Output

Before generating, ask the maintainer: "Would you like to review each skill
individually before I generate the next one, or should I generate all skills
and you review them together?" Respect their preference.

Output the complete SKILL.md file content. If reference files are needed,
output those as well with their relative paths.

If generating multiple skills in a batch (e.g. all skills for a library),
output in this order:

1. Core overview SKILL.md
2. Core sub-skills in domain order
3. Framework overview SKILL.md for each framework
4. Framework sub-skills
5. Composition skills
6. Security/checklist skills
7. Reference files

---

## Regeneration mode

When regenerating a stale skill (triggered by skill-staleness-check):

1. Read the existing SKILL.md and the source diff that triggered staleness
2. Scan GitHub issues and discussions opened since the skill was last
   generated (use `library_version` or file timestamps as the baseline).
   Look for new failure modes, resolved confusion, or changed patterns
   related to this skill's topic. Apply the same search strategy from
   Step 2b but scoped to the time window since last generation.
3. Determine which sections are affected by the source change AND by
   any new issue/discussion findings
4. Update only affected sections — preserve all other content
5. If a breaking change occurred, add the old pattern as a new Common
   Mistake entry (wrong/correct pair)
6. If issues/discussions reveal new failure modes not in the existing
   skill, add them to Common Mistakes with issue URLs as sources
7. Bump `library_version` in frontmatter
8. Validate the complete file against Step 5 checks

Do not rewrite the entire skill for a minor source change. Surgical
updates preserve review effort and reduce diff noise.

---

## Constraints

| Rule | Detail |
|------|--------|
| Match the library's framework support | Generate framework skills only for adapters the library actually provides. If the library supports only React, only generate React examples. If it supports multiple frameworks, generate one skill per adapter. |
| All imports use real package names | `@tanstack/react-query`, not `react-query` |
| No placeholder code | No `// ...`, `[your value]`, or `...rest`. Idiomatic framework patterns like `{children}` or `{props.title}` in JSX are not placeholders — they are real code and are acceptable. |
| Agent-first writing | Only write what the agent cannot already know |
| Examples are minimal | No unnecessary boilerplate or wrapper components |
| Failure modes are high-value | Focus on plausible-but-broken, not obvious errors |

---

## Cross-model compatibility

Output is consumed by all major AI coding agents. To ensure consistency:

- Markdown with YAML frontmatter — universally parsed
- No XML tags in generated skill content
- Code blocks use triple backticks with language annotation
- Section boundaries use ## headers
- Descriptions are keyword-packed for routing
- Examples show concrete values, never placeholders
- Positive instructions ("Use X") over negative ("Don't use Y")
- Critical info at start or end of sections (not buried in middle)
- Each SKILL.md is self-contained except for declared `requires`

```
