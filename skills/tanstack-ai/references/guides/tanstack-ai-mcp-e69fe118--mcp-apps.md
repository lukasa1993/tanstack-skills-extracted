# Ai Mcp — MCP Apps

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.3.10`.

## MCP Apps

MCP Apps let an MCP tool surface a UI widget (static or interactive) on the
client. Two variants exist. See `docs/mcp/apps.md` for the full guide.

### Static widgets — `UIResourcePart`

When an MCP tool result carries a `ui://` resource, TanStack AI emits a
`UIResourcePart` on the **assistant `UIMessage`**, alongside the normal
`ToolCallPart` / `ToolResultPart`. It is purely presentational — it never
enters model input. The resource is read eagerly during the `chat()` run; if
the read fails the tool result still flows to the model and the widget is
simply absent (fail-soft). Static widgets require the MCP source to expose
`readResource` — both `createMCPClient` and a `createMCPClients` pool do.

```typescript
import type { UIResourcePart } from '@tanstack/ai'

// UIResourcePart shape (on the assistant UIMessage):
// {
//   type: 'ui-resource'
//   resource: { uri: string; mimeType: string; text?: string; blob?: string }
//   serverId?: string     // pool prefix / config key — routes interactive calls
//   toolCallId: string    // links to the originating tool call
//   toolName: string      // server-native MCP tool name whose UI this renders
//   meta?: Record<string, unknown>  // reserved — currently always undefined
// }
```

### Interactive apps — `createMcpAppCallHandler`

For interactive apps (the widget iframe posts tool-call / prompt / link
actions back), mount `createMcpAppCallHandler` from `@tanstack/ai-mcp/apps`
at a POST route. Pass the MCP client(s) you already created — a single
`MCPClient`, an `MCPClients` pool, or an array of either. The handler reads
each client's transport descriptor via `client.getInfo()` /
`pool.getServers()` (pure config, not a live socket) and **reconnects
per-call** (stateless / serverless-safe). It matches the widget-supplied
native (unprefixed) tool name against the server's unprefixed tool names,
enforces a same-server allowlist, and returns `{ ok: true, result }` or
`{ ok: false, error }`.

For a pool, the `serverId` on the `UIResourcePart` is the config key (the
tool prefix); for a single client it is the client's `prefix` (or the sole
default when `serverId` is absent and there is exactly one client).

```typescript group=mcp-app-handler
import { createMCPClients } from '@tanstack/ai-mcp'
import {
  createMcpAppCallHandler,
  inMemoryMcpSessionStore,
} from '@tanstack/ai-mcp/apps'

// Reuse the same pool you pass to chat({ mcp: { clients: [mcp] } }).
const mcp = await createMCPClients({
  weather: {
    transport: { type: 'http', url: 'https://mcp-app.example.com/mcp' },
  },
})

// Minimal — reconnect-per-call via getServers() descriptor.
const handler = createMcpAppCallHandler({ clients: mcp })

// Options:
// clients   — MCPClient | MCPClients | Array<MCPClient | MCPClients> (required).
//             The handler reads transport descriptors via client.getInfo() /
//             pool.getServers() — the client does not need a live connection.
// store     — optional dynamic/stateful session store (e.g.
//             inMemoryMcpSessionStore()); used alongside clients.
// allowTool — optional authorizer receiving the WHOLE request:
//             (req: McpAppCallRequest) => boolean | Promise<boolean>.
//             The server-exposure check is ALWAYS enforced (the handler
//             rejects any tool the server does not expose). `allowTool`
//             is an ADDITIONAL restriction AND-ed on top: a request must
//             satisfy BOTH the server-exposure check and allowTool.
const handlerWithStore = createMcpAppCallHandler({
  clients: mcp,
  store: inMemoryMcpSessionStore(),
  allowTool: (req) => req.toolName === 'place_order',
})
```

The handler invokes the server (`body: { threadId, serverId?, toolName, args?, messageId? }`):

```typescript group=mcp-app-handler
export async function POST(request: Request) {
  const body = await request.json()
  const result = await handler(body)
  // { ok: true; result: unknown } | { ok: false; error: string }
  return Response.json(result)
}
```

### Client side — `useMcpAppBridge` + `MCPAppResource`

In React/Preact, create the bridge with the `useMcpAppBridge` hook (from
`@tanstack/ai-react` / `@tanstack/ai-preact`) — it returns a **stable** bridge
per `threadId`/`callEndpoint` and always calls your latest `sendMessage`/`onLink`,
so the bridge isn't recreated on every render (no `useMemo` / `exhaustive-deps`
by hand). It's a thin wrapper over the framework-agnostic `createMcpAppBridge`
from `@tanstack/ai-client` (use that directly outside React/Preact). Render
resources with `MCPAppResource` from `@tanstack/ai-react/mcp-apps` (also
`@tanstack/ai-preact/mcp-apps`, which requires a `preact/compat` alias).
`MCPAppResource` uses `@mcp-ui/client`'s `AppRenderer` under the hood — React
only. Solid, Vue, Svelte, and Angular renderers are deferred.

The bridge exposes `{ callTool, sendPrompt, openLink }` and routes the
iframe's actions: `tool` → POST to `callEndpoint`; `prompt` →
`chat.sendMessage`; `link` → `onLink(url)` if provided, otherwise the link
is dropped (with a console warning) and `openLink` returns `{ isError: true }`
— it does NOT hang. `toolName` is read from `part.toolName`; it is not a
prop. Omit `bridge` for display-only (inert) rendering.

```tsx
import { useChat, useMcpAppBridge } from '@tanstack/ai-react'
import { fetchServerSentEvents } from '@tanstack/ai-client'
import { MCPAppResource } from '@tanstack/ai-react/mcp-apps'

function ChatPage() {
  const threadId = 'weather-chat'
  const { messages, sendMessage } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
  })

  const bridge = useMcpAppBridge({
    threadId,
    callEndpoint: '/api/mcp-app/call',
    chat: { sendMessage: async (content) => void sendMessage({ content }) },
    // Opt in to link navigation — absent means links are dropped.
    onLink: (url) => window.open(url, '_blank', 'noopener'),
  })

  return (
    <div>
      {messages.map((msg) =>
        msg.parts.map((part, i) => {
          if (part.type === 'text') return <p key={i}>{part.content}</p>
          if (part.type === 'ui-resource') {
            return (
              <MCPAppResource
                key={i}
                part={part}
                bridge={bridge}
                sandbox={{ url: new URL('https://sandbox.example.com') }}
                // toolInput is optional; toolName comes from part.toolName.
              />
            )
          }
          return null
        }),
      )}
    </div>
  )
}
```
