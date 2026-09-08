# Media Generation — Common Mistakes

[Guide and prerequisites](./tanstack-ai-core-media-generation-f3029c96.md) · Published skill · `@tanstack/ai@0.53.0`.

## Common Mistakes

### a. HIGH: Using the removed `embedding()` function

The `embedding()` function and `openaiEmbed` adapter were removed in v0.5.0.
Agents trained on older code may still generate this pattern.

**Wrong:**

```typescript
import { embedding } from '@tanstack/ai'
import { openaiEmbed } from '@tanstack/ai-openai'

const result = await embedding({
  adapter: openaiEmbed(),
  model: 'text-embedding-3-small',
  input: 'Hello, world!',
})
```

**Correct -- use the provider SDK directly:**

```typescript
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const result = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: 'Hello, world!',
})
```

> Source: docs/migration/migration.md. Note: Fixed in v0.5.0 but agents
> trained on older code may still generate this pattern.

### b. HIGH: Forgetting `toServerSentEventsResponse` with TanStack Start server functions

When using TanStack Start server functions with `stream: true`, you MUST
wrap the stream with `toServerSentEventsResponse()`. Returning the raw
stream from a server function will not work.

**Wrong:**

```typescript
export const generateImageStreamFn = createServerFn({ method: 'POST' }).handler(
  ({ data }) => {
    // BUG: returning raw stream -- client cannot parse this
    return generateImage({
      adapter: openaiImage('gpt-image-1'),
      prompt: data.prompt,
      stream: true,
    })
  },
)
```

**Correct:**

```typescript
import { generateImage, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiImage } from '@tanstack/ai-openai'

export const generateImageStreamFn = createServerFn({ method: 'POST' }).handler(
  ({ data }) => {
    return toServerSentEventsResponse(
      generateImage({
        adapter: openaiImage('gpt-image-1'),
        prompt: data.prompt,
        stream: true,
      }),
    )
  },
)
```

> Source: maintainer interview.

### c. MEDIUM: Not downloading OpenAI image URLs before they expire

OpenAI image URLs expire after 1 hour. If you store the URL and display it
later, the image will silently break. Always download or display the image
immediately, or convert to base64 for persistence.

```typescript
const result = await generateImage({
  adapter: openaiImage('dall-e-3'),
  prompt: 'A mountain landscape',
})

// GOOD: download immediately
for (const img of result.images) {
  if (img.url) {
    const response = await fetch(img.url)
    const blob = await response.blob()
    // Save blob to storage...
  }
}

// GOOD: use b64Json when available (no expiration)
// gpt-image-1 returns b64Json by default
```

> Source: docs/media/image-generation.md.

### d. MEDIUM: Using `stream: true` for activities that do not support streaming

Not all generation activities support streaming. Passing `stream: true` to
an activity that does not support it may hang or produce unexpected results.
Check the activity documentation before enabling streaming. All built-in
activities (`generateImage`, `generateAudio`, `generateSpeech`,
`generateTranscription`, `generateVideo`, `summarize`) support `stream: true`,
but custom `useGeneration` setups may not.

> Source: docs/media/generations.md.

### e. HIGH: Passing `responseMimeType` or `negativePrompt` to Gemini Lyria

Gemini's `GenerateContentConfig` (used by Lyria 3 Pro / Lyria 3 Clip) does
**not** support `responseMimeType` or `negativePrompt`. Lyria 3 Clip always
returns 30-second `audio/mp3`; Lyria 3 Pro returns `audio/mp3`. These fields
are not in `GeminiAudioProviderOptions` — don't reach for them via `as any`.

```typescript
// WRONG — both fields are silently ignored or rejected by the SDK
generateAudio({
  adapter: geminiAudio('lyria-3-pro-preview'),
  prompt: 'ambient piano',
  modelOptions: {
    responseMimeType: 'audio/wav', // unsupported
    negativePrompt: 'vocals', // unsupported
  } as any,
})

// CORRECT — shape the prompt itself for what you want
generateAudio({
  adapter: geminiAudio('lyria-3-pro-preview'),
  prompt: 'ambient piano, no vocals',
})
```

> Source: Gemini API `GenerateContentConfig` type; docs/media/audio-generation.md.

