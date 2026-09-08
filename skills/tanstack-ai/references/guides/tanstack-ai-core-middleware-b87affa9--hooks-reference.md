# Middleware — Hooks Reference

[Guide and prerequisites](./tanstack-ai-core-middleware-b87affa9.md) · Published skill · `@tanstack/ai@0.53.0`.

## Hooks Reference

Every hook receives a `ChatMiddlewareContext` as its first argument, which provides
`requestId`, `streamId`, `phase`, `iteration`, `chunkIndex`, `model`, `provider`,
`signal`, `abort()`, `defer()`, and more.

| Hook                       | When                                                                                                     | Second Argument                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `onConfig`                 | Once at startup (`init`) + once per iteration (`beforeModel`) + once at a separate-finalization boundary | `ChatMiddlewareConfig` (return partial to merge)    |
| `onStructuredOutputConfig` | Once at the separate-finalization boundary                                                               | `StructuredOutputMiddlewareConfig` (return partial) |
| `onStart`                  | Once after initial `onConfig`                                                                            | none                                                |
| `onIteration`              | Start of each agent loop iteration                                                                       | `IterationInfo`                                     |
| `onShouldContinue`         | Whether to start another agent-loop iteration (AND with strategy; `false` stops)                         | `AgentLoopState`                                    |
| `onChunk`                  | Every streamed chunk                                                                                     | `StreamChunk` (return void/chunk/chunk[]/null)      |
| `onBeforeToolCall`         | Before each tool executes                                                                                | `ToolCallHookContext` (return decision or void)     |
| `onAfterToolCall`          | After each tool executes                                                                                 | `AfterToolCallInfo`                                 |
| `onToolPhaseComplete`      | After all tool calls in an iteration                                                                     | `ToolPhaseCompleteInfo`                             |
| `onUsage`                  | When `RUN_FINISHED` includes usage data                                                                  | `UsageInfo`                                         |
| `onFinish`                 | Run completed normally                                                                                   | `FinishInfo`                                        |
| `onAbort`                  | Run was aborted                                                                                          | `AbortInfo`                                         |
| `onError`                  | Unhandled error occurred                                                                                 | `ErrorInfo`                                         |

Terminal hooks (`onFinish`, `onAbort`, `onError`) are **mutually exclusive** -- exactly
one fires per `chat()` invocation.

> **Sampling in `onConfig`:** `temperature`, `topP`, and `maxTokens` are **not**
> first-class fields on `ChatMiddlewareConfig`. To adjust sampling from
> middleware, return a partial that mutates `config.modelOptions` using the
> provider's native key (e.g. OpenAI `temperature` / `max_output_tokens`,
> Anthropic `max_tokens`, Ollama nested `options.num_predict`). Returning a
> top-level `temperature`/`maxTokens` has no effect.

### Phase values

`ctx.phase` is one of:

| Phase                | When                                                                                                                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `'init'`             | Initial setup (before the first `onConfig` snapshot is built).                                                                                                                   |
| `'beforeModel'`      | Right before each agent-loop adapter call (`onConfig` re-fires here).                                                                                                            |
| `'modelStream'`      | During model streaming chunks within the agent loop.                                                                                                                             |
| `'beforeTools'`      | Before tool execution phase.                                                                                                                                                     |
| `'afterTools'`       | After tool execution phase.                                                                                                                                                      |
| `'structuredOutput'` | During the separate-finalization adapter call (set for all chunks from `adapter.structuredOutputStream` or the synthesized fallback). Does not occur for native-combined output. |

**Separate-finalization path** (adapters without native-combined support):

- `onStructuredOutputConfig` fires **before** `onConfig` at the structured-output boundary.
- `onConfig` re-fires at the same boundary with `ctx.phase === 'structuredOutput'`, receiving the post-`onStructuredOutputConfig` view of the config (minus `outputSchema`).
- `onChunk` and `onUsage` fire for every chunk and usage event emitted by the structured-output call, with `ctx.phase === 'structuredOutput'`.
- `onIteration` does **not** fire for finalization — it is agent-loop-only.
- **Terminal `info` and structured-output:** `info.usage` / `info.finishReason` / `info.content` reflect the **agent loop's** terminal state, NOT the finalization step. Finalization state is intentionally segregated to keep agent-loop semantics clean. For a tools-less `chat({ outputSchema })` run, `info.usage` is `undefined` and `info.finishReason` is `null` (no agent-loop iteration produced `RUN_FINISHED`). To capture finalization tokens, use `onUsage` — it fires for both agent-loop iterations and the final call. For the structured-output result itself, observe the `structured-output.complete` CUSTOM event in `onChunk`.

**Native-combined output:**

- The schema-constrained JSON is produced by a normal agent-loop iteration. `onStructuredOutputConfig` does not fire, `ctx.phase` remains `'modelStream'`, and `onIteration` fires for that iteration.
- `info.content` includes the structured JSON because it is agent-loop text. Middleware observes the `structured-output.complete` event in `onChunk` during the same phase.

**Both paths:**

- On successful completion, `onFinish` fires once after the structured result completes. Terminal-hook exclusivity still holds.
- By `onFinish`, `ctx.messages` includes the completed terminal assistant messages. Native-combined output keeps the structured result on its terminal assistant message. The separate-finalization path can preserve the agent loop's plain-text message followed by a distinct structured-output message.
