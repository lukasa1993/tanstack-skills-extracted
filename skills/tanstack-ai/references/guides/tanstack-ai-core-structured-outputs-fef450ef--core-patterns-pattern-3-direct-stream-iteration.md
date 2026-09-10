# Structured Outputs — Core Patterns: Pattern 3: Direct stream iteration

[Guide and prerequisites](./tanstack-ai-core-structured-outputs-fef450ef.md) · Published skill · `@tanstack/ai@0.54.0`.

## Core Patterns: Pattern 3: Direct stream iteration


Pass `stream: true` alongside `outputSchema` to get an async iterable of standard streaming chunks plus a completed typed object. Use this when you're a single process end-to-end — Node script, CLI, test, or a server endpoint that responds with one JSON blob. For the in-browser progressive-UI case, jump to Pattern 4 instead.

```typescript group=person-stream
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { z } from 'zod'

const PersonSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
})

const stream = chat({
  adapter: openaiText('gpt-5.2'),
  messages: [
    { role: 'user', content: 'Extract: John Doe is 30, john@example.com' },
  ],
  outputSchema: PersonSchema,
  stream: true,
})

for await (const chunk of stream) {
  if (chunk.type === 'CUSTOM' && chunk.name === 'structured-output.complete') {
    // Terminal event. `chunk.value.object` is complete and typed against the
    // schema you passed in. Validate it in the consumer when required.
    chunk.value.object.name // string
    chunk.value.object.age // number
    chunk.value.reasoning // string | undefined (thinking models only)
  }
}
```

The terminal event is a `CUSTOM` chunk: `{ type: 'CUSTOM', name: 'structured-output.complete', value: { object: T, raw: string, reasoning?: string } }`. The return type of `chat({ outputSchema, stream: true })` carries `T` through, so a plain discriminated narrow (`chunk.type === 'CUSTOM' && chunk.name === 'structured-output.complete'`) is enough — no type guard helper.

**Adapter coverage for streaming:**

| Adapter                                               | `outputSchema` + `stream: true`                                                                                                                       |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@tanstack/ai-openai` (Responses + Chat Completions)  | **Native combined mode (#605)** — schema wired into the regular `chatStream` call alongside `tools`; engine harvests JSON, no finalization round-trip |
| `@tanstack/ai-anthropic` (Claude 4.5+ only)           | **Native combined mode (#605)** — `output_config.format` + `tools` in one beta Messages call. Older Claude models fall back                           |
| `@tanstack/ai-gemini` (Gemini 3.x only)               | **Native combined mode (#605)** — `responseSchema` + `tools` in one `generateContentStream`. Gemini 2.x falls back                                    |
| `@tanstack/ai-grok`                                   | **Native combined mode (#605)** — OpenAI Responses `text.format` + `tools` for grok-4.6, grok-4.5, grok-4.3, and grok-build-0.1                       |
| `@tanstack/ai-openrouter`                             | Native single-request stream (legacy `structuredOutputStream` path; per-call combined-mode lookup is a follow-up)                                     |
| `@tanstack/ai-groq`                                   | Legacy `structuredOutputStream` only (no tools — Groq's API rejects schema + tools + stream)                                                          |
| `@tanstack/ai-bedrock`                                | Separate native `structuredOutputStream` finalization through Converse or an OpenAI-compatible API                                                    |
| `@tanstack/ai-byteplus`                               | Native combined mode on supported models; unsupported models emit `RUN_ERROR`                                                                         |
| `@tanstack/ai-cloudflare`                             | Native `structuredOutputStream` without tools; with tools, a separate finalization call (Workers AI models answer the tool turn in prose)             |
| `@tanstack/ai-claude-code`                            | Combined + event source — `--json-schema` on the same harness turn. Read `useChat().final`. See Pattern 6.                                            |
| `@tanstack/ai-codex`                                  | Combined + event source — `--output-schema` on the same harness turn. Read `useChat().final`. See Pattern 6.                                          |
| `@tanstack/ai-opencode`                               | Combined + event source — prompt-and-parse. Read `useChat().final`. See Pattern 6.                                                                    |
| `@tanstack/ai-grok-build`                             | Combined + event source — prompt-and-parse (ACP and streaming-json). Read `useChat().final` or the `structured-output` part. See Pattern 6.           |
| `@tanstack/ai-acp` (`acpCompatible`)                  | Combined + event source — prompt-and-parse. Read `useChat().final` or the `structured-output` part. See Pattern 6.                                    |
| All other adapters (ollama, older Claude, Gemini 2.x) | Fallback: runs non-streaming `structuredOutput`, emits one `structured-output.complete` event                                                         |

**Native-combined output vs separate finalization** is signaled by the adapter's
optional `supportsCombinedToolsAndSchema(modelOptions)` method. When
it returns `true`, the engine wires the JSON Schema into the regular
`chatStream` call and harvests the final-turn text — middleware sees
the run through `beforeModel` / `modelStream` as usual, and the
`'structuredOutput'` middleware phase does **not** fire. When it
returns `false` (or is omitted), the engine takes the legacy
finalization path: agent loop, then a separate `structuredOutput` /
`structuredOutputStream` call with `'structuredOutput'` phase tagging.

Consumer code is identical across providers — always read the final object off `structured-output.complete`.
