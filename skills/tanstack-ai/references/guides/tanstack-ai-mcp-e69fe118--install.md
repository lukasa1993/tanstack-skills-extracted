# Ai Mcp — Install

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.3.10`.

## Install

```bash
pnpm add @tanstack/ai-mcp
```

The package has two subpath exports:

- `.` — main client API (`createMCPClient`, `createMCPClients`, converters, types)
- `./stdio` — Node-only stdio transport factory (`stdioTransport`); import it
  separately so edge bundles stay clean
