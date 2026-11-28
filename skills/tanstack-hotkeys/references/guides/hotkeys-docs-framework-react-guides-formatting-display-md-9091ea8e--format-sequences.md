# Formatting Display — Format sequences

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-formatting-display-md-9091ea8e.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Format sequences

Pass a sequence array to format every step, separated by `sequenceSeparator` (a space by default):

```ts
formatForDisplay(['Mod+[KeyK]', 'C'], { platform: 'mac' }) // '⌘ K C'
formatForDisplay(['G', 'G'], { sequenceSeparator: ' → ' }) // 'G → G'
formatForDisplay(['Mod+[KeyK]', 'C'], { platform: 'mac', parts: true })
// [['⌘', 'K'], ['C']], one array of keycaps per step
```

To display in-progress steps as the user types a sequence, see [Show sequences in your UI](./hotkeys-docs-framework-react-guides-sequences-md-00eadae7.md#source-hotkeys-docs-framework-react-guides-sequences-md).
