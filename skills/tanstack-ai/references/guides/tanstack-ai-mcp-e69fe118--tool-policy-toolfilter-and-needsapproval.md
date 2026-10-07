# Ai Mcp — Tool policy: `toolFilter` and `needsApproval`

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.8.0`.

## Tool policy: `toolFilter` and `needsApproval`

By default every server tool reaches the model and runs without approval.
Set a policy on the client. It applies in `tools()`, in `chat({ mcp })`, and
per server in `createMCPClients`. Both callbacks receive the raw MCP tool
definition (native unprefixed `name`, `title`, `annotations`).

```typescript
import { createMCPClient } from '@tanstack/ai-mcp'

const mcp = await createMCPClient({
  transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
  // Hide tools from the model. Unannotated tools fail this check.
  toolFilter: (tool) => tool.annotations?.readOnlyHint === true,
  // Pause for approval before these tools run (auto-discovery only).
  needsApproval: (tool) => tool.annotations?.destructiveHint !== false,
})
```

- `toolFilter` also applies to `tools([defs])`: a hidden definition throws
  `MCPToolNotFoundError`. MCP Apps widget calls also honor it. It does not
  apply to `callTool()`.
- `needsApproval` does not change `tools([defs])`: each `toolDefinition` keeps
  its own `needsApproval`.
- MCP Apps widget calls have no approval step, so the call handler refuses a
  tool that `needsApproval` marks (`{ ok: false, error: 'Tool needs approval: <name>' }`).
- Annotations are server-declared hints. For an untrusted server, filter by
  `tool.name` instead.
