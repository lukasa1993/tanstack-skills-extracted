# SKILL — Step 2 — Extract content from sources

[Guide and prerequisites](./intent-packages-intent-meta-generate-skill-skill-md-5760b239.md) · Release-matched documentation · `@tanstack/intent@0.4.0`.

## Step 2 — Extract content from sources

**Line budget:** Each SKILL.md must stay under 500 lines. Before writing,
estimate the content size. If a skill has 5+ failure modes, 3+ primary
patterns, and subsystem details, proactively plan reference files during
extraction — don't wait until the skill exceeds the limit.

Read through the source documentation. Extract only what a coding agent
cannot already know:

### What to extract

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

### 2b — Scan GitHub issues and discussions

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

### What NOT to extract

- TypeScript basics, React hooks concepts, general web dev knowledge
- Marketing copy, motivational prose, "why this library is great"
- Exhaustive API tables (move these to `references/` if needed)
- Content that duplicates another skill (reference it instead)

---
