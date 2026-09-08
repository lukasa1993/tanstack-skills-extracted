# Adapter Configuration — Core Patterns: 1. Adapter Selection

[Guide and prerequisites](./tanstack-ai-core-adapter-configuration-e2c12fef.md) · Published skill · `@tanstack/ai@0.53.0`.

## Core Patterns: 1. Adapter Selection


Each provider has a dedicated package with tree-shakeable adapter factories.
The text adapter is the primary one for chat/completions:

| Provider          | Package                          | Factory                                     | Env Var                                                                                |
| ----------------- | -------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------- |
| OpenAI            | `@tanstack/ai-openai`            | `openaiText`                                | `OPENAI_API_KEY`                                                                       |
| Anthropic         | `@tanstack/ai-anthropic`         | `anthropicText`                             | `ANTHROPIC_API_KEY`                                                                    |
| Gemini            | `@tanstack/ai-gemini`            | `geminiText`                                | `GOOGLE_API_KEY` or `GEMINI_API_KEY`                                                   |
| Grok (xAI)        | `@tanstack/ai-grok`              | `grokText`                                  | `XAI_API_KEY`                                                                          |
| Groq              | `@tanstack/ai-groq`              | `groqText`                                  | `GROQ_API_KEY`                                                                         |
| OpenRouter        | `@tanstack/ai-openrouter`        | `openRouterText`                            | `OPENROUTER_API_KEY`                                                                   |
| Ollama            | `@tanstack/ai-ollama`            | `ollamaText`                                | `OLLAMA_HOST` (default: `http://localhost:11434`)                                      |
| Bedrock           | `@tanstack/ai-bedrock`           | `bedrockText`                               | `BEDROCK_API_KEY` or `AWS_BEARER_TOKEN_BEDROCK`                                        |
| BytePlus          | `@tanstack/ai-byteplus`          | `byteplusText`                              | `ARK_API_KEY` (falls back to `BYTEPLUS_API_KEY`)                                       |
| OpenAI-compatible | `@tanstack/ai-openai/compatible` | `openaiCompatible` / `openaiCompatibleText` | provider-specific (passed via `apiKey`)                                                |
| Cloudflare        | `@tanstack/ai-cloudflare`        | `cloudflareText`                            | `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN`, or `{ binding: env.AI }` in a Worker |

> **BytePlus uses two keys.** `byteplusText` / `byteplusVideo` /
> `byteplusImage` read `ARK_API_KEY` (ModelArk, `Authorization: Bearer`), but
> `byteplusSpeech` / `byteplusTranscription` are a separate product and read
> **`BYTEPLUS_VOICE_API_KEY`** (Seed Speech, `X-Api-Key`). Ark keys are also
> region-isolated — the default base URL is the ap-southeast endpoint.

```typescript
// Each factory takes model as first arg, optional config as second
import { openaiText } from '@tanstack/ai-openai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { geminiText } from '@tanstack/ai-gemini'
import { grokText } from '@tanstack/ai-grok'
import { groqText } from '@tanstack/ai-groq'
import { openRouterText } from '@tanstack/ai-openrouter'
import { ollamaText } from '@tanstack/ai-ollama'
import { bedrockText } from '@tanstack/ai-bedrock'
import { byteplusText } from '@tanstack/ai-byteplus'

// Model string is passed to the factory, NOT to chat()
const adapter = openaiText('gpt-5.2')
const adapter2 = anthropicText('claude-sonnet-4-6')
const adapter3 = geminiText('gemini-2.5-pro')
const adapter4 = grokText('grok-4')
const adapter5 = groqText('llama-3.3-70b-versatile')
const adapter6 = openRouterText('anthropic/claude-sonnet-4')
const adapter7 = ollamaText('llama3.3')
const adapter8 = bedrockText('us.anthropic.claude-3-7-sonnet-20250219-v1:0')
const adapter9 = byteplusText('seed-2-0-lite-260428')

// Optional: pass explicit API key
const adapterWithKey = openaiText('gpt-5.2', {
  apiKey: 'sk-...',
})
```

`@tanstack/ai-bedrock` (Amazon Bedrock) branches on `config.api`:

- `bedrockText(model)` or `bedrockText(model, { api: 'converse' })` (the default) — Bedrock's native Converse API via `@aws-sdk/client-bedrock-runtime` (adapter name `bedrock-converse`). Reaches the broad catalog: Claude, Nova, Llama, Mistral, DeepSeek, and more.
- `bedrockText(model, { api: 'chat' })` — OpenAI-compatible Chat Completions endpoint (adapter name `bedrock`). Open-weight models only (gpt-oss, DeepSeek V3.x, Gemma, Qwen, etc.). Does NOT reach Claude, Nova, or Llama.
- `bedrockText(model, { api: 'responses' })` — OpenAI-compatible Responses API, mantle-only (adapter name `bedrock-responses`). Currently gpt-oss family.

Use `createBedrockText(model, apiKey, config?)` to pass the key explicitly. Auth resolves from `BEDROCK_API_KEY` / `AWS_BEARER_TOKEN_BEDROCK`, or SigV4 via the standard AWS credential chain (no extra packages needed — handled by `@aws-sdk/client-bedrock-runtime`).
