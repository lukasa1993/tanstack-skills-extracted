# SKILL — Step 4 — Write the body

[Guide and prerequisites](./intent-packages-intent-meta-generate-skill-skill-md-5760b239.md) · Release-matched documentation · `@tanstack/intent@0.4.0`.

## Step 4 — Write the body

### Standard body (core, sub-skill, framework)

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

### Checklist body (security, go-live, audit)

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
