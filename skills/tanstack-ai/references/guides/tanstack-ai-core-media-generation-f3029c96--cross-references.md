# Media Generation — Cross-References

[Guide and prerequisites](./tanstack-ai-core-media-generation-f3029c96.md) · Published skill · `@tanstack/ai@0.53.0`.

## Cross-References

- See also: **./tanstack-ai-core-adapter-configuration-e2c12fef.md#source-tanstack-ai-core-adapter-configuration** -- Each media
  activity requires a specific activity adapter (e.g., `openaiImage` for
  images, `openaiSpeech` for speech, `openaiTranscription` for transcription,
  `openaiVideo` for video). The adapter-configuration skill covers provider
  setup, API keys, and model selection.
- See also: **./tanstack-ai-core-debug-logging-12e2d18d.md#source-tanstack-ai-core-debug-logging** -- When a media request
  returns unexpected output or fails mid-stream, toggle `debug: true` on
  any `generate*()` call to see request metadata, raw provider chunks, and
  errors. Covers per-category toggling and piping into pino/winston.
