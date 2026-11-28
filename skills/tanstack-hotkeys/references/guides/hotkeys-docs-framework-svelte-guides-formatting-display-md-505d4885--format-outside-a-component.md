# Formatting Display — Format outside a component

[Guide and prerequisites](./hotkeys-docs-framework-svelte-guides-formatting-display-md-505d4885.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Format outside a component

`getFormatForDisplay` reads the provider from context, so call it while a component initializes. Some code that builds labels isn't a component, such as a SvelteKit `load` function, a test, or a plain module. There, call the plain `formatForDisplay` function and pass the platform yourself:

```ts
import { formatForDisplay } from '@tanstack/svelte-hotkeys'

formatForDisplay('Mod+S', { platform }) // '⌘ S' when platform is 'mac'
```

The plain function takes the same options as the function from `getFormatForDisplay`. It doesn't read the provider, and it uses only the `layoutMap` you pass. Without a `platform`, it detects one in the browser and uses `'linux'` on a server. To give it the user's layout, call `loadKeyboardLayout()` in the browser, and read the layout from `getKeyboardLayoutStore()`.

> [!NOTE]
> `formatForDisplay` is marked `@deprecated` so editor autocomplete nudges component code toward `getFormatForDisplay`. Outside components, calling it directly is expected.

For `aria-keyshortcuts` outside a component, call `formatForAria` directly with `platform` and an optional `layoutMap`. For example, `formatForAria('Mod+S', { platform: 'mac' })` returns `'Meta+S'`. Like `formatForDisplay`, the plain export is marked `@deprecated`, so editors point component code to the adapter's formatter.
