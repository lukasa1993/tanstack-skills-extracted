# Sensible Defaults — `Mod` follows the platform

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.17.0`.

## `Mod` follows the platform

`Mod` is the platform's primary shortcut modifier: Command (`Meta`) on macOS and Control on Windows and Linux. Write `Mod+S` once and each user gets the save shortcut their operating system has trained them to use. The platform is detected from `navigator`. During server rendering, where there is no `navigator`, it is `linux`.

Hotkeys are stored in a canonical form, so equivalent spellings are the same binding. On Windows and Linux, `Control+S` and `ctrl+s` are stored as `Mod+S`. On macOS, `Control+S` remains `Control+S`, because Control is not the primary modifier there. This is why two spellings conflict on one platform and not on another.

Pass `platform: 'mac' | 'windows' | 'linux'` to override detection, for example in tests or to preview another platform's shortcuts.
