# Hotkeys — Metadata

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md) · Release-matched documentation · `@tanstack/hotkeys@0.11.0`.

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
