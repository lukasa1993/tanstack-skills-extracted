# Tool Calling — Core Patterns: Tuning the lazy catalog with `lazyToolsConfig`

[Guide and prerequisites](./tanstack-ai-core-tool-calling-e2b5ca3c.md) · Published skill · `@tanstack/ai@0.54.0`.

## Core Patterns: Tuning the lazy catalog with `lazyToolsConfig`


By default the discovery-tool catalog lists only bare names (`'none'`). Pass
`lazyToolsConfig` to `chat()` to include more context:

```typescript group=lazy-tools
// Same tools as the route above, with a richer discovery catalog:
export function chatWithCatalog(messages: Array<ModelMessage>) {
  return chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    tools: [getProducts, compareProducts],
    agentLoopStrategy: maxIterations(20),
    lazyToolsConfig: { includeDescription: 'first-sentence' },
  })
}
```

`includeDescription` values:

| Value              | Catalog entry                                                                            | When to use                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `'none'` (default) | `compareProducts`                                                                        | Smallest prompt; model discovers by name                                           |
| `'first-sentence'` | `compareProducts — Compare two or more products side by side.`                           | Helps the model decide whether to discover without extra tokens                    |
| `'full'`           | `compareProducts — Compare two or more products side by side. Accepts productIds array.` | Use when descriptions are short or the model needs full context to route correctly |

The post-discovery payload always returns the full description and schema regardless of this setting.
