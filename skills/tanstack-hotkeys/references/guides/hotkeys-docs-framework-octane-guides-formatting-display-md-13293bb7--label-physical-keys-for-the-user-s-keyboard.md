# Formatting Display — Label physical keys for the user's keyboard

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-formatting-display-md-13293bb7.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Label physical keys for the user's keyboard

Physical bindings follow key position (`[KeyW]` is always the US W slot), which sits at `Z` on a French AZERTY keyboard. `useFormatForDisplay()` automatically resolves physical codes to the character printed on the user's layout where supported:

```tsx
import { useFormatForDisplay } from '@tanstack/octane-hotkeys'

function MoveUp() @{
  const formatForDisplay = useFormatForDisplay()
  // 'W' on QWERTY, 'Z' on AZERTY
  <kbd>{formatForDisplay('[KeyW]')}</kbd>
}
```

> [!IMPORTANT]
> **Browser support.** Keyboard layout detection (`navigator.keyboard.getLayoutMap()`) works only in **Chromium browsers** (Chrome and Edge). Firefox and Safari don't expose layout maps and fall back to US QWERTY labels (`W` or `Q`). Inside cross-origin iframes, Chromium also requires `allow="keyboard-map"`.

Good to know:

- The layout loads asynchronously when the first label mounts, so the initial or server render shows the US fallback before updating. Later components get the resolved map immediately.
- Only physical bindings (`[KeyQ]`) change. Logical bindings (`Mod+Q`) always show their character, and key matching or recording never depend on the layout map.
- The layout refreshes whenever the window regains focus, since browsers emit no layout-change event.

To draw your own layout-aware UI, such as an on-screen keyboard, call `useKeyboardLayout()`, which returns the loaded map (`code` to character) or `null`. To turn off browser layout detection altogether, pass `keyboardLayout: false` on `HotkeysProvider`:

```tsx
<HotkeysProvider defaultOptions={{ keyboardLayout: false }}>
  <App />
</HotkeysProvider>
```

### Supply your own layout

If your app already tracks a user's layout preference, pass any `Map`-like `{ get(code): string | undefined }` object as `layoutMap`, which overrides the browser map:

```ts
const layoutMap = new Map([['KeyQ', 'a']])

formatForDisplay('Mod+[KeyQ]', { platform: 'mac', layoutMap }) // '⌘ A'
formatForDisplay('Mod+Q', { platform: 'mac', layoutMap }) // '⌘ Q' (logical key unchanged)
```

Use `keyLabels` to customize display names by physical code or logical key name. It works on the server too, and overrides both `layoutMap` and built-in fallbacks:

```ts
formatForDisplay('Mod+[KeyQ]', {
  platform: 'mac',
  layoutMap,
  keyLabels: { KeyQ: 'Action' },
}) // '⌘ Action'
```

`keyLabels` wins over a layout entry, which wins over the fallback label. Layout entries get normal letter casing and key symbols, and missing or empty entries fall back. All of these options affect display only.
