# Hotkeys — Hotkey options

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md) · Release-matched documentation · `@tanstack/hotkeys@0.16.0`.

## Hotkey options

Pass options as the third argument:

```ts
// Submit with Enter, even while focus is in a text field
this.hotkeys.createHotkey('Enter', () => submit(), { ignoreInputs: false })
```

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `true` | Whether the hotkey responds to key presses. See [Enable and disable hotkeys](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md#enable-and-disable-hotkeys). |
| `target` | `document` | Where the hotkey listens. See [Hotkey targets](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md#hotkey-targets). |
| `preventDefault` | `true` | Stops the browser's own action, such as the Save dialog for `Mod+S` |
| `stopPropagation` | `true` | Stops the key press from reaching other listeners |
| `ignoreInputs` | `'auto'` | Skips key presses that type in a text field or operate a focused control. See [Typing in inputs does not trigger shortcuts](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `eventType` | `'keydown'` | Fires on `'keydown'` or `'keyup'` |
| `capture` | `false` | Runs before the keyboard handlers of elements inside the target. See [Hotkeys run after the page's own handlers](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `requireReset` | `false` | Chords only. Fires once per press instead of again on each automatic repeat while the key is held. |
| `timeout` | `1000` | Sequences only. Milliseconds allowed between steps. |
| `conflictBehavior` | `'warn'` | What happens when the same hotkey is already registered. See [Handle duplicate hotkeys](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md#handle-duplicate-hotkeys). |
| `scope` | `'global'` | The scope the hotkey belongs to. See [Add defaults and scopes](./hotkeys-docs-framework-alpine-quick-start-md-3845b066.md#source-hotkeys-docs-framework-alpine-quick-start-md). |
| `platform` | Detected | The platform that decides what `Mod` means: `'mac'`, `'windows'`, or `'linux'`. Useful in tests. |
| `meta` | None | A name, a description, and a group. See [Describe hotkeys with `meta`](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md#describe-hotkeys-with-meta). |

The defaults suit most hotkeys. [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains why each one was chosen and when to change it. The [`AlpineHotkeyCommonOptions` reference](https://github.com/TanStack/hotkeys/blob/ad56a4b0dbf3c34d8552eca2cc88c5c7000d520a/docs/framework/alpine/reference/type-aliases/AlpineHotkeyCommonOptions.md) lists the types.

To change a default for the hotkeys an owner creates, pass default options to `createHotkeysScope`. Options passed to a function override the owner's defaults. Share the defaults object between components that need the same defaults:

```ts
const hotkeyDefaults = { hotkey: { requireReset: true, timeout: 1500 } }

Alpine.data('editor', () => ({
  hotkeys: createHotkeysScope(hotkeyDefaults),
  // ...
}))
```

Without defaults, every hotkey uses the built-in defaults in the table.

### Chord and sequence options

Most options apply to both kinds of hotkey. `requireReset` applies only to chords, and `timeout` only to sequences. The option types follow the hotkey you pass, so TypeScript rejects options for the other kind:

```ts
this.hotkeys.createHotkey('Escape', close, { requireReset: true }) // OK
this.hotkeys.createHotkey(['G', 'G'], scrollToTop, { timeout: 500 }) // OK
this.hotkeys.createHotkey('Escape', close, { timeout: 500 }) // Type error
```

Options that apply to many hotkeys at once, such as an owner's defaults, apply each of these to the matching kind only. In the defaults example above, `requireReset` affects chords, and `timeout` affects sequences.

When the kind isn't known until runtime, such as a `Hotkey` loaded from settings, the function accepts only the options that both kinds share.
