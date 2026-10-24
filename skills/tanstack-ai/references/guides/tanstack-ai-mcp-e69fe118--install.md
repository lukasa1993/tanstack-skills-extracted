# Ai Mcp — Install

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@1.0.0`.

## Install

```bash
pnpm add @tanstack/ai-mcp
```

The package has these subpaths:

- `.` exports `createMCPClient`, `createMCPClients`, converters, and types.
- `./stdio` exports the Node-only client transport `stdioTransport`.
- `./server` exports `createMCPServer`.
- `./server/stdio` exports `serveMCPStdio`.
- `./apps` exports `createMcpAppCallHandler`.
- `./harness` exports `createHarnessMcpServer` and the `mcp()` harness
  plugin. `createHarnessMcpServer` serves a TanStack AI harness as an MCP
  server. See `docs/harness/mcp-server.md`, and "`mcp()`: MCP servers in a
  harness" below.
- `./connector` exports `mcpConnector`: one OAuth MCP server as a harness
  plugin. See `docs/harness/mcp.md`.
- `./events` exports `createMCPEventWebhook`, `inMemoryMCPEventStore`, and `createMCPEventSecret` (experimental MCP Events / SEP-3415).

Import `./stdio` and `./server/stdio` only from Node code.
Those entries use Node I/O.
