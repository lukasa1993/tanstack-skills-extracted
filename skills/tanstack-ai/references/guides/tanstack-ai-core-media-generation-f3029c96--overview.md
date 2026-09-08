# Media Generation — Overview

[Guide and prerequisites](./tanstack-ai-core-media-generation-f3029c96.md) · Published skill · `@tanstack/ai@0.53.0`.

# Media Generation

> **Dependency note:** This skill builds on ai-core. Read it first for critical rules.

All media activities (image, speech, transcription, video) follow the same
server/client architecture: a `generate*()` function on the server, an SSE
transport via `toServerSentEventsResponse()`, and a framework hook on the
client.
