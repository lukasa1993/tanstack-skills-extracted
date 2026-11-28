# Formatting Display — Label physical keys for the user's keyboard

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-formatting-display-md-c1379339.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Label physical keys for the user's keyboard

A position, such as `[KeyQ]`, has a fallback label for a US keyboard: `Q`. On a French AZERTY keyboard, that key is labeled A. Labels from `createFormatForDisplay` follow the user's keyboard where the browser reports its layout:

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope } from '@tanstack/alpine-hotkeys'

Alpine.data('moveUp', () => {
  const hotkeys = createHotkeysScope()
  const formatForDisplay = hotkeys.createFormatForDisplay()

  return {
    get label() {
      // 'W' on QWERTY, 'Z' on AZERTY
      return formatForDisplay('[KeyW]')
    },
    destroy() {
      hotkeys.destroy()
    },
  }
})
```

```html
<kbd x-data="moveUp" x-text="label"></kbd>
```

> [!IMPORTANT]
> **Layout labels work only in Chromium browsers**, such as Chrome and Edge. Firefox and Safari don't report the keyboard layout, so labels there keep the fallback. For `[KeyQ]`, a French AZERTY user sees `A` in Chrome and `Q` in Firefox. In a cross-origin iframe, Chromium browsers also refuse unless the frame has `allow="keyboard-map"`.

- **The layout loads when the first `createFormatForDisplay` runs.** The label shows the fallback until the layout arrives, and later components have it at once.
- **Format in a getter or a template expression**, as `label` does above. Alpine runs it again when the layout arrives. A label stored as a plain property, such as `label: formatForDisplay('[KeyW]')`, keeps its first value.
- **Only positions change.** Hotkeys that follow characters, such as `Mod+Q`, already show the right key. Matching and recording never use the layout.
- **The layout is read again when the window regains focus**, because browsers send no event when the user switches layouts. This stops when every owner that created the function is destroyed.

`createKeyboardLayout` returns the loaded layout, or `null`, as a reactive `value`, for labels you draw yourself, such as an on-screen keyboard. It maps each code to the character the key types without modifiers, such as `KeyQ` to `a`.

The layout comes from `navigator.keyboard.getLayoutMap()`. To never call it, set `keyboardLayout: false` in the default options of `createHotkeysScope`:

```ts
const hotkeys = createHotkeysScope({ keyboardLayout: false })
```

Alpine has no provider, so the option applies to that owner. Share one options object between components to set it for all of them.

### Supply your own layout

Pass the same kind of map as `layoutMap`, for a layout your app already knows, such as one the user picked in settings:

```ts
const layoutMap = new Map([['KeyQ', 'a']])

formatForDisplay('Mod+[KeyQ]', { platform: 'mac', layoutMap }) // '⌘ A'
formatForDisplay('Mod+Q', { platform: 'mac', layoutMap }) // '⌘ Q'
```

Any object with `get(code): string | undefined` works. A `layoutMap` you pass wins over the loaded layout.

Use `keyLabels` for your own labels, keyed by physical code or by key name:

```ts
formatForDisplay('Mod+[KeyQ]', {
  platform: 'mac', layoutMap, keyLabels: { KeyQ: 'Action' },
}) // '⌘ Action'
```

`keyLabels` wins over a layout entry, which wins over the fallback label. Layout entries get normal letter casing and key symbols, and missing or empty entries fall back. All of these options affect display only.
