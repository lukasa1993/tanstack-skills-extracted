# Svelte adapter

Svelte-specific setup and behavior.

<a id="source-hotkeys-docs-framework-svelte-guides-formatting-display-md"></a>

## Formatting Display

Source: `hotkeys:docs/framework/svelte/guides/formatting-display.md`.

TanStack Hotkeys includes utilities for turning hotkey strings into display-friendly labels. These utilities are framework-agnostic, but they pair naturally with Svelte templates and reactive UI.

### `formatForDisplay`

```ts
import { formatForDisplay } from '@tanstack/svelte-hotkeys'

formatForDisplay('Mod+S')
formatForDisplay('Mod+Shift+Z')
```

### `formatWithLabels`

```ts
import { formatWithLabels } from '@tanstack/svelte-hotkeys'

formatWithLabels('Mod+S')
formatWithLabels('Mod+Shift+Z')
```

### Using Formatted Hotkeys in Svelte

#### Keyboard Shortcut Badges

```svelte
<script lang="ts">
  import { formatForDisplay } from '@tanstack/svelte-hotkeys'
</script>

<kbd class="shortcut-badge">{formatForDisplay(hotkey)}</kbd>
```

#### Menu Items with Hotkeys

```svelte
<script lang="ts">
  import { formatForDisplay, createHotkey } from '@tanstack/svelte-hotkeys'

  let { label, hotkey, onAction } = $props()

  createHotkey(hotkey, () => onAction())
</script>

<div class="menu-item">
  <span>{label}</span>
  <span class="menu-shortcut">{formatForDisplay(hotkey)}</span>
</div>
```

### Validation

```ts
import { validateHotkey } from '@tanstack/svelte-hotkeys'

const result = validateHotkey('Alt+A')
```

<a id="source-hotkeys-docs-framework-svelte-guides-hotkey-recording-md"></a>

## Hotkey Recording

Source: `hotkeys:docs/framework/svelte/guides/hotkey-recording.md`.

TanStack Hotkeys provides the `createHotkeyRecorder` function for building shortcut customization UIs in Svelte.

### Basic Usage

```svelte
<script lang="ts">
  import {
    createHotkeyRecorder,
    formatForDisplay,
  } from '@tanstack/svelte-hotkeys'

  const recorder = createHotkeyRecorder({
    onRecord: (hotkey) => {
      console.log('Recorded:', hotkey)
    },
  })
</script>

<div>
  <button onclick={recorder.startRecording}>
    {recorder.isRecording
      ? 'Press a key combination...'
      : recorder.recordedHotkey
        ? formatForDisplay(recorder.recordedHotkey)
        : 'Click to record'}
  </button>
  {#if recorder.isRecording}
    <button onclick={() => recorder.cancelRecording()}>Cancel</button>
  {/if}
</div>
```

### Return Value

- `isRecording`: whether recording is active
- `recordedHotkey`: the most recently recorded hotkey
- `startRecording()`: start listening for key presses
- `stopRecording()`: stop listening and keep the current recording
- `cancelRecording()`: stop listening and discard the in-progress recording

### Options

```ts
createHotkeyRecorder({
  onRecord: (hotkey) => {},
  onCancel: () => {},
  onClear: () => {},
})
```

Options can also be reactive:

```svelte
<script lang="ts">
  import { createHotkeyRecorder } from '@tanstack/svelte-hotkeys'

  let actionName = $state('Save')

  const recorder = createHotkeyRecorder(() => ({
    onRecord: (hotkey) => {
      console.log(`${actionName}:`, hotkey)
    },
  }))
</script>
```

#### `ignoreInputs`

The `HotkeyRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder will not intercept normal typing in text inputs, textareas, selects, or contentEditable elements -- keystrokes pass through to the input as usual. Pressing **Escape** still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.

```ts
createHotkeyRecorder({
  ignoreInputs: false, // record even from inside inputs
  onRecord: (hotkey) => console.log(hotkey),
})
```

### Recording Behavior

- Modifier-only presses do not complete a recording.
- Modifier plus key combinations record the full shortcut.
- Escape cancels recording.
- Backspace and Delete clear the shortcut.
- Recorded values are normalized to portable `Mod` format.

<a id="source-hotkeys-docs-framework-svelte-guides-hotkeys-md"></a>

## Hotkeys

Source: `hotkeys:docs/framework/svelte/guides/hotkeys.md`.

Use `createHotkey` for global shortcuts and `createHotkeyAttachment` for element-scoped shortcuts. This keeps the common global case simple while making scoped behavior feel native to Svelte 5.

### Global hotkeys

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  createHotkey('Mod+S', () => {
    saveDocument()
  })
</script>
```

