# Chat, providers, and streaming

Core chat, providers, AG-UI, custom backends, and debugging.

<a id="source-tanstack-ai-core"></a>

## Ai Core

Source: `tanstack-ai-core`.

## TanStack AI — Core Concepts

TanStack AI is a type-safe, provider-agnostic AI SDK. Server-side functions
live in `@tanstack/ai` and provider adapter packages. Client-side hooks live
in framework packages (`@tanstack/ai-react`, `@tanstack/ai-solid`, etc.).
Always import from the framework package on the client — never from
`@tanstack/ai-client` directly (unless vanilla JS).

### Sub-Skills

| Need to...                                        | Read                                          |
| ------------------------------------------------- | --------------------------------------------- |
| Build a chat UI with streaming                    | ./chat-providers.md#source-tanstack-ai-core-chat-experience              |
| Survive a browser reload (no extra package)       | ./persistence-coordination.md#source-tanstack-ai-core-client-persistence           |
| Add tool calling (server, client, or both)        | ./tools-outputs-middleware.md#source-tanstack-ai-core-tool-calling                 |
| Generate images, video, speech, or transcriptions | ./media.md#source-tanstack-ai-core-media-generation             |
| Get typed JSON responses from the LLM             | ./tools-outputs-middleware.md#source-tanstack-ai-core-structured-outputs           |
| Choose and configure a provider adapter           | ./chat-providers.md#source-tanstack-ai-core-adapter-configuration        |
| Implement AG-UI streaming protocol server-side    | ./chat-providers.md#source-tanstack-ai-core-ag-ui-protocol               |
| Add analytics, logging, or lifecycle hooks        | ./tools-outputs-middleware.md#source-tanstack-ai-core-middleware                   |
| Coordinate multi-instance work with locks         | ./persistence-coordination.md#source-tanstack-ai-core-locks                        |
| Connect to a non-TanStack-AI backend              | ./chat-providers.md#source-tanstack-ai-core-custom-backend-integration   |
| Turn on/off debug logging, pipe into pino/winston | ./chat-providers.md#source-tanstack-ai-core-debug-logging                |
| Persist chats server-side (history, runs)         | See `@tanstack/ai-persistence` package skills |
| Set up Code Mode (LLM code execution)             | See `@tanstack/ai-code-mode` package skills   |
| Give the model a catalog of SKILL.md skills       | See `@tanstack/ai-skills` package skills      |

### Companion packages

Some capabilities live in their own package and ship their own skills. Install
the package, then read its skills — do not guess the API from this file.

#### `@tanstack/ai-persistence` — durable chat state

Makes a conversation survive a reload, a server restart, a second device, or a
paused tool approval. It ships the **store contracts** (`MessageStore`,
`RunStore`, `InterruptStore`, `MetadataStore`), the `withPersistence` /
`withGenerationPersistence` middleware, `reconstructChat` for server-side
hydrate, an in-memory reference backend, and a conformance testkit. Multi-instance
locks are **not** in this package — `LockStore` / `withLocks` ship in
`@tanstack/ai/locks`; see ai-core/locks. The `runs` store contract is typed
against run lifecycle types (`RunStatus`, `RunRecord`, `RunStore`,
`defineRunStore`, `InMemoryRunStore`), which ship in `@tanstack/ai` itself;
see ai-core/middleware.

It does **not** ship a backend for your database — you implement the stores
against Postgres, SQLite, D1, Mongo, or whatever you run, and the package's
skills walk you through it (including Drizzle, Prisma, and Cloudflare recipes).

```bash
pnpm add @tanstack/ai-persistence
npx @tanstack/intent@latest install
```

The skills ship **inside** the package, so they only exist on disk once it is
installed — the second command re-scans `node_modules` and wires them into the
agent config. Until then the paths below resolve to nothing.

Entry point: `./persistence-coordination.md#source-tanstack-ai-persistence`

| Need to...                                      | Read                                    |
| ----------------------------------------------- | --------------------------------------- |
| Wire server-side chat history, runs, interrupts | ./persistence-coordination.md#source-tanstack-ai-persistence-server          |
| Implement the store interfaces for your DB      | ./persistence-coordination.md#source-tanstack-ai-persistence-stores          |
| Write the adapter for the DB your app runs      | ./persistence-adapters.md |

Browser-side persistence is **not** in this package — it ships with the
framework packages, so read **ai-core/client-persistence** instead.

#### `@tanstack/ai-code-mode` — LLM code execution

See the `ai-code-mode` skill in that package.

#### `@tanstack/ai-skills` — portable Agent Skills at runtime

Gives the model a library of `SKILL.md` skills it can load on demand, on any
provider, via the `withSkills` middleware and a `load_skill` tool. Skills come
from `inlineSkill`, `skillDirectory`, or a build-time bundle. This is the
runtime feature for the model **inside your app**, not the coding-assistant
skills this file is part of, and not the hosted `codeExecutionTool` /
`shellTool` skills (those run in a provider sandbox).

```bash
pnpm add @tanstack/ai-skills
npx @tanstack/intent@latest install
```

Entry point: `./agent-runtimes.md#source-tanstack-ai-skills`

### Quick Decision Tree

- Setting up a chatbot? → ai-core/chat-experience
- Adding function calling? → ai-core/tool-calling
- Generating media (images, audio, video)? → ai-core/media-generation
- Need structured JSON output? → ai-core/structured-outputs
- Choosing/configuring a provider? → ai-core/adapter-configuration
- Building a server-only AG-UI backend? → ai-core/ag-ui-protocol
- Adding analytics or post-stream events? → ai-core/middleware
- Surviving reloads / multi-device / durable approvals? → `@tanstack/ai-persistence` skills
- Connecting to a custom backend? → ai-core/custom-backend-integration
- Turning on debug logging to trace chunks/tools/middleware? → ai-core/debug-logging
- Debugging mistakes? → Check Common Mistakes in the relevant sub-skill

### Critical Rules

1. **This is NOT the Vercel AI SDK.** Use `chat()` not `streamText()`. Use `openaiText()` not `createOpenAI()`. Import from `@tanstack/ai`, not `ai`.
2. **Import from framework package on client.** Use `@tanstack/ai-react` (or solid/vue/svelte/preact), not `@tanstack/ai-client`.
3. **Use `toServerSentEventsResponse()`** to convert streams to HTTP responses. Never implement SSE manually.
4. **Use middleware for lifecycle events.** No `onEnd`/`onFinish` callbacks on `chat()` — use `middleware: [{ onFinish: ... }]`.
5. **Ask the user which adapter and model** they want. Suggest the latest model. Also ask if they want Code Mode.
6. **Tools must be passed to both server and client.** Server gets the tool in `chat({ tools })`; the client passes the `.client()` implementation through the `clientTools()` helper into the **`tools`** option — `useChat({ tools: clientTools(myTool.client(...)) })`. There is no `clientTools` option. See ai-core/tool-calling.

### Version

Targets TanStack AI v0.42.0.

<a id="source-tanstack-ai-core-adapter-configuration"></a>

## Adapter Configuration

Source: `tanstack-ai-core-adapter-configuration`.

## Adapter Configuration

> **Dependency:** This skill builds on ai-core. Read it first for critical rules.

