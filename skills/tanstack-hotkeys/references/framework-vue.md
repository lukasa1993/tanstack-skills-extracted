# Vue adapter

Vue-specific setup and behavior.

<a id="source-hotkeys-docs-framework-vue-guides-formatting-display-md"></a>

## Formatting Display

Source: `hotkeys:docs/framework/vue/guides/formatting-display.md`.

TanStack Hotkeys includes utilities for turning hotkey strings into display-friendly labels. These utilities are framework-agnostic, but they pair naturally with Vue templates and computed UI.

### `formatForDisplay`

```ts
import { formatForDisplay } from '@tanstack/vue-hotkeys'

formatForDisplay('Mod+S')
formatForDisplay('Mod+Shift+Z')
```

### `formatWithLabels`

```ts
import { formatWithLabels } from '@tanstack/vue-hotkeys'

formatWithLabels('Mod+S')
formatWithLabels('Mod+Shift+Z')
```

### Using Formatted Hotkeys in Vue

#### Keyboard Shortcut Badges

```vue
<script setup lang="ts">
import { formatForDisplay } from '@tanstack/vue-hotkeys'

defineProps<{ hotkey: string }>()
</script>

<template>
  <kbd class="shortcut-badge">{{ formatForDisplay(hotkey) }}</kbd>
</template>
```

#### Menu Items with Hotkeys

```vue
<script setup lang="ts">
import { formatForDisplay, useHotkey } from '@tanstack/vue-hotkeys'

const props = defineProps<{
  label: string
  hotkey: string
  onAction: () => void
}>()

useHotkey(() => props.hotkey, () => props.onAction())
</script>

<template>
  <div class="menu-item">
    <span>{{ label }}</span>
    <span class="menu-shortcut">{{ formatForDisplay(hotkey) }}</span>
  </div>
</template>
```

### Validation

```ts
import { validateHotkey } from '@tanstack/vue-hotkeys'

const result = validateHotkey('Alt+A')
```

<a id="source-hotkeys-docs-framework-vue-guides-hotkey-recording-md"></a>

## Hotkey Recording

Source: `hotkeys:docs/framework/vue/guides/hotkey-recording.md`.

TanStack Hotkeys provides the `useHotkeyRecorder` composable for building shortcut customization UIs in Vue.

### Basic Usage

```vue
<script setup lang="ts">
import { formatForDisplay, useHotkeyRecorder } from '@tanstack/vue-hotkeys'

const recorder = useHotkeyRecorder({
  onRecord: (hotkey) => {
    console.log('Recorded:', hotkey)
  },
})
</script>

<template>
  <div>
    <button @click="recorder.isRecording ? recorder.stopRecording() : recorder.startRecording()">
      {{
        recorder.isRecording
          ? 'Press a key combination...'
          : recorder.recordedHotkey
            ? formatForDisplay(recorder.recordedHotkey)
            : 'Click to record'
      }}
    </button>
    <button v-if="recorder.isRecording" @click="recorder.cancelRecording()">
      Cancel
    </button>
  </div>
</template>
```

### Return Value

- `isRecording`: reactive ref-like value indicating whether recording is active
- `recordedHotkey`: reactive ref-like value with the most recently recorded hotkey
- `startRecording()`: start listening for key presses
- `stopRecording()`: stop listening and keep the current recording
- `cancelRecording()`: stop listening and discard the in-progress recording

### Options

```ts
useHotkeyRecorder({
  onRecord: (hotkey) => {},
  onCancel: () => {},
  onClear: () => {},
})
```

### Global Default Options via Provider

```vue
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
</script>

<template>
  <HotkeysProvider
    :default-options="{
      hotkeyRecorder: {
        onCancel: () => console.log('Recording cancelled'),
      },
    }"
  >
    <AppContent />
  </HotkeysProvider>
</template>
```

#### `ignoreInputs`

