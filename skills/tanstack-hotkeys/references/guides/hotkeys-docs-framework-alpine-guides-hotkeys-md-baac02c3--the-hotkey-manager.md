# Hotkeys — The hotkey manager

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md) · Release-matched documentation · `@tanstack/hotkeys@0.15.1`.

## The hotkey manager

The manager is a shared singleton. The adapter owns registrations, not the manager itself. Do not destroy the singleton when a component unmounts.

```ts
import { getHotkeyManager } from '@tanstack/alpine-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```

Try the [createHotkey example](https://github.com/TanStack/hotkeys/tree/2a5a38a89a05794de7b8bd85c7c57b6607f7e5e5/examples/alpine/createHotkey), [createHotkeys example](https://github.com/TanStack/hotkeys/tree/2a5a38a89a05794de7b8bd85c7c57b6607f7e5e5/examples/alpine/createHotkeys), and [kitchen sink](https://github.com/TanStack/hotkeys/tree/2a5a38a89a05794de7b8bd85c7c57b6607f7e5e5/examples/alpine/kitchen-sink). See the [API reference](https://github.com/TanStack/hotkeys/blob/2a5a38a89a05794de7b8bd85c7c57b6607f7e5e5/docs/framework/alpine/reference/index.md) for full signatures.
