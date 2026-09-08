# SKILL — Overview

[Guide and prerequisites](./intent-packages-intent-meta-domain-discovery-skill-md-0976b3f5.md) · Release-matched documentation · `@tanstack/intent@0.4.0`.

# Domain Discovery & Maintainer Interview

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

### Lightweight path (small libraries)

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

### Hard rules — interview phases are mandatory and interactive

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
