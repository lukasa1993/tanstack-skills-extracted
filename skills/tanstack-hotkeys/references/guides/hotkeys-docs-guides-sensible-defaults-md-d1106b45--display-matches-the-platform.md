# Sensible Defaults — Display matches the platform

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Display matches the platform

Label formatters like `useFormatForDisplay` match OS conventions. `Mod+Shift+S` becomes `⇧ ⌘ S` on macOS and `Ctrl+Shift+S` on Windows and Linux, and sequence steps join with spaces (`G G`). Pass `useSymbols: false` for text names on macOS, or `keyLabels` to rename individual keys.
