# Structured Outputs

<a id="source-tanstack-ai-core-structured-outputs"></a>

Published skill · `@tanstack/ai@0.53.0`.

[Topic index](../tools-outputs-middleware.md) · [Source provenance](../SOURCES.md)

## Choose a section

Read the overview or setup when it is a prerequisite, then the section needed for the task.

- [Overview](./tanstack-ai-core-structured-outputs-fef450ef--overview.md) — 1 KiB
- [Setup](./tanstack-ai-core-structured-outputs-fef450ef--setup.md) — 2 KiB
- [Decision: which pattern fits](./tanstack-ai-core-structured-outputs-fef450ef--decision-which-pattern-fits.md) — 2 KiB
- [Core Patterns: Pattern 1: Basic structured output with Zod](./tanstack-ai-core-structured-outputs-fef450ef--core-patterns-pattern-1-basic-structured-output-with-zod.md) — 2 KiB
- [Core Patterns: Pattern 2: Complex nested schemas](./tanstack-ai-core-structured-outputs-fef450ef--core-patterns-pattern-2-complex-nested-schemas.md) — 2 KiB
- [Core Patterns: Pattern 3: Direct stream iteration](./tanstack-ai-core-structured-outputs-fef450ef--core-patterns-pattern-3-direct-stream-iteration.md) — 7 KiB
- [Core Patterns: Pattern 4: useChat with outputSchema (progressive UI)](./tanstack-ai-core-structured-outputs-fef450ef--core-patterns-pattern-4-usechat-with-outputschema-progressive-ui.md) — 3 KiB
- [Core Patterns: Pattern 5: Multi-turn structured chat](./tanstack-ai-core-structured-outputs-fef450ef--core-patterns-pattern-5-multi-turn-structured-chat.md) — 4 KiB
- [Core Patterns: Pattern 6: Harness adapters (Claude Code, Codex, OpenCode, Grok Build, ACP)](./tanstack-ai-core-structured-outputs-fef450ef--core-patterns-pattern-6-harness-adapters-claude-code-codex-opencode-grok-build-acp.md) — 3 KiB
- [Common Mistakes](./tanstack-ai-core-structured-outputs-fef450ef--common-mistakes.md) — 6 KiB
- [Middleware coverage](./tanstack-ai-core-structured-outputs-fef450ef--middleware-coverage.md) — 1 KiB
- [Cross-References](./tanstack-ai-core-structured-outputs-fef450ef--cross-references.md) — 2 KiB

<!-- Original source anchors retained for inbound links. -->
<a id="structured-outputs"></a>
<a id="setup"></a>
<a id="decision-which-pattern-fits"></a>
<a id="core-patterns"></a>
<a id="pattern-1-basic-structured-output-with-zod"></a>
<a id="pattern-2-complex-nested-schemas"></a>
<a id="pattern-3-direct-stream-iteration"></a>
<a id="pattern-4-usechat-with-outputschema-progressive-ui"></a>
<a id="pattern-5-multi-turn-structured-chat"></a>
<a id="pattern-6-harness-adapters-claude-code-codex-opencode-grok-build-acp"></a>
<a id="common-mistakes"></a>
<a id="high-filtering-textparts-out-of-usechat-renderers-when-using-outputschema"></a>
<a id="high-treating-partial-final-as-sticky-state-across-turns"></a>
<a id="high-parsing-streaming-json-deltas-yourself"></a>
<a id="high-trying-to-implement-provider-specific-structured-output-strategies"></a>
<a id="high-passing-raw-objects-instead-of-using-the-projects-schema-library"></a>
<a id="middleware-coverage"></a>
<a id="cross-references"></a>
