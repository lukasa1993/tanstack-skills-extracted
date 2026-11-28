# Formatting Display — Format outside a component

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-formatting-display-md-fadfd537.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Format outside a component

`createFormatForDisplay` is a primitive, so it can't run in a test or a plain module. Call `formatForDisplay` directly and pass `platform` yourself:

```ts
import { formatForDisplay } from '@tanstack/solid-hotkeys'

formatForDisplay('Mod+S', { platform }) // '⌘ S' when platform is 'mac'
```

`formatForDisplay` doesn't read `HotkeysProvider` and uses only the `layoutMap` you pass. Without a `platform`, it detects one in the browser and uses `'linux'` on a server. To feed it the browser layout outside Solid, call `loadKeyboardLayout()` and read `getKeyboardLayoutStore()`.

> [!NOTE]
> `formatForDisplay` is marked `@deprecated` on the Solid package so editor autocomplete nudges component code toward `createFormatForDisplay()`. Outside components, calling it directly is expected.

For `aria-keyshortcuts` outside a component, call `formatForAria` directly with `platform` and an optional `layoutMap`. For example, `formatForAria('Mod+S', { platform: 'mac' })` returns `'Meta+S'`. Like `formatForDisplay`, the plain export is marked `@deprecated`, so editors point component code to the adapter's formatter.
