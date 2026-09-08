# SKILL — Phase 2 — High-level interview (interactive — requires maintainer)

[Guide and prerequisites](./intent-packages-intent-meta-domain-discovery-skill-md-0976b3f5.md) · Release-matched documentation · `@tanstack/intent@0.4.0`.

## Phase 2 — High-level interview (interactive — requires maintainer)

The maintainer's mental model of developer tasks IS the skill map. Your
job in this phase is to extract it — not to propose your own structure.

You must ask the questions below to the maintainer and wait for their
responses. Do not infer answers from documentation or source code.

### Rules for Phase 2

1. One topic per message for open-ended questions. You may batch 2–3
   yes/no or short-confirmation questions together.
2. Ask each question as written (you may adapt phrasing to context, but
   keep questions open-ended — never convert to multiple-choice).
3. Wait for the maintainer's response after each question before asking
   the next.
4. Take notes silently. Do not summarize back unless asked.
5. If the maintainer gives a short answer, probe deeper before moving on.

### 2a — Developer tasks (2–4 questions)

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

### 2b — Developer journeys (1–2 questions)

Surface lifecycle/journey skills that cross-cut task areas:

> "Are there developer journeys that cut across multiple features?
> For example: a getting-started guide, a go-to-production checklist,
> a migrate-from-v4 walkthrough. Which of these exist in your docs
> or would be valuable as standalone skills?"

### 2c — Composition and ecosystem (1–3 questions)

> "Which other libraries does yours compose with most often? Are there
> integration patterns important enough to warrant their own skill —
> for example, using your library with [framework/ORM/router]?"

> "Are there tasks that developers might expect your library to handle,
> but that are actually handled by a companion library? Which tasks
> should we explicitly exclude from your library's skills?"

### 2d — Exclude experimental features (1 question)

> "Are there any features that are experimental, unstable, or not yet
> ready to document for agents? We'll exclude these from the skill set."

### 2e — Confirm initial skill map

Synthesize what you heard into a proposed skill list and present it:

> "Based on what you've told me, here's my proposed skill list:
> [enumerate skills with one-line descriptions]. Does this match how
> you think about your library? What would you add, remove, or rename?"

**── STOP ── Do not proceed to Phase 3 until the maintainer has
reviewed and confirmed (or corrected) the skill list.**

---
