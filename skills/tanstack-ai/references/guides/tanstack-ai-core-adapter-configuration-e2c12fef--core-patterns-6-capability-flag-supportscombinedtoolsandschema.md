# Adapter Configuration — Core Patterns: 6. Capability Flag: `supportsCombinedToolsAndSchema`

[Guide and prerequisites](./tanstack-ai-core-adapter-configuration-e2c12fef.md) · Published skill · `@tanstack/ai@0.54.0`.

## Core Patterns: 6. Capability Flag: `supportsCombinedToolsAndSchema`


Adapters can declare an optional capability method:

```ts
import { AnthropicTextAdapter } from '@tanstack/ai-anthropic'

// The TextAdapter contract:
//   supportsCombinedToolsAndSchema?: (modelOptions?: TProviderOptions) => boolean
// Subclasses override it to narrow the capability:
class LegacyPathAnthropic extends AnthropicTextAdapter<'claude-sonnet-4-6'> {
  override supportsCombinedToolsAndSchema(): boolean {
    return false
  }
}
```

When `true`, the engine wires `outputSchema` into the regular
`chatStream` call alongside `tools` and harvests the schema-constrained
JSON from the agent loop's final-turn text — skipping the separate
`structuredOutput` / `structuredOutputStream` finalization round-trip.
When `false` (or the method is omitted), the legacy finalization path
runs.

Current per-adapter status (#605):

| Adapter                                      | Returns                                                                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `openaiText` / `openaiChatCompletions`       | `true` (all supported models)                                                                                                        |
| `anthropicText`                              | `true` for Claude 4.5+ (gated by `ANTHROPIC_COMBINED_TOOLS_AND_SCHEMA_MODELS`), `false` otherwise                                    |
| `geminiText`                                 | `true` for Gemini 3.x (gated by `GEMINI_COMBINED_TOOLS_AND_SCHEMA_MODELS`), `false` otherwise                                        |
| `grokText`                                   | `true` (all chat models — inherits the OpenAI Responses base; no per-model gate)                                                     |
| `groqText`                                   | `false` (Groq API rejects schema + tools + stream)                                                                                   |
| `openRouterText` / `openRouterResponsesText` | Per model — `true` only when the model and every `modelOptions.models` fallback are in `OPENROUTER_COMBINED_TOOLS_AND_SCHEMA_MODELS` |
| `ollamaText`                                 | `false` (constrained-decoding vs tool-call grammar conflict)                                                                         |
| `byteplusText`                               | Per model — `true` only for the 10 ids in `BYTEPLUS_STRUCTURED_OUTPUT_CHAT_MODELS`, `false` otherwise                                |

Subclasses can override to narrow the capability. When extending an
adapter for a custom model that doesn't support the combination, return
`false` explicitly.

> **BytePlus has no JSON-mode fallback.** On the 8 chat models outside
> `BYTEPLUS_STRUCTURED_OUTPUT_CHAT_MODELS`, Ark rejects `json_schema` _and_
> `json_object`, so `false` here does not buy a degraded path — it only keeps
> `response_format` out of the streaming chat request. `structuredOutput()`
> throws and `structuredOutputStream()` emits `RUN_ERROR` on those models.
> Note `seed-2-0-lite-260428` (the obvious default) is one of them; use
> `seed-2-0-lite-260228` or `dola-seed-2-1-turbo-260628` for typed output.
