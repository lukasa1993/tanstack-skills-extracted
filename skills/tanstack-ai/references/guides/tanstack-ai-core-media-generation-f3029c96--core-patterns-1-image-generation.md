# Media Generation — Core Patterns: 1. Image Generation

[Guide and prerequisites](./tanstack-ai-core-media-generation-f3029c96.md) · Published skill · `@tanstack/ai@0.54.0`.

## Core Patterns: 1. Image Generation


Supported adapters: `openaiImage` (dall-e-2, dall-e-3, gpt-image-1,
gpt-image-1-mini, gpt-image-2), `geminiImage` (gemini-3.1-flash-image,
gemini-3.1-flash-lite-image, gemini-3-pro-image, imagen-4.0-generate-001, etc.)
and `byteplusImage` (Seedream — `seedream-4-0-250828`, `seedream-4-5-251128`,
the 5.0 family).

> **Use the GA Gemini image ids.** `gemini-3.1-flash-image-preview` and
> `gemini-3-pro-image-preview` were shut down on 2026-06-25 and now 404. They
> survive in the type union only as deprecated aliases so existing code keeps
> compiling — a call to them typechecks and then fails at runtime. Use
> `gemini-3.1-flash-image` / `gemini-3-pro-image` instead.

> **Seedream quirks:** `watermark` defaults to **`true`** (pass
> `modelOptions: { watermark: false }` for a clean image), `size` is a token
> (`'1K'` | `'2K'` | `'4K'`) **or** explicit `'2048x2048'` pixels but never a
> mix, and `numberOfImages` is an **upper bound** — Seedream has no `n`, so it
> maps onto group-image mode and the model may return fewer. Reads
> `ARK_API_KEY`.

```typescript
import { generateImage } from '@tanstack/ai'
import { openaiImage } from '@tanstack/ai-openai'
import { geminiImage } from '@tanstack/ai-gemini'

// OpenAI with quality/background options
const openaiResult = await generateImage({
  adapter: openaiImage('gpt-image-1'),
  prompt: 'A cat wearing a hat',
  size: '1024x1024',
  numberOfImages: 2,
  modelOptions: {
    quality: 'high',
    background: 'transparent',
    output_format: 'png',
  },
})

// Gemini native model with aspect-ratio sizes
const geminiResult = await generateImage({
  adapter: geminiImage('gemini-3.1-flash-image'),
  prompt: 'A futuristic cityscape at night',
  size: '16:9_4K',
})

// Gemini Imagen model
const imagenResult = await generateImage({
  adapter: geminiImage('imagen-4.0-generate-001'),
  prompt: 'A landscape photo',
  modelOptions: { aspectRatio: '16:9' },
})
```

Result shape: `ImageGenerationResult` with `images` array where each entry
has `b64Json?`, `url?`, and `revisedPrompt?`. OpenAI image URLs expire
after 1 hour -- download or display immediately.

#### Image-conditioned generation: multimodal `prompt` parts

Both `generateImage()` and `generateVideo()` accept the `prompt` either as
a plain string or as an ordered array of content parts (`TextPart` /
`ImagePart` / `VideoPart` / `AudioPart` — the same shapes used elsewhere in
TanStack AI). Part order is meaningful: natively multimodal providers
(Gemini, OpenRouter) receive parts in order; named-field providers (OpenAI,
fal, xAI) extract media parts and flatten the text. Prompt text is always
sent verbatim — to reference inputs from the prompt, write the provider's
own syntax (fal `@Image1`, OpenAI "image 1" prose); the SDK never injects
or rewrites markers. Each media part may carry an optional
`metadata.role` hint that adapters use to route the part to the
provider-specific field. The accepted part types are narrowed per model at
compile time via the adapter's input-modality map.

```typescript
import { generateImage } from '@tanstack/ai'
import { openaiImage } from '@tanstack/ai-openai'

// Image-to-image (OpenAI gpt-image-2 / gpt-image-1, dall-e-2)
await generateImage({
  adapter: openaiImage('gpt-image-2'),
  prompt: [
    { type: 'text', content: 'Turn this into a cinematic product photo' },
    { type: 'image', source: { type: 'url', value: 'https://…/product.png' } },
  ],
})

// Multi-reference (up to 16 for gpt-image models; up to ~14 for Gemini native
// — a provider limit, not enforced by the SDK)
await generateImage({
  adapter: openaiImage('gpt-image-2'),
  prompt: [
    { type: 'text', content: 'Apply the second image as style to the first' },
    { type: 'image', source: { type: 'url', value: 'https://…/product.png' } },
    { type: 'image', source: { type: 'url', value: 'https://…/style.png' } },
  ],
})

// Inpaint via metadata.role === 'mask' (OpenAI gpt-image models, dall-e-2; fal mask_url)
await generateImage({
  adapter: openaiImage('gpt-image-2'),
  prompt: [
    { type: 'text', content: 'Replace the masked region with a tree' },
    { type: 'image', source: { type: 'url', value: 'https://…/photo.png' } },
    {
      type: 'image',
      source: { type: 'url', value: 'https://…/mask.png' },
      metadata: { role: 'mask' },
    },
  ],
})

// Image-to-video (OpenAI Sora: single input_reference; fal: image_url + optional
// end_image_url; OpenRouter: frame_images + input_references)
import { generateVideo } from '@tanstack/ai'
import { falVideo } from '@tanstack/ai-fal'

await generateVideo({
  adapter: falVideo('fal-ai/kling-video/v3/pro/image-to-video'),
  prompt: [
    { type: 'image', source: { type: 'url', value: 'https://…/first.png' } },
    { type: 'text', content: 'Slow cinematic push-in' },
    {
      type: 'image',
      source: { type: 'url', value: 'https://…/last.png' },
      metadata: { role: 'end_frame' },
    },
  ],
})
```

