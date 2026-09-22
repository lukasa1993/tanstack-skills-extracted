# Hotkeys — Overview

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.9.0`.

The `@hotkey` decorator is the primary way to register keyboard shortcuts in Lit applications. It binds a hotkey to a class method, automatically registering when the element connects to the DOM and unregistering when it disconnects. For more dynamic use cases, the `HotkeyController` provides imperative control over hotkey registration.

Both approaches wrap the singleton `HotkeyManager` with automatic lifecycle management tied to Lit's `connectedCallback` / `disconnectedCallback`.