The callback receives the original `KeyboardEvent` as the first argument and a `HotkeyCallbackContext` as the second:

```ts
createHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey)
  console.log(context.parsedHotkey)
})
```

### Scoped hotkeys

Use attachments instead of capturing an element ref just to pass it back into the API.

```svelte
<script lang="ts">
  import { createHotkeyAttachment } from '@tanstack/svelte-hotkeys'

  const closePanel = createHotkeyAttachment('Escape', () => {
    close()
  })
</script>

<div tabindex="0" {@attach closePanel}>Panel content</div>
```

### Reactive inputs

Hotkeys can take plain values for static registrations or getter functions when the hotkey or options depend on reactive state.

#### Reactive `enabled`

When `enabled` is false, the hotkey **stays registered** (visible in devtools); only the callback is suppressed.

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  let isEditing = $state(false)

  createHotkey(
    'Mod+S',
    () => save(),
    () => ({ enabled: isEditing }),
  )
</script>
```

#### Reactive hotkey values

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  let shortcut = $state('Mod+S')

  createHotkey(
    () => shortcut,
    () => save(),
  )
</script>
```

### Default options

Set defaults explicitly with `setHotkeysContext` when a subtree needs shared behavior:

```svelte
<script lang="ts">
  import { setHotkeysContext } from '@tanstack/svelte-hotkeys'

  setHotkeysContext({
    hotkey: {
      preventDefault: false,
      ignoreInputs: false,
    },
  })
</script>
```

### Common Options

#### `requireReset`

```ts
createHotkey('Escape', () => closePanel(), { requireReset: true })
```

#### `ignoreInputs`

```ts
createHotkey('K', () => openSearch())
createHotkey('Enter', () => submit(), { ignoreInputs: false })
```

#### `conflictBehavior`

```ts
createHotkey('Mod+S', () => save(), { conflictBehavior: 'replace' })
```

#### `platform`

```ts
createHotkey('Mod+S', () => save(), { platform: 'mac' })
```

### Automatic Cleanup

Global hotkeys are automatically unregistered when the owning component unmounts. Attachment-based hotkeys clean themselves up when the attached element is removed or when reactive inputs change.

### Registering Multiple Hotkeys

When you need to register several hotkeys at once — or a dynamic, variable-length list — use `createHotkeys` (plural) for global shortcuts and `createHotkeysAttachment` for element-scoped shortcuts:

```svelte
<script lang="ts">
  import { createHotkeys } from '@tanstack/svelte-hotkeys'

  createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Escape', callback: () => close() },
  ])
</script>
```

#### Common Options with Per-Hotkey Overrides

Pass shared options as the second argument. Per-definition options override the common ones:

```ts
createHotkeys(
  [
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo(), options: { enabled: false } },
  ],
  { preventDefault: true },
)
```

#### Dynamic Hotkey Lists

Pass a getter for reactive arrays:

```svelte
<script lang="ts">
  import { createHotkeys } from '@tanstack/svelte-hotkeys'

  let shortcuts = $state([...])

  createHotkeys(
    () => shortcuts.map((s) => ({
      hotkey: s.key,
      callback: s.action,
    })),
  )
</script>
```

#### Scoped Multi-Hotkeys

Use `createHotkeysAttachment` to scope multiple hotkeys to a specific element:

```svelte
<script lang="ts">
  import { createHotkeysAttachment } from '@tanstack/svelte-hotkeys'

  const editorKeys = createHotkeysAttachment([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
  ])
</script>

<div tabindex="0" {@attach editorKeys}>Editor content</div>
```

### Metadata (name & description)

Every hotkey registration can carry a `meta` object with a `name` and `description`. This metadata is informational only -- it does not affect hotkey behavior -- but it flows through to registrations and devtools, making it easy to build shortcut palettes and help screens.

```ts
createHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document' },
})
```

The `meta` option is typed as `HotkeyMeta`, which ships with `name` and `description` fields. You can extend it with additional properties using TypeScript declaration merging:

```ts
declare module '@tanstack/hotkeys' {
  interface HotkeyMeta {
    icon?: string
    group?: string
  }
}

createHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', icon: 'floppy', group: 'File' },
})
```

### Introspecting Registrations

Use the `getHotkeyRegistrations` function to get a live view of all hotkey and sequence registrations. This is useful for building shortcut palettes, help dialogs, or devtools.

