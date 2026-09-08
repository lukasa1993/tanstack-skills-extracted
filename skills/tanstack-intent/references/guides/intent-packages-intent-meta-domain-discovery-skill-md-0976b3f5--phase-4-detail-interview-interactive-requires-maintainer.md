# SKILL — Phase 4 — Detail interview (interactive — requires maintainer)

[Guide and prerequisites](./intent-packages-intent-meta-domain-discovery-skill-md-0976b3f5.md) · Release-matched documentation · `@tanstack/intent@0.4.0`.

## Phase 4 — Detail interview (interactive — requires maintainer)

You have the maintainer's task map and a deep read. The interview now
fills gaps, validates your understanding, and surfaces implicit knowledge.

You must ask the questions below to the maintainer and wait for their
responses. Do not infer answers from documentation or source code —
even for gaps you think you can answer from your reading.

### Rules for Phase 4

1. One topic per message for open-ended questions. You may batch 2–3
   yes/no or short-confirmation questions together.
2. Ask each question as written (you may adapt phrasing to context, but
   keep questions open-ended — never convert to multiple-choice).
3. Each question must reference something specific from your reading.
4. Wait for the maintainer's response after each question before asking
   the next.
5. If the maintainer gives a short answer, probe deeper before moving on.
6. Take notes silently. Do not summarize back unless asked.

### 4a — Draft review (2–3 questions)

Start by confirming or correcting your skill list and failure modes:

> "Here's the skill list I've built from our earlier conversation plus
> the deep read: [list skills with brief descriptions]. Does this still
> match your thinking? Anything to add, remove, or rename?"

Follow up on any corrections. Then:

> "I identified [M] failure modes from the docs and migration guides. Are
> there important ones I missed — especially patterns that look correct
> but fail silently?"

### 4b — Gap-targeted questions (3–8 questions)

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

### 4c — AI-agent-specific failure modes (2–4 questions)

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

### 4d — Implicit knowledge extraction (3–5 questions)

These surface knowledge that doesn't appear in any docs:

- "What does a senior developer using your library know that a mid-level
  developer doesn't — something that isn't written down anywhere?"
- "Are there patterns that work fine for prototyping but are dangerous
  in production? What makes them dangerous?"
- "What question do you answer most often in Discord or GitHub issues
  that the docs technically cover but people still miss?"
- "Is there anything you'd change about the API design if you could break
  backwards compatibility? What's the current workaround?"

### 4e — Composition questions (if library interacts with others)

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
