# Adapter Configuration — Tension

[Guide and prerequisites](./tanstack-ai-core-adapter-configuration-e2c12fef.md) · Published skill · `@tanstack/ai@0.54.0`.

## Tension

**HIGH Tension: Type safety vs. quick prototyping** -- Per-model type safety
requires specific model string literals. Quick prototyping wants dynamic
selection with `string` variables. Agents optimizing for quick setup silently
lose type safety. If model names come from user input or config files, use
`extendAdapter()` to add custom names.
