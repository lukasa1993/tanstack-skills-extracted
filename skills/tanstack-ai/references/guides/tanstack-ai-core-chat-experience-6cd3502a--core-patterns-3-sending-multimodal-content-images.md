# Chat Experience — Core Patterns: 3. Sending Multimodal Content (Images)

[Guide and prerequisites](./tanstack-ai-core-chat-experience-6cd3502a.md) · Published skill · `@tanstack/ai@0.54.0`.

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
  const src =
    part.source.type === 'url'
      ? part.source.value
      : `data:${part.source.mimeType};base64,${part.source.value}`
  return <img src={src} alt="Attached image" />
}
```
