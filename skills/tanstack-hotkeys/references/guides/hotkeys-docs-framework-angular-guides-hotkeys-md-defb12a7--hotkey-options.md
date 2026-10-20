# Hotkeys — Hotkey options

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md) · Release-matched documentation · `@tanstack/hotkeys@0.17.0`.

## Hotkey options

Pass options as the third argument:

```ts
// Submit with Enter, even while focus is in a text field
injectHotkey('Enter', () => this.submit(), { ignoreInputs: false })
```

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `true` | Whether the hotkey responds to key presses. See [Enable and disable hotkeys](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md#enable-and-disable-hotkeys). |
| `target` | `document` | Where the hotkey listens. See [Hotkey targets](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md#hotkey-targets). |
| `preventDefault` | `true` | Stops the browser's own action, such as the Save dialog for `Mod+S` |
| `stopPropagation` | `true` | Stops the key press from reaching other listeners |
| `ignoreInputs` | `'auto'` | Skips key presses that type in a text field or operate a focused control. See [Typing in inputs does not trigger shortcuts](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `eventType` | `'keydown'` | Fires on `'keydown'` or `'keyup'` |
| `capture` | `false` | Runs before the keyboard handlers of elements inside the target. See [Hotkeys run after the page's own handlers](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `requireReset` | `false` | Chords only. Fires once per press instead of again on each automatic repeat while the key is held. |
| `timeout` | `1000` | Sequences only. Milliseconds allowed between steps. |
| `conflictBehavior` | `'warn'` | What happens when the same hotkey is already registered. See [Handle duplicate hotkeys](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md#handle-duplicate-hotkeys). |
| `scope` | The nearest provider's scope | The [scope](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md#source-hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md) the hotkey belongs to |
| `platform` | Detected | The platform that decides what `Mod` means: `'mac'`, `'windows'`, or `'linux'`. Useful in tests. |
| `meta` | None | A name, a description, and a group. See [Describe hotkeys with `meta`](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md#describe-hotkeys-with-meta). |

The defaults suit most hotkeys. [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains why each one was chosen and when to change it. The [`InjectHotkeyOptions` reference](https://github.com/TanStack/hotkeys/blob/2172bfc6a4a50b4adb6f86c3f79b6eb3ae7a28b3/docs/framework/angular/reference/type-aliases/InjectHotkeyOptions.md) lists the types.

To change a default for every hotkey in your app, add `provideHotkeys` with `defaultOptions` to your application config. Options passed to `injectHotkey` override the provided defaults:

```ts
import { ApplicationConfig } from '@angular/core'
import { provideHotkeys } from '@tanstack/angular-hotkeys'

export const appConfig: ApplicationConfig = {
  providers: [
    provideHotkeys({
      defaultOptions: { hotkey: { requireReset: true, timeout: 1500 } },
    }),
  ],
}
```

The provider is optional. Without one, every hotkey uses the built-in defaults in the table. See [provideHotkeys and Scopes](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md#source-hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md) for nested defaults and for grouping hotkeys into scopes.

### Chord and sequence options

Most options apply to both kinds of hotkey. `requireReset` applies only to chords, and `timeout` only to sequences. The option types follow the hotkey you pass, so TypeScript rejects options for the other kind:

```ts
injectHotkey('Escape', close, { requireReset: true }) // OK
injectHotkey(['G', 'G'], scrollToTop, { timeout: 500 }) // OK
injectHotkey('Escape', close, { timeout: 500 }) // Type error
```

Options that apply to many hotkeys at once, such as provided defaults, apply each of these to the matching kind only. In the provider example above, `requireReset` affects chords, and `timeout` affects sequences.

When the kind isn't known until runtime, such as a `Hotkey` loaded from settings, `injectHotkey` accepts only the options that both kinds share.
