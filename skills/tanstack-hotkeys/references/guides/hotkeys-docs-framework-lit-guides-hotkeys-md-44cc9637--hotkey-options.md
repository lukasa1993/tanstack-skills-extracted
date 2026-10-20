# Hotkeys — Hotkey options

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.17.0`.

## Hotkey options

Pass options as the decorator's second argument, or the controller's fourth:

```ts
// Submit with Enter, even while focus is in a text field
@hotkey('Enter', { ignoreInputs: false })
submit() {}
```

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `true` | Whether the hotkey responds to key presses. See [Enable and disable hotkeys](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md#enable-and-disable-hotkeys). |
| `target` | `document` | Where the hotkey listens. See [Hotkey targets](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md#hotkey-targets). |
| `preventDefault` | `true` | Stops the browser's own action, such as the Save dialog for `Mod+S` |
| `stopPropagation` | `true` | Stops the key press from reaching other listeners |
| `ignoreInputs` | `'auto'` | Skips key presses that type in a text field or operate a focused control. See [Typing in inputs does not trigger shortcuts](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `eventType` | `'keydown'` | Fires on `'keydown'` or `'keyup'` |
| `capture` | `false` | Runs before the keyboard handlers of elements inside the target. See [Hotkeys run after the page's own handlers](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `requireReset` | `false` | Chords only. Fires once per press instead of again on each automatic repeat while the key is held. |
| `timeout` | `1000` | Sequences only. Milliseconds allowed between steps. |
| `conflictBehavior` | `'warn'` | What happens when the same hotkey is already registered. See [Handle duplicate hotkeys](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md#handle-duplicate-hotkeys). |
| `scope` | `'global'` | The scope the hotkey belongs to. See [Add scopes](./hotkeys-docs-framework-lit-quick-start-md-e9425977.md#source-hotkeys-docs-framework-lit-quick-start-md). |
| `platform` | Detected | The platform that decides what `Mod` means: `'mac'`, `'windows'`, or `'linux'`. Useful in tests. |
| `meta` | None | A name, a description, and a group. See [Describe hotkeys with `meta`](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md#describe-hotkeys-with-meta). |

The defaults suit most hotkeys. [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains why each one was chosen and when to change it. The [`HotkeyControllerOptions` reference](https://github.com/TanStack/hotkeys/blob/2172bfc6a4a50b4adb6f86c3f79b6eb3ae7a28b3/docs/framework/lit/reference/type-aliases/HotkeyControllerOptions.md) lists the types.

Lit has no provider for app-wide defaults, so pass options to each hotkey. To give several hotkeys the same options, share an options object. See [Share options](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md#share-options).

### Chord and sequence options

Most options apply to both kinds of hotkey. `requireReset` applies only to chords, and `timeout` only to sequences. The decorator's option types follow the hotkey you pass, so TypeScript rejects options for the other kind:

```ts
@hotkey('Escape', { requireReset: true }) // OK
close() {}

@hotkey(['G', 'G'], { timeout: 500 }) // OK
scrollToTop() {}

@hotkey('Escape', { timeout: 500 }) // Type error
cancel() {}
```

When the kind isn't known until runtime, such as a `Hotkey` loaded from settings, the decorator accepts only the options that both kinds share.
