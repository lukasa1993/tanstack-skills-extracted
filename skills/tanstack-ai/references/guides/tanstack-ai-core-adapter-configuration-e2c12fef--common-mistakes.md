# Adapter Configuration — Common Mistakes

[Guide and prerequisites](./tanstack-ai-core-adapter-configuration-e2c12fef.md) · Published skill · `@tanstack/ai@0.54.0`.

## Common Mistakes

### a. HIGH: Confusing legacy monolithic with tree-shakeable adapter

The legacy `openai()` (and `anthropic()`, etc.) monolithic adapters are
deprecated. They take the model in `chat()`, not in the factory.

```typescript ignore
// WRONG: Legacy monolithic adapter pattern (no longer exported)
import { openai } from '@tanstack/ai-openai'
chat({ adapter: openai(), model: 'gpt-5.2', messages })
```

```typescript
// CORRECT: Tree-shakeable adapter, model in factory
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

const messages = [{ role: 'user' as const, content: 'Hello' }]

chat({ adapter: openaiText('gpt-5.2'), messages })
```

Source: docs/migration/migration.md

### b. MEDIUM: Wrong API key environment variable name

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
