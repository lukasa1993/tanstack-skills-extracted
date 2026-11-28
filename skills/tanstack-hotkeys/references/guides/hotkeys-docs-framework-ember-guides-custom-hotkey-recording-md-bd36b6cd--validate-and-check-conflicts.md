# Custom Hotkey Recording — Validate and check conflicts

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-custom-hotkey-recording-md-bd36b6cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Validate and check conflicts

### Reject hotkeys you don't want

Pass `validate` to accept or reject each recording before it commits. Return `true` to accept, or `false` or a message to reject:

```ts
recorder = useHotkeyRecorder(this, {
  validate: (_hotkey, { parsedChord }) =>
    parsedChord.modifiers.length > 0 || 'Include a modifier.',
  onReject: ({ message }) => setError(message ?? 'Try another shortcut.'),
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

The second argument has the `event` that recorded the chord and `parsedChord`, with `Mod` resolved. `onRecord` receives the same second argument. With `maxSteps: Infinity`, a recording can be a chord or a sequence, so check `kind` first. A sequence's context has `events` and `parsedSequence`, with one entry per step:

```ts
recorder = useHotkeyRecorder(this, {
  maxSteps: Infinity,
  validate: (_hotkey, context) =>
    context.kind === 'sequence' ||
    context.parsedChord.modifiers.length > 0 ||
    'A single chord needs a modifier.',
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

A rejected recording keeps listening, so the user can try again. A rejected sequence recording keeps its steps, so the user can edit them with Backspace.

### Save hotkeys that work on another platform

A recorded hotkey's modifiers mean the same keys on every platform when they are `Mod`, `Shift`, and `Alt`. A recorded character such as `@` follows the layout, so it can sit on a different key, while a bracketed code such as `[Slash]` stays on the same physical key. The recorder writes Command on macOS and Control elsewhere as `Mod`. The other two modifiers stay platform-specific: Control+S recorded on a Mac is `Control+S`, which on Windows is the same press as `Mod+S`, and the Windows key recorded on Windows is `Meta`, which on a Mac is Command.

If your app syncs hotkeys between machines, pick one rule:

- Store each hotkey with the platform it was recorded on, and use it only there. `context.platform` names it.
- Reject the platform-specific modifiers, so every saved hotkey's modifiers work on every platform:

```ts
recorder = useHotkeyRecorder(this, {
  validate: (_hotkey, { parsedChord, platform }) =>
    !(platform === 'mac' ? parsedChord.ctrl : parsedChord.meta) ||
    'Use Ctrl or Cmd, Shift, and Alt.',
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

### Check for conflicts

Set `detectConflicts: true` to reject a hotkey that's already registered:

```ts
recorder = useHotkeyRecorder(this, {
  detectConflicts: true,
  onReject: ({ reason }) => {
    if (reason === 'conflict') setError('That shortcut is already in use.')
  },
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

By default, the check compares the recording with every enabled `keydown` hotkey on the page, in every [scope](./hotkeys-docs-framework-ember-guides-hotkey-manager-md-124cc37b.md#source-hotkeys-docs-framework-ember-guides-hotkey-manager-md). A recorded chord conflicts with a sequence that starts with it, and a recorded sequence conflicts with a chord equal to its first step. Pass an object instead of `true` to change what's checked:

```ts
detectConflicts: {
  excludeIds: [registration.id], // Skip the hotkey being changed
  target: panelElement, // Only hotkeys on this element, inside it, or around it (pass scope: 'all' instead to check every element)
  eventType: 'keyup', // Check keyup hotkeys instead
  includeDisabled: true, // Include disabled hotkeys
  exclude: (registration) => registration.options.scope === 'vim', // Skip one hotkey scope
}
```

Two hotkeys can be written differently and still fire for the same key press. On a US keyboard, `Shift+[Slash]`, recorded by code or saved by an earlier version, and a registered `?` are the same press. The check also tests each registered hotkey against the key presses that made the recording, so it finds these.

A conflict check finds hotkeys that could collide. It can't promise which callback a key press would run, because propagation, typing in fields, other listeners, and pages that haven't rendered all affect that. To check app hotkeys, including ones on pages that haven't rendered, use `findConflicts` from [app hotkeys](./hotkeys-docs-framework-ember-guides-app-hotkeys-md-c66d9482.md#source-hotkeys-docs-framework-ember-guides-app-hotkeys-md) instead.

`onReject` doesn't generate user-facing copy. Map `reason`, along with the optional `hotkey`, `conflicts`, and `message`, to your own UI strings:

| `reason` | When it happens |
| --- | --- |
| `'conflict'` | Collides with a registered hotkey (`conflicts` lists the matches) |
| `'validation'` | Rejected by your `validate` callback (`message` holds your return string) |
| `'whitespace'` | The user pressed a whitespace character that can't be recorded |
| `'missing-code'` | The key press had no physical `code`, and the recorder can't record it another way |
| `'alt-graph'` | The user pressed an `AltGr` combination that typed no character to record, or, with `recordBy: 'code'`, any other `AltGr` combination. On Windows, the recorder treats `AltGr` with a key it doesn't change, such as `Home`, as Control+Alt, so no mode rejects that press: it records `Mod+Alt+Home`, or `Mod+Alt+[Home]` with `recordBy: 'code'` |

`findHotkeyConflicts(hotkey, options)` runs the same conflict check outside a recording and returns `HotkeyConflict` objects (`{ registration }`) wrapping matching [registration views](./hotkeys-docs-framework-ember-guides-cheat-sheet-ui-helpers-md-5bcba5e0.md#source-hotkeys-docs-framework-ember-guides-cheat-sheet-ui-helpers-md).