```svelte
<script lang="ts">
  import { getHotkeyRegistrations } from '@tanstack/svelte-hotkeys'

  const registrations = getHotkeyRegistrations()
</script>

<div>
  <h2>Keyboard Shortcuts</h2>
  <ul>
    {#each registrations.hotkeys as reg (reg.hotkey)}
      <li>
        <kbd>{reg.hotkey}</kbd>
        {#if reg.meta?.name}
          <span> — {reg.meta.name}</span>
        {/if}
        {#if reg.meta?.description}
          <p>{reg.meta.description}</p>
        {/if}
      </li>
    {/each}
  </ul>
  {#if registrations.sequences.length > 0}
    <h2>Sequences</h2>
    <ul>
      {#each registrations.sequences as reg (reg.sequence.join(' '))}
        <li>
          <kbd>{reg.sequence.join(' → ')}</kbd>
          {#if reg.meta?.name}
            <span> — {reg.meta.name}</span>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>
```

The returned object contains a `hotkeys` array with registration objects including the hotkey string, options (including `meta`), and enabled state, and a `sequences` array containing sequence registrations with the same structure.

### The Hotkey Manager

You can always reach for the underlying manager directly:

```ts
import { getHotkeyManager } from '@tanstack/svelte-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```

<a id="source-hotkeys-docs-framework-svelte-guides-key-state-tracking-md"></a>

## Key State Tracking

Source: `hotkeys:docs/framework/svelte/guides/key-state-tracking.md`.

TanStack Hotkeys provides three Svelte functions for tracking live keyboard state: `getHeldKeys`, `getHeldKeyCodesMap`, and `getIsKeyHeld`.

### `getHeldKeys`

```svelte
<script lang="ts">
  import { getHeldKeys } from '@tanstack/svelte-hotkeys'

  const heldKeys = getHeldKeys()
</script>

<div>{heldKeys.keys.length > 0 ? heldKeys.keys.join(' + ') : 'No keys held'}</div>
```

### `getHeldKeyCodesMap`

```svelte
<script lang="ts">
  import { getHeldKeyCodesMap } from '@tanstack/svelte-hotkeys'

  const heldCodes = getHeldKeyCodesMap()
</script>

<pre>{JSON.stringify(heldCodes.codes, null, 2)}</pre>
```

### `getIsKeyHeld`

```svelte
<script lang="ts">
  import { getIsKeyHeld } from '@tanstack/svelte-hotkeys'

  const isShiftHeld = getIsKeyHeld('Shift')
</script>

<span class:active={isShiftHeld.held}>Shift</span>
```

### Common Patterns

#### Hold-to-Reveal UI

```svelte
<script lang="ts">
  import { getIsKeyHeld } from '@tanstack/svelte-hotkeys'

  const isShiftHeld = getIsKeyHeld('Shift')
</script>

{#if isShiftHeld.held}
  <button>Permanently Delete</button>
{:else}
  <button>Move to Trash</button>
{/if}
```

#### Debugging Key Display

```svelte
<script lang="ts">
  import {
    formatForDisplay,
    getHeldKeyCodesMap,
    getHeldKeys,
    type RegisterableHotkey,
  } from '@tanstack/svelte-hotkeys'

  const heldKeys = getHeldKeys()
  const heldCodes = getHeldKeyCodesMap()
</script>

<div>
  {#each heldKeys.keys as key}
    <kbd>
      {formatForDisplay(key as RegisterableHotkey, { useSymbols: true })}:
      {heldCodes.codes[key] ?? 'unknown'}
    </kbd>
  {/each}
</div>
```

### Under the Hood

All three functions subscribe to the singleton `KeyStateTracker`:

```ts
import { getKeyStateTracker } from '@tanstack/svelte-hotkeys'

const tracker = getKeyStateTracker()
tracker.getHeldKeys()
tracker.isKeyHeld('Shift')
```

<a id="source-hotkeys-docs-framework-svelte-guides-sequence-recording-md"></a>

## Sequence Recording

Source: `hotkeys:docs/framework/svelte/guides/sequence-recording.md`.

Use `createHotkeySequenceRecorder` from `@tanstack/svelte-hotkeys`. Reactive getters `isRecording`, `steps`, `recordedSequence` and methods `startRecording`, `stopRecording`, `cancelRecording`, `commitRecording` match the hotkey recorder pattern.

Configure `commitKeys`, `commitOnEnter`, and `idleTimeoutMs` on the options object; set defaults on `HotkeysProvider` with `hotkeySequenceRecorder`.

