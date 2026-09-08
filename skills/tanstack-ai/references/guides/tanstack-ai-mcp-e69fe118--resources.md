# Ai Mcp — Resources

[Guide and prerequisites](./tanstack-ai-mcp-e69fe118.md) · Published skill · `@tanstack/ai-mcp@0.3.9`.

## Resources

```typescript
// List all resources the server exposes.
const resources = await client.resources()

// Read a specific resource by URI.
const resource = await client.readResource(resources[0].uri)

// Convert one content block to a TanStack ContentPart.
import { mcpResourceToContentPart } from '@tanstack/ai-mcp'

const part = mcpResourceToContentPart(resource.contents[0])
// part: ContentPart  (type: 'text' always for v1)
```

Inject resources into a chat turn:

```typescript
import { chat } from '@tanstack/ai'
import { createMCPClient, mcpResourceToContentPart } from '@tanstack/ai-mcp'

const client = await createMCPClient({
  transport: { type: 'http', url: '...' },
})
const resource = await client.readResource('file:///project/README.md')
const parts = resource.contents.map(mcpResourceToContentPart)

const stream = chat({
  adapter: openaiText('gpt-5.5'),
  messages: [
    {
      role: 'user',
      content: [
        ...parts,
        { type: 'text', content: 'Summarize this document.' },
      ],
    },
  ],
})
```
