# Hotkeys — The hotkey manager

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md) · Release-matched documentation · `@tanstack/hotkeys@0.11.0`.

## The hotkey manager

The manager is a shared singleton. The adapter owns registrations, not the manager itself. Do not destroy the singleton when a component unmounts.

```ts
import { getHotkeyManager } from '@tanstack/ember-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```

Try the [useHotkey example](https://github.com/TanStack/hotkeys/tree/748379f3ac2df52b7e5f2aae9cceed2ce1bea78f/examples/ember/useHotkey), [useHotkeys example](https://github.com/TanStack/hotkeys/tree/748379f3ac2df52b7e5f2aae9cceed2ce1bea78f/examples/ember/useHotkeys), and [kitchen sink](https://github.com/TanStack/hotkeys/tree/748379f3ac2df52b7e5f2aae9cceed2ce1bea78f/examples/ember/kitchen-sink). See the [API reference](https://github.com/TanStack/hotkeys/blob/748379f3ac2df52b7e5f2aae9cceed2ce1bea78f/docs/framework/ember/reference/index.md) for full signatures.
