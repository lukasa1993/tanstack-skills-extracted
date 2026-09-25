# Adapter Configuration — Core Patterns: 7. Files Adapters (upload once, reference by handle)

[Guide and prerequisites](./tanstack-ai-core-adapter-configuration-e2c12fef.md) · Published skill · `@tanstack/ai@0.61.0`.

## Core Patterns: 7. Files Adapters (upload once, reference by handle)


Four providers expose a native Files/storage API as a tree-shakeable `files`
adapter: `openaiFiles()`, `anthropicFiles()`, `geminiFiles()` (each reads the
same env var as the provider's text adapter; `create*Files(apiKey)` variants
take an explicit key), and `falFiles(config)`. Upload media once with
`uploadFile()`, then reference the returned `FileHandle` in messages via a
`{ type: 'file' }` content source instead of re-sending base64 each request:

```typescript
import { chat, fileSourceFromHandle, uploadFile } from '@tanstack/ai'
import { openaiFiles, openaiText } from '@tanstack/ai-openai'
import { pdfBase64 } from './pdf-data'

const handle = await uploadFile({
  adapter: openaiFiles(),
  input: { data: pdfBase64, mimeType: 'application/pdf' },
})

chat({
  adapter: openaiText('gpt-5.5'),
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', content: 'Summarize this document' },
        { type: 'document', source: fileSourceFromHandle(handle) },
      ],
    },
  ],
})
```

Rules agents must respect:

- **The source is one opaque handle plus its issuer.** `fileSourceFromHandle`
  builds `{ type: 'file', value: 'file-…', provider: 'openai' }`, matching the
  AG-UI `FileSource` arm. A handle only resolves at the provider that issued
  it, so an adapter throws when `provider` names a different adapter.
  `provider` is optional, as on the AG-UI wire; a source without it is taken
  as-is. To use the same bytes with two providers,
  upload to each and send the matching handle.
- **Adapters declare `supportsFileSources`.** For adapters that don't (Groq, Bedrock, Mistral, OpenRouter, Ollama, BytePlus, Cohere, and anything
  written before this feature), `chat()` / `generateImage()` /
  `generateVideo()` / `embed()` reject file sources in preflight, before any
  request is built — pass `data`/`url` sources there instead.
- **Lifecycle:** `getFile()` / `deleteFile()` work for OpenAI, Anthropic,
  Gemini, and Grok, and accept the handle itself (provider-literal typed, so a
  foreign handle is a compile error). fal storage is upload-only, so those
  calls throw for `falFiles()`. `grokFiles().get()` mints the public URL again,
  so do not call it after `revokePublicUrl()`.
- **Some endpoints need raw bytes even on supporting providers:** OpenAI
  `images/edits` + Sora `input_reference`, Gemini Veo, and Chat Completions
  image inputs throw endpoint-specific errors for file sources.
- **A file source crosses the chat wire.** A browser that holds a handle puts
  `fileSourceFromHandle(handle)` straight into the `sendMessage` content, and
  the server passes the messages to `chat()` as usual. `fileSourceFromHandle`
  and the `FileHandle` type are exported from the browser-safe
  `@tanstack/ai/client` entry.

See `docs/advanced/files-api.md` for the full guide.
