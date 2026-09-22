# Media Generation — Core Patterns: 3. Text-to-Speech

[Guide and prerequisites](./tanstack-ai-core-media-generation-f3029c96.md) · Published skill · `@tanstack/ai@0.58.0`.

## Core Patterns: 3. Text-to-Speech


Adapters include `openaiSpeech` (tts-1, tts-1-hd, gpt-4o-audio-preview),
`byteplusSpeech` (`seed-audio-1.0`), and `elevenlabsSpeech` (`eleven_v3`).

`elevenlabsSpeech` accepts `format: 'mp3' | 'pcm' | 'opus' | 'wav'`.
WAV output contains 44.1 kHz, 16-bit mono PCM with a RIFF header.
AAC and FLAC requests throw before the API call.
An explicit `modelOptions.outputFormat` overrides `format` and returns
the selected provider format without WAV wrapping.

> **BytePlus Seed Speech is a separate product from ModelArk** — it reads
> **`BYTEPLUS_VOICE_API_KEY`**, not `ARK_API_KEY`, and an Ark key there fails
> with `45000010 Invalid X-Api-Key`. Output is capped at **120 seconds**.
> There is no top-level `speaker` field — `voice` is sent as
> `references: [{ speaker }]`, and `modelOptions.references` **replaces** that
> array rather than merging, so passing `references` for voice cloning silently
> drops `voice`. Voice ids ending `_uranus_bigtts` are TTS 2.0,
> `_mars_bigtts` / `_moon_bigtts` are TTS 1.0, and `*_emo_v2_*` are the 1.0
> voices that accept emotion tags. Formats: `wav`, `mp3`, `pcm`, `ogg_opus`;
> `modelOptions.watermark` takes an object here, not a boolean:
> `{ aigc_watermark }` for an audible marker and `{ aigc_metadata: { enable } }`
> for header provenance. `watermark: true` is shorthand for
> `{ aigc_watermark: true }`.

```typescript
import { generateSpeech } from '@tanstack/ai'
import { openaiSpeech } from '@tanstack/ai-openai'

const result = await generateSpeech({
  adapter: openaiSpeech('tts-1-hd'),
  text: 'Hello, welcome to TanStack AI!',
  voice: 'alloy', // alloy | echo | fable | onyx | nova | shimmer | ash | ballad | coral | sage | verse
  format: 'mp3', // mp3 | opus | aac | flac | wav | pcm
  speed: 1.0, // 0.25 to 4.0
})

// result.audio is base64-encoded audio
// result.format is the output format string
// result.contentType is the MIME type (e.g. "audio/mpeg")
```

Client hook:

```tsx
import { useGenerateSpeech, fetchServerSentEvents } from '@tanstack/ai-react'

const { generate, result, isLoading } = useGenerateSpeech({
  connection: fetchServerSentEvents('/api/generate/speech'),
})

// Trigger: generate({ text: 'Hello!', voice: 'alloy' })
// Play:   <audio src={`data:audio/${result.format};base64,${result.audio}`} controls />
```

**Dialogue (`turns`) and timings (`timestamps`).** `text` + `voice` is one
speaker. For a multi-voice script pass `turns` instead of `text` (they are
mutually exclusive), and set `timestamps: true` to get `result.alignment`
(per character or per word, `alignment.unit` says which) and `result.segments`
(one per turn or per sentence). All times are seconds.

```typescript
import { generateSpeech } from '@tanstack/ai'
import { byteplusSpeech } from '@tanstack/ai-byteplus'

// Second voice id comes from the BytePlus voice list.
const SECOND_VOICE = 'your-second-voice-id'

const result = await generateSpeech({
  adapter: byteplusSpeech('seed-audio-1.0'),
  turns: [
    { text: 'Do you sell picks?', voice: 'en_female_stokie_uranus_bigtts' },
    { text: 'By the till.', voice: SECOND_VOICE },
  ],
  timestamps: true,
})

result.alignment?.endSeconds.at(-1) // where speech stops, not where the file does
result.segments?.[0] // { startSeconds, endSeconds, turnIndex?, voice?, text? }
```

Both are adapter capabilities, not universal. The activity rejects the request
before it reaches the provider when the adapter cannot do it, so read
`adapter.capabilities` rather than guessing:

| Adapter                 | `maxSpeakers` | `timestamps`                                     |
| ----------------------- | ------------- | ------------------------------------------------ |
| `byteplusSpeech`        | 3             | yes (`enable_subtitle`, word + sentence)         |
| `elevenlabsSpeech`      | 10            | yes (character, plus voice segments on dialogue) |
| `geminiSpeech`          | 2             | no                                               |
| every other TTS adapter | not supported | no                                               |
