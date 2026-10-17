# Hotkeys — The hotkey manager

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md) · Release-matched documentation · `@tanstack/hotkeys@0.15.1`.

## The hotkey manager

The manager is a shared singleton. The adapter owns registrations, not the manager itself. Do not destroy the singleton when a component unmounts.

```ts
import { getHotkeyManager } from '@tanstack/octane-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```

Try the [useHotkey example](https://github.com/TanStack/hotkeys/tree/2a5a38a89a05794de7b8bd85c7c57b6607f7e5e5/examples/octane/useHotkey), [useHotkeys example](https://github.com/TanStack/hotkeys/tree/2a5a38a89a05794de7b8bd85c7c57b6607f7e5e5/examples/octane/useHotkeys), and [kitchen sink](https://github.com/TanStack/hotkeys/tree/2a5a38a89a05794de7b8bd85c7c57b6607f7e5e5/examples/octane/kitchen-sink). See the [API reference](https://github.com/TanStack/hotkeys/blob/2a5a38a89a05794de7b8bd85c7c57b6607f7e5e5/docs/framework/octane/reference/index.md) for full signatures.
