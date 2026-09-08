# Structured Outputs — Middleware coverage

[Guide and prerequisites](./tanstack-ai-core-structured-outputs-fef450ef.md) · Published skill · `@tanstack/ai@0.53.0`.

## Middleware coverage

On the separate-finalization path, the final structured-output adapter call
runs through the middleware pipeline with
`ctx.phase === 'structuredOutput'`. Use `onStructuredOutputConfig` to transform
the JSON Schema or finalization config before that provider call.

Native-combined output stays in the regular agent loop. Its chunks use
`ctx.phase === 'modelStream'`, and `onStructuredOutputConfig` does not fire.

On both paths, `onChunk` observes the `structured-output.complete` event,
`onUsage` observes usage from the provider calls that ran, and `onFinish` fires
once after the structured-output result is available. See
[middleware skill](./tanstack-ai-core-middleware-b87affa9.md#source-tanstack-ai-core-middleware).
