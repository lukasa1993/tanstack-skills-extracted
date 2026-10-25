# Lit Hotkeys

<a id="source-tanstack-lit-hotkeys"></a>

Published skill · `@tanstack/lit-hotkeys@0.18.0`.

[Topic index](../foundations.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Hotkeys Core](./tanstack-hotkeys-core-62518e1a.md).

# TanStack Hotkeys in Lit

Before starting, load the `@tanstack/hotkeys#hotkeys-core` skill (`npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core`).

```ts no-check
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { HotkeyController, hotkey } from '@tanstack/lit-hotkeys'

@customElement('my-editor')
export class MyEditor extends LitElement {
  @state() private dirty = false

  @hotkey('Mod+K')
  openSearch() {}

  constructor() {
    super()
    this.addController(
      new HotkeyController(
        this,
        'Mod+S',
        () => this.save(),
        () => ({ enabled: this.dirty }),
      ),
    )
  }

  save() {}

  render() {
    return html`<textarea @input=${() => (this.dirty = true)}></textarea>`
  }
}
```

## API

| API                                                      | What it's for                                                                                                                                                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@hotkey(hotkey, options?)`                              | Run the decorated method when the hotkey fires, with options fixed when the class is defined.                                                                                                     |
| `new HotkeyController(host, hotkey, callback, options?)` | Register a hotkey whose options can change; add it with `this.addController(...)`.                                                                                                                |
| `provideAppHotkeys(appHotkeys, options?)`                | Declare app hotkeys and load the user's custom hotkeys once at startup, since Lit has no provider.                                                                                                |
| `getHotkeyManager().activateScope(scope, options?)`      | Turn on a scope, such as an exclusive one for a dialog; it returns the function that turns the scope off.                                                                                         |
| `new AppHotkeysController(host)`                         | Read `appHotkeys`, the cheat sheet `list`, and `customHotkeys`, and change custom hotkeys with `setCustomHotkey`, `resetCustomHotkey`, and `findConflicts`.                                       |
| `new HotkeyRecorderController(host, options)`            | Record a chord or sequence the user presses, for a settings screen.                                                                                                                               |
| `new HotkeyRegistrationsController(host)`                | Read `.hotkeys`, every registered hotkey with its options, `meta`, and `status` (whether it's enabled and in an active scope).                                                                    |
| `new HotkeyScopesStateController(host)`                  | Read `.value`, the active scopes and the exclusive scope that owns the keyboard.                                                                                                                  |
| `new HotkeyHintController(host, hotkey, options?)`       | Read `.value`, whether held modifiers should reveal a shortcut's hint. False unless a registration of the hotkey can fire: enabled, in an active scope, and with focus inside its element target. |
| `new KeyHoldController(host, key)`                       | Read `.value`, whether one key is held.                                                                                                                                                           |
| `new HeldKeysController(host)`                           | Read `.value`, every key that's held right now.                                                                                                                                                   |
| `new HeldKeyCodesController(host)`                       | Read `.value`, which maps each held key to its physical `event.code`.                                                                                                                             |

The package also re-exports `@tanstack/hotkeys`, such as `formatForDisplay`, `matchesKeyboardEvent`, and `defineAppHotkeys`.

## Pitfalls

- **Add `HotkeyController` to its host.** It is the only controller that doesn't add itself, so without `this.addController(...)` it never registers.
- **`@hotkey` is a legacy decorator.** It needs `"experimentalDecorators": true` and `"useDefineForClassFields": false`; with standard decorators it fails with TS1241. Use `HotkeyController` in that case.
- **Decorator options are fixed when the class is defined.** For options that read instance state, or a `target` from a `ref`, use `HotkeyController` with an options function, which reruns after each update.
- **Release every scope you activate.** Lit has no provider, so a dialog activates its scope in `connectedCallback` with `this.release = getHotkeyManager().activateScope('dialog-1', { exclusive: true })` and calls `this.release()` in `disconnectedCallback`. A forgotten release keeps every other hotkey suspended. Give each open dialog its own scope name.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Lit](../assets/tanstack-lit-hotkeys/references/app-hotkeys.md).

## API discovery and docs

Signatures: `node_modules/@tanstack/lit-hotkeys/dist/controllers/*.d.ts` and `dist/decorators/*.d.ts`. Guides: `https://tanstack.com/hotkeys/latest/docs/framework/lit/guides/<page>.md`, such as `hotkeys` or `app-hotkeys`.
