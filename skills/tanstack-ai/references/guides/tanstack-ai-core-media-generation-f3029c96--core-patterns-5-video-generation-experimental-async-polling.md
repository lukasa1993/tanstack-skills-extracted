# Media Generation — Core Patterns: 5. Video Generation (Experimental -- async polling)

[Guide and prerequisites](./tanstack-ai-core-media-generation-f3029c96.md) · Published skill · `@tanstack/ai@0.53.0`.

## Core Patterns: 5. Video Generation (Experimental -- async polling)


Video generation uses a jobs/polling architecture. The server creates a job,
polls for status, and streams updates to the client. Adapters: `openaiVideo`
(Sora), `geminiVideo` (Veo / Omni Flash), `grokVideo`, `byteplusVideo`
(Seedance), `falVideo` (Kling, MiniMax, Hunyuan, …), and `openRouterVideo`
(OpenRouter's dedicated `POST /api/v1/videos` gateway — Seedance, Veo, Wan,
Kling, Sora 2 Pro and others through one API key; `getVideoJobStatus()`
returns the video as a `data:` URL since OpenRouter's download URLs require
the API key, and surfaces the gateway-reported cost as `usage.cost`).

```typescript
import {
  generateVideo,
  getVideoJobStatus,
  toServerSentEventsResponse,
} from '@tanstack/ai'
import { openaiVideo } from '@tanstack/ai-openai'

// Non-streaming: manual polling loop
const { jobId } = await generateVideo({
  adapter: openaiVideo('sora-2'),
  prompt: 'A golden retriever playing in sunflowers',
  size: '1280x720',
  duration: 8,
})

let status = await getVideoJobStatus({ adapter: openaiVideo('sora-2'), jobId })
while (status.status !== 'completed' && status.status !== 'failed') {
  await new Promise((r) => setTimeout(r, 5000))
  status = await getVideoJobStatus({ adapter: openaiVideo('sora-2'), jobId })
}

// Streaming: server handles polling, client gets real-time updates
const stream = generateVideo({
  adapter: openaiVideo('sora-2'),
  prompt: 'A flying car over a city',
  stream: true,
  pollingInterval: 3000,
  maxDuration: 600_000,
})
return toServerSentEventsResponse(stream)
```

Google Veo (`@tanstack/ai-gemini`) uses the same jobs/polling flow. Its
`duration` option is typed per model (`4 | 6 | 8` for the Veo 3.1 models);
use `adapter.snapDuration(seconds)` to coerce raw
seconds and `adapter.availableDurations()` to enumerate the valid set.
Image prompt parts route by `metadata.role`: first un-roled /
`'start_frame'` image → input image, `'end_frame'` → `lastFrame`,
`'reference'` / `'character'` → `referenceImages`:

```typescript
import { geminiVideo } from '@tanstack/ai-gemini'

const adapter = geminiVideo('veo-3.1-generate-preview')
adapter.availableDurations() // { kind: 'discrete', values: [4, 6, 8] }

const { jobId } = await generateVideo({
  adapter,
  prompt: 'A golden retriever playing in sunflowers',
  size: '16:9', // Veo sizes are aspect ratios: '16:9' | '9:16'
  duration: adapter.snapDuration(7), // 6
  modelOptions: { resolution: '1080p', generateAudio: true },
})
// Note: Veo result URLs require the Google API key to download
// (x-goog-api-key header or ?key= query parameter).
```

Gemini Omni Flash (`geminiVideo('gemini-omni-1.1-flash')`) is served by
the Interactions API instead of Veo's operations flow — same adapter, routed
by model. `duration` is any number of seconds in the 3–10
range (fractional ok, default 10 — availableDurations() reports the range),
`size` is an `aspectRatio_resolution` template (`'16:9'` or `'16:9_1080p'`;
suffix `'360p' | '720p' | '1080p' | '4k'`, default 720p), and the finished video arrives
**inline** as a `data:video/mp4;base64,…` URL (no key needed to use it).
Image/video prompt parts are sent as interaction content blocks, grouped
as images, then videos, then text (no
`metadata.role` routing); `data` sources go inline, `url` sources pass
through as-is (never downloaded — use Gemini Files API URIs for remote
media). For conversational editing, pass a prior generation's `jobId` as
`modelOptions.previous_interaction_id` with a prompt describing the change.
`gemini-omni-flash-preview` remains a deprecated alias until it shuts down
on 2026-09-30.

