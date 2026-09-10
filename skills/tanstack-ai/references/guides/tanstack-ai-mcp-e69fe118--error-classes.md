# Ai Mcp — Error classes

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.3.10`.

## Error classes

- `MCPConnectionError` — thrown when a server connection fails or when calling
  methods after `close()`.
- `MCPToolNotFoundError` — thrown from `client.tools([defs])` when a definition's
  `name` is not exposed by the server.
- `MCPTaskRequiredToolError` — thrown from `client.tools([defs])` when the named
  tool declares `execution.taskSupport: 'required'` (experimental MCP tasks).
  Such tools only run via the SDK's `tasks/callToolStream` flow, which
  `@tanstack/ai-mcp` does not support yet; they are silently excluded from
  `tools()` auto-discovery for the same reason.
- `DuplicateToolNameError` — thrown by a single pool's own `tools()` when two
  tools within that pool share the same name (same server or pool clients with no
  prefix). Exported from `@tanstack/ai-mcp`.
- `MCPDuplicateToolNameError` — thrown by `chat()` when tools from separate
  `mcp.clients` entries collide after merging. Exported from `@tanstack/ai`
  (not `@tanstack/ai-mcp`), so users can `instanceof` it at the `chat()` call site.

```typescript
import {
  MCPConnectionError,
  MCPToolNotFoundError,
  MCPTaskRequiredToolError,
  DuplicateToolNameError,
} from '@tanstack/ai-mcp'

import { MCPDuplicateToolNameError } from '@tanstack/ai'
```
