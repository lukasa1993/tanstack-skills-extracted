# Sensible Defaults — `Mod` follows the platform

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## `Mod` follows the platform

`Mod` resolves to the platform's primary shortcut modifier: Command (`Meta`) on macOS, and Control on Windows and Linux. A single `Mod+S` binding adapts to each user's operating system automatically.

- **Platform detection.** Detected from `navigator` in the browser, defaulting to `'linux'` during server rendering where `navigator` doesn't exist. Pass `platform: 'mac' | 'windows' | 'linux'` to override detection in tests or when previewing another OS.
- **Canonical storage.** Hotkeys normalize to canonical strings. On Windows and Linux, `Control+S` and `ctrl+s` store as `Mod+S`. On macOS, `Control+S` stays `Control+S` because Control isn't the primary modifier. That's why `Mod+S` and `Control+S` collide on Windows and Linux, not on macOS.
