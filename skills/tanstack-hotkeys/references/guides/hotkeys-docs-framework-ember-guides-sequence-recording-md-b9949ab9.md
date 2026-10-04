# Sequence Recording

<a id="source-hotkeys-docs-framework-ember-guides-sequence-recording-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.11.0`.

[Topic index](../other-guides.md) · [Source provenance](../SOURCES.md)

Use `useHotkeySequenceRecorder` to record an ordered sequence of chords. Recording defaults to physical codes, such as `['[KeyG]', 'Alt+[KeyS]']`. Use `recordBy: 'key'` for logical characters. Pass the saved array directly to `useHotkeySequence`.

TanStack Hotkeys automatically suppresses registered hotkey and sequence callbacks while any recorder is active. You do not need to set `enabled` from `isRecording`. Registrations remain available for conflict detection, and recorded keys stay suppressed through repeats and key release.

## Reactive options

This section is an exact duplicate. Read [Reactive options in Hotkey Recording](./hotkeys-docs-framework-ember-guides-hotkey-recording-md-e4d4b8dd.md).

## Basic usage

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { useHotkeySequence, useHotkeySequenceRecorder, formatForDisplay } from '@tanstack/ember-hotkeys'
import type { HotkeySequence } from '@tanstack/ember-hotkeys'

export default class SequenceSettings extends Component {
	@tracked binding: HotkeySequence = ['G', 'G']
	recorder = useHotkeySequenceRecorder(this, {
		onRecord: (sequence) => { this.binding = sequence },
	})
	goToTop = () => console.log('Go to top')
	get preview() { return this.recorder.steps.map((step) => formatForDisplay(step)).join(' → ') }

	<template>
		{{useHotkeySequence this.binding this.goToTop}}
		<button type="button" {{on 'click' this.recorder.startRecording}}>Record sequence</button>
		{{#if this.recorder.isRecording}}
			<p>{{this.preview}}</p>
			<button type="button" {{on 'click' this.recorder.commitRecording}}>Save</button>
			<button type="button" {{on 'click' this.recorder.cancelRecording}}>Cancel</button>
		{{/if}}
	</template>
}
```

Press and release each chord, then press Enter or click Save. Cancellation leaves the saved binding unchanged.

## Return value

This section is an exact duplicate. Read [Return value in Sequence Recording](./hotkeys-docs-framework-alpine-guides-sequence-recording-md-94046ff1.md).

## Options

- `recordBy`: `'code'` by default, or `'key'` for logical characters. Missing physical codes never fall back to logical recording.
- `onRecord(sequence)`: called when a nonempty sequence is committed. Clearing calls only `onClear`.
- `onCancel` and `onClear`: handle cancellation and removal of a saved binding.
- `commitKeys`: `'enter'` by default. Use `'none'` for manual or idle-timeout commit; plain Enter can then be recorded as a chord.
- `commitOnEnter`: with `commitKeys: 'enter'`, set this to `false` to record Enter as a chord and finish another way.
- `idleTimeoutMs`: commit after this many milliseconds of inactivity following a completed chord. No timer runs while waiting for the first chord.
- `platform`: override platform detection for portable `Mod` conversion.

### Shared defaults

Pass defaults to `createHotkeysScope`. The scope accepts `hotkey`, `hotkeySequence`, `hotkeyRecorder`, and `hotkeySequenceRecorder` options. Use the returned contextual helpers and recorder factories. Pass the scope through component arguments to share it with descendants; helpers and recorders still clean up with their own owners. Pass a getter for tracked defaults. Call-specific options override scope defaults, and per-definition options override common options. Omitted options use the core defaults. See [shared defaults](./hotkeys-docs-framework-ember-quick-start-md-d5e4889e.md#source-hotkeys-docs-framework-ember-quick-start-md) for a complete example. Options getters are read during recording and commit, so policy and callback changes also apply to active sessions.

### `ignoreInputs`

The default is `true`, so normal typing in inputs, textareas, selects, and contentEditable elements passes through. Escape still cancels. Set `ignoreInputs: false` to record in a focused input.

## Validation and conflicts

This section is an exact duplicate. Read [Validation and conflicts in Sequence Recording](./hotkeys-docs-framework-alpine-guides-sequence-recording-md-94046ff1.md).

## Behavior

This section is an exact duplicate. Read [Behavior in Sequence Recording](./hotkeys-docs-framework-alpine-guides-sequence-recording-md-94046ff1.md).

## Under the hood

Ember owns the core Store subscription and recorder through the supplied owner. Destruction cancels active recording and releases listeners.

See the [useHotkeySequenceRecorder example](https://github.com/TanStack/hotkeys/tree/748379f3ac2df52b7e5f2aae9cceed2ce1bea78f/examples/ember/useHotkeySequenceRecorder) for editable sequence settings and the [kitchen sink](https://github.com/TanStack/hotkeys/tree/748379f3ac2df52b7e5f2aae9cceed2ce1bea78f/examples/ember/kitchen-sink) for manual commit, idle timeout, validation, and conflict feedback.
