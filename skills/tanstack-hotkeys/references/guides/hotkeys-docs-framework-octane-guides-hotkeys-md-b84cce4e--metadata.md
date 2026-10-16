# Hotkeys — Metadata

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md) · Release-matched documentation · `@tanstack/hotkeys@0.14.0`.

## Metadata

Attach `meta.name`, `meta.description`, and `meta.group` for a shortcut palette or help panel. Metadata does not change matching, enabled state, or target scope. Extend `HotkeyMeta` through declaration merging for application-specific fields.

```ts
import '@tanstack/hotkeys'

declare module '@tanstack/hotkeys' {
	interface HotkeyMeta {
		icon?: string
	}
}
```
