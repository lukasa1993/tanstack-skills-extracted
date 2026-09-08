# Tool Calling — Provider Skills

[Guide and prerequisites](./tanstack-ai-core-tool-calling-e2b5ca3c.md) · Published skill · `@tanstack/ai@0.53.0`.

## Provider Skills

> **Not to be confused with `@tanstack/ai-code-mode-snippets`**, whose snippets are TypeScript functions your application generates and runs in its own Code Mode sandbox (a local JS isolate). Provider Skills are hosted, provider-managed bundles that the model loads on demand and runs inside the provider's server-side sandbox.

Provider Skills are inert without an execution tool. The execution tool is what activates the sandbox; skills are additional capability bundles that run inside it:

- **Anthropic**: skills require the `code_execution` tool (`@tanstack/ai-anthropic/tools`).
- **OpenAI**: skills live inside the `shell` tool (`@tanstack/ai-openai/tools`) and are Responses API only.

### Anthropic: `codeExecutionTool` with skills

Import from `@tanstack/ai-anthropic/tools`:

```typescript
import { codeExecutionTool } from '@tanstack/ai-anthropic/tools'
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { anthropicText } from '@tanstack/ai-anthropic'

export async function POST(request: Request) {
  const { messages } = await request.json()
  const stream = chat({
    adapter: anthropicText('claude-sonnet-4-6'),
    messages,
    tools: [
      codeExecutionTool(
        { type: 'code_execution_20250825', name: 'code_execution' },
        {
          skills: [{ type: 'anthropic', skill_id: 'pptx', version: 'latest' }],
        },
      ),
    ],
  })
  return toServerSentEventsResponse(stream)
}
```

`AnthropicContainerSkill` shape: `{ type: 'anthropic' | 'custom'; skill_id: string; version?: string }`. Constraints: max 8 skills per request; `skill_id` must be 1–64 characters.

The adapter automatically:

- Lifts the skills into the request's top-level `container.skills` param (the shape Anthropic's API requires).
- Attaches the required beta headers (`code-execution-2025-08-25` plus `skills-2025-10-02` when skills are present). You do not set these manually.

**Deprecation:** Setting skills via `modelOptions.container.skills` is deprecated. Use `codeExecutionTool(config, { skills })` instead — the legacy path bypasses the beta-header wiring.

### OpenAI: `shellTool` with skills (Responses API only)

Import from `@tanstack/ai-openai/tools`:

```typescript
import { shellTool } from '@tanstack/ai-openai/tools'
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

export async function POST(request: Request) {
  const { messages } = await request.json()
  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    tools: [
      shellTool({
        environment: {
          type: 'container_auto',
          skills: [
            { type: 'skill_reference', skill_id: 'skill_abc', version: '2' },
          ],
        },
      }),
    ],
  })
  return toServerSentEventsResponse(stream)
}
```

`SkillReference` shape: `{ type: 'skill_reference'; skill_id: string; version?: string }`. `version` is a string — use a positive integer as a string (e.g. `'2'`) or `'latest'`. This is Responses API only; Chat Completions does not support the shell tool.

### Scope

Only hosted/managed-by-id skills (`type: 'anthropic'` / `type: 'custom'` for Anthropic; `type: 'skill_reference'` for OpenAI) are wired. Inline bundles, local-path, and upload-API skill creation are not handled by these factories.
