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

Before the deep read, load [the Phase 3 procedure](https://github.com/TanStack/intent/blob/bffcdabbdb9a55af5a3ba1ff09ece0f7da223eb2/packages/intent/meta/domain-discovery/references/deep-read.md).
Follow its reading order and steps 3a–3i to extract sourced failure modes,
domains, task-focused skills, tensions, references, gaps, and compositions.
Use [the artifact formats](https://github.com/TanStack/intent/blob/bffcdabbdb9a55af5a3ba1ff09ece0f7da223eb2/packages/intent/meta/domain-discovery/references/artifacts.md) for the draft.

**── STOP ── Present the draft and wait for the maintainer's review before
starting Phase 4.**

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

Before writing the draft in Phase 3 or finalizing it in Phase 5, read
[the artifact formats and placement rules](https://github.com/TanStack/intent/blob/bffcdabbdb9a55af5a3ba1ff09ece0f7da223eb2/packages/intent/meta/domain-discovery/references/artifacts.md).
Produce both `domain_map.yaml` and `skill_spec.md` using those schemas;
retain the documented custom-root and monorepo placement.

### Constraints

| Check                                 | Rule                                                                                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Quick scan before interview           | Never interview without at least reading README and package structure                                                                |
| High-level interview before deep read | The maintainer's task map informs what you read deeply                                                                               |
| **Interview phases are interactive**  | Phases 2 and 4 require sending questions to the maintainer and waiting                                                               |
| **Docs are not a substitute**         | Documentation cannot replace maintainer answers — even comprehensive docs                                                            |
| **Open-ended questions stay open**    | Never convert interview questions to multiple-choice or yes/no                                                                       |
| **Minimum question counts enforced**  | Each sub-section's minimum count must be met; zero questions = violation                                                             |
| **STOP gates are mandatory**          | Do not proceed past a STOP gate without maintainer response                                                                          |
| Batch only confirmations              | Yes/no questions may batch 2–3; open-ended questions get their own message                                                           |
| Questions reference findings          | No generic questions — cite what you found                                                                                           |
| Skills are task-focused               | Each skill matches a developer moment, not a conceptual area                                                                         |
| 3+ failure modes per skill            | Complex skills target 5–6                                                                                                            |
| Every failure mode sourced            | Doc page, source file, issue link, or maintainer interview                                                                           |
| Gaps are explicit                     | Unknown areas flagged, not guessed                                                                                                   |
| No marketing prose                    | Library description is factual, not promotional                                                                                      |
| domain_map.yaml is valid YAML         | Parseable by any YAML parser                                                                                                         |
| Draft before detail interview         | Present draft for review before Phase 4                                                                                              |
| **Draft reviewed before Phase 4**     | Maintainer must acknowledge or respond to draft before detail interview                                                              |
| Agent-specific failures probed        | Always ask AI-agent-specific questions in Phase 4c                                                                                   |
| Compositions discovered from code     | Scan peer deps and examples before asking composition questions                                                                      |
| Cross-skill failure modes tagged      | Failure modes spanning skills list all relevant slugs                                                                                |
| Tensions identified                   | 2–4 cross-skill tensions; if none found, revisit skill boundaries                                                                    |
| Subsystems flagged                    | Skills with 3+ adapters/backends list them as subsystems                                                                             |
| Dense surfaces flagged                | Topics with >10 patterns noted as reference_candidates                                                                               |
| Lifecycle skills considered           | Suggest journey skills when docs have the material                                                                                   |
| Cross-references mapped               | Skills that illuminate each other get "See also" pointers                                                                            |
| **Documentation coverage**            | Read all local narrative files; document external sampling under the [Phase 3 reading policy](https://github.com/TanStack/intent/blob/bffcdabbdb9a55af5a3ba1ff09ece0f7da223eb2/packages/intent/meta/domain-discovery/references/deep-read.md#reading-order) |

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
tree-generator for the full spec of each type.

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
