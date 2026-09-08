# Media Generation

<a id="source-tanstack-ai-core-media-generation"></a>

Published skill · `@tanstack/ai@0.53.0`.

[Topic index](../media.md) · [Source provenance](../SOURCES.md)

## Choose a section

Read the overview or setup when it is a prerequisite, then the section needed for the task.

- [Overview](./tanstack-ai-core-media-generation-f3029c96--overview.md) — 1 KiB
- [Setup -- Image Generation End-to-End](./tanstack-ai-core-media-generation-f3029c96--setup-image-generation-end-to-end.md) — 4 KiB
- [Core Patterns: 1. Image Generation](./tanstack-ai-core-media-generation-f3029c96--core-patterns-1-image-generation.md) — 12 KiB
- [Core Patterns: 2. Audio Generation (Music, Sound Effects)](./tanstack-ai-core-media-generation-f3029c96--core-patterns-2-audio-generation-music-sound-effects.md) — 2 KiB
- [Core Patterns: 3. Text-to-Speech](./tanstack-ai-core-media-generation-f3029c96--core-patterns-3-text-to-speech.md) — 2 KiB
- [Core Patterns: 4. Audio Transcription](./tanstack-ai-core-media-generation-f3029c96--core-patterns-4-audio-transcription.md) — 3 KiB
- [Core Patterns: 5. Video Generation (Experimental -- async polling)](./tanstack-ai-core-media-generation-f3029c96--core-patterns-5-video-generation-experimental-async-polling.md) — 8 KiB
- [Core Patterns: 6. Cost tracking (fal billable units)](./tanstack-ai-core-media-generation-f3029c96--core-patterns-6-cost-tracking-fal-billable-units.md) — 2 KiB
- [Core Patterns: 7. Durable persistence (job lifecycle + artifact bytes)](./tanstack-ai-core-media-generation-f3029c96--core-patterns-7-durable-persistence-job-lifecycle-artifact-bytes.md) — 5 KiB
- [Common Hook API](./tanstack-ai-core-media-generation-f3029c96--common-hook-api.md) — 3 KiB
- [Common Mistakes](./tanstack-ai-core-media-generation-f3029c96--common-mistakes.md) — 9 KiB
- [Cross-References](./tanstack-ai-core-media-generation-f3029c96--cross-references.md) — 1 KiB

<!-- Original source anchors retained for inbound links. -->
<a id="media-generation"></a>
<a id="setup----image-generation-end-to-end"></a>
<a id="server-api-route-or-tanstack-start-server-function"></a>
<a id="client-react"></a>
<a id="tanstack-start-server-function-streaming-recommended"></a>
<a id="core-patterns"></a>
<a id="1-image-generation"></a>
<a id="image-conditioned-generation-multimodal-prompt-parts"></a>
<a id="2-audio-generation-music-sound-effects"></a>
<a id="3-text-to-speech"></a>
<a id="4-audio-transcription"></a>
<a id="5-video-generation-experimental----async-polling"></a>
<a id="6-cost-tracking-fal-billable-units"></a>
<a id="7-durable-persistence-job-lifecycle-artifact-bytes"></a>
<a id="common-hook-api"></a>
<a id="common-mistakes"></a>
<a id="a-high-using-the-removed-embedding-function"></a>
<a id="b-high-forgetting-toserversenteventsresponse-with-tanstack-start-server-functions"></a>
<a id="c-medium-not-downloading-openai-image-urls-before-they-expire"></a>
<a id="d-medium-using-stream-true-for-activities-that-do-not-support-streaming"></a>
<a id="e-high-passing-responsemimetype-or-negativeprompt-to-gemini-lyria"></a>
<a id="f-medium-passing-duration-to-lyria-expecting-it-to-control-length"></a>
<a id="g-medium-gemini-tts-multi-speaker-with-0-or-3-speakers"></a>
<a id="h-high-passing-image-prompt-parts-to-a-model-that-doesnt-support-image-conditioned-generation"></a>
<a id="i-low-writing-a-logging-middleware-to-see-media-chunks-flow-through"></a>
<a id="cross-references"></a>