> **Before implementing:** Ask the user which provider and model they want.
> Then fetch the latest available models from the provider's source code
> (check the adapter's model metadata file, e.g. `packages/ai-openai/src/model-meta.ts`)
> or from the provider's API/docs to recommend the most current model.
> The model lists in this skill and its reference files may be outdated.
> Always verify against the source before recommending a specific model.

### Setup

Create an adapter and use it with `chat()`:

```typescript
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

const stream = chat({
  adapter: openaiText('gpt-5.2'),
  messages,
  modelOptions: {
    temperature: 0.7,
    max_output_tokens: 1000,
  },
})

return toServerSentEventsResponse(stream)
```

The adapter factory function takes the model name as a string literal and an
optional config object (API key, base URL, etc.). The model name is passed
into the factory, not into `chat()`.

Sampling options (`temperature`, token limits, `top_p`/`topP`, etc.) live
inside `modelOptions` using each provider's native key — they are **not**
top-level options on `chat()`. See the per-provider table in
[Configuring Sampling](#5-configuring-sampling) below.

### Core Patterns

#### 1. Adapter Selection

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

#### 2. Runtime Adapter Switching

Use an adapter factory map to switch providers dynamically based on user
input or configuration:

```typescript
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import type { TextAdapter } from '@tanstack/ai/adapters'
import { openaiText } from '@tanstack/ai-openai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { geminiText } from '@tanstack/ai-gemini'

// Define a map of provider+model to adapter factory calls
const adapters: Record<string, () => TextAdapter> = {
  'openai/gpt-5.2': () => openaiText('gpt-5.2'),
  'anthropic/claude-sonnet-4-6': () => anthropicText('claude-sonnet-4-6'),
  'gemini/gemini-2.5-pro': () => geminiText('gemini-2.5-pro'),
}

export function handleChat(providerModel: string, messages: Array<any>) {
  const createAdapter = adapters[providerModel]
  if (!createAdapter) {
    throw new Error(`Unknown provider/model: ${providerModel}`)
  }

  const stream = chat({
    adapter: createAdapter(),
    messages,
  })

  return toServerSentEventsResponse(stream)
}
```

#### 3. Configuring Reasoning / Thinking

Different providers expose reasoning/thinking through their `modelOptions`:

```typescript
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { geminiText } from '@tanstack/ai-gemini'

// OpenAI: reasoning with effort and summary
const openaiStream = chat({
  adapter: openaiText('gpt-5.2'),
  messages,
  modelOptions: {
    reasoning: {
      effort: 'high',
      summary: 'auto',
    },
  },
})

// Anthropic: extended thinking with budget_tokens
const anthropicStream = chat({
  adapter: anthropicText('claude-sonnet-4-6'),
  messages,
  modelOptions: {
    max_tokens: 16000,
    thinking: {
      type: 'enabled',
      budget_tokens: 8000, // must be >= 1024 and < max_tokens
    },
  },
})

// Anthropic: adaptive thinking (claude-sonnet-4-6 and newer)
const adaptiveStream = chat({
  adapter: anthropicText('claude-sonnet-4-6'),
  messages,
  modelOptions: {
    max_tokens: 16000,
    thinking: {
      type: 'adaptive',
    },
    effort: 'high', // 'max' | 'high' | 'medium' | 'low'
  },
})

// Gemini: thinking config with budget or level
const geminiStream = chat({
  adapter: geminiText('gemini-2.5-pro'),
  messages,
  modelOptions: {
    thinkingConfig: {
      includeThoughts: true,
      thinkingBudget: 4096,
    },
  },
})
```

#### 4. Extending Adapters with Custom Models

Use `extendAdapter()` and `createModel()` to add custom or fine-tuned models
while preserving type safety for the original models:

```typescript
import { extendAdapter, createModel } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

// Define custom models
const customModels = [
  createModel('ft:gpt-5.2:my-org:custom-model:abc123', ['text', 'image']),
  createModel('my-local-proxy-model', ['text']),
] as const

// Create extended factory - original models still fully typed
const myOpenai = extendAdapter(openaiText, customModels)

// Use original models - full type inference preserved
const gpt5 = myOpenai('gpt-5.2')

// Use custom models - accepted by the type system
const custom = myOpenai('ft:gpt-5.2:my-org:custom-model:abc123')

// Type error: 'nonexistent-model' is not a valid model
// myOpenai('nonexistent-model')
```

At runtime, `extendAdapter` simply passes through to the original factory.
The `_customModels` parameter is only used for type inference.

#### 5. Configuring Sampling

Sampling controls (`temperature`, token limits, nucleus sampling) are passed
inside `modelOptions` using each provider's **native** key. They are not
top-level fields on `chat()`/`ai()`/`generate()`.

```typescript
// OpenAI — native keys
chat({
  adapter: openaiText('gpt-5.2'),
  messages,
  modelOptions: { temperature: 0.7, top_p: 0.9, max_output_tokens: 1000 },
})

// Anthropic
chat({
  adapter: anthropicText('claude-sonnet-4-6'),
  messages,
  modelOptions: { temperature: 0.7, top_p: 0.9, max_tokens: 1000 },
})

// Gemini — camelCase
chat({
  adapter: geminiText('gemini-2.5-pro'),
  messages,
  modelOptions: { temperature: 0.7, topP: 0.9, maxOutputTokens: 1000 },
})

// Ollama — NESTED under modelOptions.options
chat({
  adapter: ollamaText('llama3.3'),
  messages,
  modelOptions: {
    options: { temperature: 0.7, top_p: 0.9, num_predict: 1000 },
  },
})
```

Per-provider sampling keys (all live inside `modelOptions`):

| Provider          | Temperature   | Nucleus | Max output tokens                         |
| ----------------- | ------------- | ------- | ----------------------------------------- |
| OpenAI            | `temperature` | `top_p` | `max_output_tokens`                       |
| Anthropic         | `temperature` | `top_p` | `max_tokens`                              |
| Gemini            | `temperature` | `topP`  | `maxOutputTokens`                         |
| Grok (xAI)        | `temperature` | `top_p` | `max_tokens`                              |
| Groq              | `temperature` | `top_p` | `max_completion_tokens`                   |
| OpenRouter (chat) | `temperature` | `topP`  | `maxCompletionTokens`                     |
| Ollama            | `temperature` | `top_p` | `num_predict` (nested in `options`)       |
| BytePlus          | `temperature` | `top_p` | `max_tokens` (or `max_completion_tokens`) |

`temperature` is the one key every provider names identically; token limits and
some sampling options use provider-native names. Ollama nests all sampling under
`modelOptions.options`.

> **Anthropic `max_tokens` default:** Anthropic's API _requires_ `max_tokens`,
> so the adapter always sends one. When you omit `modelOptions.max_tokens`, it
> defaults to the selected model's full output ceiling (its `max_output_tokens`
> from model metadata — e.g. 64K for Sonnet, 128K for Opus), not a low constant.
> `max_tokens` is a ceiling, not a reservation (billing is per token generated),
> so leaving it unset is the right default for codegen / agentic / long-form
> output and avoids silent `stop_reason: "max_tokens"` truncation. Set it only to
> cap output below the model ceiling. Other providers treat token limits as
> optional and don't apply this flooring.

#### 6. Capability Flag: `supportsCombinedToolsAndSchema`

Adapters can declare an optional capability method:

```ts
supportsCombinedToolsAndSchema?(modelOptions?: TProviderOptions): boolean
```

When `true`, the engine wires `outputSchema` into the regular
`chatStream` call alongside `tools` and harvests the schema-constrained
JSON from the agent loop's final-turn text — skipping the separate
`structuredOutput` / `structuredOutputStream` finalization round-trip.
When `false` (or the method is omitted), the legacy finalization path
runs.

Current per-adapter status (#605):

| Adapter                                      | Returns                                                                                               |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `openaiText` / `openaiChatCompletions`       | `true` (all supported models)                                                                         |
| `anthropicText`                              | `true` for Claude 4.5+ (gated by `ANTHROPIC_COMBINED_TOOLS_AND_SCHEMA_MODELS`), `false` otherwise     |
| `geminiText`                                 | `true` for Gemini 3.x (gated by `GEMINI_COMBINED_TOOLS_AND_SCHEMA_MODELS`), `false` otherwise         |
| `grokText`                                   | `true` for Grok 4 family (gated by `GROK_COMBINED_TOOLS_AND_SCHEMA_MODELS`), `false` otherwise        |
| `groqText`                                   | `false` (Groq API rejects schema + tools + stream)                                                    |
| `openRouterText` / `openRouterResponsesText` | `false` (per-call resolution is a follow-up)                                                          |
| `ollamaText`                                 | `false` (constrained-decoding vs tool-call grammar conflict)                                          |
| `byteplusText`                               | Per model — `true` only for the 10 ids in `BYTEPLUS_STRUCTURED_OUTPUT_CHAT_MODELS`, `false` otherwise |

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

#### 6. OpenAI-Compatible Providers

Any provider that implements the OpenAI **Chat Completions** API (DeepSeek,
Moonshot/Kimi, Together, Fireworks, Cerebras, Qwen/DashScope, Perplexity,
NVIDIA NIM, LM Studio, etc.) can be used through the generic
`openaiCompatible` factory from `@tanstack/ai-openai/compatible` — no
dedicated package required.

```typescript
import { openaiCompatible } from '@tanstack/ai-openai/compatible'
import { createModel } from '@tanstack/ai'

// Provider-factory: configure baseURL + apiKey + models ONCE,
// then select a model per call (the model arg is a type-safe union).
const deepseek = openaiCompatible({
  name: 'deepseek', // optional label for devtools/errors (default 'openai-compatible')
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY!,
  models: [
    'deepseek-chat', // bare string → optimistic defaults: text/image in, streaming, tools, structured output
    createModel('deepseek-reasoner', {
      // rich def → precise per-model capabilities
      input: ['text'],
      features: ['reasoning', 'structured_outputs'],
    }),
  ],
})

chat({ adapter: deepseek('deepseek-chat'), messages })
chat({ adapter: deepseek('deepseek-reasoner'), messages })
```

`config` also accepts any OpenAI SDK `ClientOptions` (notably `defaultHeaders`
and `defaultQuery`) for providers that need extra auth headers or query params.

For a single model, use the one-shot helper:

```typescript
import { openaiCompatibleText } from '@tanstack/ai-openai/compatible'

chat({
  adapter: openaiCompatibleText('deepseek-chat', {
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY!,
  }),
  messages,
})
```

Pass `api: 'responses'` to target the OpenAI **Responses** API instead of Chat
Completions (only for the rare compatible provider that implements it, e.g.
Azure OpenAI); the default is `'chat-completions'`, which is what nearly all
compatible providers speak.

> Verify the provider's current `baseURL` and model ids against its live docs —
> they drift. See `docs/adapters/openai-compatible.md` for the full provider table.

### Behind a proxy or gateway

Every adapter's client config accepts `baseURL` and `defaultHeaders`. Use these
two names to route any adapter through Cloudflare AI Gateway, Vercel AI Gateway,
or a corporate proxy. The adapter maps them onto the vendor SDK's own option
names (Gemini `httpOptions`, Mistral `serverURL`, Ollama `host`, Cohere and
ElevenLabs `baseUrl`/`headers`). The vendor names still work; when both are
set, `baseURL` and `defaultHeaders` win.

```typescript
const gateway = {
  baseURL: 'https://gateway.example.com/google-ai-studio',
  defaultHeaders: {
    'cf-aig-authorization': `Bearer ${process.env.GATEWAY_TOKEN}`,
  },
}
createGeminiChat('gemini-3.8-flash', apiKey, { ...gateway })
```

### Common Mistakes

#### a. HIGH: Confusing legacy monolithic with tree-shakeable adapter

The legacy `openai()` (and `anthropic()`, etc.) monolithic adapters are
deprecated. They take the model in `chat()`, not in the factory.

```typescript
// WRONG: Legacy monolithic adapter pattern
import { openai } from '@tanstack/ai-openai'
chat({ adapter: openai(), model: 'gpt-5.2', messages })

// CORRECT: Tree-shakeable adapter, model in factory
import { openaiText } from '@tanstack/ai-openai'
chat({ adapter: openaiText('gpt-5.2'), messages })
```

Source: docs/migration/migration.md

#### b. MEDIUM: Wrong API key environment variable name

Each provider uses a specific env var name. Using the wrong one causes a
runtime error:

| Provider   | Correct Env Var                                | Common Mistake                                                           |
| ---------- | ---------------------------------------------- | ------------------------------------------------------------------------ |
| OpenAI     | `OPENAI_API_KEY`                               |                                                                          |
| Anthropic  | `ANTHROPIC_API_KEY`                            |                                                                          |
| Gemini     | `GOOGLE_API_KEY` or `GEMINI_API_KEY`           | `GOOGLE_GENAI_API_KEY` (does not work)                                   |
| Grok (xAI) | `XAI_API_KEY`                                  | `GROK_API_KEY` (does not work)                                           |
| Groq       | `GROQ_API_KEY`                                 |                                                                          |
| OpenRouter | `OPENROUTER_API_KEY`                           |                                                                          |
| Ollama     | `OLLAMA_HOST`                                  | No API key needed, just the host URL (default: `http://localhost:11434`) |
| Bedrock    | `BEDROCK_API_KEY` / `AWS_BEARER_TOKEN_BEDROCK` | Falls back to SigV4 credentials when no API key is set                   |

Source: adapter source code (`utils/client.ts` in each adapter package).

### References

Detailed per-adapter reference files:

- [OpenAI Adapter](./assets/tanstack-ai-core-adapter-configuration/references/openai-adapter.md)
- [Anthropic Adapter](./assets/tanstack-ai-core-adapter-configuration/references/anthropic-adapter.md)
- [Gemini Adapter](./assets/tanstack-ai-core-adapter-configuration/references/gemini-adapter.md)
- [Ollama Adapter](./assets/tanstack-ai-core-adapter-configuration/references/ollama-adapter.md)
- [Grok Adapter](./assets/tanstack-ai-core-adapter-configuration/references/grok-adapter.md)
- [Groq Adapter](./assets/tanstack-ai-core-adapter-configuration/references/groq-adapter.md)
- [OpenRouter Adapter](./assets/tanstack-ai-core-adapter-configuration/references/openrouter-adapter.md)
- [BytePlus Adapter](./assets/tanstack-ai-core-adapter-configuration/references/byteplus-adapter.md)

### Tension

**HIGH Tension: Type safety vs. quick prototyping** -- Per-model type safety
requires specific model string literals. Quick prototyping wants dynamic
selection with `string` variables. Agents optimizing for quick setup silently
lose type safety. If model names come from user input or config files, use
`extendAdapter()` to add custom names.

### Cross-References

- See also: `./chat-providers.md#source-tanstack-ai-core-chat-experience` -- Adapter choice affects chat setup
- See also: `./tools-outputs-middleware.md#source-tanstack-ai-core-structured-outputs` -- `outputSchema` handles provider differences transparently

<a id="source-tanstack-ai-core-ag-ui-protocol"></a>

## Ag Ui Protocol

Source: `tanstack-ai-core-ag-ui-protocol`.

## AG-UI Protocol

This skill builds on ai-core. Read it first for critical rules.

### Setup — Server Endpoint Producing AG-UI Events via SSE

```typescript
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

export async function POST(request: Request) {
  const { messages } = await request.json()
  const stream = chat({
    adapter: openaiText('gpt-5.2'),
    messages,
  })
  return toServerSentEventsResponse(stream)
}
```

`chat()` returns an `AsyncIterable<StreamChunk>`. Each `StreamChunk` is a
typed AG-UI event (discriminated union on `type`). The `toServerSentEventsResponse()`
helper encodes that iterable into an SSE-formatted `Response` with correct headers.

### Setup — Receiving AG-UI RunAgentInput on the Server

```typescript
import {
  chat,
  chatParamsFromRequestBody,
  mergeAgentTools,
  toServerSentEventsResponse,
} from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai/adapters'
import { serverTools } from './tools'

export async function POST(req: Request) {
  let params
  try {
    params = await chatParamsFromRequestBody(await req.json())
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : 'Bad request',
      { status: 400 },
    )
  }

  const stream = chat({
    adapter: openaiText('gpt-4o'),
    messages: params.messages,
    tools: mergeAgentTools(serverTools, params.tools),
  })

  return toServerSentEventsResponse(stream)
}
```

`chatParamsFromRequestBody` validates the body against `RunAgentInputSchema` from `@ag-ui/core`. `mergeAgentTools` merges the server's tool registry with client-declared tools (server wins on collision; client-only tools become no-execute stubs that flow through the runtime's `ClientToolRequest` path).

`params.messages` is a mixed array of TanStack `UIMessage` anchors (with `parts`) and AG-UI fan-out duplicates (`{role:'tool',...}`, `{role:'reasoning',...}`). The existing `convertMessagesToModelMessages` (called inside `chat()`) handles dedup automatically.

**Wire shape (POST body):** AG-UI `RunAgentInput` — `{threadId, runId, parentRunId?, state, messages, tools, context, forwardedProps}`. The `messages` array carries TanStack `UIMessage` anchors with their canonical `parts` plus AG-UI mirror fields (`content`, `toolCalls`) inline; tool results and thinking parts are additionally emitted as fan-out `{role:'tool',...}` and `{role:'reasoning',...}` entries.

**`forwardedProps` security:** Don't spread it directly into `chat()` — clients could override `adapter`, `model`, `tools`, etc. Always allowlist specific fields.

### Core Patterns

#### 1. SSE Format — toServerSentEventsStream / toServerSentEventsResponse

**Wire format:** Each event is `data: <JSON>\n\n`. Stream ends with `data: [DONE]\n\n`.

```typescript
import {
  chat,
  toServerSentEventsStream,
  toServerSentEventsResponse,
} from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

// Option A: Get a ReadableStream (manual Response construction)
const abortController = new AbortController()
const stream = chat({
  adapter: openaiText('gpt-5.2'),
  messages,
  abortController,
})
const sseStream = toServerSentEventsStream(stream, abortController)

const response = new Response(sseStream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  },
})

// Option B: Use the helper (sets headers automatically)
const response2 = toServerSentEventsResponse(stream, { abortController })
// Default headers: Content-Type: text/event-stream, Cache-Control: no-cache, Connection: keep-alive
```

**Default response headers set by `toServerSentEventsResponse()`:**

| Header          | Value               |
| --------------- | ------------------- |
| `Content-Type`  | `text/event-stream` |
| `Cache-Control` | `no-cache`          |
| `Connection`    | `keep-alive`        |

Custom headers merge on top (user headers override defaults):

```typescript
toServerSentEventsResponse(stream, {
  headers: {
    'X-Accel-Buffering': 'no', // Disable nginx buffering
    'Cache-Control': 'no-store', // Override default
  },
  abortController,
})
```

**Error handling:** If the stream throws, a `RUN_ERROR` event is emitted
automatically before the stream closes. If the `abortController` is already
aborted, the error event is suppressed and the stream closes silently.

#### 2. HTTP Stream (NDJSON) — toHttpStream / toHttpResponse

**Wire format:** Each event is `<JSON>\n` (newline-delimited JSON, no SSE prefix, no `[DONE]` marker).

```typescript
import { chat, toHttpStream, toHttpResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

// Option A: Get a ReadableStream
const abortController = new AbortController()
const stream = chat({
  adapter: openaiText('gpt-5.2'),
  messages,
  abortController,
})
const ndjsonStream = toHttpStream(stream, abortController)

const response = new Response(ndjsonStream, {
  headers: {
    'Content-Type': 'application/x-ndjson',
  },
})

// Option B: Use the helper (does NOT set headers automatically)
const response2 = toHttpResponse(stream, { abortController })
// Note: toHttpResponse does NOT set Content-Type automatically.
// You should pass headers explicitly:
const response3 = toHttpResponse(stream, {
  headers: { 'Content-Type': 'application/x-ndjson' },
  abortController,
})
```

**Client-side pairing:** SSE endpoints are consumed by `fetchServerSentEvents()`.
HTTP stream endpoints are consumed by `fetchHttpStream()`. Both are connection
adapters from `@tanstack/ai-react` (or the framework-specific package).

#### 3. AG-UI Event Types Reference

All events extend `BaseAGUIEvent` which carries `type`, `timestamp`, optional
`model`, and optional `rawEvent`.

| Event Type             | Description                                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `RUN_STARTED`          | First event in a stream. Carries `runId` and optional `threadId`.                                                           |
| `TEXT_MESSAGE_START`   | New text message begins. Carries `messageId` and `role`.                                                                    |
| `TEXT_MESSAGE_CONTENT` | Incremental text token. Carries `messageId` and `delta` (the new text).                                                     |
| `TEXT_MESSAGE_END`     | Text message complete. Carries `messageId`.                                                                                 |
| `TOOL_CALL_START`      | Tool invocation begins. Carries `toolCallId`, `toolName`, and `index`.                                                      |
| `TOOL_CALL_ARGS`       | Incremental tool arguments JSON. Carries `toolCallId` and `delta`.                                                          |
| `TOOL_CALL_END`        | Tool call arguments complete. Carries `toolCallId` and `toolName`.                                                          |
| `STEP_STARTED`         | Thinking/reasoning step begins. Carries `stepId` and optional `stepType`.                                                   |
| `STEP_FINISHED`        | Thinking step complete. Carries `stepId`, `delta`, and optional `content`.                                                  |
| `MESSAGES_SNAPSHOT`    | Full conversation transcript snapshot. Carries `messages: Array<UIMessage>`.                                                |
| `STATE_SNAPSHOT`       | Full application state snapshot. Carries `state: Record<string, unknown>`.                                                  |
| `STATE_DELTA`          | Incremental state update. Carries `delta: Record<string, unknown>`.                                                         |
| `CUSTOM`               | Extension point. Carries `name` (string) and optional `value` (unknown).                                                    |
| `RUN_FINISHED`         | Stream complete. Carries `runId` and `finishReason` (`'stop'` / `'length'` / `'content_filter'` / `'tool_calls'` / `null`). |
| `RUN_ERROR`            | Error during stream. Carries optional `runId` and `error: { message, code? }`.                                              |

**Typical event sequence for a text-only response:**

```
RUN_STARTED -> TEXT_MESSAGE_START -> TEXT_MESSAGE_CONTENT (repeated) -> TEXT_MESSAGE_END -> RUN_FINISHED
```

**Typical event sequence with tool calls:**

```
RUN_STARTED -> TEXT_MESSAGE_START -> TEXT_MESSAGE_CONTENT* -> TEXT_MESSAGE_END
            -> TOOL_CALL_START -> TOOL_CALL_ARGS* -> TOOL_CALL_END
            -> RUN_FINISHED (finishReason: 'tool_calls')
```

**Type aliases:** `StreamChunk` is an alias for `AGUIEvent` (the discriminated
union of all event interfaces). `StreamChunkType` is an alias for `AGUIEventType`
(the string union of all event type literals).

#### 4. Typed CUSTOM Events — `ChatStream` and `KnownCustomEvent`

The `CUSTOM` row above describes the raw `StreamChunk` union, where the single
generic `CustomEvent` member types `value` as `any` -- once merged into a
union, that `any` poisons every other member too, so narrowing on `name`
still leaves `value: any`. `chat()` doesn't return raw `StreamChunk`; by
default (no `outputSchema`, `stream` not explicitly `false`) it returns
`ChatStream`, which swaps that generic member for `KnownCustomEvent` -- a
discriminated union of every `CUSTOM` event TanStack AI itself emits, each
with a literal `name` and a concrete `value`. Narrow with a plain `if` --
no helper, no cast:

```typescript
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

const stream = chat({
  adapter: openaiText('gpt-5.2'),
  messages,
})

for await (const chunk of stream) {
  if (chunk.type === 'CUSTOM' && chunk.name === 'sandbox.file.diff') {
    console.log(chunk.value.path, chunk.value.diff) // typed, no helper, no cast
  } else if (
    chunk.type === 'CUSTOM' &&
    chunk.name === 'structured-output.complete'
  ) {
    console.log(chunk.value.object) // typed, no helper, no cast
  }
}
```

**Caveat -- `.endsWith()` (or any non-literal check) does not narrow.**
`SessionIdEvent['name']` is the template-literal type
`` `${string}.session-id` ``. TypeScript's control-flow narrowing only
understands exact comparisons (`===`) and `in`/type-predicate checks against
a discriminant -- a runtime `chunk.name.endsWith('.session-id')` check
doesn't inform the type system, so `chunk.value` stays the union of every
`KnownCustomEvent`'s `value`, not `{ sessionId: string }`. Compare against
the exact literal you expect, or write a user-defined type predicate
(`(c): c is SessionIdEvent => c.name.endsWith('.session-id')`) and call that
in the `if` instead.

**User-emitted `emitCustomEvent` names are typed out of `ChatStream`.** Tools
that call `context.emitCustomEvent('my-app:progress', ...)` still stream a
`CUSTOM` chunk at runtime, but `'my-app:progress'` isn't one of
`KnownCustomEvent`'s literal names, so it's intentionally absent from
`ChatStream`'s type -- including a generic fallback member would reintroduce
the `value: any` poison for every other event on the stream. To read your own
event with a type, annotate the stream as the wider `StreamChunk` instead of
`ChatStream` for that branch; its generic `CUSTOM` member already types
`value` as `any`, so no cast is needed there either.

Source: docs/protocol/custom-events.md

### Common Mistakes

#### MEDIUM: Proxy buffering breaks SSE streaming

Reverse proxies (nginx, Cloudflare, AWS ALB) buffer SSE responses by default,
causing events to arrive in batches instead of streaming token-by-token.

Fix: Set proxy-bypass headers on the response.

```typescript
toServerSentEventsResponse(stream, {
  headers: {
    'X-Accel-Buffering': 'no', // nginx
    'X-Content-Type-Options': 'nosniff', // Some CDNs
  },
  abortController,
})
```

For Cloudflare Workers, SSE streams automatically. For Cloudflare proxied
origins, ensure "Response Buffering" is disabled in the dashboard.

Source: docs/protocol/sse-protocol.md

#### MEDIUM: Assuming all AG-UI events arrive in every response

Not all event types appear in every stream:

- `STEP_STARTED` / `STEP_FINISHED` only appear with thinking-enabled models
  (e.g., `o3`, `claude-sonnet-4-5` with extended thinking). Standard models
  skip these entirely.
- `TOOL_CALL_START` / `TOOL_CALL_ARGS` / `TOOL_CALL_END` only appear when
  the model invokes tools. A text-only response has none.
- `STATE_SNAPSHOT` / `STATE_DELTA` only appear when server code explicitly
  emits them for stateful agent workflows.
- `MESSAGES_SNAPSHOT` only appears when the server explicitly sends a
  full transcript snapshot.
- `CUSTOM` events are application-defined and never emitted by default.

Code that expects a fixed sequence (e.g., always waiting for `STEP_FINISHED`
before processing text) will hang or break on models that don't emit those events.

Source: docs/protocol/chunk-definitions.md

### Tension

RESOLVED: TanStack AI is fully AG-UI compliant on both axes (server→client events
AND client→server `RunAgentInput`). The wire format carries TanStack `UIMessage`
anchors with their parts intact alongside AG-UI fan-out messages, so strict AG-UI
servers see role-based messages while TanStack-aware servers read parts directly
without transformation. See `docs/migration/ag-ui-compliance.md` for details.

### Cross-References

- See also: `./chat-providers.md#source-tanstack-ai-core-custom-backend-integration` -- Custom backends must implement SSE or HTTP stream format to work with TanStack AI client connection adapters.
- See also: `./tools-outputs-middleware.md#source-tanstack-ai-core-middleware` -- `sandbox.file.diff`'s `{ path, diff }` value (one of `KnownCustomEvent`'s members) is populated from the same lazy `before()`/`after()`/`diff()` accessors documented there for `onFile*` middleware hooks.
- Full CUSTOM event taxonomy: `docs/protocol/custom-events.md`.

