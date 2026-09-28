# Ai Mcp — Host an MCP server

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.6.0`.

## Host an MCP server

Import `createMCPServer` from `@tanstack/ai-mcp/server`.
Pass tools from `toolDefinition().server()`.
Call `server.fetch(request)` in your HTTP route.

```typescript
import { toolDefinition } from '@tanstack/ai'
import { createMCPServer } from '@tanstack/ai-mcp/server'
import { z } from 'zod'

const getWeather = toolDefinition({
  name: 'get_weather',
  description: 'Current weather for a city',
  inputSchema: z.object({ city: z.string() }),
}).server(async ({ city }) => {
  return { city, temperature: 18, conditions: 'clear' }
})

const server = createMCPServer({
  name: 'weather',
  version: '1.0.0',
  tools: [getWeather],
})

export function handleMcp(request: Request) {
  return server.fetch(request)
}

// Mount handleMcp on GET, POST, and DELETE.
// GET is the spec 2025 stream.
// DELETE closes a spec 2025 session.
```

`createMCPServer` speaks spec `2026-07-28`.
`createMCPServer` also speaks spec 2025 sessions.

`stdioTransport` from `@tanstack/ai-mcp/stdio` connects your client to a command.
`serveMCPStdio` from `@tanstack/ai-mcp/server/stdio` serves your server on stdin and stdout.
Write logs with `console.error`.
stdout carries only protocol messages.

```typescript
import { toolDefinition } from '@tanstack/ai'
import { createMCPServer } from '@tanstack/ai-mcp/server'
import { serveMCPStdio } from '@tanstack/ai-mcp/server/stdio'
import { z } from 'zod'

const getWeather = toolDefinition({
  name: 'get_weather',
  description: 'Current weather for a city',
  inputSchema: z.object({ city: z.string() }),
}).server(async ({ city }) => {
  return { city, temperature: 18, conditions: 'clear' }
})

const server = createMCPServer({
  name: 'weather',
  version: '1.0.0',
  tools: [getWeather],
})

serveMCPStdio(server)
```

You can also pass `resources` and `prompts`.
Build them with `resourceDefinition` and `promptDefinition` from `@tanstack/ai-mcp/server`.

A tool reads its hooks on `ctx.context`.
Give `.server()` the type `MCPToolContext` from `@tanstack/ai-mcp/server`.
Then `ctx.context.requestInput` and `ctx.context.sample` type-check.
On spec 2026, `ctx.context.requestInput` throws, and the handler returns `input_required`.
The client runs the tool again with the answer.
Code before `requestInput` runs on each call, so it can run more than once.
Put work that must run once after `requestInput` returns.
On spec 2026, a tool asks one question per call. A second `requestInput` throws an Error.
If the user declines or cancels, `requestInput` throws an Error, and the call ends with a tool error.
In an `execution: 'task'` tool, `ctx.context.requestInput` throws an error.
On spec 2025, `requestInput` waits on the open session.
The same tool call then continues.

```typescript
import { toolDefinition } from '@tanstack/ai'
import { createMCPServer } from '@tanstack/ai-mcp/server'
import type { MCPToolContext } from '@tanstack/ai-mcp/server'
import { z } from 'zod'

const askCity = toolDefinition({
  name: 'ask_city',
  description: 'Ask which city to use',
  inputSchema: z.object({}),
}).server<MCPToolContext>(async (_args, ctx) => {
  const city = await ctx.context.requestInput({ message: 'Which city?' })
  return { city }
})

const server = createMCPServer({
  name: 'weather',
  version: '1.0.0',
  tools: [askCity],
})

export function handleMcp(request: Request) {
  return server.fetch(request)
}
```

Mount `handleMcp` on GET, POST, and DELETE.

If a tool calls `ctx.context.sample` on spec 2026, pass `sample` to `createMCPServer`.
On spec 2026, `ctx.context.sample` calls the `sample` function.
On spec 2025, `ctx.context.sample` asks the MCP client.
A tool with `execution: 'task'` returns a spec 2025 task handle.
Spec 2026 has no tasks, so that tool runs inline there.

### Require a bearer token

The server is an OAuth resource server. Your authorization server issues the token.
Pass `auth` with a `verifier`. It is the `OAuthTokenVerifier` type from the MCP SDK.
`jwtVerifier` checks a JWT against the JWKS of the provider.
`introspectionVerifier` checks an opaque token at an RFC 7662 endpoint.
A missing or bad token returns 401. A token without a scope in `requiredScopes` returns 403.
A tool reads the token as `ctx.context.authInfo`.
Sessions and tasks belong to the `clientId` plus the `sub` claim of the token.
Serve the OAuth discovery documents with `oauthMetadataResponse` at the app root.

```typescript
import { createMCPServer, jwtVerifier } from '@tanstack/ai-mcp/server'

const server = createMCPServer({
  name: 'notes',
  version: '1.0.0',
  auth: {
    verifier: jwtVerifier({
      jwksUrl: 'https://auth.example.com/.well-known/jwks.json',
      issuer: 'https://auth.example.com/',
      audience: 'https://mcp.example.com/mcp',
    }),
    requiredScopes: ['notes:read'],
  },
})
```

### Use the auth the app already has

When a middleware already verified the caller, pass the result to `server.handle`.
`server.fetch(request)` stays a plain Fetch handler. `server.handle` takes options.
`options.authInfo` is the SDK `AuthInfo`. The server skips its `auth` gate for that request.
`options.context` reaches every tool call of that request on `ctx.context`.
Type the values with `MCPToolContext<{ db: Db }>`.
`authInfo`, `requestInput`, and `sample` win over a same-named value in `context`.

```typescript
import { server } from './mcp-server'
import { verifyCaller } from './auth'

export async function handleMcp(request: Request) {
  const caller = await verifyCaller(request)
  if (caller instanceof Response) return caller
  return server.handle(request, {
    authInfo: caller.authInfo,
    context: { db: caller.db },
  })
}
```

### Describe a tool to the host

Set `metadata.title` and `metadata.annotations` on the tool definition.
The host gets them as the MCP tool title and annotations.
Use the MCP names: `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`.
A host skips its confirmation for a tool with `readOnlyHint: true`.

A tool with no `outputSchema` can return an MCP `CallToolResult`.
The server sends it as is: its content blocks, its `structuredContent`, and its `isError`.

### Turn spec 2025 sessions off

Set `sessions: 'reject'` on a host with many instances, such as Cloudflare Workers.
The server opens no session. A spec 2025 request gets the SDK rejection.
The default is `'memory'`: sessions live in the process for 30 idle minutes.

### Call a `createMCPServer` server with its types

For a deployed server, pass `typeof server` and a transport.
Import the server with `import type`, so its code stays out of the app.
The client speaks MCP, so the server `auth` option runs.
`callTool` accepts only the server tool names and their input types.
`callTool` returns the raw MCP result.
For a tool with an `outputSchema`, `structuredContent` has the tool output type.
`getPrompt` accepts only the server prompt names and their argument types.
`readResource` accepts only the server resource URIs.

```typescript
import { createMCPClient } from '@tanstack/ai-mcp'
import type { server } from './mcp-server'

const remote = await createMCPClient<typeof server>({
  transport: { type: 'http', url: 'https://mcp.example.com/api/mcp' },
})
await remote.callTool('get_weather', { city: 'Paris' })
```

`createMCPClient({ server })` is a different client.
It calls the tool functions in the same process and returns the tool output.
It opens no connection, and the server `auth` option does not run.
It has no `tools()`, so do not pass it to `chat()`.
Use it only when the app and the server run in one process.
