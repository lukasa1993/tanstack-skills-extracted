# Formatting Display — Supply layout labels

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-formatting-display-md-31421e77.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.0`.

## Supply layout labels

A position, such as `[KeyQ]`, gets a fallback label that may differ from the character printed on the user's keyboard. Pass an already-resolved `layoutMap` to label positions for a known layout:

```ts
const layoutMap = new Map([['KeyQ', 'a']])

formatForDisplay('Mod+[KeyQ]', { platform: 'mac', layoutMap }) // '⌘ A'
formatForDisplay('Mod+Q', { platform: 'mac', layoutMap }) // '⌘ Q'
```

Any object with `get(code): string | undefined` works, including a browser `KeyboardLayoutMap`. Formatting stays synchronous. Your app owns loading, errors, and refreshing the map: render fallback labels while it loads, then pass the resolved map on the next render. The library never requests it. Hotkeys that follow characters ignore `layoutMap`.

Use `keyLabels` for your own labels, keyed by physical code or by key name:

```ts
formatForDisplay('Mod+[KeyQ]', {
  platform: 'mac', layoutMap, keyLabels: { KeyQ: 'Action' },
}) // '⌘ Action'
```

`keyLabels` wins over a layout entry, which wins over the fallback label. Layout entries get normal letter casing and key symbols, and missing or empty entries fall back. All of these options affect display only.

The browser's `KeyboardLayoutMap` exists only in the browser, and it loads after the page renders. In a server-rendered app, render fallback labels first and pass the map once it loads, as above. The first render then matches the server's HTML. `keyLabels` works anywhere, including on the server.