<a id="source-tanstack-ai-core-chat-experience"></a>

## Chat Experience

Source: `tanstack-ai-core-chat-experience`.

## Chat Experience

This skill builds on ai-core. Read it first for critical rules.

### Setup — Minimal Chat App

#### Server: API Route (TanStack Start)

```typescript
// src/routes/api.chat.ts
import { createFileRoute } from '@tanstack/react-router'
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const abortController = new AbortController()
        const body = await request.json()
        const { messages } = body

        const stream = chat({
          adapter: openaiText('gpt-5.5'),
          messages,
          systemPrompts: ['You are a helpful assistant.'],
          abortController,
        })

        return toServerSentEventsResponse(stream, { abortController })
      },
    },
  },
})
```

#### Client: React Component

```typescript
// src/routes/index.tsx
import { useState } from 'react'
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
import type { UIMessage } from '@tanstack/ai-react'

function ChatPage() {
  const [input, setInput] = useState('')

  const { messages, sendMessage, isLoading, error, stop } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
  })

  const handleSubmit = () => {
    if (!input.trim()) return
    sendMessage(input.trim())
    setInput('')
  }

  return (
    <div>
      <div>
        {messages.map((message: UIMessage) => (
          <div key={message.id}>
            <strong>{message.role}:</strong>
            {message.parts.map((part, i) => {
              if (part.type === 'text') {
                return <p key={i}>{part.content}</p>
              }
              return null
            })}
          </div>
        ))}
      </div>

      {error && <div>Error: {error.message}</div>}

      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          disabled={isLoading}
          placeholder="Type a message..."
        />
        {isLoading ? (
          <button onClick={stop}>Stop</button>
        ) : (
          <button onClick={handleSubmit} disabled={!input.trim()}>
            Send
          </button>
        )}
      </div>
    </div>
  )
}
```