#### `ignoreInputs`

The `HotkeySequenceRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder will not intercept normal typing in text inputs, textareas, selects, or contentEditable elements -- keystrokes pass through to the input as usual. Pressing **Escape** still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.

<a id="source-hotkeys-docs-framework-svelte-guides-sequences-md"></a>

## Sequences

Source: `hotkeys:docs/framework/svelte/guides/sequences.md`.

TanStack Hotkeys supports multi-key sequences in Svelte, where keys are pressed one after another rather than simultaneously.

### Global sequences

```svelte
<script lang="ts">
  import { createHotkeySequence } from '@tanstack/svelte-hotkeys'

  createHotkeySequence(['G', 'G'], () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
</script>
```

### Many sequences at once

Use `createHotkeySequences` to register several global sequences in one place (including from a reactive getter). For multiple sequences on a focused element, use `createHotkeySequencesAttachment` the same way you would use `createHotkeySequenceAttachment`.

```svelte
<script lang="ts">
  import { createHotkeySequences } from '@tanstack/svelte-hotkeys'

  createHotkeySequences([
    { sequence: ['G', 'G'], callback: () => scrollToTop() },
    { sequence: ['D', 'D'], callback: () => deleteLine(), options: { timeout: 500 } },
  ])
</script>
```

### Scoped sequences

Use `createHotkeySequenceAttachment` when a sequence should only be active while a specific element owns focus.

```svelte
<script lang="ts">
  import { createHotkeySequenceAttachment } from '@tanstack/svelte-hotkeys'

  const editorSequences = createHotkeySequenceAttachment(['G', 'G'], () => {
    scrollToTop()
  })
</script>

<div tabindex="0" {@attach editorSequences}>
  Focus here, then press g then g
</div>
```

### Sequence options

```ts
createHotkeySequence(['G', 'G'], callback, {
  timeout: 1000,
  enabled: true,
})
```

#### Reactive `enabled`

When disabled, the sequence **stays registered** (visible in devtools); only execution is suppressed.

```svelte
<script lang="ts">
  import { createHotkeySequence } from '@tanstack/svelte-hotkeys'

  let isVimMode = $state(true)

  createHotkeySequence(
    ['G', 'G'],
    () => scrollToTop(),
    () => ({ enabled: isVimMode }),
  )
</script>
```

### Default options

```svelte
<script lang="ts">
  import { setHotkeysContext } from '@tanstack/svelte-hotkeys'

  setHotkeysContext({
    hotkeySequence: { timeout: 1500 },
  })
</script>
```

#### `meta`

Sequences support the same `meta` option as hotkeys, allowing you to attach a `name` and `description` for use in shortcut palettes and devtools.

```ts
createHotkeySequence(['G', 'G'], () => scrollToTop(), {
  meta: { name: 'Go to Top', description: 'Scroll to the top of the page' },
})
```

See the [Hotkeys Guide](./framework-svelte.md#source-hotkeys-docs-framework-svelte-guides-hotkeys-md) for details on declaration merging and introspecting registrations.

### Chained modifier chords

You can use the same modifier on consecutive steps (for example `Shift+R` then `Shift+T`):

```ts
createHotkeySequence(['Shift+R', 'Shift+T'], () => doNextAction())
```

While a sequence is in progress, **modifier-only** keydown events (Shift, Control, Alt, or Meta pressed alone) are ignored: they do not advance the sequence and do not reset progress.

### Common Patterns

#### Vim-Style Navigation

```ts
createHotkeySequence(['G', 'G'], () => scrollToTop())
createHotkeySequence(['G', 'Shift+G'], () => scrollToBottom())
createHotkeySequence(['D', 'D'], () => deleteLine())
createHotkeySequence(['D', 'W'], () => deleteWord())
createHotkeySequence(['C', 'I', 'W'], () => changeInnerWord())
```

#### Konami Code

```ts
createHotkeySequence(
  ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'B', 'A'],
  () => enableEasterEgg(),
  { timeout: 2000 },
)
```

### Under the Hood

`createHotkeySequence` uses the singleton `SequenceManager`. You can also access it directly:

```ts
import {
  createSequenceMatcher,
  getSequenceManager,
} from '@tanstack/svelte-hotkeys'

