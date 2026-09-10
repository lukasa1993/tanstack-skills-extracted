# Ai Code Mode — Common Mistakes

[Guide and prerequisites](./tanstack-ai-code-mode-e0b454df.md) · Published skill · `@tanstack/ai-code-mode@0.4.9`.

## Common Mistakes

### CRITICAL: Passing API keys or secrets to the sandbox environment

Code Mode executes LLM-generated code. Any secrets available in the sandbox context are accessible to generated code, which could exfiltrate them via tool calls. Never pass API keys, database credentials, or tokens into the sandbox. Keep secrets in your tool server implementations, which run in the host process outside the sandbox.

Wrong:

```typescript
import { toolDefinition } from '@tanstack/ai'
import { createCodeModeTool } from '@tanstack/ai-code-mode'
import { createNodeIsolateDriver } from '@tanstack/ai-isolate-node'
import { z } from 'zod'

const codeModeTool = createCodeModeTool({
  driver: createNodeIsolateDriver(),
  tools: [
    toolDefinition({
      name: 'callApi',
      description: 'Call an HTTP API',
      inputSchema: z.object({ url: z.string(), apiKey: z.string() }),
      outputSchema: z.any(),
    }).server(async ({ url, apiKey }) =>
      fetch(url, {
        headers: { Authorization: apiKey },
      }),
    ),
  ],
})
```

Right:

```typescript
import { toolDefinition } from '@tanstack/ai'
import { createCodeModeTool } from '@tanstack/ai-code-mode'
import { createNodeIsolateDriver } from '@tanstack/ai-isolate-node'
import { z } from 'zod'

const codeModeTool = createCodeModeTool({
  driver: createNodeIsolateDriver(),
  tools: [
    toolDefinition({
      name: 'callApi',
      description: 'Call an HTTP API',
      inputSchema: z.object({ url: z.string() }),
      outputSchema: z.any(),
    }).server(async ({ url }) =>
      fetch(url, {
        headers: { Authorization: `Bearer ${process.env.API_KEY}` }, // secret stays in host
      }),
    ),
  ],
})
```

Source: docs/code-mode/code-mode.md

### HIGH: Not setting timeout for code execution

LLM-generated code may contain infinite loops. The default timeout is 30s, but developers may override to 0 (no timeout). Always set an explicit, finite timeout.

Wrong:

```typescript
import { createNodeIsolateDriver } from '@tanstack/ai-isolate-node'

const driver = createNodeIsolateDriver({ timeout: 0 })
```

Right:

```typescript
import { createNodeIsolateDriver } from '@tanstack/ai-isolate-node'

const driver = createNodeIsolateDriver({ timeout: 30_000 })
```

Source: ai-code-mode source (default timeout in CodeModeToolConfig)

### HIGH: Using Node isolated-vm driver without checking platform compatibility

`isolated-vm` requires native module compilation. An incompatible build (wrong Node.js version, missing build tools) causes segfaults that no JS error handling can catch. The driver runs a subprocess probe by default. Never set `skipProbe: true` unless you have independently verified compatibility. Use `probeIsolatedVm()` to check before creating the driver.

```typescript
import {
  createNodeIsolateDriver,
  probeIsolatedVm,
} from '@tanstack/ai-isolate-node'

const probe = probeIsolatedVm()
if (!probe.compatible) {
  console.error('isolated-vm not compatible:', probe.error)
  // Fall back to QuickJS
}

// Never do this unless you verified compatibility yourself:
// const driver = createNodeIsolateDriver({ skipProbe: true })
```

Source: ai-isolate-node source (probeIsolatedVm implementation)

### MEDIUM: Expecting identical behavior across isolate drivers

The four drivers have different capabilities. Same code may work in Node but fail elsewhere.

- **Node**: Full V8 support, JIT compilation, configurable memory limit
- **QuickJS**: Interpreted, limited stdlib (no File I/O), configurable stack size, asyncified execution (serialized through global queue)
- **QuickJS Bun**: Bun runtime only (throws on Node.js), native QuickJS via `bun:ffi`, dedicated runtime per context with per-context memory/stack limits and normalized `MemoryLimitError`/`StackOverflowError`/`TimeoutError`
- **Cloudflare**: Network latency per tool call round-trip, `maxToolRounds` limit (default 10), requires deployed worker with `UNSAFE_EVAL` or `eval` unsafe binding

Test generated code against your target driver. If you need portability, target QuickJS's subset.

Source: docs/code-mode/code-mode-isolates.md
