# Hotkeys — Current callbacks and automatic cleanup

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md) · Release-matched documentation · `@tanstack/hotkeys@0.11.0`.

## Current callbacks and automatic cleanup

Create one scope for each Alpine component. Register shortcuts in `init()` so getters and callbacks read the reactive component instance. Call `scope.destroy()` from the component's `destroy()` method. Destruction releases registrations, effects, Store subscriptions, and active recorders. Do not reuse a destroyed scope.

Pass getters for bindings and options that can change. A value such as `{ enabled: this.enabled }` captures the value at registration time; `() => ({ enabled: this.enabled })` follows Alpine state. State readers return an object with a reactive `.value` getter. Read it in a template or an Alpine effect instead of destructuring it once.
