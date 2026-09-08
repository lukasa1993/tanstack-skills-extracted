# Adapter Configuration — Core Patterns: 4. Extending Adapters with Custom Models

[Guide and prerequisites](./tanstack-ai-core-adapter-configuration-e2c12fef.md) · Published skill · `@tanstack/ai@0.53.0`.

## Core Patterns: 4. Extending Adapters with Custom Models


Use `extendAdapter()` and `createModel()` to add custom or fine-tuned models
while preserving type safety for the original models:

```typescript
import { extendAdapter, createModel } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

// Define custom models
const customModels = [
  createModel('ft:gpt-5.2:my-org:custom-model:abc123', ['text', 'image']),
  createModel('my-local-proxy-model', ['text']),
] as const

// Create extended factory - original models still fully typed
const myOpenai = extendAdapter(openaiText, customModels)

// Use original models - full type inference preserved
const gpt5 = myOpenai('gpt-5.2')

// Use custom models - accepted by the type system
const custom = myOpenai('ft:gpt-5.2:my-org:custom-model:abc123')

// Type error: 'nonexistent-model' is not a valid model
// myOpenai('nonexistent-model')
```

At runtime, `extendAdapter` simply passes through to the original factory.
The `_customModels` parameter is only used for type inference.
