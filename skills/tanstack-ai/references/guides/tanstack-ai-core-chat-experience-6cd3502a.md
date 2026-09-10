# Chat Experience

<a id="source-tanstack-ai-core-chat-experience"></a>

Published skill · `@tanstack/ai@0.54.0`.

[Topic index](../chat-providers.md) · [Source provenance](../SOURCES.md)

## Choose a section

Read the overview or setup when it is a prerequisite, then the section needed for the task.

- [Overview](./tanstack-ai-core-chat-experience-6cd3502a--overview.md) — 1 KiB
- [Setup — Minimal Chat App](./tanstack-ai-core-chat-experience-6cd3502a--setup-minimal-chat-app.md) — 3 KiB
- [Core Patterns: 1. Streaming Chat with SSE](./tanstack-ai-core-chat-experience-6cd3502a--core-patterns-1-streaming-chat-with-sse.md) — 3 KiB
- [Core Patterns: 2. Rendering Thinking/Reasoning Content](./tanstack-ai-core-chat-experience-6cd3502a--core-patterns-2-rendering-thinking-reasoning-content.md) — 2 KiB
- [Core Patterns: 3. Sending Multimodal Content (Images)](./tanstack-ai-core-chat-experience-6cd3502a--core-patterns-3-sending-multimodal-content-images.md) — 2 KiB
- [Core Patterns: 4. Sending Audio Messages (Browser Recording)](./tanstack-ai-core-chat-experience-6cd3502a--core-patterns-4-sending-audio-messages-browser-recording.md) — 2 KiB
- [Core Patterns: 5. HTTP Stream Format (Alternative to SSE)](./tanstack-ai-core-chat-experience-6cd3502a--core-patterns-5-http-stream-format-alternative-to-sse.md) — 2 KiB
- [Core Patterns: 6. MCP Tool Discovery via `chat({ mcp })`](./tanstack-ai-core-chat-experience-6cd3502a--core-patterns-6-mcp-tool-discovery-via-chat-mcp.md) — 3 KiB
- [Core Patterns: 7. Queueing Messages Sent While Streaming](./tanstack-ai-core-chat-experience-6cd3502a--core-patterns-7-queueing-messages-sent-while-streaming.md) — 3 KiB
- [Core Patterns: 8. Browser-Refresh Durability (client persistence)](./tanstack-ai-core-chat-experience-6cd3502a--core-patterns-8-browser-refresh-durability-client-persistence.md) — 4 KiB
- [Common Mistakes](./tanstack-ai-core-chat-experience-6cd3502a--common-mistakes.md) — 9 KiB
- [Cross-References](./tanstack-ai-core-chat-experience-6cd3502a--cross-references.md) — 1 KiB

<!-- Original source anchors retained for inbound links. -->
<a id="chat-experience"></a>
<a id="setup-minimal-chat-app"></a>
<a id="server-api-route-tanstack-start"></a>
<a id="client-react-component"></a>
<a id="core-patterns"></a>
<a id="1-streaming-chat-with-sse"></a>
<a id="2-rendering-thinkingreasoning-content"></a>
<a id="3-sending-multimodal-content-images"></a>
<a id="4-sending-audio-messages-browser-recording"></a>
<a id="5-http-stream-format-alternative-to-sse"></a>
<a id="6-mcp-tool-discovery-via-chat-mcp"></a>
<a id="7-queueing-messages-sent-while-streaming"></a>
<a id="8-browser-refresh-durability-client-persistence"></a>
<a id="common-mistakes"></a>
<a id="a-critical-using-vercel-ai-sdk-patterns-streamtext-generatetext"></a>
<a id="b-critical-using-vercel-createopenai-provider-pattern"></a>
<a id="c-critical-using-monolithic-openai-instead-of-openaitext"></a>
<a id="d-high-using-toresponsestream-instead-of-toserversenteventsresponse"></a>
<a id="e-high-passing-model-as-separate-parameter-to-chat"></a>
<a id="f-high-passing-sampling-options-at-the-root-of-chat"></a>
<a id="g-high-using-provideroptions-instead-of-modeloptions"></a>
<a id="h-high-implementing-custom-sse-stream-instead-of-using-toserversenteventsresponse"></a>
<a id="i-high-implementing-custom-onendonfinish-callbacks-instead-of-middleware"></a>
<a id="j-high-importing-from-tanstackai-client-instead-of-framework-package"></a>
<a id="k-medium-not-handling-runerror-events-in-streaming-context"></a>
<a id="cross-references"></a>
