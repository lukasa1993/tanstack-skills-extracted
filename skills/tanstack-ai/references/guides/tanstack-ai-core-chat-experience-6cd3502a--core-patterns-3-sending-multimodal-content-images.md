# Chat Experience — Core Patterns: 3. Sending Multimodal Content (Images)

[Guide and prerequisites](./tanstack-ai-core-chat-experience-6cd3502a.md) · Published skill · `@tanstack/ai@0.61.0`.

## Core Patterns: 3. Sending Multimodal Content (Images)


Use `sendMessage` with a `MultimodalContent` object instead of a plain string.

```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
import type { ContentPart } from '@tanstack/ai'

const { sendMessage } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
})

function sendImageMessage(text: string, imageBase64: string, mimeType: string) {
  const contentParts: Array<ContentPart> = [
    { type: 'text', content: text },
    {
      type: 'image',
      source: { type: 'data', value: imageBase64, mimeType },
    },
  ]

  sendMessage({ content: contentParts })
}

function sendImageUrl(text: string, imageUrl: string) {
  const contentParts: Array<ContentPart> = [
    { type: 'text', content: text },
    {
      type: 'image',
      source: { type: 'url', value: imageUrl },
    },
  ]

  sendMessage({ content: contentParts })
}
```

Render image parts in received messages:

```tsx
import type { UIMessage } from '@tanstack/ai-react'

function ImagePart({ part }: { part: UIMessage['parts'][number] }) {
  if (part.type !== 'image') return null
  // A provider file handle is an opaque id, so the browser cannot load it.
  if (part.source.type === 'file') return null
  const src =
    part.source.type === 'url'
      ? part.source.value
      : `data:${part.source.mimeType};base64,${part.source.value}`
  return <img src={src} alt="Attached image" />
}
```

For media reused across turns, upload once via a provider Files adapter
(`openaiFiles()`, `anthropicFiles()`, `geminiFiles()`, `grokFiles()`,
`falFiles()`) and send a `{ type: 'file' }` source built with
`fileSourceFromHandle(handle)` instead of re-sending base64 each request. The
source is `{ type: 'file', value, provider }`: an opaque handle and the adapter
that issued it. A different provider (or one without Files API support at all)
rejects it with a clear error before any request is sent.
The source crosses the chat wire, so the browser can put it straight into the
`sendMessage` content. Import `fileSourceFromHandle` from the browser-safe
`@tanstack/ai/client` entry. See `./tanstack-ai-core-adapter-configuration-e2c12fef.md#source-tanstack-ai-core-adapter-configuration` §7
and `docs/advanced/files-api.md`.
