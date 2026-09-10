# Media Generation — Common Hook API

[Guide and prerequisites](./tanstack-ai-core-media-generation-f3029c96.md) · Published skill · `@tanstack/ai@0.54.0`.

## Common Hook API

All generation hooks return the same shape:

| Property    | Type                       | Description                                      |
| ----------- | -------------------------- | ------------------------------------------------ |
| `generate`  | `(input) => Promise<void>` | Trigger generation                               |
| `result`    | `T \| null`                | Result (optionally transformed via `onResult`)   |
| `isLoading` | `boolean`                  | Whether generation is in progress                |
| `error`     | `Error \| undefined`       | Current error                                    |
| `status`    | `GenerationClientState`    | `'idle' \| 'generating' \| 'success' \| 'error'` |
| `stop`      | `() => void`               | Abort current generation                         |
| `reset`     | `() => void`               | Clear state and the in-memory snapshot           |
| `runId`     | `string \| null`           | Id of the job WHILE it runs; null when idle      |

The hook is **transparent**, mirroring `useChat`: there is no `resumeSnapshot`,
`resumeState`, `pendingArtifacts`, or `resultArtifacts` field. Hooks also accept
`persistence: true` plus a stable `threadId`: on mount the client hydrates the
last run for that scope from the server and repaints the **normal** `status` /
`result` / `error` fields, so the last run survives a reload (metadata only,
never media bytes; `result`'s media returns only with server byte storage +
`artifactUrl`). See `ai-core/client-persistence` for details.

Provide either `connection` (streaming SSE transport) or `fetcher`
(direct async call / server function returning `Response`). Use `onResult`
to transform what is stored:

```tsx
import { useGenerateSpeech, fetchServerSentEvents } from '@tanstack/ai-react'

const { result } = useGenerateSpeech({
  connection: fetchServerSentEvents('/api/generate/speech'),
  onResult: (raw) => ({
    audioUrl: `data:${raw.contentType};base64,${raw.audio}`,
    duration: raw.duration,
  }),
})
// result is typed as { audioUrl: string; duration?: number } | null
```

---
