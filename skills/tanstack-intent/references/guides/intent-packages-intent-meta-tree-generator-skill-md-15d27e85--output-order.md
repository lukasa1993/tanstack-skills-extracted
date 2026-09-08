# SKILL — Output order

[Guide and prerequisites](./intent-packages-intent-meta-tree-generator-skill-md-15d27e85.md) · Release-matched documentation · `@tanstack/intent@0.4.0`.

## Output order

When generating a complete skill tree:

1. Core overview SKILL.md — entry point for the library
2. Core sub-skills in domain order
3. Framework overview SKILL.md for each framework
4. Framework sub-skills
5. Composition skills (if applicable)
6. Security skills (if applicable)
7. references/ files for any skill that needs them
8. CHANGELOG.md entry

When updating:

1. staleness_report.yaml
2. Updated SKILL.md files (core then framework)
3. CHANGELOG.md entry

---
