# SKILL — 2. Read the evidence and choose the owner

[Guide and prerequisites](./intent-packages-intent-meta-generate-skill-skill-md-5760b239.md) · Release-matched documentation · `@tanstack/intent@0.5.5`.

## 2. Read the evidence and choose the owner

Read the relevant source, types, tests, docs, examples, and existing skills with their required references. Follow imports or related guidance where they affect the task. Record the source revision or package version used. For an update, inspect the supplied change and the existing skill's claims; use an actual diff or documented before/after behavior when available. A version change alone does not establish changed behavior or a baseline.

Prefer updating guidance that already owns the task. Create one new skill only when developers would benefit from discovering that task independently. Clarify an ambiguous boundary with a concrete example: would a developer trying this task need the same guidance, or a different prerequisite or workflow? Keep the library's established names and terminology.

Expand research only to close a task-relevant gap. Read the relevant FAQ, migration guide, or issue/discussion when local evidence does not explain a failure or intended behavior. Verify external evidence against the target version. Do not scan broad issue histories or regenerate the library for a routine update.

Before editing, identify the existing sections affected or the independently useful task that justifies a new file. If the inspected change leaves all relevant guidance accurate, report the evidence and make no content rewrite or artificial version bump. Missing or conflicting evidence is uncertainty, not “no impact”; state what is missing and which conclusion it blocks.
