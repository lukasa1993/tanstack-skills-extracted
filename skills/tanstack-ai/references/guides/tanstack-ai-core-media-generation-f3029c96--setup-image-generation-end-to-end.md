# Media Generation — Setup -- Image Generation End-to-End

[Guide and prerequisites](./tanstack-ai-core-media-generation-f3029c96.md) · Published skill · `@tanstack/ai@1.0.1`.

## Setup -- Image Generation End-to-End

### Server (API route or TanStack Start server function)

```typescript
// routes/api/generate/image.ts
import {
  generateImage,
  generationParamsFromRequest,
  toServerSentEventsResponse,
} from '@tanstack/ai'
import { openaiImage } from '@tanstack/ai-openai'

export async function POST(req: Request) {
  // The hook posts an AG-UI RunAgentInput envelope: the input is in
  // `forwardedProps`, and `threadId` / `runId` are at the top.
  const { input, threadId, runId } = await generationParamsFromRequest(
    'image',
    req,
  )
  if (typeof input.prompt !== 'string') {
    return new Response('Send a text prompt.', { status: 400 })
  }

  const stream = generateImage({
    adapter: openaiImage('gpt-image-1'),
    threadId,
    runId,
    prompt: input.prompt,
    size: '1024x1024',
    numberOfImages: input.numberOfImages,
    stream: true,
  })

  return toServerSentEventsResponse(stream)
}
```

### Client (React)

```tsx
import { useGenerateImage, fetchServerSentEvents } from '@tanstack/ai-react'
import { useState } from 'react'

function ImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const { generate, result, isLoading, error, reset } = useGenerateImage({
    connection: fetchServerSentEvents('/api/generate/image'),
    threadId: 'product-123-hero',
  })

  return (
    <div>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe an image..."
      />
      <button
        onClick={() => generate({ prompt })}
        disabled={isLoading || !prompt.trim()}
      >
        {isLoading ? 'Generating...' : 'Generate'}
      </button>

      {error && <p>Error: {error.message}</p>}

      {result?.images.map((img, i) => (
        <img
          key={i}
          src={img.url || `data:image/png;base64,${img.b64Json}`}
          alt={img.revisedPrompt || 'Generated image'}
        />
      ))}

      {result && <button onClick={reset}>Clear</button>}
    </div>
  )
}
```

### TanStack Start: Server Function Streaming (recommended)

When using TanStack Start, return `toServerSentEventsResponse()` from a
server function. The client fetcher receives a `Response` and the hook
parses it as SSE automatically:

```typescript
// lib/server-functions.ts
import { createServerFn } from '@tanstack/react-start'
import { generateImage, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiImage } from '@tanstack/ai-openai'
import type { OpenAIImageModel } from '@tanstack/ai-openai'

export const generateImageStreamFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { prompt: string; model?: OpenAIImageModel; threadId: string }) =>
      data,
  )
  .handler(({ data }) => {
    return toServerSentEventsResponse(
      generateImage({
        adapter: openaiImage(data.model ?? 'gpt-image-1'),
        threadId: data.threadId,
        prompt: data.prompt,
        stream: true,
      }),
    )
  })
```

```tsx
import { useGenerateImage } from '@tanstack/ai-react'
import { generateImageStreamFn } from '../lib/server-functions'

function ImageGenerator() {
  const { generate, result, isLoading } = useGenerateImage({
    fetcher: (input, { threadId }) =>
      generateImageStreamFn({ data: { ...input, threadId } }),
    threadId: 'product-123-hero',
  })

  return (
    <button
      onClick={() => generate({ prompt: 'A sunset over mountains' })}
      disabled={isLoading}
    >
      {isLoading ? 'Generating...' : 'Generate'}
    </button>
  )
}
```

---
