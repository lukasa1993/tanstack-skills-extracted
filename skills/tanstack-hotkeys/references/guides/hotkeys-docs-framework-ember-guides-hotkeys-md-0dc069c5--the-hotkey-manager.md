# Hotkeys — The hotkey manager

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md) · Release-matched documentation · `@tanstack/hotkeys@0.14.0`.

## The hotkey manager

The manager is a shared singleton. The adapter owns registrations, not the manager itself. Do not destroy the singleton when a component unmounts.

```ts
import { getHotkeyManager } from '@tanstack/ember-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```

Try the [useHotkey example](https://github.com/TanStack/hotkeys/tree/5ce675b3ccced6ec5ac940ba5a66bff85350bf4c/examples/ember/useHotkey), [useHotkeys example](https://github.com/TanStack/hotkeys/tree/5ce675b3ccced6ec5ac940ba5a66bff85350bf4c/examples/ember/useHotkeys), and [kitchen sink](https://github.com/TanStack/hotkeys/tree/5ce675b3ccced6ec5ac940ba5a66bff85350bf4c/examples/ember/kitchen-sink). See the [API reference](https://github.com/TanStack/hotkeys/blob/5ce675b3ccced6ec5ac940ba5a66bff85350bf4c/docs/framework/ember/reference/index.md) for full signatures.
