# Sensible Defaults — Display matches the platform

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.20.0`.

## Display matches the platform

`formatForDisplay` uses each platform's conventions. On macOS, `Mod+Shift+S` displays as `⇧ ⌘ S`. On Windows and Linux, it displays as `Ctrl+Shift+S`. Sequence steps are separated by a space: `G G`.

Pass `useSymbols: false` for text labels on macOS, or `keyLabels` to rename individual keys.
