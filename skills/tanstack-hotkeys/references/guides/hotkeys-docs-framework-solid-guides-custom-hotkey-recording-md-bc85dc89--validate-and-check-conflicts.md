# Custom Hotkey Recording — Validate and check conflicts

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-custom-hotkey-recording-md-bc85dc89.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Validate and check conflicts

### Reject hotkeys you don't want

Return `true` from `validate` to accept a recording, or `false` or an error string to reject it:

```tsx
createHotkeyRecorder({
  validate: (_hotkey, { parsedChord }) =>
    parsedChord.modifiers.length > 0 || 'Include a modifier.',
  onReject: ({ message }) => setError(message ?? 'Try another shortcut.'),
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

With `maxSteps: Infinity`, check `context.kind` before reading `parsedChord` or `parsedSequence` (both `validate` and `onRecord` receive the same `context`):

```tsx
createHotkeyRecorder({
  maxSteps: Infinity,
  validate: (_hotkey, context) =>
    context.kind === 'sequence' ||
    context.parsedChord.modifiers.length > 0 ||
    'A single chord needs a modifier.',
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

Rejected recordings keep the recorder active, and rejected sequences keep their captured `steps` so users can edit with `Backspace`.

### Save hotkeys that work on another platform

A recorded hotkey's modifiers mean the same keys on every platform when they are `Mod`, `Shift`, and `Alt`. A recorded character such as `@` follows the layout, so it can sit on a different key, while a bracketed code such as `[Slash]` stays on the same physical key. The recorder writes Command on macOS and Control elsewhere as `Mod`. The other two modifiers stay platform-specific: Control+S recorded on a Mac is `Control+S`, which on Windows is the same press as `Mod+S`, and the Windows key recorded on Windows is `Meta`, which on a Mac is Command.

If your app syncs hotkeys between machines, pick one rule:

- Store each hotkey with the platform it was recorded on, and use it only there. `context.platform` names it.
- Reject the platform-specific modifiers, so every saved hotkey's modifiers work on every platform:

```tsx
createHotkeyRecorder({
  validate: (_hotkey, { parsedChord, platform }) =>
    !(platform === 'mac' ? parsedChord.ctrl : parsedChord.meta) ||
    'Use Ctrl or Cmd, Shift, and Alt.',
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

### Check for conflicts

Pass `detectConflicts: true` to reject bindings already registered on the page:

```tsx
createHotkeyRecorder({
  detectConflicts: true,
  onReject: ({ reason }) => {
    if (reason === 'conflict') setError('That shortcut is already in use.')
  },
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

By default, `detectConflicts` checks every enabled `keydown` registration across all scopes. A recorded chord conflicts with a sequence that starts with it, and a recorded sequence conflicts with a chord equal to its first step (so `['G', 'H']` and `['G', 'S']` do not conflict). It compares underlying keypresses so `Shift+[Slash]`, recorded by code, catches `?`. Pass an options object to narrow the check:

```tsx
detectConflicts: {
  excludeIds: [registration.id], // Ignore the registration being edited
  target: panelElement, // Check only overlapping elements (pass scope: 'all' instead to check every target)
  eventType: 'keyup',
  includeDisabled: true,
  exclude: (registration) => registration.options.scope === 'vim', // Skip a hotkey scope
}
```

> [!NOTE]
> Live conflict checks inspect only mounted registrations. If you use [App Hotkeys](./hotkeys-docs-framework-solid-guides-app-hotkeys-md-acd9069d.md#source-hotkeys-docs-framework-solid-guides-app-hotkeys-md), use `findConflicts` inside `validate` so shortcuts on unmounted routes are checked too.

`onReject` doesn't generate user-facing copy. Map `reason` (along with optional `hotkey`, `conflicts`, and `message`) to your own UI strings:

| `reason` | When it happens |
| --- | --- |
| `'conflict'` | Collides with an active registration (`conflicts` lists the matches) |
| `'validation'` | Rejected by your `validate` callback (`message` holds your return string) |
| `'whitespace'` | User pressed a whitespace character that can't be recorded |
| `'missing-code'` | Key event had no physical `code` when needed |
| `'alt-graph'` | `AltGr` combination that typed no character, or, with `recordBy: 'code'`, any other. On Windows, the recorder treats `AltGr` with a key it doesn't change, such as `Home`, as Control+Alt, which no mode rejects. It records `Mod+Alt+Home`, or `Mod+Alt+[Home]` with `recordBy: 'code'` |

`findHotkeyConflicts(hotkey, options)` runs the same conflict check outside a recording and returns `HotkeyConflict` objects (`{ registration }`) wrapping matching [registration views](./hotkeys-docs-framework-solid-guides-cheat-sheet-ui-helpers-md-db8cc71d.md#source-hotkeys-docs-framework-solid-guides-cheat-sheet-ui-helpers-md).