Vue/Solid/Svelte/Preact have identical patterns with different hook imports
(e.g., `import { useChat } from '@tanstack/ai-solid'`).

### Core Patterns

#### 1. Streaming Chat with SSE

Server returns a streaming SSE Response; client parses it automatically.

**Server:**

```typescript
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { anthropicText } from '@tanstack/ai-anthropic'

const stream = chat({
  adapter: anthropicText('claude-sonnet-4-5'),
  messages,
  modelOptions: {
    temperature: 0.7,
    max_tokens: 2000, // Anthropic-native key
  },
  systemPrompts: ['You are a helpful assistant.'],
  abortController,
})

return toServerSentEventsResponse(stream, { abortController })
```

To make the SSE response resumable (reconnect after a drop/refresh without
re-running the provider), pass a delivery-durability adapter:
`toServerSentEventsResponse(stream, { durability: { adapter: memoryStream(request) } })`
(`memoryStream` from `@tanstack/ai` is process-local, for dev/tests) or
`durableStream(request, { server })` from `@tanstack/ai-durable-stream`
(Durable Streams protocol, production). Each SSE event gets an opaque
adapter-owned `id:`; `fetchServerSentEvents` auto-reconnects with
`Last-Event-ID` and exposes `joinRun(runId)` to replay a run from the start.
See `docs/resumable-streams/overview.md`.

