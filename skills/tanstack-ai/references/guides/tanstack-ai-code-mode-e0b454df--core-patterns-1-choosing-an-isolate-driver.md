# Ai Code Mode — Core Patterns: 1. Choosing an Isolate Driver

[Guide and prerequisites](./tanstack-ai-code-mode-e0b454df.md) · Published skill · `@tanstack/ai-code-mode@0.4.9`.

## Core Patterns: 1. Choosing an Isolate Driver


Four drivers implement the `IsolateDriver` interface. All are interchangeable.

**Node.js** (`createNodeIsolateDriver`) -- Full V8 with JIT. Fastest option. Requires `isolated-vm` native C++ addon.

```typescript
import { createNodeIsolateDriver } from '@tanstack/ai-isolate-node'

const driver = createNodeIsolateDriver({
  memoryLimit: 128, // MB, default 128
  timeout: 30_000, // ms, default 30000
  // skipProbe: false -- set true only after verifying compatibility
})
```

**QuickJS** (`createQuickJSIsolateDriver`) -- WASM-based, no native deps. Works in Node.js, browsers, Deno, Bun, and edge runtimes. Slower (interpreted, no JIT). Limited stdlib (no File I/O).

```typescript
import { createQuickJSIsolateDriver } from '@tanstack/ai-isolate-quickjs'

const driver = createQuickJSIsolateDriver({
  memoryLimit: 128, // MB, default 128
  timeout: 30_000, // ms, default 30000
  maxStackSize: 524288, // bytes, default 512 KiB
})
```

**QuickJS Bun** (`createQuickJSBunIsolateDriver`) -- Native QuickJS on the Bun runtime via `bun:ffi`. Requires Bun >= 1.3.14 (throws a descriptive error on Node.js). No native deps or build step. Each context gets a dedicated QuickJS runtime with its own memory limit, stack size, and interrupt-based timeout. Recommended QuickJS option on Bun, where the WASM driver's asyncify bridge is unreliable for async host tool calls.

```typescript
import { createQuickJSBunIsolateDriver } from '@tanstack/ai-isolate-quickjs-bun'

const driver = createQuickJSBunIsolateDriver({
  memoryLimit: 128, // MB, default 128
  timeout: 30_000, // ms, default 30000
  maxStackSize: 524288, // bytes, default 512 KiB
})
```

**Cloudflare** (`createCloudflareIsolateDriver`) -- Edge execution via a deployed Cloudflare Worker. Requires a `workerUrl` pointing to your deployed worker. Network latency on each tool call.

```typescript
import { createCloudflareIsolateDriver } from '@tanstack/ai-isolate-cloudflare'

const driver = createCloudflareIsolateDriver({
  workerUrl: 'https://my-code-mode-worker.my-account.workers.dev',
  authorization: process.env.CODE_MODE_WORKER_SECRET,
  timeout: 30_000, // ms, default 30000
  maxToolRounds: 10, // max tool-call/result cycles, default 10
})
```

| Driver      | Best for                    | Native deps     | Browser support | Performance           |
| ----------- | --------------------------- | --------------- | --------------- | --------------------- |
| Node        | Server-side Node.js         | Yes (C++ addon) | No              | Fast (V8 JIT)         |
| QuickJS     | Browsers, edge, portability | None (WASM)     | Yes             | Slower (interpreted)  |
| QuickJS Bun | Bun servers                 | None            | No              | Fast (native QuickJS) |
| Cloudflare  | Edge deployments            | None            | N/A             | Fast (V8 on edge)     |
