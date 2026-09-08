# Ai Code Mode — Core Patterns: 4. Lazy Tools

[Guide and prerequisites](./tanstack-ai-code-mode-e0b454df.md) · Published skill · `@tanstack/ai-code-mode@0.4.8`.

## Core Patterns: 4. Lazy Tools


When a large tool catalog would bloat the `execute_typescript` system prompt, mark low-priority tools `lazy: true`. Lazy tools are kept out of the full type-stub documentation and listed in a compact "Discoverable APIs" catalog instead. All sandbox bindings are always injected — `lazy` defers documentation, not callability.

**Marking a tool lazy:**

```typescript
import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

const rarelyUsedTool = toolDefinition({
  name: 'fetchStocks',
  description: 'Get stock prices for a ticker. Returns a price quote.',
  inputSchema: z.object({ ticker: z.string() }),
  outputSchema: z.object({ price: z.number() }),
  lazy: true, // <-- opt out of full system-prompt documentation
}).server(async ({ ticker }) => {
  // ...
  return { price: 0 }
})
```

**`createCodeMode` return shape:**

`createCodeMode()` returns `{ tool, discoveryTool, tools, systemPrompt }`. When lazy tools are present `discoveryTool` is a `discover_tools` server tool; otherwise it is `null`. Always spread `tools` (not just `tool`) into `chat()` so the discovery tool is registered:

```typescript
import { chat } from '@tanstack/ai'
import { createCodeMode } from '@tanstack/ai-code-mode'
import { createNodeIsolateDriver } from '@tanstack/ai-isolate-node'
import { openaiText } from '@tanstack/ai-openai'

const { tools, systemPrompt } = createCodeMode({
  driver: createNodeIsolateDriver(),
  tools: [eagerTool, rarelyUsedTool], // rarelyUsedTool has lazy: true
})

const stream = chat({
  adapter: openaiText('gpt-5.5'),
  systemPrompts: ['You are a helpful assistant.', systemPrompt],
  tools: [...tools, ...otherTools], // spread tools, not just tool
  messages,
})
```

`tools` equals `[tool]` when there are no lazy tools (backward compatible) and `[tool, discoveryTool]` when lazy tools exist.

**`discover_tools` flow:**

When the model encounters a lazy tool it has not seen before, it calls `discover_tools` with the bare name (no `external_` prefix). The tool returns each requested tool's TypeScript type stub and description. The model then writes correctly-typed `external_<name>` calls inside `execute_typescript`.

```text
Model sees: "Discoverable APIs: external_fetchStocks"
Model calls: discover_tools({ toolNames: ["fetchStocks"] })
Response:    { tools: [{ name: "external_fetchStocks", description: "...", typeStub: "declare function external_fetchStocks(...)" }] }
Model writes inside execute_typescript: const result = await external_fetchStocks({ ticker: "AAPL" })
```

**`lazyToolsConfig.includeDescription`:**

Control how much of each lazy tool's description appears in the Discoverable APIs catalog (the pre-discovery list):

| Value              | Catalog entry                                                     |
| ------------------ | ----------------------------------------------------------------- |
| `'none'`           | `external_fetchStocks` (name only — default)                      |
| `'first-sentence'` | `external_fetchStocks — Get stock prices.`                        |
| `'full'`           | `external_fetchStocks — Get stock prices. Returns a price quote.` |

```typescript
const { tools, systemPrompt } = createCodeMode({
  driver: createNodeIsolateDriver(),
  tools: [eagerTool, rarelyUsedTool],
  lazyToolsConfig: { includeDescription: 'first-sentence' },
})
```

The same `lazyToolsConfig` option is accepted by plain `chat()` for its own lazy-tool discovery catalog (see `./tanstack-ai-core-tool-calling-e2b5ca3c.md#source-tanstack-ai-core-tool-calling`).
