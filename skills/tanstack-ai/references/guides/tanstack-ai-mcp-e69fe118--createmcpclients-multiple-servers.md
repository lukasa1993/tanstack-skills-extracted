# Ai Mcp — `createMCPClients` — multiple servers

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.3.9`.

## `createMCPClients` — multiple servers

Connect to many MCP servers in parallel. Each config key becomes the default
prefix for that server's tools, preventing name collisions across servers.

```typescript
import { createMCPClients } from '@tanstack/ai-mcp'

await using pool = await createMCPClients({
  github: { transport: { type: 'http', url: 'https://mcp.github.com/mcp' } },
  linear: { transport: { type: 'http', url: 'https://mcp.linear.app/mcp' } },
})

// Tool names auto-prefixed: 'github_search_repos', 'linear_create_issue', etc.
const tools = await pool.tools()

// Forward lazy flag to every server:
const lazyTools = await pool.tools({ lazy: true })

// Per-server typed access:
const githubTools = await pool.clients.github.tools()
```

`createMCPClients` connects in parallel, closes already-connected clients if
any connection fails (no leaks), and throws `MCPConnectionError` naming the
failed server(s).

Override or disable prefixing:

```typescript
await using pool = await createMCPClients({
  github: { transport: { ... }, prefix: 'gh' },    // 'gh_search_repos'
  linear: { transport: { ... }, prefix: '' },        // 'create_issue' (no prefix)
})
```
