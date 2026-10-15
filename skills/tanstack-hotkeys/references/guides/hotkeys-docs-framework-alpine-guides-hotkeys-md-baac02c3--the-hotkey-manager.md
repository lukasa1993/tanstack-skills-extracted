# Hotkeys — The hotkey manager

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md) · Release-matched documentation · `@tanstack/hotkeys@0.12.0`.

## The hotkey manager

The manager is a shared singleton. The adapter owns registrations, not the manager itself. Do not destroy the singleton when a component unmounts.

```ts
import { getHotkeyManager } from '@tanstack/alpine-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```

Try the [createHotkey example](https://github.com/TanStack/hotkeys/tree/72f5d4ce8e7a0f1c9593a614fc3482dd0c3da393/examples/alpine/createHotkey), [createHotkeys example](https://github.com/TanStack/hotkeys/tree/72f5d4ce8e7a0f1c9593a614fc3482dd0c3da393/examples/alpine/createHotkeys), and [kitchen sink](https://github.com/TanStack/hotkeys/tree/72f5d4ce8e7a0f1c9593a614fc3482dd0c3da393/examples/alpine/kitchen-sink). See the [API reference](https://github.com/TanStack/hotkeys/blob/72f5d4ce8e7a0f1c9593a614fc3482dd0c3da393/docs/framework/alpine/reference/index.md) for full signatures.
