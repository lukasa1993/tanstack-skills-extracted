# Ai Mcp — When to use this package

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.3.9`.

## When to use this package

Use `@tanstack/ai-mcp` when:

- A third-party MCP server exposes tools you want an agent or chat loop to call.
- You want to read MCP server resources (files, text, data) or prompts into a
  `chat()` message list.
- You want generated TypeScript types for an external MCP server's tool
  signatures (via the bundled `generate` CLI).
- You are running tool execution on the server side and want to connect to MCP
  servers with HTTP (Streamable HTTP or SSE) or stdio transports.

Do NOT use this package for browser/client-side code — MCP connections are
server-side only.
