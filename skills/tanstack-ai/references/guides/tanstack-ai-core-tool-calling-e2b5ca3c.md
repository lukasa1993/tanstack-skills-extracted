# Tool Calling

<a id="source-tanstack-ai-core-tool-calling"></a>

Published skill · `@tanstack/ai@0.53.0`.

[Topic index](../tools-outputs-middleware.md) · [Source provenance](../SOURCES.md)

## Choose a section

Read the overview or setup when it is a prerequisite, then the section needed for the task.

- [Overview](./tanstack-ai-core-tool-calling-e2b5ca3c--overview.md) — 1 KiB
- [Setup](./tanstack-ai-core-tool-calling-e2b5ca3c--setup.md) — 4 KiB
- [Core Patterns](./tanstack-ai-core-tool-calling-e2b5ca3c--core-patterns.md) — 11 KiB
- [MCP Tools](./tanstack-ai-core-tool-calling-e2b5ca3c--mcp-tools.md) — 8 KiB
- [Provider Skills](./tanstack-ai-core-tool-calling-e2b5ca3c--provider-skills.md) — 4 KiB
- [Common Mistakes](./tanstack-ai-core-tool-calling-e2b5ca3c--common-mistakes.md) — 1 KiB
- [Cross-References](./tanstack-ai-core-tool-calling-e2b5ca3c--cross-references.md) — 1 KiB

<!-- Original source anchors retained for inbound links. -->
<a id="tool-calling"></a>
<a id="setup"></a>
<a id="core-patterns"></a>
<a id="generic-middleware-interrupts"></a>
<a id="pattern-1-server-only-tool"></a>
<a id="pattern-2-client-only-tool"></a>
<a id="pattern-3-tool-with-approval-flow"></a>
<a id="pattern-4-lazy-tool-discovery"></a>
<a id="tuning-the-lazy-catalog-with-lazytoolsconfig"></a>
<a id="mcp-tools"></a>
<a id="basic-usage-auto-discovery"></a>
<a id="typed-path-pass-tooldefinition-instances"></a>
<a id="multiple-servers-with-createmcpclients"></a>
<a id="toolexecutioncontextabortsignal-cancelling-long-running-tools"></a>
<a id="stdio-transport-node-only"></a>
<a id="chat-mcp-discovery-lifecycle-in-one-prop"></a>
<a id="provider-skills"></a>
<a id="anthropic-codeexecutiontool-with-skills"></a>
<a id="openai-shelltool-with-skills-responses-api-only"></a>
<a id="scope"></a>
<a id="common-mistakes"></a>
<a id="a-high-not-passing-tool-definitions-to-both-server-and-client"></a>
<a id="cross-references"></a>
