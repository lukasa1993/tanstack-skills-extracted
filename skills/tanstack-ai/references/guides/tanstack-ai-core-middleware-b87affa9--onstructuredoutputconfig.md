# Middleware — onStructuredOutputConfig

[Guide and prerequisites](./tanstack-ai-core-middleware-b87affa9.md) · Published skill · `@tanstack/ai@0.53.0`.

## onStructuredOutputConfig

A dedicated config hook that fires **only** at the separate-finalization
boundary. Use it to transform the JSON Schema sent to the provider (inject
`$defs`, strip vendor-incompatible keywords) or to apply structured-output-
specific config changes that should not affect the agent-loop adapter calls.

**Signature:**

```ts
onStructuredOutputConfig?: (
  ctx: ChatMiddlewareContext,
  config: StructuredOutputMiddlewareConfig,
) =>
  | void
  | null
  | Partial<StructuredOutputMiddlewareConfig>
  | Promise<void | null | Partial<StructuredOutputMiddlewareConfig>>
```

**`StructuredOutputMiddlewareConfig` shape:**

```ts
interface StructuredOutputMiddlewareConfig extends Omit<
  ChatMiddlewareConfig,
  'tools'
> {
  outputSchema: JSONSchema // The JSON Schema being sent to the provider
}
```

Note the `Omit<…, 'tools'>`: there is **no `config.tools`** on this hook. The
structured-output call is the final, tool-free call, so reading or returning
`tools` here is a compile error, not a no-op. Transform tools in `onConfig`
instead.

**Ordering rule:**

- `onStructuredOutputConfig` fires **before** `onConfig` at the structured-output boundary.
- `onConfig` re-fires at the same boundary with `ctx.phase === 'structuredOutput'`, receiving the post-`onStructuredOutputConfig` view of the config (minus `outputSchema`).
- Use `onConfig` for general-purpose transforms that apply to every adapter call (agent-loop iterations and the final structured-output call).
- Use `onStructuredOutputConfig` when you need to transform the JSON Schema or apply structured-output-specific behavior.
