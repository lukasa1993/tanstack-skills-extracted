# Ai Sandbox — Setup — Claude Code in a Docker sandbox

[Guide and prerequisites](./tanstack-ai-sandbox-c1c16d85.md) · Published skill · `@tanstack/ai-sandbox@0.5.7`.

## Setup — Claude Code in a Docker sandbox

```typescript
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { claudeCodeText } from '@tanstack/ai-claude-code'
import {
  createSecrets,
  defineSandbox,
  defineWorkspace,
  withSandbox,
} from '@tanstack/ai-sandbox'
import { dockerSandbox } from '@tanstack/ai-sandbox-docker'

const sandbox = defineSandbox({
  id: 'repo-agent',
  provider: dockerSandbox({ image: 'node:22' }),
  workspace: defineWorkspace({
    source: { type: 'git', url: 'https://github.com/owner/repo', ref: 'main' },
    packageManager: 'pnpm',
    setup: ['corepack enable', 'pnpm install'],
    scripts: { test: 'pnpm test' },
    secrets: createSecrets({
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? '',
    }),
  }),
  lifecycle: { reuse: 'thread', snapshot: 'after-setup', keepAlive: '30m' },
})

export async function POST(request: Request) {
  const { threadId, messages } = await request.json()

  const stream = chat({
    threadId,
    adapter: claudeCodeText('sonnet'),
    messages,
    middleware: [withSandbox(sandbox)],
  })

  return toServerSentEventsResponse(stream)
}
```
