# Custom Hotkey Recording — Validate and check conflicts

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-custom-hotkey-recording-md-7d47b3ce.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.0`.

## Validate and check conflicts

### Reject hotkeys you don't want

Pass `validate` to accept or reject each recording before it commits. Return `true` to accept, or `false` or a message to reject:

```ts
recorder = new HotkeyRecorderController(this, {
  validate: (_hotkey, { parsedChord }) =>
    parsedChord.modifiers.length > 0 || 'Include a modifier.',
  onReject: ({ message }) => setError(message ?? 'Try another shortcut.'),
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

The second argument has the `event` that recorded the chord and `parsedChord`, with `Mod` resolved. With `maxSteps: Infinity`, a recording can be a chord or a sequence, so check `kind` first. A sequence's context has `events` and `parsedSequence`, with one entry per step:

```ts
recorder = new HotkeyRecorderController(this, {
  maxSteps: Infinity,
  validate: (_hotkey, context) =>
    context.kind === 'sequence' ||
    context.parsedChord.modifiers.length > 0 ||
    'A single chord needs a modifier.',
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

A rejected recording keeps listening, so the user can try again. A rejected sequence recording keeps its steps, so the user can edit them with Backspace.

### Check for conflicts

Set `detectConflicts: true` to reject a hotkey that's already registered:

```ts
recorder = new HotkeyRecorderController(this, {
  detectConflicts: true,
  onReject: ({ reason }) => {
    if (reason === 'conflict') setError('That shortcut is already in use.')
  },
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

By default, the check compares the recording with every enabled `keydown` hotkey on the page, in every [scope](./hotkeys-docs-framework-lit-guides-hotkey-manager-md-506c8dcc.md#source-hotkeys-docs-framework-lit-guides-hotkey-manager-md). A recorded chord conflicts with a sequence that starts with it, and a recorded sequence conflicts with a chord equal to its first step. Pass an object instead of `true` to change what's checked:

```ts
detectConflicts: {
  excludeIds: [registration.id], // Skip the hotkey being changed
  target: panelElement, // Only hotkeys on this element, inside it, or around it
  scope: 'all', // Ignore target and check hotkeys on every element. Unrelated to hotkey scopes.
  eventType: 'keyup', // Check keyup hotkeys instead
  includeDisabled: true, // Include disabled hotkeys
  exclude: (registration) => registration.options.scope === 'vim', // Skip one hotkey scope
}
```

A conflict check finds hotkeys that could collide. It can't promise which callback a key press would run, because propagation, typing in fields, other listeners, and pages that haven't rendered all affect that. To check app hotkeys, including ones on pages that haven't rendered, use `findConflicts` from [app hotkeys](./hotkeys-docs-framework-lit-guides-app-hotkeys-md-6d116aa2.md#source-hotkeys-docs-framework-lit-guides-app-hotkeys-md) instead.

`onReject` receives a `reason`: `'conflict'`, `'validation'`, `'whitespace'` for a whitespace character, `'missing-code'` for a key press with no physical code, or `'alt-graph'` for an AltGr press it can't record. It also receives the rejected `hotkey` when there is one, the `conflicts` for a conflict, and the `message` your `validate` callback returned. The recorder sends no text of its own, so map each `reason` to your app's wording.

To check a hotkey outside a recording, call `findHotkeyConflicts(hotkey, options)`. It takes the same options, and returns [registration views](./hotkeys-docs-framework-lit-guides-cheat-sheet-ui-helpers-md-a557e5c4.md#source-hotkeys-docs-framework-lit-guides-cheat-sheet-ui-helpers-md).
