# Sequence Recording

<a id="source-hotkeys-docs-framework-octane-guides-sequence-recording-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.11.0`.

[Topic index](../other-guides.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Sequence Recording](./hotkeys-docs-framework-ember-guides-sequence-recording-md-b9949ab9.md).

## Basic usage

```tsx
import { useState } from 'octane'
import { useHotkeySequence, useHotkeySequenceRecorder, formatForDisplay } from '@tanstack/octane-hotkeys'
import type { HotkeySequence } from '@tanstack/octane-hotkeys'

export function SequenceSettings() @{
	const [binding, setBinding] = useState<HotkeySequence>(['G', 'G'])
	const recorder = useHotkeySequenceRecorder({ onRecord: setBinding })
	useHotkeySequence(binding, () => console.log('Go to top'))

	<div>
		<button type="button" onClick={recorder.startRecording}>Record sequence</button>
		@if (recorder.isRecording) {
			<div>
				<p>{recorder.steps.map((step) => formatForDisplay(step)).join(' → ')}</p>
				<button type="button" onClick={recorder.commitRecording}>Save</button>
				<button type="button" onClick={recorder.cancelRecording}>Cancel</button>
			</div>
		}
	</div>
}
```

Press and release each chord, then press Enter or click Save. Cancellation leaves the saved binding unchanged.

## Return value

| Property | Type | Meaning |
| --- | --- | --- |
| `isRecording` | `boolean` | Whether a session is active. |
| `steps` | `HotkeySequence` | Chords captured in the current session. |
| `recordedSequence` | `HotkeySequence \| null` | The last committed sequence. |
| `startRecording` | `() => void` | Start a new session. |
| `stopRecording` | `() => void` | Stop without calling `onRecord` or `onCancel`. |
| `cancelRecording` | `() => void` | Discard the session and call `onCancel`. |
| `commitRecording` | `() => void` | Commit current steps; do nothing if empty. |

## Options

- `recordBy`: `'code'` by default, or `'key'` for logical characters. Missing physical codes never fall back to logical recording.
- `onRecord(sequence)`: called when a nonempty sequence is committed. Clearing calls only `onClear`.
- `onCancel` and `onClear`: handle cancellation and removal of a saved binding.
- `commitKeys`: `'enter'` by default. Use `'none'` for manual or idle-timeout commit; plain Enter can then be recorded as a chord.
- `commitOnEnter`: with `commitKeys: 'enter'`, set this to `false` to record Enter as a chord and finish another way.
- `idleTimeoutMs`: commit after this many milliseconds of inactivity following a completed chord. No timer runs while waiting for the first chord.
- `platform`: override platform detection for portable `Mod` conversion.

### Shared defaults

Set `hotkeySequenceRecorder` defaults in `HotkeysProvider`. Options passed to an individual hook override provider defaults. For a plural hook, each definition's options override its common options. See the [provider setup](./hotkeys-docs-framework-octane-quick-start-md-ecf7a027.md#source-hotkeys-docs-framework-octane-quick-start-md). Hook options refresh after each commit.

### `ignoreInputs`

The default is `true`, so normal typing in inputs, textareas, selects, and contentEditable elements passes through. Escape still cancels. Set `ignoreInputs: false` to record in a focused input.

## Validation and conflicts

This section is an exact duplicate. Read [Validation and conflicts in Sequence Recording](./hotkeys-docs-framework-alpine-guides-sequence-recording-md-94046ff1.md).

## Behavior

This section is an exact duplicate. Read [Behavior in Sequence Recording](./hotkeys-docs-framework-alpine-guides-sequence-recording-md-94046ff1.md).

## Under the hood

Octane subscribes with `@tanstack/octane-store` and destroys the recorder on unmount.

See the [useHotkeySequenceRecorder example](https://github.com/TanStack/hotkeys/tree/748379f3ac2df52b7e5f2aae9cceed2ce1bea78f/examples/octane/useHotkeySequenceRecorder) for editable sequence settings and the [kitchen sink](https://github.com/TanStack/hotkeys/tree/748379f3ac2df52b7e5f2aae9cceed2ce1bea78f/examples/octane/kitchen-sink) for manual commit, idle timeout, validation, and conflict feedback.
