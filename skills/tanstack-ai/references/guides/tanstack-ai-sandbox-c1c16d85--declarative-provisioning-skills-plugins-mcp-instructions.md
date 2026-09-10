# Ai Sandbox — Declarative provisioning (skills, plugins, MCP, instructions)

[Guide and prerequisites](./tanstack-ai-sandbox-c1c16d85.md) · Published skill · `@tanstack/ai-sandbox@0.5.7`.

## Declarative provisioning (skills, plugins, MCP, instructions)

```typescript
import {
  agentSkill,
  gitSkill,
  mcpSkill,
  fileSkill,
  bearer,
  createSecrets,
  defineWorkspace,
} from '@tanstack/ai-sandbox'

const secrets = createSecrets({ GH: process.env.GH_TOKEN ?? '' })

defineWorkspace({
  source: { type: 'git', url: 'https://github.com/owner/repo' },
  secrets,
  skills: [
    agentSkill('tanstack'), // named skill (no-op with warning on CLIs that lack the concept)
    gitSkill({
      repo: 'owner/private-skills',
      secret: secrets.GH, // resolved at bootstrap time, never stored
      // into: '/abs/path/inside/sandbox'  // optional; defaults to .tanstack-skills/<repo>
    }),
    mcpSkill('my-mcp', {
      url: 'https://mcp.example.com',
      headers: { Authorization: bearer(secrets.GH) },
    }),
    fileSkill({ path: '.hints.md', content: 'Prefer pnpm.' }),
  ],
  plugins: ['@anthropic/plugin-foo'], // no-op with warning on CLIs without a plugin concept
  instructions: 'Always run `pnpm test` before proposing a change.',
})
```

Each skill type is projected per harness (Claude Code → `.mcp.json`; Codex →
`.codex/config.toml`; OpenCode → `opencode.json`).
`instructions` is written as `AGENTS.md` at the workspace root; `CLAUDE.md` and
`GEMINI.md` are created as symlinks (falling back to copies on symlink failure).
Skills/plugins that a CLI lacks emit a `console.warn` and are skipped.

**`gitSkill` `into` field:** an **absolute path inside the sandbox** where the
repo is cloned. Defaults to `<root>/.tanstack-skills/<repo-basename>`.