**Client:**

```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'

const { messages, sendMessage, isLoading, error, stop, status } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
  body: { provider: 'anthropic', model: 'claude-sonnet-4-5' },
  onFinish: (message) => {
    console.log('Response complete:', message.id)
  },
  onError: (err) => {
    console.error('Stream error:', err)
  },
})
```

The `body` field is merged into the POST request body alongside `messages`,
letting the server read `data.provider`, `data.model`, etc.

The `status` field tracks the chat lifecycle: `'ready'` | `'submitted'` | `'streaming'` | `'error'`.

#### 2. Rendering Thinking/Reasoning Content

Models with extended thinking (Claude, Gemini) emit `ThinkingPart` in the message parts array.

```typescript
import type { UIMessage } from '@tanstack/ai-react'

function MessageRenderer({ message }: { message: UIMessage }) {
  return (
    <div>
      {message.parts.map((part, i) => {
        if (part.type === 'thinking') {
          const isComplete = message.parts
            .slice(i + 1)
            .some((p) => p.type === 'text')
          return (
            <details key={i} open={!isComplete}>
              <summary>{isComplete ? 'Thought process' : 'Thinking...'}</summary>
              <pre>{part.content}</pre>
            </details>
          )
        }

        if (part.type === 'text' && part.content) {
          return <p key={i}>{part.content}</p>
        }

        if (part.type === 'tool-call') {
          return (
            <div key={part.id}>
              Tool call: {part.name} ({part.state})
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
```

Server-side, enable thinking via `modelOptions` on the adapter:

```typescript
import { geminiText } from '@tanstack/ai-gemini'

const stream = chat({
  adapter: geminiText('gemini-2.5-flash'),
  messages,
  modelOptions: {
    thinkingConfig: {
      includeThoughts: true,
      thinkingBudget: 100,
    },
  },
})
```

#### 3. Sending Multimodal Content (Images)

Use `sendMessage` with a `MultimodalContent` object instead of a plain string.

```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
import type { ContentPart } from '@tanstack/ai'

const { sendMessage } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
})

function sendImageMessage(text: string, imageBase64: string, mimeType: string) {
  const contentParts: Array<ContentPart> = [
    { type: 'text', content: text },
    {
      type: 'image',
      source: { type: 'data', value: imageBase64, mimeType },
    },
  ]

  sendMessage({ content: contentParts })
}

function sendImageUrl(text: string, imageUrl: string) {
  const contentParts: Array<ContentPart> = [
    { type: 'text', content: text },
    {
      type: 'image',
      source: { type: 'url', value: imageUrl },
    },
  ]

  sendMessage({ content: contentParts })
}
```

Render image parts in received messages:

```typescript
if (part.type === 'image') {
  const src =
    part.source.type === 'url'
      ? part.source.value
      : `data:${part.source.mimeType};base64,${part.source.value}`
  return <img key={i} src={src} alt="Attached image" />
}
```

#### 4. Sending Audio Messages (Browser Recording)

Use `useAudioRecorder` from `@tanstack/ai-react` (or `createAudioRecorder` in Svelte) to capture audio in the browser. The resolved `AudioRecording` includes a ready-to-use `part` that slots directly into `sendMessage`.

```typescript
import {
  useAudioRecorder,
  useChat,
  fetchServerSentEvents,
} from '@tanstack/ai-react'

const { isRecording, isSupported, start, stop } = useAudioRecorder()
const { sendMessage } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
})

async function toggle() {
  if (!isRecording) {
    await start()
    return
  }
  const recording = await stop()
  await sendMessage({ content: [recording.part] })
}
```

`recording.part` is `{ type: 'audio', source: { type: 'data', value: base64, mimeType } }`. Returns the recorder's native format (`audio/webm` or `audio/mp4`) with no transcoding.

#### 5. HTTP Stream Format (Alternative to SSE)

Use `toHttpResponse` + `fetchHttpStream` for newline-delimited JSON instead of SSE.

**Server:**

```typescript
import { chat, toHttpResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

const stream = chat({
  adapter: openaiText('gpt-5.5'),
  messages,
  abortController,
})

return toHttpResponse(stream, { abortController })
```

**Client:**

```typescript
import { useChat, fetchHttpStream } from '@tanstack/ai-react'

const { messages, sendMessage } = useChat({
  connection: fetchHttpStream('/api/chat'),
})
```

The only difference is swapping `toServerSentEventsResponse` / `fetchServerSentEvents`
for `toHttpResponse` / `fetchHttpStream`. Everything else stays identical.

This includes resumability: pass the same `durability` adapter to
`toHttpResponse(stream, { durability: { adapter: memoryStream(request) } })` and
each NDJSON line becomes an `{ id, chunk }` envelope. `fetchHttpStream`
auto-reconnects with `Last-Event-ID`, de-dupes the replayed prefix, and exposes
`joinRun(runId)` — the same guarantees as resumable SSE. The XHR adapters
(`xhrServerSentEvents` / `xhrHttpStream`) are resumable too.

#### 6. MCP Tool Discovery via `chat({ mcp })`

Pass `mcp` to let `chat()` own discovery **and** lifecycle for one or more MCP
clients. Useful when you want minimal boilerplate and don't need to reuse the
clients across calls.

```typescript
// Prop shape:
// chat({
//   ...,
//   mcp: {
//     clients: Array<MCPClient | MCPClients>,
//     connection?: 'close' | 'keep-alive',  // default: 'close'
//     lazyTools?: boolean,
//     onDiscoveryError?: (error: unknown, source) => void,
//   }
// })
```

- **`clients`** — one or more `MCPClient` / `MCPClients` instances.
- **`connection`** — `'close'` (default) closes each client when the run ends
  (after the agent loop completes and the stream is drained); with
  `'keep-alive'`, `chat()` never closes the clients — the caller owns their
  lifecycle (keep connections warm across requests).
- **`lazyTools`** — forwarded to `tools({ lazy: true })` so tool schemas are
  sent to the LLM on demand.
- **`onDiscoveryError`** — throw (or re-throw) to fail the entire call fast;
  return normally to skip that source and continue. Omit to rethrow (fail-fast).

**When to use `mcp` vs. the tools spread:**

| Approach                                                | Use when                                                                                        |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `chat({ mcp: { clients: [...] } })`                     | You want discovery + lifecycle managed for you, and don't need fully-typed input/output schemas |
| `tools: [...await client.tools([toolDefinition(...)])]` | You want fully-typed MCP tools with Zod input/output validation                                 |

**Server-side example:**

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { createMCPClient } from '@tanstack/ai-mcp'

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = await request.json()

        const mcpClient = await createMCPClient({
          transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
        })

        const stream = chat({
          adapter: openaiText('gpt-5.5'),
          messages,
          mcp: {
            clients: [mcpClient],
            connection: 'keep-alive', // chat() won't close it — reuse across requests
          },
        })

        return toServerSentEventsResponse(stream)
        // connection: 'keep-alive' — chat() never closes mcpClient; it stays open for reuse across runs.
      },
    },
  },
})
```

#### 7. Queueing Messages Sent While Streaming

By default, a `sendMessage` call that arrives while a stream is in flight is
**queued** and sent automatically once the run settles **successfully** —
this is a behavior change: such sends used to be silently dropped. Configure
it with the `queue` option on `useChat`:

```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'

const { messages, queue, sendMessage, cancelQueued, isLoading } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
  queue: { whenBusy: 'queue', drain: 'fifo', maxSize: 5, onOverflow: 'reject' },
})
```

- **`whenBusy`** — `'queue'` (default) holds the message until a successful
  settle; `'drop'` ignores the send (never appears in `queue`/`messages`);
  `'interrupt'` aborts the current stream and sends immediately (unlike
  `stop()`, does **not** flush already-queued items — they drain after the
  interrupting send **succeeds**).
- **`drain`** — `'fifo'` (default) sends queued items one at a time in
  order; `'batch'` merges everything queued into a single send once the
  run settles successfully.
- **`maxSize`** / **`onOverflow`** — cap the queue length; `'reject'`
  (default) silently ignores overflow sends (does not throw),
  `'drop-oldest'` evicts the oldest queued item to make room.

The top-level `queue` option also accepts a plain `WhenBusy` string
shorthand (e.g. `queue: 'interrupt'`) or a `QueueStrategy` function for
per-send action control. Strategy form always drains FIFO. Actions use
the `WhenBusy` type.

**Drain vs flush:** queued messages auto-send only after a **successful**
settle. They are **discarded** on stream error/abort of the active
generation, `stop()`, `clear()`, `unsubscribe()`, and `reload()`.
`interrupt` does not flush.

`queue: Array<QueuedMessage>` (`{ id, content, createdAt }`) is separate
from `messages` — render pending sends distinctly and cancel with
`cancelQueued(id)`:

```typescript
{queue.map((q) => (
  <div key={q.id}>
    {typeof q.content === 'string' ? q.content : '[attachment]'}
    <button onClick={() => cancelQueued(q.id)}>Cancel</button>
  </div>
))}
```

Override the configured policy for a single send with the second argument
to `sendMessage`:

```typescript
sendMessage('Never mind, do this instead', { whenBusy: 'interrupt' })
```

#### 8. Browser-Refresh Durability (client persistence)

By default a `ChatClient` / `useChat` keeps messages in memory only, so a full
page reload loses the conversation. The optional `persistence` option (a
`ChatClientPersistence` adapter) fixes this from the client side: it stores one
combined record — `{ messages, resume? }` (`ChatPersistedState`) — per chat `id`,
so a reload restores the transcript **and** rehydrates any pending interrupt /
rejoins a run that was still streaming. No manual `initialMessages` + `onFinish`
boilerplate.

Three storage adapters ship from `@tanstack/ai-client`:
`localStoragePersistence` (survives reloads and browser restarts),
`sessionStoragePersistence` (scoped to the tab), and `indexedDBPersistence`
(async, structured-clone storage — no codec needed for `Date`/`Map`/etc.).
Give the chat a stable `threadId` so the reload finds the same record.
Persistence keys on `threadId`; the storage adapters are re-exported from each
framework package, so a single import works:

```typescript
import {
  useChat,
  fetchServerSentEvents,
  localStoragePersistence,
} from '@tanstack/ai-react'

