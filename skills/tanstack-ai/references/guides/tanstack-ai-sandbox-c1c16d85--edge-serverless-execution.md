# Ai Sandbox — Edge / serverless execution

[Guide and prerequisites](./tanstack-ai-sandbox-c1c16d85.md) · Published skill · `@tanstack/ai-sandbox@0.5.7`.

## Edge / serverless execution

A request-scoped Worker can't hold a multi-minute agent run open. The
serverless/edge model splits this: a **trigger** starts the run and returns
immediately, a **durable orchestrator** drives it, and clients **tail from a
resumable cursor**.

Core primitives (`@tanstack/ai-sandbox`, transport- and runtime-agnostic):

- **`pipeToRunLog` / `RunController`** (the run driver), built on two of core's
  (`@tanstack/ai`) durable seams: a `RunStore` for the run's lifecycle record
  (the same store `withPersistence` uses for chat history) and a
  `StreamDurability` for its event log (`memoryStream` or `durableStream`).
  `pipeToRunLog(stream, { runs, durability, runId, threadId, signal, logger })`
  pumps a `chat()` stream into both and is **total**: every store/event-log
  call is individually guarded, so it never throws and never rejects. A
  thrown stream error becomes a terminal `RUN_ERROR` event plus the record's
  `error`, so a detached client always observes failures, and a failing store
  write or a failing durability close is recorded through the optional
  `logger` (same `logger?.errors(...)` contract core uses) rather than
  silently absorbed. `threadId` is required. `RunController` wraps a fixed
  `RunDeps = { runs, durability, logger? }`, where **`durability` is a per-run
  factory `(runId) => StreamDurability`, not an instance**:

  ```typescript
  import { InMemoryRunStore, memoryStream } from '@tanstack/ai'
  import { RunController } from '@tanstack/ai-sandbox'
  import type { StreamChunk } from '@tanstack/ai'

  const runs = new InMemoryRunStore()

  export async function driveOne(
    request: Request,
    runId: string,
    threadId: string,
    stream: AsyncIterable<StreamChunk>,
  ): Promise<void> {
    const controller = new RunController({
      runs,
      // A per-run FACTORY. A `StreamDurability` is bound to ONE run, so the log
      // is resolved FROM the runId rather than handed in pre-bound. Whatever you
      // pass MUST return the same instance for the same runId within a process,
      // or `snapshot()` will not see this host's own appends. `memoryStream`
      // keys its log by the run the request names, so every call for one run
      // shares one log; swap in `durableStream(request, options)` in production.
      durability: () => memoryStream(request),
    })

    const handle = controller.start({ runId, threadId, stream })
    // handle.runId, handle.done (resolves with the terminal RunRecord)

    // `attach` takes the runId FIRST, because the log it reads is per-run.
    // fromOffset is an opaque string the durability adapter produced; for
    // memoryStream, '-1' replays from the start. The third `signal` argument is
    // optional and stops tailing when it aborts.
    for await (const { offset, chunk } of controller.attach(runId, '-1')) {
      console.log(offset, chunk.type)
    }

    await handle.done
    await controller.drain() // await every in-flight run, e.g. inside waitUntil
  }
  ```

  Terminal statuses are `'completed' | 'failed' | 'aborted'` (core's
  `TerminalRunStatus`); a run may also be `'running'` or `'interrupted'`
  (`RunStatus`). Because the log is resolved from the `runId`, a
  `RunController` **is** safe for concurrent runs: each run appends to its own
  log and no run's `close()` terminalizes another's. Two failures that a
  single pre-bound instance used to make reachable are now unrepresentable —
  writing the lifecycle record under one id and the events under another, and
  parallel runs interleaving chunks into one log. Do not hand back the same
  `StreamDurability` for every `runId` to "simplify" the factory; that
  reintroduces both.

  For a production takeover, do **not** drive `RunController` /
  `pipeToRunLog` by hand — use `sandboxRunDriver` (see
  [Takeover](./tanstack-ai-sandbox-c1c16d85.md#takeover-detached-runs-and-single-writer-safety)), which owns the
  claim, the epoch fence, and the quiescence gate.

- **Transport-agnostic tool-bridge** — `createToolBridgeCore` +
  `handleBridgeJsonRpc` are the portable core; `startHostToolBridge` is the
  `node:http` host transport. The `ToolBridgeProvisioner` capability injects the
  transport, so an edge orchestrator serves the same core from its own `fetch`
  handler (no raw TCP listener). Default = host transport.
- **Co-located host-tool seam** — `toolDescriptors` / `remoteToolStubs` /
  `httpRemoteToolExecutor` (container side) + `executeHostTool` (orchestrator
  side): only chat()-tool EXECUTION crosses the container→orchestrator boundary,
  not the whole MCP protocol.
- **`SandboxCapabilities.writableStdin`** — `false` for providers (e.g.
  Cloudflare) with no writable host→process stdin; stdin-fed harnesses then
  deliver the prompt via a file + in-shell redirection (`claude -p … < file`).

Cloudflare runtime (`@tanstack/ai-sandbox-cloudflare`):

- `createCloudflareSandboxAgent(config)` → `{ Coordinator, Sandbox, worker }` —
  an app's `worker.ts` is one configured call plus the wrangler-required DO
  re-exports. Two models via `mode`: `do-drives` (the DO runs `chat()`) and
  `colocated` (harness + bridge run in-container; the DO is a thin coordinator,
  pair with `runInContainerHarness` from `/runner`).
- `DurableObjectRunEventLog` mirrors `InMemoryRunEventLog` (both live in
  `@tanstack/ai-sandbox-cloudflare`, exported from its `/agent` entry) over DO
  storage; `timingSafeBearerEqualWeb` is the Web-Crypto constant-time bearer
  check. That package's own `RunStatus`, `TerminalRunStatus`, `RunRecord`, and
  `RunError` describe its event-log vocabulary, which is deliberately distinct
  from core's run-lifecycle types of the same names; the `/agent` entry
  re-exports them under a `Legacy` prefix (`LegacyRunStatus`,
  `LegacyTerminalRunStatus`, `LegacyRunRecord`, `LegacyRunError`) so an app can
  import both this package's run driver and the Cloudflare event log without a
  name collision. `RunEventLog`, `RunEvent`, and `RunEventLogReadOptions` have
  no equivalent in core and keep their plain names.
