# Ai Mcp — Codegen CLI

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.3.10`.

## Codegen CLI

Generate TypeScript types (typed tool names and pool keys) by introspecting live MCP servers.

**1. Create `mcp.config.ts` at your project root:**

```typescript
import { defineConfig } from '@tanstack/ai-mcp'

export default defineConfig({
  servers: {
    github: {
      transport: { type: 'http', url: 'https://mcp.github.com/mcp' },
      // prefix must match the runtime createMCPClient({ prefix }) value
    },
  },
  outFile: './src/mcp-types.generated.ts',
})
```

**2. Run the generator:**

```bash
npx @tanstack/ai-mcp generate
```

This connects to each server, lists its tools/resources/prompts, converts JSON
Schemas to TypeScript, and writes one `interface <Name>Server extends ServerDescriptor`
per server plus a combined `interface MCPServers` for pool typing.

**3. Use the generated types:**

```typescript
// Single server — narrows tools() return to descriptor-keyed tool names.
import type { GithubServer } from './src/mcp-types.generated'
import { createMCPClient, createMCPClients } from '@tanstack/ai-mcp'

const client = await createMCPClient<GithubServer>({
  transport: { type: 'http', url: 'https://mcp.github.com/mcp' },
})
const tools = await client.tools() // typed to GithubServer's tool names

// Multiple servers via the generated MCPServers map.
import type { MCPServers } from './src/mcp-types.generated'

const pool = await createMCPClients<MCPServers>({
  github: { transport: { type: 'http', url: 'https://mcp.github.com/mcp' } },
})
// pool.clients.github is MCPClient<GithubServer>
// missing/extra keys are a compile error
```

Codegen deps (`json-schema-to-typescript`, `jiti`) are bundled into the CLI bin
and do NOT appear in the library's runtime dependency graph.
