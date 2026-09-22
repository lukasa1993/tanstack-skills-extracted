# Hotkeys — Choosing between decorator and controller

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.9.0`.

## Choosing between decorator and controller

| | `@hotkey` Decorator | `HotkeyController` |
|---|---|---|
| **Best for** | Static, declarative method binding | Dynamic hotkeys, programmatic control |
| **Registration** | Automatic via `connectedCallback` | Automatic via `hostConnected` |
| **Cleanup** | Automatic via `disconnectedCallback` | Automatic via `hostDisconnected` |
| **Dynamic hotkeys** | No (hotkey is fixed at decoration time) | Yes (can construct hotkey at runtime) |
| **Callback binding** | Bound to the host element automatically | Bound to the host element automatically |

Use the `@hotkey` decorator for the common case of binding a static shortcut to a method. Use `HotkeyController` when you need to construct the hotkey string dynamically or manage registration imperatively.
