# Media Generation — Core Patterns: 4. Audio Transcription

[Guide and prerequisites](./tanstack-ai-core-media-generation-f3029c96.md) · Published skill · `@tanstack/ai@0.54.0`.

## Core Patterns: 4. Audio Transcription


Adapters: `openaiTranscription` (whisper-1, gpt-4o-transcribe,
gpt-4o-mini-transcribe, gpt-4o-transcribe-diarize) and `byteplusTranscription`
(`seed-asr` — synchronous, no polling; audio up to 2 hours / 100 MB; also reads
**`BYTEPLUS_VOICE_API_KEY`**).

> **Capturing audio in the browser:** Use `useAudioRecorder` from `@tanstack/ai-react` to record directly in the browser, then pass the recording as the `audio` input to `generate()`, or use `recording.part` as a prompt part in chat/generation calls. No transcoding or extra dependencies required — the recorder returns the native browser format (`audio/webm` or `audio/mp4`). For transcription, wrap it as a `data:` URL so the provider gets the real content type; passing raw `recording.base64` makes the adapter assume `audio/mpeg` and mislabel the webm/mp4 bytes.
>
> ```tsx
> import {
>   useAudioRecorder,
>   useTranscription,
>   fetchServerSentEvents,
> } from '@tanstack/ai-react'
>
> function VoiceNote() {
>   const { isRecording, start, stop } = useAudioRecorder()
>   const { generate } = useTranscription({
>     connection: fetchServerSentEvents('/api/transcribe'),
>   })
>
>   async function finish() {
>     const recording = await stop()
>     const mimeType = recording.mimeType.split(';')[0] // strip ;codecs=...
>     await generate({ audio: `data:${mimeType};base64,${recording.base64}` })
>   }
>
>   return (
>     <button onClick={isRecording ? finish : start}>
>       {isRecording ? 'Stop & transcribe' : 'Record'}
>     </button>
>   )
> }
> ```

```typescript
// routes/api/transcribe.ts
import { generateTranscription, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiTranscription } from '@tanstack/ai-openai'

export async function POST(request: Request) {
  // The client hook below posts { data: { audio: dataUrl, language } }
  const { audio, language } = (await request.json()).data

  const stream = generateTranscription({
    adapter: openaiTranscription('whisper-1'),
    audio, // File, Blob, base64 string, or data URL
    language,
    responseFormat: 'verbose_json',
    modelOptions: {
      timestamp_granularities: ['word', 'segment'],
    },
    stream: true,
  })

  // On the client, result.text is the transcript, result.language the
  // detected language, result.duration the seconds, result.segments the
  // timestamped segments (word-level timestamps are in result.words).
  return toServerSentEventsResponse(stream)
}
```

For speaker diarization, use `openaiTranscription('gpt-4o-transcribe-diarize')`.
When no response format is given it defaults the request to `response_format: 'diarized_json'`
and `chunking_strategy: 'auto'` (a top-level `responseFormat` of `'json'`/`'text'` opts out of
speaker segments); do not pass `prompt`, `include`, or `timestamp_granularities` with this model.

Client hook:

```tsx
import { useTranscription, fetchServerSentEvents } from '@tanstack/ai-react'

const { generate, result, isLoading } = useTranscription({
  connection: fetchServerSentEvents('/api/transcribe'),
})

// Trigger: generate({ audio: dataUrl, language: 'en' })
```
