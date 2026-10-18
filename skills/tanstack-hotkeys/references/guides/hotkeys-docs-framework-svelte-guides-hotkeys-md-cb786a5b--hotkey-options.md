# Hotkeys — Hotkey options

[Guide and prerequisites](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md) · Release-matched documentation · `@tanstack/hotkeys@0.16.0`.

## Hotkey options

Pass options as the third argument:

```ts
// Submit with Enter, even while focus is in a text field
createHotkey('Enter', () => submit(), { ignoreInputs: false })
```

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `true` | Whether the hotkey responds to key presses. See [Enable and disable hotkeys](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md#enable-and-disable-hotkeys). |
| `target` | `document` | Where the hotkey listens: `document` or `window`. For an element, use an attachment. See [Hotkey targets](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md#hotkey-targets). |
| `preventDefault` | `true` | Stops the browser's own action, such as the Save dialog for `Mod+S` |
| `stopPropagation` | `true` | Stops the key press from reaching other listeners |
| `ignoreInputs` | `'auto'` | Skips key presses that type in a text field or operate a focused control. See [Typing in inputs does not trigger shortcuts](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `eventType` | `'keydown'` | Fires on `'keydown'` or `'keyup'` |
| `capture` | `false` | Runs before the keyboard handlers of elements inside the target. See [Hotkeys run after the page's own handlers](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `requireReset` | `false` | Chords only. Fires once per press instead of again on each automatic repeat while the key is held. |
| `timeout` | `1000` | Sequences only. Milliseconds allowed between steps. |
| `conflictBehavior` | `'warn'` | What happens when the same hotkey is already registered. See [Handle duplicate hotkeys](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md#handle-duplicate-hotkeys). |
| `scope` | The nearest provider's scope | The [scope](./hotkeys-docs-framework-svelte-guides-hotkeys-provider-and-scopes-md-e8237f03.md#source-hotkeys-docs-framework-svelte-guides-hotkeys-provider-and-scopes-md) the hotkey belongs to |
| `platform` | Detected | The platform that decides what `Mod` means: `'mac'`, `'windows'`, or `'linux'`. Useful in tests. |
| `meta` | None | A name, a description, and a group. See [Describe hotkeys with `meta`](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md#describe-hotkeys-with-meta). |

The defaults suit most hotkeys. [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains why each one was chosen and when to change it. The [`CreateHotkeyOptions` reference](https://github.com/TanStack/hotkeys/blob/ad56a4b0dbf3c34d8552eca2cc88c5c7000d520a/docs/framework/svelte/reference/type-aliases/CreateHotkeyOptions.md) lists the types.

To change a default for every hotkey in your app, wrap it in a `HotkeysProvider` with `defaultOptions`. Options passed to a function override the provider's defaults:

```svelte
<!-- App.svelte -->
<script lang="ts">
  import { HotkeysProvider } from '@tanstack/svelte-hotkeys'
  import Editor from './Editor.svelte'
</script>

<HotkeysProvider
  defaultOptions={{ hotkey: { requireReset: true, timeout: 1500 } }}
>
  <Editor />
</HotkeysProvider>
```

The provider is optional. Without one, every hotkey uses the built-in defaults in the table. See [HotkeysProvider and Scopes](./hotkeys-docs-framework-svelte-guides-hotkeys-provider-and-scopes-md-e8237f03.md#source-hotkeys-docs-framework-svelte-guides-hotkeys-provider-and-scopes-md) for nested defaults and for grouping hotkeys into scopes.

### Chord and sequence options

Most options apply to both kinds of hotkey. `requireReset` applies only to chords, and `timeout` only to sequences. The option types follow the hotkey you pass, so TypeScript rejects options for the other kind:

```ts
createHotkey('Escape', close, { requireReset: true }) // OK
createHotkey(['G', 'G'], scrollToTop, { timeout: 500 }) // OK
createHotkey('Escape', close, { timeout: 500 }) // Type error
```

Options that apply to many hotkeys at once, such as provider defaults, apply each of these to the matching kind only. In the provider example above, `requireReset` affects chords, and `timeout` affects sequences.

When the kind isn't known until runtime, such as a `Hotkey` loaded from settings, the function accepts only the options that both kinds share.
