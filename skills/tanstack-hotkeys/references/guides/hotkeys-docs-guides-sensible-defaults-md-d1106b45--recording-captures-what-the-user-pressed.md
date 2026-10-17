# Sensible Defaults — Recording captures what the user pressed

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.15.1`.

## Recording captures what the user pressed

The hotkey recorder records physical key positions by default (`recordBy: 'code'`). A modifier can change which character a key types (Option+S types `ß`, and Shift+1 types `!`), but its position does not change. Recording the position saves the key the user pressed, regardless of what it typed. Set `recordBy: 'key'` to record characters instead.

While recording:

- **Escape** cancels.
- **Backspace** or **Delete** removes the last step, or clears an empty recording.
- **Enter** commits a multi-step recording before it reaches `maxSteps`.
- **Registered hotkeys are paused**, so pressing `Mod+S` to record it does not also save.
- **Typing in inputs passes through**, so other fields on the page keep working. Escape still cancels.
- **AltGr is rejected** for position recordings, because it types characters rather than shortcuts.