**URL inputs that require an upload throw by default.** Most adapters pass a
`type: 'url'` source straight through to the provider. Three paths can't —
OpenAI `images.edit()`, OpenAI Sora `input_reference`, and Gemini **Veo** —
because the provider only accepts uploaded bytes (Veo also takes a `gs://`
reference). For those, an HTTP(S) URL would have to be downloaded and buffered
in memory, which can OOM constrained runtimes, so they **throw** on an HTTP(S)
URL image input by default. Pass a `data:` URI (or `gs://` for Veo), or opt in
with `allowUrlFetch: true` on the adapter config
(`createOpenaiImage(model, apiKey, { allowUrlFetch: true })`, and likewise on
`createOpenaiVideo` / `createGeminiVideo`). `data:` URIs never need the flag.

**Role hints** (`metadata.role`):

| Role            | Maps to                                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `'reference'`   | fal `reference_image_urls`; OpenRouter video `input_references[]`; Gemini multimodal part; positional otherwise                        |
| `'character'`   | Same as `'reference'`; Veo `referenceImages`; OpenRouter `input_references[]`                                                          |
| `'mask'`        | OpenAI `mask` (gpt-image-2, gpt-image-1, dall-e-2); fal `mask_url`                                                                     |
| `'control'`     | fal `control_image_url` (ControlNet / depth / pose)                                                                                    |
| `'start_frame'` | fal `start_image_url` (or the endpoint's field, e.g. `image_url` on Kling i2v); OpenRouter `frame_images[]` `first_frame`; Veo `image` |
| `'end_frame'`   | fal `end_image_url` (or e.g. `tail_image_url` / `last_frame_url`); OpenRouter `frame_images[]` `last_frame`; Veo `lastFrame`           |

**Provider support matrix:**

| Provider   | `generateImage` image parts                                                                                                                                                                              | `generateVideo` image parts                                                                                                                                                                                                                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| OpenAI     | gpt-image-2 / gpt-image-1 / -mini → `images.edit()` (up to 16). dall-e-2 → edit (1). dall-e-3 throws.                                                                                                    | Sora-2 / -pro → `input_reference` (single). Throws if >1.                                                                                                                                                                                                                                                    |
| Gemini     | Native (gemini-\*-flash-image, "nano-banana") → multimodal `contents`. Imagen throws.                                                                                                                    | Veo → first un-roled / `'start_frame'` image is the input image; `'end_frame'` → `lastFrame`; `'reference'` / `'character'` → `referenceImages`. Omni Flash sends image/video parts as interaction content blocks (no role routing).                                                                         |
| fal        | Per-endpoint field names from a generated map (`pnpm generate:fal-image-fields`). Defaults: 1 input → `image_url`; >1 → `image_urls`; roles → `mask_url` / `control_image_url` / `reference_image_urls`. | Per-endpoint map (e.g. Kling i2v start frame → `image_url`). Defaults: 1 input → `image_url`; `start_frame`/`end_frame` → `start_image_url`/`end_image_url`; `reference` → `reference_image_urls`.                                                                                                           |
| Grok       | grok-imagine models → `/v1/images/edits` JSON endpoint (≤3 sources, addressed by xAI in request order; prompt sent verbatim; mask/control throw). grok-2-image-1212 throws.                              | Un-roled / `'start_frame'` image → starting frame; `'reference'` / `'character'` → `reference_images` (1.5). Starting frame and reference inputs cannot be combined. A `video` part + `modelOptions.mode: 'edit' \| 'extend'` routes to `/videos/edits` / `/videos/extensions` on `grok-imagine-video` only. |
| OpenRouter | Prompt parts map 1:1 onto multimodal `text` / `image_url` content parts, preserving interleaved order.                                                                                                   | Dedicated async API (`openRouterVideo`): `start_frame`/`end_frame` → `frame_images[]` (`first_frame`/`last_frame`); `reference`/`character` → `input_references[]`; an unroled image defaults to the start frame. Frame roles validated against the model's `supported_frame_images` metadata.               |
| Anthropic  | n/a (no image generation API).                                                                                                                                                                           | n/a                                                                                                                                                                                                                                                                                                          |

Video and audio prompt parts follow the same `metadata.role` convention
for video-to-video and lipsync flows on fal. Grok accepts one source
`video` part on `grok-imagine-video` with `modelOptions.mode: 'edit' | 'extend'`
and rejects audio parts. Other providers throw when those parts are passed.