### f. MEDIUM: Passing `duration` to Lyria expecting it to control length

Lyria 3 Clip is fixed at 30 seconds — the `duration` option is ignored on
that model. Lyria 3 Pro accepts duration via natural-language in the
**prompt** ("2-minute ambient track with a 30-second build"), not via the
`duration` field. `duration` works for fal audio models (mapped to each
model's native field like `music_length_ms` or `seconds_total`), but not
for Lyria.

```typescript
// For Lyria: put length guidance in the prompt
generateAudio({
  adapter: geminiAudio('lyria-3-pro-preview'),
  prompt: 'A 2-minute ambient piano piece with gentle strings',
  // duration: 120  // ← does nothing; rely on the prompt
})

// For fal: duration works and is translated per-model
generateAudio({
  adapter: falAudio('fal-ai/minimax-music/v2'),
  prompt: 'upbeat synth melody',
  duration: 60, // → music_length_ms: 60_000
})
```

> Source: Google Lyria 3 docs; docs/media/audio-generation.md.

### g. MEDIUM: Gemini TTS multi-speaker with 0 or 3+ speakers

`multiSpeakerVoiceConfig.speakerVoiceConfigs` is validated to be length 1 or 2. Passing an empty array or three+ entries throws at the adapter boundary
(not at Gemini's API) with a clear error. Don't try to work around it with
`as any`.

```typescript
generateSpeech({
  adapter: geminiSpeech('gemini-2.5-pro-preview-tts'),
  text: '[Alice] Hi. [Bob] Hello!',
  modelOptions: {
    multiSpeakerVoiceConfig: {
      speakerVoiceConfigs: [
        {
          speaker: 'Alice',
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
        {
          speaker: 'Bob',
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
        },
      ],
    },
  },
})
```

> Source: Gemini TTS adapter validation; CodeRabbit review of PR #463.

### h. HIGH: Passing image prompt parts to a model that doesn't support image-conditioned generation

Not every model accepts image-conditioned prompts. The `prompt` type is
narrowed per model, so passing an image part to a text-only model
(dall-e-3, Imagen, grok-2-image) is a **compile-time error**; adapters
also throw a clear runtime error as a backstop, so users learn at call
time rather than getting silently wrong output.

```typescript
// WRONG — dall-e-3 has no edit/inputs API; image parts are a type error
generateImage({
  adapter: openaiImage('dall-e-3'),
  prompt: [
    { type: 'text', content: 'Edit this' },
    { type: 'image', source: { type: 'url', value: url } }, // ❌ type error
  ],
})

// WRONG — Imagen is text-to-image only; same compile-time rejection
generateImage({
  adapter: geminiImage('imagen-4.0-generate-001'),
  prompt: [
    { type: 'text', content: 'Edit this' },
    { type: 'image', source: { type: 'url', value: url } }, // ❌ type error
  ],
})

// CORRECT — use a model that supports image-conditioned generation
generateImage({
  adapter: openaiImage('gpt-image-2'), // edits up to 16 images
  prompt: [
    { type: 'text', content: 'Edit this' },
    { type: 'image', source: { type: 'url', value: url } },
  ],
})

generateImage({
  adapter: geminiImage('gemini-3.1-flash-image'), // native multimodal
  prompt: [
    { type: 'text', content: 'Edit this' },
    { type: 'image', source: { type: 'url', value: url } },
  ],
})
```

> Source: docs/media/image-generation.md, docs/media/video-generation.md.

### i. LOW: Writing a logging middleware to see media chunks flow through

Every media activity — `generateAudio`, `generateSpeech`,
`generateTranscription`, `generateImage`, `generateVideo` — accepts the
same `debug?: DebugOption` option that `chat()` does. Reach for `debug`
instead of wiring up logging middleware.

```typescript
// When a speech generation sounds wrong or a transcription returns garbage
generateSpeech({
  adapter: openaiSpeech('tts-1'),
  text: 'Hello',
  debug: { provider: true, output: true }, // raw SDK chunks + yielded chunks
})
```

See the `ai-core/debug-logging` sub-skill for full details on categories
and piping into a custom logger.

> Source: docs/advanced/debug-logging.md.

---
