# Formatting Display — Format for `aria-keyshortcuts`

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-formatting-display-md-c1379339.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Format for `aria-keyshortcuts`

`hotkeys.createFormatForAria()` returns a function that formats a hotkey for the [`aria-keyshortcuts`](https://w3c.github.io/aria/#aria-keyshortcuts) attribute so screen readers can announce it. It uses the same platform and keyboard layout as the display formatter. See [Accessibility](./hotkeys-docs-framework-alpine-guides-accessibility-md-5823d5ab.md#source-hotkeys-docs-framework-alpine-guides-accessibility-md) for where to place the attribute.

```ts
Alpine.data('searchButton', () => {
  const hotkeys = createHotkeysScope()
  const formatForAria = hotkeys.createFormatForAria()
  const formatForDisplay = hotkeys.createFormatForDisplay()

  return {
    init() {
      hotkeys.createHotkey('Mod+K', () => this.search())
    },
    search() {
      openSearch()
    },
    get shortcut() {
      return formatForAria('Mod+K')
    },
    get label() {
      return formatForDisplay('Mod+K')
    },
    destroy() {
      hotkeys.destroy()
    },
  }
})
```

```html
<button x-data="searchButton" @click="search()" :aria-keyshortcuts="shortcut">
  Search <kbd x-text="label"></kbd>
</button>
```

The output uses the key names from the ARIA specification:

- **Modifiers.** `Mod` becomes `Meta` on macOS and `Control` elsewhere. Modifiers use `Control`, `Alt`, `Shift`, and `Meta` in that order before the key, so `Mod+Shift+P` formats as `Shift+Meta+P` on macOS.
- **Keys.** Keys use `KeyboardEvent.key` values (`K`, `/`, `Escape`, `ArrowUp`), with `Space` for the space bar and `Plus` for the plus key. A physical binding names the key at that position from the user's keyboard layout where the browser reports it, so `[KeyQ]` formats as `Q`, or `A` on a French AZERTY keyboard. A logical hotkey's punctuation stays as written, so `'?'` formats as `?` rather than the `Shift+/` you press on a US keyboard. The key that types `?` depends on the layout. For punctuation that takes `Shift` to type, pass your own `aria-keyshortcuts` value for the layout, or use a physical binding such as `Shift+[Slash]`, which also changes which key the hotkey matches.
- **No value.** Returns `undefined` for a multi-step sequence, a standalone modifier, an empty or `null` hotkey, or a physical code with no key name such as `[NumpadMemoryAdd]`, so `:aria-keyshortcuts` omits the attribute. ARIA has no syntax for multi-step sequences. The adapter's formatter also returns `undefined` while the hotkey can't fire, such as when it is disabled, its scope is suspended, character keys are suspended, or nothing has registered it, so a screen reader doesn't announce a shortcut that no registration can fire. The plain `formatForAria` function only formats.

For a control with two shortcuts, join both formatted values with a space, such as `Control+K /`.