// Defaults to the ChatPersistedState shape and a JSON codec, so no type
// argument or serialize/deserialize is needed. indexedDBPersistence stores via
// structured clone (a Date round-trips exactly).
const persistence = localStoragePersistence()

function Chat() {
  const { messages, sendMessage } = useChat({
    threadId: 'support-chat',
    connection: fetchServerSentEvents('/api/chat'),
    persistence,
  })
  // ...render messages, call sendMessage(text)
}
```

**Keep large transcripts off the client.** `persistence` also accepts `true`
(server-authoritative): the client caches nothing, and on mount it hydrates the
thread from the server by `threadId` (transcript plus a cursor to any run still
generating). An adapter is client-authoritative; `true` leaves history on the
server and needs a connection with a `hydrate` handler plus a server GET
endpoint (`reconstructChat`), since the delivery log only holds one run.

**Mid-stream reload rejoin.** If the run was still streaming when the page
reloaded, the client re-attaches instead of showing a frozen half-reply — but
only when the connection is **resumable**: a delivery-durability-backed route
that records the stream and exposes a GET replay handler (see
`docs/resumable-streams/overview.md` and Pattern 1's `durability` adapter). Given
that, `useChat` finds the persisted in-flight run on load and auto-rejoins it via
`joinRun`, replaying from the server's log so the reply finishes where it left
off. No extra client code beyond the resumable connection.

**Every framework, no extra code.** Durability rides the existing `persistence`
option, so it works identically in `@tanstack/ai-react`, `-solid`, `-vue`,
`-svelte`, `-angular`, and `-preact` — pass `persistence` (and a stable
`threadId`, which is the chat's identity) to the framework's `useChat` /
`createChat` / `injectChat`; nothing is framework-specific.

> **Client vs. server durability.** This is the client (per-browser) half.
> The authoritative, multi-user, server-side copy is the `withPersistence`
> middleware — see ./tools-outputs-middleware.md#source-tanstack-ai-core-middleware. The two are independent; use
> both for instant reload restore plus a durable record of record.

### Common Mistakes

#### a. CRITICAL: Using Vercel AI SDK patterns (streamText, generateText)

```typescript
// WRONG
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
const result = streamText({ model: openai('gpt-5.5'), messages })

// CORRECT
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
const stream = chat({ adapter: openaiText('gpt-5.5'), messages })
```

#### b. CRITICAL: Using Vercel createOpenAI() provider pattern

```typescript
// WRONG
import { createOpenAI } from '@ai-sdk/openai'
const openai = createOpenAI({ apiKey })
streamText({ model: openai('gpt-5.5'), messages })

// CORRECT
import { openaiText } from '@tanstack/ai-openai'
import { chat } from '@tanstack/ai'
chat({ adapter: openaiText('gpt-5.5'), messages })
```

#### c. CRITICAL: Using monolithic openai() instead of openaiText()

```typescript
// WRONG
import { openai } from '@tanstack/ai-openai'
chat({ adapter: openai(), model: 'gpt-5.5', messages })

// CORRECT
import { openaiText } from '@tanstack/ai-openai'
chat({ adapter: openaiText('gpt-5.5'), messages })
```

The monolithic `openai()` adapter is deprecated. Use tree-shakeable adapters:
`openaiText()`, `openaiImage()`, `openaiSpeech()`, etc.

#### d. HIGH: Using toResponseStream instead of toServerSentEventsResponse

```typescript
// WRONG
import { toResponseStream } from '@tanstack/ai'
return toResponseStream(stream, { abortController })

// CORRECT
import { toServerSentEventsResponse } from '@tanstack/ai'
return toServerSentEventsResponse(stream, { abortController })
```

#### e. HIGH: Passing model as separate parameter to chat()

```typescript
// WRONG
chat({ adapter: openaiText(), model: 'gpt-5.5', messages })

// CORRECT
chat({ adapter: openaiText('gpt-5.5'), messages })
```

The model is passed to the adapter factory, not to `chat()`.

#### f. HIGH: Passing sampling options at the root of chat()

Sampling options (`temperature`, token limits, `top_p`/`topP`) are **not**
top-level fields on `chat()`. They live inside `modelOptions` using the
provider's native key.

```typescript
// WRONG — temperature/maxTokens are not root options
chat({ adapter, messages, temperature: 0.7, maxTokens: 1000 })

// WRONG — there is no `options` field either
chat({ adapter, messages, options: { temperature: 0.7, maxTokens: 1000 } })

// CORRECT — inside modelOptions, provider-native keys (OpenAI shown)
chat({
  adapter,
  messages,
  modelOptions: { temperature: 0.7, max_output_tokens: 1000 },
})
```

`temperature` is universal across providers; token limits use provider-native
keys (`max_output_tokens` for OpenAI, `max_tokens` for Anthropic/Grok,
`maxOutputTokens` for Gemini, `max_completion_tokens` for Groq,
`maxCompletionTokens` for OpenRouter, and `num_predict` nested under
`modelOptions.options` for Ollama). See ./chat-providers.md#source-tanstack-ai-core-adapter-configuration.

#### g. HIGH: Using providerOptions instead of modelOptions

```typescript
// WRONG
chat({
  adapter,
  messages,
  providerOptions: { responseFormat: { type: 'json_object' } },
})

// CORRECT
chat({
  adapter,
  messages,
  modelOptions: { responseFormat: { type: 'json_object' } },
})
```

#### h. HIGH: Implementing custom SSE stream instead of using toServerSentEventsResponse

```typescript
// WRONG
const readable = new ReadableStream({
  async start(controller) {
    const encoder = new TextEncoder()
    for await (const chunk of stream) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
    }
    controller.enqueue(encoder.encode('data: [DONE]\n\n'))
    controller.close()
  },
})
return new Response(readable, {
  headers: { 'Content-Type': 'text/event-stream' },
})

// CORRECT
import { toServerSentEventsResponse } from '@tanstack/ai'
return toServerSentEventsResponse(stream, { abortController })
```

`toServerSentEventsResponse` handles SSE formatting, abort signals,
error events (RUN_ERROR), and correct headers automatically.

#### i. HIGH: Implementing custom onEnd/onFinish callbacks instead of middleware

```typescript
// WRONG
chat({
  adapter,
  messages,
  onEnd: (result) => {
    trackAnalytics(result)
  },
})

// CORRECT
import type { ChatMiddleware } from '@tanstack/ai'

const analytics: ChatMiddleware = {
  name: 'analytics',
  onFinish(ctx, info) {
    trackAnalytics({ reason: info.finishReason, iterations: ctx.iteration })
  },
  onUsage(ctx, usage) {
    trackTokens(usage.totalTokens)
  },
}

chat({ adapter, messages, middleware: [analytics] })
```

`chat()` has no `onEnd`/`onFinish` option. Use `middleware` for lifecycle events.
See also: ./tools-outputs-middleware.md#source-tanstack-ai-core-middleware.

#### j. HIGH: Importing from @tanstack/ai-client instead of framework package

```typescript
// WRONG
import { fetchServerSentEvents } from '@tanstack/ai-client'
import { useChat } from '@tanstack/ai-react'

// CORRECT
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
```

Framework packages re-export everything needed from `@tanstack/ai-client`.
Import from `@tanstack/ai-client` only in vanilla JS (no framework).

#### k. MEDIUM: Not handling RUN_ERROR events in streaming context

Streaming errors arrive as `RUN_ERROR` events in the stream, not as thrown
exceptions. The `useChat` hook surfaces these via the `error` state and
`onError` callback. If you consume the stream manually (without `useChat`),
check for `RUN_ERROR` chunks:

```typescript
for await (const chunk of stream) {
  if (chunk.type === 'RUN_ERROR') {
    console.error('Stream error:', chunk.error.message)
    break
  }
  if (chunk.type === 'TEXT_MESSAGE_CONTENT') {
    process.stdout.write(chunk.delta)
  }
}
```

If not handled, the UI appears to hang with no feedback.

### Cross-References

- See also: **./tools-outputs-middleware.md#source-tanstack-ai-core-tool-calling** -- Most chats include tools
- See also: **./chat-providers.md#source-tanstack-ai-core-adapter-configuration** -- Adapter choice affects available features
- See also: **./tools-outputs-middleware.md#source-tanstack-ai-core-middleware** -- Use middleware for analytics and lifecycle events
- See also: **`@tanstack/ai-persistence` skills** (`./persistence-coordination.md#source-tanstack-ai-persistence` in that package) -- Server + client state persistence, store contracts, adapter recipes (deeper than Pattern 8)

