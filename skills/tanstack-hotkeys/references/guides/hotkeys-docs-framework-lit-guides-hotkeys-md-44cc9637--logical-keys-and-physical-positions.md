# Hotkeys — Logical keys and physical positions

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.9.0`.

## Logical keys and physical positions

Use a logical binding when the shortcut should follow the character on the active layout. Use a physical binding when it should follow a keyboard position:

| Binding | Identity checked |
| --- | --- |
| `Mod+S` or `{ key: 'S', mod: true }` | Logical `event.key`, with conservative code fallback |
| `Mod+[KeyS]` or `{ code: 'KeyS', mod: true }` | Exact `event.code` |
| `Enter` | Logical Enter, including numpad Enter |
| `[Enter]` / `[NumpadEnter]` | Separate physical Enter positions |

Every physical code uses brackets in strings, including names shared with logical keys such as `[Enter]` and `[F13]`. Supported codes are type-safe and available in autocomplete. Do not put a bracketed code in an object's `key` field; use `code`. A binding has either `key` or `code`, never both.

On a layout where the `KeyQ` position produces `a`, `A` follows that character and `[KeyQ]` follows the position. Logical ASCII letters remain layout-aware; conservative physical fallback helps with transformed output such as macOS Option keys. Exact matches take priority over weaker fallbacks among eligible registrations on the same target.

Callbacks expose the same distinction in `context.parsedHotkey`: check `parsed.code !== undefined` before reading its physical identity. Use `formatForDisplay` for labels; stored physical strings retain their brackets.
