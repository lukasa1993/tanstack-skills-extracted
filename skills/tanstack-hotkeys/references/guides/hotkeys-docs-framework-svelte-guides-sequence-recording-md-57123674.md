# Sequence Recording

<a id="source-hotkeys-docs-framework-svelte-guides-sequence-recording-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.8.0`.

[Topic index](../framework-svelte.md) · [Source provenance](../SOURCES.md)

Use `createHotkeySequenceRecorder` from `@tanstack/svelte-hotkeys`. Reactive getters `isRecording`, `steps`, `recordedSequence` and methods `startRecording`, `stopRecording`, `cancelRecording`, `commitRecording` match the hotkey recorder pattern.

Configure `commitKeys`, `commitOnEnter`, and `idleTimeoutMs` on the options object; set defaults on `HotkeysProvider` with `hotkeySequenceRecorder`.

### `ignoreInputs`

The `HotkeySequenceRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder will not intercept normal typing in text inputs, textareas, selects, or contentEditable elements -- keystrokes pass through to the input as usual. Pressing **Escape** still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.
