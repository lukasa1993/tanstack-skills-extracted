# Chat Experience — Core Patterns: 4. Sending Audio Messages (Browser Recording)

[Guide and prerequisites](./tanstack-ai-core-chat-experience-6cd3502a.md) · Published skill · `@tanstack/ai@0.53.0`.

## Core Patterns: 4. Sending Audio Messages (Browser Recording)


Use `useAudioRecorder` from `@tanstack/ai-react` (or `createAudioRecorder` in Svelte) to capture audio in the browser. The resolved `AudioRecording` includes a ready-to-use `part` that slots directly into `sendMessage`.

```typescript
import {
  useAudioRecorder,
  useChat,
  fetchServerSentEvents,
} from '@tanstack/ai-react'

const { isRecording, isSupported, start, stop } = useAudioRecorder()
const { sendMessage } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
})

async function toggle() {
  if (!isRecording) {
    await start()
    return
  }
  const recording = await stop()
  await sendMessage({ content: [recording.part] })
}
```

`recording.part` is `{ type: 'audio', source: { type: 'data', value: base64, mimeType } }`. Returns the recorder's native format (`audio/webm` or `audio/mp4`) with no transcoding.