The `HotkeyRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder will not intercept normal typing in text inputs, textareas, selects, or contentEditable elements -- keystrokes pass through to the input as usual. Pressing **Escape** still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.

```ts
useHotkeyRecorder({
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

<a id="source-hotkeys-docs-framework-vue-guides-hotkeys-md"></a>

## Hotkeys

Source: `hotkeys:docs/framework/vue/guides/hotkeys.md`.

The `useHotkey` composable is the primary way to register keyboard shortcuts in Vue applications. It wraps the singleton `HotkeyManager` with automatic cleanup, support for template refs, and reactive option syncing.

### Basic Usage

```vue
<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'

useHotkey('Mod+S', () => {
  saveDocument()
})
</script>
```

The callback receives the original `KeyboardEvent` as the first argument and a `HotkeyCallbackContext` as the second:

```ts
useHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey)
  console.log(context.parsedHotkey)
})
```

### Default Options

`useHotkey` uses the same core defaults as the framework-agnostic manager:

```ts
useHotkey('Mod+S', callback, {
  enabled: true,
  preventDefault: true,
  stopPropagation: true,
  eventType: 'keydown',
  requireReset: false,
  ignoreInputs: undefined,
  target: document,
  platform: undefined,
  conflictBehavior: 'warn',
})
```

### Reactive Options

Vue-specific options can be plain values, refs, or getters.

#### `enabled`

When `enabled` is false, the hotkey **stays registered** (visible in devtools); only the callback is suppressed.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'

const isEditing = ref(false)

useHotkey('Mod+S', () => save(), { enabled: isEditing })
</script>
```

#### `target`

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'

const panelRef = ref<HTMLDivElement | null>(null)

useHotkey('Escape', () => closePanel(), { target: panelRef })
</script>

<template>
  <div ref="panelRef" tabindex="0">Panel content</div>
</template>
```

### Global Default Options via Provider

```vue
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
</script>

<template>
  <HotkeysProvider
    :default-options="{
      hotkey: { preventDefault: false, ignoreInputs: false },
    }"
  >
    <AppContent />
  </HotkeysProvider>
</template>
```

### Common Options

#### `requireReset`

```ts
useHotkey('Escape', () => closePanel(), { requireReset: true })
```

#### `ignoreInputs`

```ts
useHotkey('K', () => openSearch())
useHotkey('Enter', () => submit(), { ignoreInputs: false })
```

#### `conflictBehavior`

```ts
useHotkey('Mod+S', () => save(), { conflictBehavior: 'replace' })
```

#### `platform`

```ts
useHotkey('Mod+S', () => save(), { platform: 'mac' })
```

### Automatic Cleanup

Hotkeys are automatically unregistered when the owning component unmounts.

### Registering Multiple Hotkeys

When you need to register several hotkeys at once — or a dynamic, variable-length list — use the `useHotkeys` (plural) composable:

```vue
<script setup>
import { useHotkeys } from '@tanstack/vue-hotkeys'

useHotkeys([
  { hotkey: 'Mod+S', callback: () => save() },
  { hotkey: 'Mod+Z', callback: () => undo() },
  { hotkey: 'Escape', callback: () => close() },
])
</script>
```

#### Common Options with Per-Hotkey Overrides

Pass shared options as the second argument. Per-definition options override the common ones:

```ts
useHotkeys(
  [
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo(), options: { enabled: false } },
  ],
  { preventDefault: true },
)
```

#### Dynamic Hotkey Lists

Pass a getter or computed ref as the first argument for reactive arrays:

```vue
<script setup>
import { computed } from 'vue'
import { useHotkeys } from '@tanstack/vue-hotkeys'

const items = computed(() => [...])

useHotkeys(
  () => items.value.map((item) => ({
    hotkey: item.shortcut,
    callback: item.action,
  })),
)
</script>
```

The composable watches for changes and diffs registrations automatically.

### Metadata (name & description)

Every hotkey registration can carry a `meta` object with a `name` and `description`. This metadata is informational only -- it does not affect hotkey behavior -- but it flows through to registrations and devtools, making it easy to build shortcut palettes and help screens.

```ts
useHotkey('Mod+S', () => save(), {
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

useHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', icon: 'floppy', group: 'File' },
})
```

### Introspecting Registrations

Use the `useHotkeyRegistrations` composable to get a live view of all hotkey and sequence registrations. This is useful for building shortcut palettes, help dialogs, or devtools.

```vue
<script setup lang="ts">
import { useHotkeyRegistrations } from '@tanstack/vue-hotkeys'

const { hotkeys, sequences } = useHotkeyRegistrations()
</script>

<template>
  <div>
    <h2>Keyboard Shortcuts</h2>
    <ul>
      <li v-for="reg in hotkeys" :key="reg.hotkey">
        <kbd>{{ reg.hotkey }}</kbd>
        <span v-if="reg.meta?.name"> — {{ reg.meta.name }}</span>
        <p v-if="reg.meta?.description">{{ reg.meta.description }}</p>
      </li>
    </ul>
    <template v-if="sequences.length > 0">
      <h2>Sequences</h2>
      <ul>
        <li v-for="reg in sequences" :key="reg.sequence.join(' ')">
          <kbd>{{ reg.sequence.join(' → ') }}</kbd>
          <span v-if="reg.meta?.name"> — {{ reg.meta.name }}</span>
        </li>
      </ul>
    </template>
  </div>
</template>
```

The returned `hotkeys` array contains registration objects with the hotkey string, options (including `meta`), and enabled state. The `sequences` array contains sequence registrations with the same structure.

### The Hotkey Manager

You can always reach for the underlying manager directly:

```ts
import { getHotkeyManager } from '@tanstack/vue-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```

<a id="source-hotkeys-docs-framework-vue-guides-key-state-tracking-md"></a>

## Key State Tracking

Source: `hotkeys:docs/framework/vue/guides/key-state-tracking.md`.

TanStack Hotkeys provides three Vue composables for tracking live keyboard state: `useHeldKeys`, `useHeldKeyCodes`, and `useKeyHold`.

### `useHeldKeys`

```vue
<script setup lang="ts">
import { useHeldKeys } from '@tanstack/vue-hotkeys'

const heldKeys = useHeldKeys()
</script>

<template>
  <div>{{ heldKeys.length > 0 ? heldKeys.join(' + ') : 'No keys held' }}</div>
</template>
```

### `useHeldKeyCodes`

```vue
<script setup lang="ts">
import { useHeldKeyCodes } from '@tanstack/vue-hotkeys'

const heldCodes = useHeldKeyCodes()
</script>
```

### `useKeyHold`

```vue
<script setup lang="ts">
import { useKeyHold } from '@tanstack/vue-hotkeys'

const isShiftHeld = useKeyHold('Shift')
</script>

<template>
  <span :class="{ active: isShiftHeld }">Shift</span>
</template>
```

### Common Patterns

#### Hold-to-Reveal UI

```vue
<script setup lang="ts">
import { useKeyHold } from '@tanstack/vue-hotkeys'

const isShiftHeld = useKeyHold('Shift')
</script>

<template>
  <button v-if="isShiftHeld">Permanently Delete</button>
  <button v-else>Move to Trash</button>
</template>
```

#### Debugging Key Display

```vue
<script setup lang="ts">
import {
  formatForDisplay,
  useHeldKeyCodes,
  useHeldKeys,
} from '@tanstack/vue-hotkeys'
import type { RegisterableHotkey } from '@tanstack/vue-hotkeys'

const heldKeys = useHeldKeys()
const heldCodes = useHeldKeyCodes()
</script>

<template>
  <div v-for="key in heldKeys" :key="key">
    <strong>{{
      formatForDisplay(key as RegisterableHotkey, { useSymbols: true })
    }}</strong>
    <span>{{ heldCodes[key] }}</span>
  </div>
</template>
```

### Under the Hood

All three composables subscribe to the singleton `KeyStateTracker`:

```ts
import { getKeyStateTracker } from '@tanstack/vue-hotkeys'

const tracker = getKeyStateTracker()
tracker.getHeldKeys()
tracker.isKeyHeld('Shift')
```

<a id="source-hotkeys-docs-framework-vue-guides-sequence-recording-md"></a>

## Sequence Recording

Source: `hotkeys:docs/framework/vue/guides/sequence-recording.md`.

TanStack Hotkeys provides the `useHotkeySequenceRecorder` composable for building UIs where users record **multi-chord sequences** (Vim-style shortcuts). Each step is captured like a single hotkey chord; users finish with **Enter** by default, or you can use manual commit and optional idle timeout.

### Basic usage

```vue
import { useHotkeySequenceRecorder, formatForDisplay } from '@tanstack/vue-hotkeys'
import type { HotkeySequence } from '@tanstack/vue-hotkeys'

function HotkeySequenceRecorder() {
  const recorder = useHotkeySequenceRecorder({
    onRecord: (sequence: HotkeySequence) => {
      console.log('Recorded:', sequence)
    },
  })

  return (
    <div>
      <button
        type="button"
        onClick={
          recorder.isRecording ? recorder.cancelRecording : recorder.startRecording
        }
      >
        {recorder.isRecording
          ? 'Press chords, then Enter…'
          : recorder.recordedSequence
            ? recorder.recordedSequence.map((h) => formatForDisplay(h)).join(' ')
            : 'Click to record'}
      </button>
      {recorder.isRecording && (
        <button type="button" onClick={recorder.cancelRecording}>
          Cancel
        </button>
      )}
    </div>
  )
}
```

### Return value

| Property | Type | Description |
|----------|------|-------------|
| `isRecording` | `boolean` | Whether the recorder is listening |
| `steps` | `HotkeySequence` | Chords captured in the current session |
| `recordedSequence` | `HotkeySequence \| null` | Last committed sequence |
| `startRecording` | `() => void` | Start a new session |
| `stopRecording` | `() => void` | Stop without calling `onRecord` |
| `cancelRecording` | `() => void` | Stop and call `onCancel` |
| `commitRecording` | `() => void` | Commit current `steps` (no-op if empty) |

### Options

Core options live on `HotkeySequenceRecorderOptions` from `@tanstack/hotkeys`:

- `onRecord(sequence)` — called when a sequence is committed (including `[]` when cleared via Backspace with no steps).
- `onCancel`, `onClear` — same intent as the hotkey recorder.
- `commitKeys` — `'enter'` (default) or `'none'`. With `'none'`, only `commitRecording()` (or `idleTimeoutMs`) finishes recording; plain Enter can be recorded as a chord.
- `commitOnEnter` — when `commitKeys` is `'enter'`, set to `false` to treat Enter as a normal chord (then use `commitRecording()` or idle timeout to finish).
- `idleTimeoutMs` — optional milliseconds of inactivity **after the last completed chord** to auto-commit. The timer does not run while waiting for the **first** chord.

#### Provider defaults

```vue
<HotkeysProvider
  defaultOptions={{
    hotkeySequenceRecorder: {
      idleTimeoutMs: 2000,
    },
  }}
>
  <App />
</HotkeysProvider>
```

#### `ignoreInputs`

The `HotkeySequenceRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder will not intercept normal typing in text inputs, textareas, selects, or contentEditable elements -- keystrokes pass through to the input as usual. Pressing **Escape** still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.

### Behavior

| Input | Behavior |
|-------|----------|
| Valid chord | Appended to `steps`; listener stays active |
| Enter (no modifiers), `commitKeys: 'enter'`, `steps.length >= 1` | Commits and calls `onRecord` |
| Escape | Cancels; `onCancel` |
| Backspace / Delete (no modifiers) | Removes last step, or if empty runs `onClear` + `onRecord([])` and stops |

Recorded chords use portable `Mod` format, same as `HotkeyRecorder`.

### Under the hood

`useHotkeySequenceRecorder` wraps the `HotkeySequenceRecorder` class and subscribes to its TanStack Store, same pattern as `useHotkeyRecorder`.

<a id="source-hotkeys-docs-framework-vue-guides-sequences-md"></a>

## Sequences

Source: `hotkeys:docs/framework/vue/guides/sequences.md`.

TanStack Hotkeys supports multi-key sequences in Vue, where keys are pressed one after another rather than simultaneously.

### Basic Usage

```vue
<script setup lang="ts">
import { useHotkeySequence } from '@tanstack/vue-hotkeys'

useHotkeySequence(['G', 'G'], () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>
```

### Many sequences at once

When you need several sequences—or a **reactive** list whose length changes—use `useHotkeySequences` instead of many `useHotkeySequence` calls. One composable registers every sequence safely.

```vue
<script setup lang="ts">
import { useHotkeySequences } from '@tanstack/vue-hotkeys'

useHotkeySequences([
  { sequence: ['G', 'G'], callback: () => scrollToTop() },
  { sequence: ['D', 'D'], callback: () => deleteLine(), options: { timeout: 500 } },
])
</script>
```

Options merge like `useHotkeys`: `HotkeysProvider` defaults, then `commonOptions`, then each definition’s `options`.

### Sequence Options

```ts
useHotkeySequence(['G', 'G'], callback, {
  timeout: 1000,
  enabled: true,
})
```

#### Reactive `enabled`

When disabled, the sequence **stays registered** (visible in devtools); only execution is suppressed.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useHotkeySequence } from '@tanstack/vue-hotkeys'

const isVimMode = ref(true)

useHotkeySequence(['G', 'G'], () => scrollToTop(), {
  enabled: isVimMode,
})
</script>
```

### Global Default Options via Provider

```vue
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
</script>

<template>
  <HotkeysProvider
    :default-options="{
      hotkeySequence: { timeout: 1500 },
    }"
  >
    <AppContent />
  </HotkeysProvider>
</template>
```

#### `meta`

Sequences support the same `meta` option as hotkeys, allowing you to attach a `name` and `description` for use in shortcut palettes and devtools.

```ts
useHotkeySequence(['G', 'G'], () => scrollToTop(), {
  meta: { name: 'Go to Top', description: 'Scroll to the top of the page' },
})
```

See the [Hotkeys Guide](./framework-vue.md#source-hotkeys-docs-framework-vue-guides-hotkeys-md) for details on declaration merging and introspecting registrations.

### Chained modifier chords

Each step can use modifiers (for example `Mod+K` then `Mod+C`). You can use the **same** modifier on consecutive steps:

```ts
useHotkeySequence(['Shift+R', 'Shift+T'], () => doNextAction())
```

While a sequence is in progress, **modifier-only** keydown events (Shift, Control, Alt, or Meta pressed alone) are ignored: they do not advance the sequence and do not reset progress. A user can press Shift alone between `Shift+R` and `Shift+T` without breaking the sequence.

### Common Patterns

#### Vim-Style Navigation

```ts
useHotkeySequence(['G', 'G'], () => scrollToTop())
useHotkeySequence(['G', 'Shift+G'], () => scrollToBottom())
useHotkeySequence(['D', 'D'], () => deleteLine())
useHotkeySequence(['D', 'W'], () => deleteWord())
useHotkeySequence(['C', 'I', 'W'], () => changeInnerWord())
```

#### Konami Code

```ts
useHotkeySequence(
  ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'B', 'A'],
  () => enableEasterEgg(),
  { timeout: 2000 },
)
```

### Under the Hood

`useHotkeySequence` uses the singleton `SequenceManager`. You can also access it directly:

```ts
import { createSequenceMatcher, getSequenceManager } from '@tanstack/vue-hotkeys'

const manager = getSequenceManager()
const matcher = createSequenceMatcher(['G', 'G'], { timeout: 1000 })
```

<a id="source-hotkeys-docs-framework-vue-quick-start-md"></a>

## Quick Start

Source: `hotkeys:docs/framework/vue/quick-start.md`.

### Installation

Don't have TanStack Hotkeys installed yet? See the [Installation](./foundations.md#source-hotkeys-docs-installation-md) page for instructions.

### Your First Hotkey

The `useHotkey` composable is the primary way to register keyboard shortcuts in Vue:

```vue
<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'

useHotkey('Mod+S', () => {
  saveDocument()
})
</script>

<template>
  <div>Press Cmd+S (Mac) or Ctrl+S (Windows) to save</div>
</template>
```

The `Mod` modifier automatically resolves to `Meta` (Command) on macOS and `Control` on Windows/Linux, so your shortcuts work across platforms without extra logic.

### Common Patterns

#### Multiple Hotkeys

```vue
<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'

useHotkey('Mod+S', () => save())
useHotkey('Mod+Z', () => undo())
useHotkey('Mod+Shift+Z', () => redo())
useHotkey('Mod+F', () => openSearch())
useHotkey('Escape', () => closeDialog())
</script>
```

#### Scoped Hotkeys with Template Refs

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'

const panelRef = ref<HTMLDivElement | null>(null)

useHotkey('Escape', () => closePanel(), { target: panelRef })
</script>

<template>
  <div ref="panelRef" tabindex="0">
    <p>Press Escape while focused here to close</p>
  </div>
</template>
```

#### Conditional Hotkeys

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'

const isOpen = ref(true)

useHotkey('Escape', () => {
  isOpen.value = false
}, { enabled: isOpen })
</script>
```

#### Multi-Key Sequences

```vue
<script setup lang="ts">
import { useHotkeySequence } from '@tanstack/vue-hotkeys'

useHotkeySequence(['G', 'G'], () => scrollToTop())
useHotkeySequence(['G', 'Shift+G'], () => scrollToBottom())
</script>
```

For several sequences or a list that changes at runtime, prefer a single `useHotkeySequences([...])` call (see the [Sequences guide](./framework-vue.md#source-hotkeys-docs-framework-vue-guides-sequences-md)).

#### Tracking Held Keys

```vue
<script setup lang="ts">
import { useHeldKeys, useKeyHold } from '@tanstack/vue-hotkeys'

const heldKeys = useHeldKeys()
const isShiftHeld = useKeyHold('Shift')
</script>

<template>
  <div class="status-bar">
    <span v-if="isShiftHeld">Shift mode active</span>
    <span v-if="heldKeys.length > 0">Keys: {{ heldKeys.join('+') }}</span>
  </div>
</template>
```

#### Displaying Hotkeys in the UI

```vue
<script setup lang="ts">
import { formatForDisplay, useHotkey } from '@tanstack/vue-hotkeys'

useHotkey('Mod+S', () => save())
</script>

<template>
  <button>
    Save <kbd>{{ formatForDisplay('Mod+S') }}</kbd>
  </button>
</template>
```

### Default Options Provider

Wrap part of your app with `HotkeysProvider` to set default options for all Vue composables in that subtree:

```vue
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
</script>

<template>
  <HotkeysProvider
    :default-options="{
      hotkey: { preventDefault: true },
      hotkeySequence: { timeout: 1500 },
      hotkeyRecorder: { onCancel: () => console.log('Recording cancelled') },
    }"
  >
    <AppContent />
  </HotkeysProvider>
</template>
```

### Next Steps

- [Hotkeys Guide](./framework-vue.md#source-hotkeys-docs-framework-vue-guides-hotkeys-md)
- [Sequences Guide](./framework-vue.md#source-hotkeys-docs-framework-vue-guides-sequences-md)
- [Hotkey Recording Guide](./framework-vue.md#source-hotkeys-docs-framework-vue-guides-hotkey-recording-md)
- [Sequence Recording Guide](./framework-vue.md#source-hotkeys-docs-framework-vue-guides-sequence-recording-md)
- [Key State Tracking Guide](./framework-vue.md#source-hotkeys-docs-framework-vue-guides-key-state-tracking-md)
- [Formatting & Display Guide](./framework-vue.md#source-hotkeys-docs-framework-vue-guides-formatting-display-md)
