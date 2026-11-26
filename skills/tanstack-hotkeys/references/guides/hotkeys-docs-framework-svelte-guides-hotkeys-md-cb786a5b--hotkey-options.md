# Hotkeys — Hotkey options

[Guide and prerequisites](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Hotkey options

Pass options as the third argument:

```ts
// Submit with Enter, even while focus is in a text field
createHotkey('Enter', () => submit(), { ignoreInputs: false })
```

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `true` | Whether the hotkey fires. See [Enable and disable hotkeys](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md#enable-and-disable-hotkeys). |
| `target` | `document` | Where the hotkey listens: `document` or `window`. For an element, use an attachment. See [Hotkey targets](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md#hotkey-targets). |
| `preventDefault` | `true` | Prevents the browser's default action. `'always'` keeps blocking even while disabled or suspended. |
| `stopPropagation` | `true` | Stops the event from reaching outer listeners |
| `ignoreInputs` | `'auto'` | Skips keys in text fields and interactive controls. See [Typing in inputs](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `ignoreDefaultPrevented` | `false` | Skips events already prevented by another listener, such as a UI library overlay. See [Component libraries](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `eventType` | `'keydown'` | Fires on `'keydown'` or `'keyup'` |
| `capture` | `false` | Runs in the capture phase before widget handlers inside `target`. See [Event phase](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `requireReset` | `false` | Chords only. Fires once per press instead of repeating while held. |
| `timeout` | `1000` | Sequences only. Milliseconds allowed between steps. |
| `conflictBehavior` | `'warn'` | How duplicate registrations are handled. See [Handle duplicate hotkeys](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md#handle-duplicate-hotkeys). |
| `scope` | The nearest provider's scope | The [scope](./hotkeys-docs-framework-svelte-guides-hotkeys-provider-and-scopes-md-e8237f03.md#source-hotkeys-docs-framework-svelte-guides-hotkeys-provider-and-scopes-md) the hotkey belongs to |
| `platform` | Detected | Override `'mac'`, `'windows'`, or `'linux'` for `Mod` resolution. Useful in tests. |
| `meta` | None | Display metadata (`name`, `description`, `group`). See [Describe hotkeys with `meta`](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md#describe-hotkeys-with-meta). |

See [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) for why each default behaves the way it does, and the [`CreateHotkeyOptions` reference](https://github.com/TanStack/hotkeys/blob/fc48fc09f82cd285da5e0991948d604cec2a3263/docs/framework/svelte/reference/type-aliases/CreateHotkeyOptions.md) for type definitions.

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

The provider is optional. See [HotkeysProvider & Scopes](./hotkeys-docs-framework-svelte-guides-hotkeys-provider-and-scopes-md-e8237f03.md#source-hotkeys-docs-framework-svelte-guides-hotkeys-provider-and-scopes-md) for nested overrides and scope management.

### Chord and sequence options

`requireReset` applies only to chords, and `timeout` applies only to sequences. TypeScript enforces this per hotkey:

```ts
createHotkey('Escape', close, { requireReset: true }) // OK
createHotkey(['G', 'G'], scrollToTop, { timeout: 500 }) // OK
createHotkey('Escape', close, { timeout: 500 }) // Type error
```

When defaults apply to many hotkeys at once, `requireReset` affects only chords and `timeout` affects only sequences. If a hotkey's kind isn't known until runtime, such as a `Hotkey` loaded from user settings, only the options common to both kinds are accepted.