const manager = getSequenceManager()
const matcher = createSequenceMatcher(['G', 'G'], { timeout: 1000 })
```

<a id="source-hotkeys-docs-framework-svelte-quick-start-md"></a>

## Quick Start

Source: `hotkeys:docs/framework/svelte/quick-start.md`.

### Installation

Don't have TanStack Hotkeys installed yet? See the [Installation](./foundations.md#source-hotkeys-docs-installation-md) page for instructions.

### Your First Hotkey

Use `createHotkey` for global shortcuts and attachments for element-scoped shortcuts.

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  createHotkey('Mod+S', () => {
    saveDocument()
  })
</script>

<div>Press Cmd+S (Mac) or Ctrl+S (Windows) to save</div>
```

The `Mod` modifier automatically resolves to `Meta` (Command) on macOS and `Control` on Windows/Linux, so your shortcuts work across platforms without extra logic.

### Common Patterns

#### Multiple global hotkeys

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  createHotkey('Mod+S', () => save())
  createHotkey('Mod+Z', () => undo())
  createHotkey('Mod+Shift+Z', () => redo())
  createHotkey('Mod+F', () => openSearch())
  createHotkey('Escape', () => closeDialog())
</script>
```

#### Scoped hotkeys with attachments

```svelte
<script lang="ts">
  import { createHotkeyAttachment } from '@tanstack/svelte-hotkeys'

  const closePanel = createHotkeyAttachment('Escape', () => {
    close()
  })
</script>

<div tabindex="0" {@attach closePanel}>
  <p>Press Escape while focused here to close</p>
</div>
```

#### Reactive options

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  let isOpen = $state(true)

  createHotkey(
    'Escape',
    () => {
      isOpen = false
    },
    () => ({ enabled: isOpen }),
  )
</script>
```

#### Scoped sequences

```svelte
<script lang="ts">
  import { createHotkeySequenceAttachment } from '@tanstack/svelte-hotkeys'

  const vimKeys = createHotkeySequenceAttachment(['G', 'G'], () => {
    scrollToTop()
  })
</script>

<div tabindex="0" {@attach vimKeys}>
  Focus here, then press g then g
</div>
```

#### Tracking held keys

```svelte
<script lang="ts">
  import { getHeldKeys, getIsKeyHeld } from '@tanstack/svelte-hotkeys'

  const heldKeys = getHeldKeys()
  const isShiftHeld = getIsKeyHeld('Shift')
</script>

<div class="status-bar">
  {#if isShiftHeld.held}<span>Shift mode active</span>{/if}
  {#if heldKeys.keys.length > 0}
    <span>Keys: {heldKeys.keys.join('+')}</span>
  {/if}
</div>
```

#### Recording shortcuts

```svelte
<script lang="ts">
  import {
    createHotkeyRecorder,
    formatForDisplay,
  } from '@tanstack/svelte-hotkeys'

  const recorder = createHotkeyRecorder({
    onRecord: (hotkey) => {
      console.log('Recorded:', hotkey)
    },
  })
</script>

<button onclick={recorder.startRecording}>
  {recorder.recordedHotkey
    ? formatForDisplay(recorder.recordedHotkey)
    : 'Click to record'}
</button>
```

#### Displaying hotkeys in the UI

```svelte
<script lang="ts">
  import { formatForDisplay, createHotkey } from '@tanstack/svelte-hotkeys'

  createHotkey('Mod+S', () => save())
</script>

<button>
  Save <kbd>{formatForDisplay('Mod+S')}</kbd>
</button>
```

### Default options

Use `setHotkeysContext` when you want defaults for a subtree. This is an advanced API and usually belongs near the root of the part of the app that owns the hotkeys.

```svelte
<script lang="ts">
  import { setHotkeysContext } from '@tanstack/svelte-hotkeys'

  setHotkeysContext({
    hotkey: { preventDefault: true },
    hotkeySequence: { timeout: 1500 },
  })
</script>
```

### Next Steps

- [Hotkeys Guide](./framework-svelte.md#source-hotkeys-docs-framework-svelte-guides-hotkeys-md)
- [Sequences Guide](./framework-svelte.md#source-hotkeys-docs-framework-svelte-guides-sequences-md)
- [Hotkey Recording Guide](./framework-svelte.md#source-hotkeys-docs-framework-svelte-guides-hotkey-recording-md)
- [Sequence Recording Guide](./framework-svelte.md#source-hotkeys-docs-framework-svelte-guides-sequence-recording-md)
- [Key State Tracking Guide](./framework-svelte.md#source-hotkeys-docs-framework-svelte-guides-key-state-tracking-md)
- [Formatting & Display Guide](./framework-svelte.md#source-hotkeys-docs-framework-svelte-guides-formatting-display-md)
