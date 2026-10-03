# Ai Mcp — `createMCPClient` — single server

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.7.0`.

## `createMCPClient` — single server

```typescript
import { createMCPClient } from '@tanstack/ai-mcp'

const client = await createMCPClient({
  transport: { type: 'http', url: 'https://mcp.example.com/mcp' },
  prefix: 'weather', // optional: prefixes all tool names (e.g. 'weather_get_forecast')
  name: 'my-app', // optional: client identity sent to the server
})
```

`createMCPClient` connects immediately and returns an `MCPClient`.
If the connection fails, `createMCPClient` throws `MCPConnectionError`.
`createMCPClient` tries spec `2026-07-28` first.
If the server does not support that spec, the client uses the 2025 initialize handshake.
The client keeps negotiation mode `auto`.

### Transports

#### Streamable HTTP (default for internet-facing servers)

```typescript
import { createMCPClient } from '@tanstack/ai-mcp'

const client = await createMCPClient({
  transport: {
    type: 'http',
    url: 'https://mcp.example.com/mcp',
    headers: { Authorization: 'Bearer sk-...' },
  },
})
```

#### SSE

```typescript
import { createMCPClient } from '@tanstack/ai-mcp'

const client = await createMCPClient({
  transport: {
    type: 'sse',
    url: 'https://mcp.example.com/sse',
    headers: { Authorization: 'Bearer sk-...' },
  },
})
```

#### stdio (Node-only — import from `/stdio` subpath)

```typescript
import { createMCPClient } from '@tanstack/ai-mcp'
import { stdioTransport } from '@tanstack/ai-mcp/stdio'

const client = await createMCPClient({
  transport: stdioTransport({
    command: 'npx',
    args: ['-y', 'my-mcp-server'],
    env: { API_KEY: process.env.API_KEY ?? '' },
  }),
})
```

#### Custom transport (escape hatch)

Pass any `Transport` from `@modelcontextprotocol/client`:

```typescript
// InMemoryTransport comes from @modelcontextprotocol/client.
// @tanstack/ai-mcp re-exports it. Any Transport from that package works here.
import { createMCPClient, InMemoryTransport } from '@tanstack/ai-mcp'

const [clientTransport] = InMemoryTransport.createLinkedPair()
const client = await createMCPClient({ transport: clientTransport })
```

### Authentication

Two levels:

- **Static tokens** — pass `headers` on the `http`/`sse` config (sent with
  every request): `headers: { Authorization: 'Bearer ...' }`.
- **OAuth 2.1 (MCP authorization spec).** Pass `authProvider` on the
  `http` or `sse` config. The value is an `OAuthClientProvider` from
  `@modelcontextprotocol/client`. The transport attaches tokens, refreshes
  them, and retries on 401.

```typescript
import { createMCPClient } from '@tanstack/ai-mcp'
// An OAuthClientProvider from @modelcontextprotocol/client.
// You persist the tokens on the server.
import { myOAuthProvider } from './oauth-provider'

const client = await createMCPClient({
  transport: {
    type: 'http',
    url: 'https://mcp.example.com/mcp',
    authProvider: myOAuthProvider,
  },
})
```

Caveat: interactive authorization-code flows need `transport.finishAuth(code)`,
and `createMCPClient` does not expose its internal transport. For redirect
flows, construct the `StreamableHTTPClientTransport` yourself with the
`authProvider`, keep a reference, call `finishAuth(code)` in the OAuth
callback route, then pass the transport via the escape hatch above. For
server-side providers backed by pre-provisioned/refreshable tokens, the
config form is sufficient.
Import `StreamableHTTPClientTransport` from `@modelcontextprotocol/client`.
