# Build Cloudflare Artifact Store — Overview

[Guide and prerequisites](./tanstack-ai-persistence-build-cloudflare-artifact-store-60c47cfe.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

# Cloudflare Artifact + Blob Store

`withGenerationPersistence(persistence)` needs only `stores.generationRuns` to track a
generation's lifecycle. Add `stores.artifacts` (metadata) **and** `stores.blobs`
(the bytes) — both, or neither — and the middleware also persists the generated
media: image/audio/TTS/video/transcription bytes land at blob key
`artifacts/<runId>/<artifactId>`, with an `ArtifactRecord` row describing each.

The deliverable is **one file in the Worker** — e.g.
`src/lib/generation-persistence.ts` — exporting a factory that builds an
`AIPersistence` from the request's R2 + D1 bindings, plus a GET route that serves
artifact bytes with `retrieveArtifact` / `retrieveBlob`.

Read the sibling **ai-persistence/build-cloudflare-adapter** skill for the
per-request-binding rule, `wrangler` config shape, D1 migration workflow, and the
chat (generation-run/message) side. This skill covers only the two byte-storage stores and
how to compose them.
