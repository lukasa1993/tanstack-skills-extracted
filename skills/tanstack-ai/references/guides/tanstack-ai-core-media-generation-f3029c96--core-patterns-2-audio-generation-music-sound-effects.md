# Media Generation — Core Patterns: 2. Audio Generation (Music, Sound Effects)

[Guide and prerequisites](./tanstack-ai-core-media-generation-f3029c96.md) · Published skill · `@tanstack/ai@0.54.0`.

## Core Patterns: 2. Audio Generation (Music, Sound Effects)


Distinct from TTS — `generateAudio()` produces non-speech audio content.
Supported adapters: `geminiAudio` (Lyria 3 Pro / Lyria 3 Clip) and
`falAudio` (MiniMax Music, DiffRhythm, Stable Audio, ElevenLabs SFX, etc.).

```typescript
import { generateAudio } from '@tanstack/ai'
import { falAudio } from '@tanstack/ai-fal'

const result = await generateAudio({
  adapter: falAudio('fal-ai/diffrhythm'),
  prompt: 'An upbeat electronic track with synths',
  duration: 10,
})

// result.audio.url or result.audio.b64Json (provider-dependent)
// result.audio.contentType e.g. "audio/mpeg"
```

Client hook:

```tsx
import { useGenerateAudio, fetchServerSentEvents } from '@tanstack/ai-react'

const { generate, result, isLoading } = useGenerateAudio({
  connection: fetchServerSentEvents('/api/generate/audio'),
})

// Trigger: generate({ prompt: 'Upbeat synths', duration: 10 })
// Play:    <audio src={result.audio.url} controls />
```
