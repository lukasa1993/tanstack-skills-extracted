# Formatting Display — Format outside a component

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-formatting-display-md-60ef242e.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Format outside a component

`useFormatForDisplay` is a composable, so call it in a component's `setup`. Some code that builds labels isn't a component, such as a test or a plain module. There, call the plain `formatForDisplay` function and pass the platform yourself:

```ts
import { formatForDisplay } from '@tanstack/vue-hotkeys'

formatForDisplay('Mod+S', { platform }) // '⌘ S' when platform is 'mac'
```

The plain function takes the same options as the function from the composable. It doesn't read the provider, and it uses only the `layoutMap` you pass. Without a `platform`, it detects one in the browser and uses `'linux'` on a server. To give it the user's layout, call `loadKeyboardLayout()` in the browser, and read the layout from `getKeyboardLayoutStore()`.

> [!NOTE]
> `formatForDisplay` is marked `@deprecated` so editor autocomplete nudges component code toward `useFormatForDisplay`. Outside components, calling it directly is expected.

For `aria-keyshortcuts` outside a component, call `formatForAria` directly with `platform` and an optional `layoutMap`. For example, `formatForAria('Mod+S', { platform: 'mac' })` returns `'Meta+S'`. Like `formatForDisplay`, the plain export is marked `@deprecated`, so editors point component code to the adapter's formatter.