<a id="source-tanstack-ai-core-custom-backend-integration"></a>

## Custom Backend Integration

Source: `tanstack-ai-core-custom-backend-integration`.

## Custom Backend Integration

This skill builds on ai-core and ai-core/chat-experience. Read them first.

### Setup

Connect `useChat` to a custom SSE backend with auth headers:

```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'

function Chat() {
  const { messages, sendMessage, isLoading } = useChat({
    connection: fetchServerSentEvents('https://my-api.com/chat', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  })

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>
          <strong>{msg.role}:</strong>
          {msg.parts.map((part, i) => {
            if (part.type === 'text') {
              return <p key={i}>{part.content}</p>
            }
            return null
          })}
        </div>
      ))}
      <button onClick={() => sendMessage('Hello')}>Send</button>
    </div>
  )
}
```

Both `fetchServerSentEvents` and `fetchHttpStream` accept a static URL string
or a function returning a string (evaluated per request), and a static options
object or a sync/async function returning options (also evaluated per request).
This allows dynamic auth tokens and URLs without re-creating the adapter.

### Core Patterns

#### 1. Custom SSE Backend with fetchServerSentEvents

Use when your backend speaks SSE (`text/event-stream`) with `data: {json}\n\n`
framing. This is the recommended default.

**Static options:**

```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'

const { messages, sendMessage } = useChat({
  connection: fetchServerSentEvents('https://my-api.com/chat', {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Id': tenantId,
    },
    credentials: 'include',
  }),
})
```

**Dynamic URL and options (evaluated per request):**

```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'

const { messages, sendMessage } = useChat({
  connection: fetchServerSentEvents(
    () => `https://my-api.com/chat?session=${sessionId}`,
    async () => ({
      headers: {
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      body: {
        provider: 'openai',
        model: 'gpt-4o',
      },
    }),
  ),
})
```

The `body` field in options is merged into the POST request body alongside
`messages` and `data`, so the server receives `{ messages, data, provider, model }`.

**Custom fetch client (for proxies, interceptors, retries):**

```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'

const { messages, sendMessage } = useChat({
  connection: fetchServerSentEvents('/api/chat', {
    fetchClient: myCustomFetch,
  }),
})
```

#### 2. Custom NDJSON Backend with fetchHttpStream

Use when your backend sends newline-delimited JSON (`application/x-ndjson`)
instead of SSE. Each line is one JSON-encoded `StreamChunk` followed by `\n`.

```typescript
import { useChat, fetchHttpStream } from '@tanstack/ai-react'

const { messages, sendMessage } = useChat({
  connection: fetchHttpStream('https://my-api.com/chat', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),
})
```

`fetchHttpStream` accepts the same URL and options signatures as
`fetchServerSentEvents` (static or dynamic, sync or async). The only difference
is the parsing: no `data:` prefix stripping, no `[DONE]` sentinel -- just one
JSON object per line.

**Dynamic options work identically:**

```typescript
import { useChat, fetchHttpStream } from '@tanstack/ai-react'

const { messages, sendMessage } = useChat({
  connection: fetchHttpStream(
    () => `/api/chat?region=${region}`,
    async () => ({
      headers: { Authorization: `Bearer ${await refreshToken()}` },
    }),
  ),
})
```

#### 3. Fully Custom Connection Adapter

For protocols that don't fit SSE or NDJSON (WebSockets, gRPC-web, custom binary,
server functions), implement the `ConnectionAdapter` interface directly.

There are two mutually exclusive modes:

**ConnectConnectionAdapter (pull-based / async iterable):**

Use when the client initiates a request and consumes the response as a stream.
This is the simpler model and covers most HTTP-based protocols.

```typescript
import { useChat } from '@tanstack/ai-react'
import type { ConnectionAdapter } from '@tanstack/ai-react'
import type { StreamChunk, UIMessage } from '@tanstack/ai'

const websocketAdapter: ConnectionAdapter = {
  async *connect(
    messages: Array<UIMessage>,
    data?: Record<string, any>,
    abortSignal?: AbortSignal,
  ): AsyncGenerator<StreamChunk> {
    const ws = new WebSocket('wss://my-api.com/chat')

    // Wait for connection
    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => resolve()
      ws.onerror = (e) => reject(e)
    })

    // Send messages
    ws.send(JSON.stringify({ messages, ...data }))

    // Create an async queue to bridge WebSocket events to an async iterable
    const queue: Array<StreamChunk> = []
    let resolve: (() => void) | null = null
    let done = false

    ws.onmessage = (event) => {
      const chunk: StreamChunk = JSON.parse(event.data)
      queue.push(chunk)
      resolve?.()
    }

    ws.onclose = () => {
      done = true
      resolve?.()
    }

    ws.onerror = () => {
      done = true
      resolve?.()
    }

    abortSignal?.addEventListener('abort', () => {
      ws.close()
    })

    // Yield chunks as they arrive
    while (!done || queue.length > 0) {
      if (queue.length > 0) {
        yield queue.shift()!
      } else {
        await new Promise<void>((r) => {
          resolve = r
        })
      }
    }
  },
}

function Chat() {
  const { messages, sendMessage } = useChat({
    connection: websocketAdapter,
  })

  // ... render messages
}
```

**SubscribeConnectionAdapter (push-based / separate subscribe + send):**

Use for push-based protocols where the server can send data at any time
(persistent WebSocket connections, MQTT, server push). The `subscribe` method
returns an `AsyncIterable<StreamChunk>` that stays open, and `send` dispatches
messages through it.

```typescript
import type { StreamChunk, UIMessage } from '@tanstack/ai'

// SubscribeConnectionAdapter is exported from @tanstack/ai-client
// (not re-exported by framework packages -- use ConnectionAdapter
//  union type from @tanstack/ai-react for typing)
const pushAdapter = {
  subscribe(abortSignal?: AbortSignal): AsyncIterable<StreamChunk> {
    // Return a long-lived async iterable that yields chunks
    // whenever the server pushes them
    return createPersistentStream(abortSignal)
  },

  async send(
    messages: Array<UIMessage>,
    data?: Record<string, any>,
    abortSignal?: AbortSignal,
  ): Promise<void> {
    // Dispatch messages; chunks arrive through subscribe()
    await persistentConnection.send(JSON.stringify({ messages, ...data }))
  },
}

function Chat() {
  const { messages, sendMessage } = useChat({
    connection: pushAdapter,
  })

  // ... render messages
}
```

The `stream()` helper function (re-exported from `@tanstack/ai-react`) provides
a shorthand for creating a `ConnectConnectionAdapter` from an async generator:

```typescript
import { useChat, stream } from '@tanstack/ai-react'
import type { StreamChunk, UIMessage } from '@tanstack/ai'

const directAdapter = stream(async function* (
  messages: Array<UIMessage>,
  data?: Record<string, any>,
): AsyncGenerator<StreamChunk> {
  const response = await fetch('https://my-api.com/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, ...data }),
  })

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.trim()) {
        yield JSON.parse(line) as StreamChunk
      }
    }
  }
})

const { messages, sendMessage } = useChat({
  connection: directAdapter,
})
```

### Common Mistakes

#### a. HIGH: Providing both connect and subscribe+send in connection adapter

The `ConnectionAdapter` interface has two mutually exclusive modes. Providing
both throws at runtime.

```typescript
// WRONG -- throws "Connection adapter must provide either connect or both
// subscribe and send, not both modes"
const adapter = {
  async *connect(messages) {
    /* ... */
  },
  subscribe(signal) {
    /* ... */
  },
  async send(messages) {
    /* ... */
  },
}

// CORRECT -- pick one mode
// Option A: ConnectConnectionAdapter (pull-based)
const pullAdapter = {
  async *connect(messages, data, abortSignal) {
    // ... yield StreamChunks
  },
}

// Option B: SubscribeConnectionAdapter (push-based)
const pushAdapter = {
  subscribe(abortSignal) {
    return longLivedAsyncIterable
  },
  async send(messages, data, abortSignal) {
    await connection.dispatch({ messages, ...data })
  },
}
```

Source: `ai-client/src/connection-adapters.ts` line 116

#### b. MEDIUM: SSE browser connection limits

Browsers limit SSE connections to 6-8 per domain (the HTTP/1.1 connection
limit). Multiple chat sessions on the same page, or multiple tabs to the
same origin, can exhaust this limit. New connections queue indefinitely until
an existing one closes.

Mitigations:

- Use HTTP/2 (multiplexes streams over a single TCP connection; no per-domain limit)
- Use `fetchHttpStream` instead of `fetchServerSentEvents` (each request is a
  standard POST, not a long-lived EventSource)
- Close idle connections when not actively streaming
- Use a single persistent WebSocket via `SubscribeConnectionAdapter` instead of
  per-request SSE connections

Source: `docs/chat/connection-adapters.md`

#### c. MEDIUM: HTTP stream without implementing reconnection

SSE has built-in browser auto-reconnection via the `EventSource` API. HTTP
stream (NDJSON via `fetchHttpStream`) does not -- if the connection drops
mid-stream, the partial response is silently lost with no automatic retry.

If your application needs resilience to transient network errors with HTTP
streaming, implement retry logic in your connection adapter:

```typescript
import { useChat } from '@tanstack/ai-react'
import type { ConnectionAdapter } from '@tanstack/ai-react'
import type { StreamChunk, UIMessage } from '@tanstack/ai'

