# SKILL — Cross-model compatibility

[Guide and prerequisites](./intent-packages-intent-meta-tree-generator-skill-md-15d27e85.md) · Release-matched documentation · `@tanstack/intent@0.4.0`.

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

---
