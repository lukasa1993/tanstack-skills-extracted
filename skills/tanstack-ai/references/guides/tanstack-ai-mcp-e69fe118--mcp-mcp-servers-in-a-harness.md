# Ai Mcp — `mcp()`: MCP servers in a harness

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@1.0.0`.

## `mcp()`: MCP servers in a harness

In a TanStack AI harness, use the `mcp()` plugin. It connects each server,
gives the model the tools as `<server>_<tool>`, and adds a `/mcp` command
that shows the status of each server.

```typescript
import { defineHarness } from '@tanstack/ai-harness'
import { openaiText } from '@tanstack/ai-openai'
import { mcp } from '@tanstack/ai-mcp/harness'

// Once, outside `plugins`, so the sessions share the stdio server.
const tools = mcp({
  servers: {
    files: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '.'],
    },
    docs: {
      type: 'http',
      url: 'https://mcp.example.com/mcp',
      headers: { authorization: `Bearer ${process.env.DOCS_TOKEN}` },
      timeoutMs: 10_000,
    },
    notion: {
      type: 'http',
      url: 'https://mcp.notion.com/mcp',
      oauth: true,
    },
  },
})

const agent = defineHarness({
  name: 'acme/agent',
  adapter: openaiText('gpt-6.1-sol'),
  plugins: () => [tools],
})
```

How it works:

- Each server connects on its own, in the background. The first turn waits
  for the connections.
- A server that fails gets the status `failed` with its error. The tools of
  the other servers still work.
- The status of a server is `connecting`, `connected`, `reconnecting`, or
  `failed`. `/mcp` prints it. A UI reads
  `snapshot().plugins['tanstack/mcp'].servers`.
- When a server closes, `mcp()` connects again with backoff. It lists the
  tools again on `list_changed`.
- A `stdio` server runs as one child process (Node only) for the sessions
  of the host that use the same `mcp()` object. It stops when the last of
  them closes. An `mcp()` call inside `plugins` starts one per session.
- A server request for input (MCP elicitation, spec 2025 and 2026) becomes
  a session question. The tool call waits for
  `session.answer({ questionId, value })`.

Options for each server:

- `timeoutMs`: the limit for the connect, the tool list, and each tool call
  of that server.
- `oauth: true` (`http` only): sign in like `mcpConnector`. The user runs
  `/connect <name>`, and the tools come after the sign-in.
- `needsApproval`: ask the user before a tool of that server runs.
- `toolName`: give the tools of that server other names.
