# Ai Mcp — Error classes

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.9.1`.

## Error classes

- `MCPConnectionError` — thrown when a server connection fails or when calling
  methods after `close()`.
- `MCPToolNotFoundError` — thrown from `client.tools([defs])` when a definition's
  `name` is not exposed by the server, or the client's `toolFilter` hides it.
- `MCPToolFilterError`: thrown from `client.tools()` when a `toolFilter`
  list names a tool the server does not have, or names a tool twice. Its
  `missing`, `repeated`, and `available` fields name the tools.
- `MCPTaskRequiredToolError` — thrown when a task-required tool is bound via
  `tools([defs])` or called via `callTool()` and the server does not declare
  the tasks capability for `tools/call`. It is also thrown when a `toolFilter`
  list names such a tool. Auto-discovery without a list skips those tools
  instead of throwing.
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
  MCPToolFilterError,
  DuplicateToolNameError,
} from '@tanstack/ai-mcp'

import { MCPDuplicateToolNameError } from '@tanstack/ai'
```
