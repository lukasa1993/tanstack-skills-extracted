# SKILL — 4. Write the bounded change

[Guide and prerequisites](./intent-packages-intent-meta-generate-skill-skill-md-5760b239.md) · Release-matched documentation · `@tanstack/intent@0.5.2`.

## 4. Write the bounded change

Apply the writing rules below to each task in the agreed batch. For a **new skill**, read [the skill format](https://github.com/TanStack/intent/blob/796fd6a054846da260ca579e1d744679cc2512bf/packages/intent/meta/generate-skill/references/skill-format.md) for frontmatter, body, and prerequisite conventions. Source documentation can establish the batch’s evidence; create or extend its required planning record alongside the skills.

For an **update**, preserve established names, layout, terminology, and scope unless the actual change requires otherwise. Edit only affected sections and references. Add a sourced old/new example when a changed pattern would otherwise mislead users. Reconcile all three planning documents with the change using the planning record procedure; update affected entries and preserve accurate, unrelated decisions. Change `metadata.library_version` only when the revised guidance is verified for that version; do not fabricate historical versions or rewrite unrelated metadata to clear a staleness signal.

### Writing rules

- Write `description` as self-contained activation guidance: concrete developer tasks, library/framework context, and relevant boundaries. Name each distinct task once instead of listing synonymous triggers. Include requests that omit API names. Other agents must be able to select the skill from this standard field alone; exact wording is not a validation rule.
- Put the descriptive explanation of what the skill is for in `metadata.purpose`. For an existing skill without that field, copy its pre-edit description text unchanged before writing the activation description. Preserve an existing purpose; never replace it with a later activation description. Read [the field contract](https://github.com/TanStack/intent/blob/796fd6a054846da260ca579e1d744679cc2512bf/packages/intent/meta/generate-skill/references/skill-format.md#purpose-and-activation) before this migration or when creating either field.
- Start the body with the task procedure. Keep skill-selection criteria in `description`; retain execution prerequisites, conditional reference pointers, and downstream handoffs in the body.
- Each independent skill enables an independently useful developer task. Keep common, necessary guidance accessible from its entry point.
- Put conditional detail behind a Markdown link that says **when to read it**. Choose reference boundaries by relevance, not proximity to 500 lines.
- Group features used in the same developer task under one skill. Use references for conditional detail within that task; create a separate skill only for a task worth discovering independently. API exports and feature counts do not determine skill boundaries.
- Give shared rules one authoritative home, keeping each rule beside its exceptions and failure conditions. Every affected entry point must route to that home with the required reading condition; preserve genuine prerequisites and failure handling when removing duplication.
- Use source, types, and docs for readily discoverable facts. Capture the decisions, constraints, and pitfalls they do not make obvious. Include the API detail necessary to make the task's examples usable.
- Keep necessary, complete examples with real imports and concrete values. Ground pitfalls in evidence; do not manufacture mistakes to meet a quota.
- End each workflow step with a checkable result or failure condition. Complete the task only when all required results are verified; report missing evidence explicitly. A shorter file that omits required behavior is not an improvement.
- Give one supported default, with alternatives only for a concrete condition. Specify exact steps for fragile operations and allow judgment where approaches are equivalent. Keep non-obvious failure constraints at the entry point when the agent could miss a conditional reference.
- When adding commands or reusable automation, follow [script guidance](https://github.com/TanStack/intent/blob/796fd6a054846da260ca579e1d744679cc2512bf/packages/intent/meta/generate-skill/references/skill-format.md#commands-and-bundled-scripts). Bundle tested logic only when it prevents repeated reinvention or fragile command construction.
