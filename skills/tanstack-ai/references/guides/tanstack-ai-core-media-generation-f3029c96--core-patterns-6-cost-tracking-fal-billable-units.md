# Media Generation — Core Patterns: 6. Cost tracking (fal billable units)

[Guide and prerequisites](./tanstack-ai-core-media-generation-f3029c96.md) · Published skill · `@tanstack/ai@0.53.0`.

## Core Patterns: 6. Cost tracking (fal billable units)


fal bills media generation by usage-based units, not tokens. Every fal media
adapter (`falImage`, `falAudio`, `falSpeech`, `falTranscription`, `falVideo`)
surfaces the real billed quantity on the result as `usage.billed`
({ quantity, unit: 'units' }), read from fal's `x-fal-billable-units` response
header — no `fetch` interceptor needed. It rides on the canonical `TokenUsage`
shape (token fields are `0` for media), mirroring how duration-billed
transcription reports { quantity, unit: 'seconds' }.

```typescript
import { generateImage } from '@tanstack/ai'
import { falImage } from '@tanstack/ai-fal'

const result = await generateImage({
  adapter: falImage('fal-ai/flux/dev'),
  prompt: 'a serene mountain lake',
})

// usage.billed.quantity is the priced quantity. Multiply by the endpoint unit
// price (GET https://api.fal.ai/v1/models/pricing?endpoint_id=…) for exact cost.
if (result.usage?.billed) {
  const cost = result.usage.billed.quantity * unitPrice
}
```

For video, the units arrive with the completed result: `getVideoJobStatus()`
returns `usage` and emits a `video:usage` devtools event when fal reports it.
