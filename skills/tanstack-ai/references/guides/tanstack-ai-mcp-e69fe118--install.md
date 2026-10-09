# Ai Mcp — Install

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.8.1`.

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

Import `./stdio` and `./server/stdio` only from Node code.
Those entries use Node I/O.