const resilientAdapter: ConnectionAdapter = {
  async *connect(
    messages: Array<UIMessage>,
    data?: Record<string, any>,
    abortSignal?: AbortSignal,
  ): AsyncGenerator<StreamChunk> {
    const maxRetries = 3
    let attempt = 0

    while (attempt < maxRetries) {
      try {
        const response = await fetch('https://my-api.com/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, ...data }),
          signal: abortSignal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.trim()) {
              yield JSON.parse(line) as StreamChunk
            }
          }
        }

        return // Stream completed successfully
      } catch (err) {
        if (abortSignal?.aborted) throw err
        attempt++
        if (attempt >= maxRetries) throw err
        // Exponential backoff
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt))
      }
    }
  },
}

const { messages, sendMessage } = useChat({
  connection: resilientAdapter,
})
```

Note: `fetchServerSentEvents` in TanStack AI uses `fetch()` under the hood (not
the browser `EventSource` API), so it also does not auto-reconnect. The SSE
auto-reconnection advantage only applies when using the native `EventSource` API
directly.

Source: `docs/protocol/http-stream-protocol.md`

### Cross-References

- See also: **./chat-providers.md#source-tanstack-ai-core-ag-ui-protocol** -- Understanding the AG-UI protocol helps build compatible custom servers
- See also: **./chat-providers.md#source-tanstack-ai-core-chat-experience** -- Full chat setup patterns including server-side `chat()` and `toServerSentEventsResponse()`
- See also: **./tools-outputs-middleware.md#source-tanstack-ai-core-middleware** -- Use middleware for analytics and lifecycle events on the server side

<a id="source-tanstack-ai-core-debug-logging"></a>

## Debug Logging

Source: `tanstack-ai-core-debug-logging`.

## Debug Logging

> **Dependency note:** This skill builds on ai-core. Read it first for critical rules.

Use this skill when you need to turn debug logging on or off, narrow what's
printed, or pipe logs into a custom logger (pino, winston, etc.). The same
`debug` option works on every activity — `chat()`, `summarize()`,
`generateImage()`, `generateSpeech()`, `generateTranscription()`,
`generateVideo()`.

### Turn it on

```typescript
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

const stream = chat({
  adapter: openaiText('gpt-5.2'),
  messages,
  debug: true, // all categories on, prints to console
})
```

Each log line is prefixed with an emoji and `[tanstack-ai:<category>]`:

```
📤 [tanstack-ai:request] 📤 activity=chat provider=openai model=gpt-5.2 messages=1 tools=0 stream=true
🔁 [tanstack-ai:agentLoop] 🔁 run started
📥 [tanstack-ai:provider] 📥 provider=openai type=response.output_text.delta
📨 [tanstack-ai:output] 📨 type=TEXT_MESSAGE_CONTENT
```

### Turn it off

```typescript
chat({
  adapter: openaiText('gpt-5.2'),
  messages,
  debug: false, // silence everything, including errors
})
```

Omitting `debug` is **not** the same as `debug: false`. When omitted, the
`errors` category is still on (errors are cheap and important). Use
`debug: false` or `debug: { errors: false }` for true silence.

### `DebugOption` — the accepted shapes

```typescript
type DebugOption = boolean | DebugConfig

interface DebugConfig {
  // Per-category flags. Any flag omitted from a DebugConfig defaults to true.
  request?: boolean
  provider?: boolean
  output?: boolean
  middleware?: boolean
  tools?: boolean
  agentLoop?: boolean
  config?: boolean
  errors?: boolean
  // Optional custom logger. Defaults to ConsoleLogger.
  logger?: Logger
}
```

Resolution rules for the `debug?: DebugOption` field on every activity:

| `debug` value         | Effect                                                                       |
| --------------------- | ---------------------------------------------------------------------------- |
| omitted (`undefined`) | Only `errors` is active; default `ConsoleLogger`.                            |
| `true`                | All categories on; default `ConsoleLogger`.                                  |
| `false`               | All categories off (including `errors`); default `ConsoleLogger`.            |
| `DebugConfig` object  | Each unspecified flag defaults to `true`; `logger` replaces `ConsoleLogger`. |

### Narrow what's printed

Pass a `DebugConfig` object. Unspecified categories default to `true`, so it's
easiest to toggle by setting specific flags to `false`:

```typescript
chat({
  adapter: openaiText('gpt-5.2'),
  messages,
  debug: { middleware: false }, // everything except middleware
})
```

To print only a specific set, set the rest to `false` explicitly:

```typescript
chat({
  adapter: openaiText('gpt-5.2'),
  messages,
  debug: {
    provider: true,
    output: true,
    middleware: false,
    tools: false,
    agentLoop: false,
    config: false,
    errors: true, // keep errors on — they're cheap and important
    request: false,
  },
})
```

### Pipe into your own logger

```typescript
import type { Logger } from '@tanstack/ai'
import pino from 'pino'

const pinoLogger = pino()
const logger: Logger = {
  debug: (msg, meta) => pinoLogger.debug(meta, msg),
  info: (msg, meta) => pinoLogger.info(meta, msg),
  warn: (msg, meta) => pinoLogger.warn(meta, msg),
  error: (msg, meta) => pinoLogger.error(meta, msg),
}

chat({
  adapter: openaiText('gpt-5.2'),
  messages,
  debug: { logger }, // all categories on, piped to pino
})
```

The default console logger is exported as `ConsoleLogger` if you want to wrap
it:

```typescript
import { ConsoleLogger } from '@tanstack/ai'
```

### Categories

| Category     | Logs                                                           | Applies to                            |
| ------------ | -------------------------------------------------------------- | ------------------------------------- |
| `request`    | Outgoing call to a provider (model, message count, tool count) | All activities                        |
| `provider`   | Every raw chunk/frame received from a provider SDK             | Streaming activities (chat, realtime) |
| `output`     | Every chunk or result yielded to the caller                    | All activities                        |
| `middleware` | Inputs and outputs around every middleware hook                | `chat()` only                         |
| `tools`      | Before/after tool call execution                               | `chat()` only                         |
| `agentLoop`  | Agent-loop iterations and phase transitions                    | `chat()` only                         |
| `config`     | Config transforms returned by middleware `onConfig` hooks      | `chat()` only                         |
| `errors`     | Every caught error anywhere in the pipeline                    | All activities                        |

Chat-only categories simply never fire for non-chat activities — those
concepts don't exist in their pipelines.

### Non-chat activities

Same `debug` option everywhere:

```typescript
summarize({ adapter, text, debug: true })
generateImage({ adapter, prompt: 'a cat', debug: { logger } })
generateSpeech({ adapter, text, debug: { request: true } })
generateTranscription({ adapter, audio, debug: false })
generateVideo({ adapter, prompt: 'a wave', debug: { output: true } })
```

Realtime session adapters in provider packages (e.g. `openaiRealtime`,
`elevenlabsRealtime`) accept the same `debug?: DebugOption` on their session
options. They emit `request`, `provider`, and `errors` lines; the chat-only
categories don't apply.

### Common Mistakes

#### a. HIGH: Treating omitted `debug` as silent

```typescript
// WRONG — expecting this to be completely silent
chat({ adapter, messages })
// Errors still print via [tanstack-ai:errors] ... on failure.

// CORRECT — explicit silence
chat({ adapter, messages, debug: false })
chat({ adapter, messages, debug: { errors: false } })
```

`debug` undefined means "only errors"; `debug: false` means "nothing at all".

Source: docs/advanced/debug-logging.md

#### b. MEDIUM: Reaching for middleware when `debug` would do

```typescript
// WRONG — writing logging middleware to see chunks flow
const chunkLogger: ChatMiddleware = {
  name: 'chunk-logger',
  onChunk: (ctx, chunk) => {
    console.log(chunk.type, chunk)
  },
}
chat({ adapter, messages, middleware: [chunkLogger] })

// CORRECT — just turn on the relevant categories
chat({
  adapter,
  messages,
  debug: { provider: true, output: true },
})
```

For observing the built-in pipeline, the `debug` option is strictly faster
than writing logging middleware. Reach for middleware when you need to
_transform_ chunks, not just see them.

Source: docs/advanced/debug-logging.md

#### c. LOW: Logger implementation that can throw

A user-supplied `Logger` that throws will have its exception swallowed by the
SDK so it never masks the real error that triggered the log call. Still,
prefer implementations that don't throw — silenced exceptions are harder to
debug than loud ones.

```typescript
// WRONG — a logger that can throw on serialization
const fragile: Logger = {
  debug: (msg, meta) => console.debug(msg, JSON.stringify(meta)), // cyclic meta → throws
  /* ... */
}

// CORRECT — guard serialization in the logger itself
const safe: Logger = {
  debug: (msg, meta) => {
    try {
      console.debug(msg, meta)
    } catch {
      console.debug(msg)
    }
  },
  /* ... */
}
```

Source: packages/ai/src/logger/internal-logger.ts

### Cross-References

- See also: **./tools-outputs-middleware.md#source-tanstack-ai-core-middleware** — if you need to transform
  chunks/config, not just observe them.
- See also: **Observability** (`docs/advanced/observability.md`) — the
  programmatic event client for a richer, structured feed beyond log lines.
