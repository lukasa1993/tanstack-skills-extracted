# Formatting Display — Format sequences

[Guide and prerequisites](./hotkeys-docs-framework-preact-guides-formatting-display-md-817c4c0d.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Format sequences

Pass a sequence array to format every step, separated by `sequenceSeparator` (a space by default):

```ts
formatForDisplay(['Mod+[KeyK]', 'C'], { platform: 'mac' }) // '⌘ K C'
formatForDisplay(['G', 'G'], { sequenceSeparator: ' → ' }) // 'G → G'
formatForDisplay(['Mod+[KeyK]', 'C'], { platform: 'mac', parts: true })
// [['⌘', 'K'], ['C']], one array of keycaps per step
```

To display in-progress steps as the user types a sequence, see [Show sequences in your UI](./hotkeys-docs-framework-preact-guides-sequences-md-71b8fd79.md#source-hotkeys-docs-framework-preact-guides-sequences-md).