```typescript
import { geminiVideo } from '@tanstack/ai-gemini'

const omni = geminiVideo('gemini-omni-1.1-flash')
const first = await generateVideo({
  adapter: omni,
  prompt: 'A violinist outdoors',
})
// …poll first.jobId to completion, then edit it:
const edited = await generateVideo({
  adapter: omni,
  prompt: 'Make the violin invisible',
  modelOptions: { previous_interaction_id: first.jobId },
})
```

Other video adapters: `openaiVideo('sora-2')` (pixel sizes like `'1280x720'`,
durations 4/8/12s, single `input_reference` image prompt part), `grokVideo(...)`
(`grok-imagine-video` and `grok-imagine-video-1.5` both do text-to-video + image-to-video;
1.5 adds reference-to-video — `'reference'`/`'character'`-roled image parts →
`reference_images` (max 7), preset voices via `modelOptions.reference_audios` (max 3) —
1.5-only, capped at 720p, and not combinable with a starting-frame image; only
`grok-imagine-video` edits/extends a source `video` prompt part via
`modelOptions.mode: 'edit' | 'extend'` (extend `duration` = added tail). Edit/extend
outputs inherit the source clip's properties, so `size`/`aspect_ratio`/`resolution`
throw in both modes and `duration` throws in edit mode — pass none of them there;
generation uses the aspect-ratio size template like `'16:9_720p'` (1080p is 1.5-only),
integer durations 1-15s, reports `usage.billed` seconds ({ quantity, unit: 'seconds' }) and exact `usage.cost`), `byteplusVideo(...)` (Seedance —
aspect-ratio size template like `'16:9_720p'`, durations 4-15s on the 2.0 family,
4-12s on 1.5-pro, 2-12s on the 1.0-pro models; reads `ARK_API_KEY`),
`openRouterVideo(...)` (OpenRouter's dedicated `POST /api/v1/videos` gateway),
and `falVideo(...)` (hosted models; `duration` typed from `@fal-ai/client`'s
`EndpointTypeMap` — `'5' | '10'` on Kling 2.6, `'3'`…`'15'` on Kling 3,
`'4s' | '6s' | '8s'` on Veo 3.1, `'5s' | '9s'` on Luma; `availableDurations()` /
`snapDuration()` on the curated set; see cost tracking below).

> **Seedance option applicability is per model and enforced server-side** —
> Ark returns a 400 for an inapplicable field rather than ignoring it.
> `service_tier` / `camera_fixed` are Seedance 1.x only, `frames` is
> 1-0-pro + 1-0-pro-fast only, `draft` is 1-5-pro only, `priority` is the 2.0
> family only, and `duration: -1` works on 2.0 + 1-5-pro. There is no 2K tier
> on any model and `4k` exists only on `dreamina-seedance-2-0-260128`.
> **Video URLs expire 24 hours after the task completes** (task record kept 7
> days). Seedance is also reachable via `falVideo` — `byteplusVideo` is the
> direct-to-BytePlus path.

OpenRouter (`@tanstack/ai-openrouter`, `openRouterVideo`) runs the dedicated
async video API (`POST /api/v1/videos`) and shares the same typed-duration
contract — `duration`, `size`, and provider options are narrowed per model
from OpenRouter's published metadata, with the same `availableDurations()` /
`snapDuration()` helpers:

```typescript
import { openRouterVideo } from '@tanstack/ai-openrouter'

const adapter = openRouterVideo('bytedance/seedance-2.0')
adapter.availableDurations()
// { kind: 'discrete', values: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }
adapter.snapDuration(7.4) // 7

const sliderSeconds = 7 // raw seconds from a UI control
const { jobId } = await generateVideo({
  adapter,
  prompt: 'A timelapse of clouds',
  duration: adapter.snapDuration(sliderSeconds),
})
// Completed url is a data: URL; usage.cost carries the real billed cost.
```

Client hook with job tracking:

```tsx
import { useGenerateVideo, fetchServerSentEvents } from '@tanstack/ai-react'

const { generate, result, jobId, videoStatus, isLoading } = useGenerateVideo({
  connection: fetchServerSentEvents('/api/generate/video'),
  onJobCreated: (id) => console.log('Job created:', id),
  onStatusUpdate: (status) =>
    console.log(`${status.status} (${status.progress}%)`),
})

// videoStatus: { jobId, status, progress?, url?, error?, usage? }
// result (on completion): { url }
```
