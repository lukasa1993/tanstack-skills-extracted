# Formatting Display — Format sequences

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-formatting-display-md-9091ea8e.md) · Release-matched documentation · `@tanstack/hotkeys@0.26.0`.

## Format sequences

Pass a sequence to format each step and join the steps with `sequenceSeparator`, a space by default:

```ts
formatForDisplay(['Mod+[KeyK]', 'C'], { platform: 'mac' }) // '⌘ K C'
formatForDisplay(['G', 'G'], { sequenceSeparator: ' → ' }) // 'G → G'
formatForDisplay(['Mod+[KeyK]', 'C'], { platform: 'mac', parts: true })
// [['⌘', 'K'], ['C']], one array of keycaps per step
```

With `parts: true`, a sequence returns one array per step, so you can render each step as a group of keycaps. To show the steps a user has pressed so far, see [Show sequences in your UI](./hotkeys-docs-framework-react-guides-sequences-md-00eadae7.md#source-hotkeys-docs-framework-react-guides-sequences-md).
