# Angular adapter

Angular-specific setup and behavior.

<a id="source-hotkeys-docs-framework-angular-guides-formatting-display-md"></a>

## Formatting Display

Source: `hotkeys:docs/framework/angular/guides/formatting-display.md`.

TanStack Hotkeys includes utilities for turning hotkey strings into display-friendly labels. These utilities are framework-agnostic, but they pair naturally with Angular templates and signals.

### `formatForDisplay`

```ts
import { formatForDisplay } from '@tanstack/angular-hotkeys'

formatForDisplay('Mod+S')
formatForDisplay('Mod+Shift+Z')
```

### `formatWithLabels`

```ts
import { formatWithLabels } from '@tanstack/angular-hotkeys'

formatWithLabels('Mod+S')
formatWithLabels('Mod+Shift+Z')
```

### Using Formatted Hotkeys in Angular

#### Keyboard Shortcut Badges

```ts
import { Component, input } from '@angular/core'
import { formatForDisplay } from '@tanstack/angular-hotkeys'

@Component({
  standalone: true,
  selector: 'app-shortcut-badge',
  template: `<kbd class="shortcut-badge">{{ formatForDisplay(hotkey()) }}</kbd>`,
})
export class ShortcutBadgeComponent {
  readonly hotkey = input.required<string>()
  readonly formatForDisplay = formatForDisplay
}
```

#### Menu Items with Hotkeys

```ts
import { Component, input } from '@angular/core'
import { formatForDisplay, injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  standalone: true,
  selector: 'app-menu-item',
  template: `
    <div class="menu-item">
      <span>{{ label() }}</span>
      <span class="menu-shortcut">{{ formatForDisplay(hotkey()) }}</span>
    </div>
  `,
})
export class MenuItemComponent {
  readonly label = input.required<string>()
  readonly hotkey = input.required<string>()
  readonly onAction = input.required<() => void>()
  readonly formatForDisplay = formatForDisplay

  constructor() {
    injectHotkey(() => this.hotkey(), () => this.onAction()())
  }
}
```

### Validation

```ts
import { validateHotkey } from '@tanstack/angular-hotkeys'

const result = validateHotkey('Alt+A')
```

<a id="source-hotkeys-docs-framework-angular-guides-hotkey-recording-md"></a>

## Hotkey Recording

Source: `hotkeys:docs/framework/angular/guides/hotkey-recording.md`.

TanStack Hotkeys provides the `injectHotkeyRecorder` API for building shortcut customization UIs in Angular.

### Basic Usage

```ts
import { Component } from '@angular/core'
import {
  formatForDisplay,
  injectHotkeyRecorder,
} from '@tanstack/angular-hotkeys'

@Component({
  standalone: true,
  template: `
    <button (click)="recorder.isRecording() ? recorder.stopRecording() : recorder.startRecording()">
      {{
        recorder.isRecording()
          ? 'Press a key combination...'
          : recorder.recordedHotkey()
            ? formatForDisplay(recorder.recordedHotkey()!)
            : 'Click to record'
      }}
    </button>
    @if (recorder.isRecording()) {
      <button (click)="recorder.cancelRecording()">Cancel</button>
    }
  `,
})
export class ShortcutRecorderComponent {
  readonly formatForDisplay = formatForDisplay
  readonly recorder = injectHotkeyRecorder({
    onRecord: (hotkey) => {
      console.log('Recorded:', hotkey)
    },
  })
}
```

### Return Value

- `isRecording()`: Angular signal getter indicating whether recording is active
- `recordedHotkey()`: Angular signal getter with the most recently recorded hotkey
- `startRecording()`: start listening for key presses
- `stopRecording()`: stop listening and keep the current recording
- `cancelRecording()`: stop listening and discard the in-progress recording

### Options

```ts
injectHotkeyRecorder({
  onRecord: (hotkey) => {},
  onCancel: () => {},
  onClear: () => {},
})
```

### Global Default Options via Provider

```ts
import { ApplicationConfig } from '@angular/core'
import { provideHotkeys } from '@tanstack/angular-hotkeys'

export const appConfig: ApplicationConfig = {
  providers: [
    provideHotkeys({
      hotkeyRecorder: {
        onCancel: () => console.log('Recording cancelled'),
      },
    }),
  ],
}
```

#### `ignoreInputs`

The `HotkeyRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder will not intercept normal typing in text inputs, textareas, selects, or contentEditable elements -- keystrokes pass through to the input as usual. Pressing **Escape** still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.

```ts
injectHotkeyRecorder({
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

<a id="source-hotkeys-docs-framework-angular-guides-hotkeys-md"></a>

## Hotkeys

Source: `hotkeys:docs/framework/angular/guides/hotkeys.md`.

The `injectHotkey` API is the primary way to register keyboard shortcuts in Angular applications. It wraps the singleton `HotkeyManager` with injection-context lifecycle management and Angular signal-friendly reactive options.

### Basic Usage

```ts
import { Component } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({ standalone: true, template: `` })
export class AppComponent {
  constructor() {
    injectHotkey('Mod+S', () => {
      saveDocument()
    })
  }
}
```

The callback receives the original `KeyboardEvent` as the first argument and a `HotkeyCallbackContext` as the second:

```ts
injectHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey)
  console.log(context.parsedHotkey)
})
```

### Default Options

`injectHotkey` uses the same core defaults as the framework-agnostic manager:

```ts
injectHotkey('Mod+S', callback, {
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

For reactive state, pass an accessor function as the third argument.

#### `enabled`

When `enabled` is false, the hotkey **stays registered** (visible in devtools); only the callback is suppressed.

```ts
import { Component, signal } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({ standalone: true, template: `` })
export class EditorComponent {
  readonly isEditing = signal(false)

  constructor() {
    injectHotkey('Mod+S', () => save(), () => ({
      enabled: this.isEditing(),
    }))
  }
}
```

#### `target`

```ts
import { Component, ElementRef, viewChild } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  standalone: true,
  template: `<div #panel tabindex="0">Panel content</div>`,
})
export class PanelComponent {
  private readonly panel = viewChild<ElementRef<HTMLDivElement>>('panel')

  constructor() {
    injectHotkey('Escape', () => closePanel(), () => ({
      target: this.panel()?.nativeElement ?? null,
    }))
  }
}
```

### Global Default Options via Provider

```ts
import { ApplicationConfig } from '@angular/core'
import { provideHotkeys } from '@tanstack/angular-hotkeys'

export const appConfig: ApplicationConfig = {
  providers: [
    provideHotkeys({
      hotkey: { preventDefault: false, ignoreInputs: false },
    }),
  ],
}
```

### Common Options

#### `requireReset`

```ts
injectHotkey('Escape', () => closePanel(), { requireReset: true })
```

#### `ignoreInputs`

```ts
injectHotkey('K', () => openSearch())
injectHotkey('Enter', () => submit(), { ignoreInputs: false })
```

#### `conflictBehavior`

```ts
injectHotkey('Mod+S', () => save(), { conflictBehavior: 'replace' })
```

#### `platform`

```ts
injectHotkey('Mod+S', () => save(), { platform: 'mac' })
```

### Automatic Cleanup

Registrations are cleaned up automatically when the owning injection context is destroyed.

### Registering Multiple Hotkeys

When you need to register several hotkeys at once — or a dynamic, variable-length list — use `injectHotkeys` (plural):

```ts
import { Component } from '@angular/core'
import { injectHotkeys } from '@tanstack/angular-hotkeys'

@Component({ standalone: true, template: `` })
export class EditorComponent {
  constructor() {
    injectHotkeys([
      { hotkey: 'Mod+S', callback: () => this.save() },
      { hotkey: 'Mod+Z', callback: () => this.undo() },
      { hotkey: 'Escape', callback: () => this.close() },
    ])
  }
}
```

#### Common Options with Per-Hotkey Overrides

Pass shared options as the second argument. Per-definition options override the common ones:

```ts
injectHotkeys(
  [
    { hotkey: 'Mod+S', callback: () => this.save() },
    { hotkey: 'Mod+Z', callback: () => this.undo(), options: { enabled: false } },
  ],
  { preventDefault: true },
)
```

#### Dynamic Hotkey Lists

Pass a getter for reactive arrays driven by Angular signals:

```ts
shortcuts = signal([...])

constructor() {
  injectHotkeys(
    () => this.shortcuts().map((s) => ({
      hotkey: s.key,
      callback: s.action,
    })),
  )
}
```

The function tracks signal dependencies and diffs registrations automatically.

### Metadata (name & description)

Every hotkey registration can carry a `meta` object with a `name` and `description`. This metadata is informational only -- it does not affect hotkey behavior -- but it flows through to registrations and devtools, making it easy to build shortcut palettes and help screens.

```ts
injectHotkey('Mod+S', () => save(), {
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

injectHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', icon: 'floppy', group: 'File' },
})
```

### Introspecting Registrations

Use the `injectHotkeyRegistrations` API to get a live view of all hotkey and sequence registrations. This is useful for building shortcut palettes, help dialogs, or devtools.

```ts
import { Component } from '@angular/core'
import { injectHotkeyRegistrations } from '@tanstack/angular-hotkeys'

@Component({
  standalone: true,
  template: `
    <h2>Keyboard Shortcuts</h2>
    <ul>
      @for (reg of registrations().hotkeys; track reg.hotkey) {
        <li>
          <kbd>{{ reg.hotkey }}</kbd>
          @if (reg.meta?.name) {
            <span> — {{ reg.meta.name }}</span>
          }
          @if (reg.meta?.description) {
            <p>{{ reg.meta.description }}</p>
          }
        </li>
      }
    </ul>
    @if (registrations().sequences.length > 0) {
      <h2>Sequences</h2>
      <ul>
        @for (reg of registrations().sequences; track reg.sequence.join(' ')) {
          <li>
            <kbd>{{ reg.sequence.join(' → ') }}</kbd>
            @if (reg.meta?.name) {
              <span> — {{ reg.meta.name }}</span>
            }
          </li>
        }
      </ul>
    }
  `,
})
export class ShortcutPaletteComponent {
  readonly registrations = injectHotkeyRegistrations()
}
```

The returned signal provides an object with a `hotkeys` array containing registration objects with the hotkey string, options (including `meta`), and enabled state, and a `sequences` array containing sequence registrations with the same structure.

### The Hotkey Manager

You can access the underlying manager directly when needed:

```ts
import { getHotkeyManager } from '@tanstack/angular-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```

<a id="source-hotkeys-docs-framework-angular-guides-key-state-tracking-md"></a>

## Key State Tracking

Source: `hotkeys:docs/framework/angular/guides/key-state-tracking.md`.

TanStack Hotkeys provides three Angular APIs for tracking live keyboard state: `injectHeldKeys`, `injectHeldKeyCodes`, and `injectKeyHold`.

### `injectHeldKeys`

```ts
import { Component } from '@angular/core'
import { injectHeldKeys } from '@tanstack/angular-hotkeys'

@Component({
  standalone: true,
  template: `
    <div>
      {{ heldKeys().length > 0 ? heldKeys().join(' + ') : 'No keys held' }}
    </div>
  `,
})
export class KeyDisplayComponent {
  readonly heldKeys = injectHeldKeys()
}
```

### `injectHeldKeyCodes`

```ts
import { injectHeldKeyCodes } from '@tanstack/angular-hotkeys'

readonly heldCodes = injectHeldKeyCodes()
```

### `injectKeyHold`

```ts
import { injectKeyHold } from '@tanstack/angular-hotkeys'

readonly isShiftHeld = injectKeyHold('Shift')
```

### Common Patterns

#### Hold-to-Reveal UI

```ts
import { Component } from '@angular/core'
import { injectKeyHold } from '@tanstack/angular-hotkeys'

@Component({
  standalone: true,
  template: `
    @if (isShiftHeld()) {
      <button>Permanently Delete</button>
    } @else {
      <button>Move to Trash</button>
    }
  `,
})
export class FileActionsComponent {
  readonly isShiftHeld = injectKeyHold('Shift')
}
```

#### Debugging Key Display

```ts
import { Component } from '@angular/core'
import {
  formatForDisplay,
  injectHeldKeyCodes,
  injectHeldKeys,
  type RegisterableHotkey,
} from '@tanstack/angular-hotkeys'

@Component({ standalone: true, template: `` })
export class KeyDebuggerComponent {
  readonly heldKeys = injectHeldKeys()
  readonly heldCodes = injectHeldKeyCodes()
  readonly formatKey = (k: string) =>
    formatForDisplay(k as RegisterableHotkey, { useSymbols: true })
}
```

### Under the Hood

All three APIs subscribe to the singleton `KeyStateTracker`:

```ts
import { getKeyStateTracker } from '@tanstack/angular-hotkeys'

const tracker = getKeyStateTracker()
tracker.getHeldKeys()
tracker.isKeyHeld('Shift')
```

<a id="source-hotkeys-docs-framework-angular-guides-sequence-recording-md"></a>

## Sequence Recording

Source: `hotkeys:docs/framework/angular/guides/sequence-recording.md`.

Use `injectHotkeySequenceRecorder` from `@tanstack/angular-hotkeys` for sequence recording. It returns signals: `isRecording()`, `steps()`, `recordedSequence()`, and methods `startRecording`, `stopRecording`, `cancelRecording`, `commitRecording`.

Options match the core `HotkeySequenceRecorder` class. Provide defaults via `provideHotkeys({ hotkeySequenceRecorder: { ... } })`.

#### `ignoreInputs`

The `HotkeySequenceRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder will not intercept normal typing in text inputs, textareas, selects, or contentEditable elements -- keystrokes pass through to the input as usual. Pressing **Escape** still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.

<a id="source-hotkeys-docs-framework-angular-guides-sequences-md"></a>

## Sequences

Source: `hotkeys:docs/framework/angular/guides/sequences.md`.

TanStack Hotkeys supports multi-key sequences in Angular, where keys are pressed one after another rather than simultaneously.

### Basic Usage

```ts
import { Component } from '@angular/core'
import { injectHotkeySequence } from '@tanstack/angular-hotkeys'

@Component({ standalone: true, template: `` })
export class AppComponent {
  constructor() {
    injectHotkeySequence(['G', 'G'], () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }
}
```

### Many sequences at once

Use `injectHotkeySequences` when you want several sequences (or a list built from data) in one injection context, instead of many `injectHotkeySequence` calls.

```ts
import { Component } from '@angular/core'
import { injectHotkeySequences } from '@tanstack/angular-hotkeys'

@Component({ standalone: true, template: `` })
export class AppComponent {
  constructor() {
    injectHotkeySequences([
      {
        sequence: ['G', 'G'],
        callback: () =>
          window.scrollTo({ top: 0, behavior: 'smooth' }),
      },
      {
        sequence: ['D', 'D'],
        callback: () => console.log('delete line'),
        options: { timeout: 500 },
      },
    ])
  }
}
```

Options merge like `injectHotkeys`: `provideHotkeys` defaults, then `commonOptions`, then each definition’s `options`.

### Sequence Options

```ts
injectHotkeySequence(['G', 'G'], callback, {
  timeout: 1000,
  enabled: true,
})
```

#### Reactive `enabled`

When disabled, the sequence **stays registered** (visible in devtools); only execution is suppressed.

```ts
import { Component, signal } from '@angular/core'
import { injectHotkeySequence } from '@tanstack/angular-hotkeys'

@Component({ standalone: true, template: `` })
export class VimModeComponent {
  readonly isVimMode = signal(true)

  constructor() {
    injectHotkeySequence(['G', 'G'], () => scrollToTop(), () => ({
      enabled: this.isVimMode(),
    }))
  }
}
```

### Global Default Options via Provider

```ts
import { ApplicationConfig } from '@angular/core'
import { provideHotkeys } from '@tanstack/angular-hotkeys'

export const appConfig: ApplicationConfig = {
  providers: [
    provideHotkeys({
      hotkeySequence: { timeout: 1500 },
    }),
  ],
}
```

#### `meta`

Sequences support the same `meta` option as hotkeys, allowing you to attach a `name` and `description` for use in shortcut palettes and devtools.

```ts
injectHotkeySequence(['G', 'G'], () => scrollToTop(), {
  meta: { name: 'Go to Top', description: 'Scroll to the top of the page' },
})
```

See the [Hotkeys Guide](./framework-angular.md#source-hotkeys-docs-framework-angular-guides-hotkeys-md) for details on declaration merging and introspecting registrations.

### Chained modifier chords

You can repeat the same modifier across consecutive steps:

```ts
injectHotkeySequence(['Shift+R', 'Shift+T'], () => doNextAction())
```

While a sequence is in progress, **modifier-only** keydown events (Shift, Control, Alt, or Meta pressed alone) are ignored: they do not advance the sequence and do not reset progress, so a user can press Shift alone between chords without breaking the sequence.

### Common Patterns

#### Vim-Style Navigation

```ts
injectHotkeySequence(['G', 'G'], () => scrollToTop())
injectHotkeySequence(['G', 'Shift+G'], () => scrollToBottom())
injectHotkeySequence(['D', 'D'], () => deleteLine())
injectHotkeySequence(['D', 'W'], () => deleteWord())
injectHotkeySequence(['C', 'I', 'W'], () => changeInnerWord())
```

#### Konami Code

```ts
injectHotkeySequence(
  ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'B', 'A'],
  () => enableEasterEgg(),
  { timeout: 2000 },
)
```

### Under the Hood

`injectHotkeySequence` uses the singleton `SequenceManager`. You can also access it directly:

```ts
import {
  createSequenceMatcher,
  getSequenceManager,
} from '@tanstack/angular-hotkeys'

const manager = getSequenceManager()
const matcher = createSequenceMatcher(['G', 'G'], { timeout: 1000 })
```

<a id="source-hotkeys-docs-framework-angular-quick-start-md"></a>

## Quick Start

Source: `hotkeys:docs/framework/angular/quick-start.md`.

### Installation

Don't have TanStack Hotkeys installed yet? See the [Installation](./foundations.md#source-hotkeys-docs-installation-md) page for instructions.

### Your First Hotkey

The `injectHotkey` API is the primary way to register keyboard shortcuts in Angular:

```ts
import { Component } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<div>Press Cmd+S (Mac) or Ctrl+S (Windows) to save</div>`,
})
export class AppComponent {
  constructor() {
    injectHotkey('Mod+S', () => {
      saveDocument()
    })
  }
}
```

The `Mod` modifier automatically resolves to `Meta` (Command) on macOS and `Control` on Windows/Linux, so your shortcuts work across platforms without extra logic.

### Common Patterns

#### Multiple Hotkeys

```ts
constructor() {
  injectHotkey('Mod+S', () => save())
  injectHotkey('Mod+Z', () => undo())
  injectHotkey('Mod+Shift+Z', () => redo())
  injectHotkey('Mod+F', () => openSearch())
  injectHotkey('Escape', () => closeDialog())
}
```

#### Scoped Hotkeys with `viewChild`

```ts
import { Component, ElementRef, viewChild } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  standalone: true,
  template: `
    <div #panel tabindex="0">
      <p>Press Escape while focused here to close</p>
    </div>
  `,
})
export class PanelComponent {
  private readonly panel = viewChild<ElementRef<HTMLDivElement>>('panel')

  constructor() {
    injectHotkey('Escape', () => closePanel(), () => ({
      target: this.panel()?.nativeElement ?? null,
    }))
  }
}
```

#### Conditional Hotkeys

```ts
import { Component, signal } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({ standalone: true, template: `` })
export class ModalComponent {
  readonly isOpen = signal(true)

  constructor() {
    injectHotkey('Escape', () => this.isOpen.set(false), () => ({
      enabled: this.isOpen(),
    }))
  }
}
```

#### Multi-Key Sequences

```ts
import { injectHotkeySequence } from '@tanstack/angular-hotkeys'

constructor() {
  injectHotkeySequence(['G', 'G'], () => scrollToTop())
  injectHotkeySequence(['G', 'Shift+G'], () => scrollToBottom())
}
```

#### Tracking Held Keys

```ts
import { Component } from '@angular/core'
import { injectHeldKeys, injectKeyHold } from '@tanstack/angular-hotkeys'

@Component({
  standalone: true,
  template: `
    <div class="status-bar">
      @if (isShiftHeld()) {
        <span>Shift mode active</span>
      }
      @if (heldKeys().length > 0) {
        <span>Keys: {{ heldKeys().join('+') }}</span>
      }
    </div>
  `,
})
export class StatusBarComponent {
  readonly heldKeys = injectHeldKeys()
  readonly isShiftHeld = injectKeyHold('Shift')
}
```

#### Displaying Hotkeys in the UI

```ts
import { Component } from '@angular/core'
import { formatForDisplay, injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  standalone: true,
  template: `<button>Save <kbd>{{ saveLabel }}</kbd></button>`,
})
export class SaveButtonComponent {
  readonly saveLabel = formatForDisplay('Mod+S')

  constructor() {
    injectHotkey('Mod+S', () => save())
  }
}
```

### Default Options Provider

Use `provideHotkeys` to configure default options for your Angular app:

```ts
import { ApplicationConfig } from '@angular/core'
import { provideHotkeys } from '@tanstack/angular-hotkeys'

export const appConfig: ApplicationConfig = {
  providers: [
    provideHotkeys({
      hotkey: { preventDefault: true },
      hotkeySequence: { timeout: 1500 },
      hotkeyRecorder: { onCancel: () => console.log('Recording cancelled') },
    }),
  ],
}
```

### Next Steps

- [Hotkeys Guide](./framework-angular.md#source-hotkeys-docs-framework-angular-guides-hotkeys-md)
- [Sequences Guide](./framework-angular.md#source-hotkeys-docs-framework-angular-guides-sequences-md)
- [Hotkey Recording Guide](./framework-angular.md#source-hotkeys-docs-framework-angular-guides-hotkey-recording-md)
- [Sequence Recording Guide](./framework-angular.md#source-hotkeys-docs-framework-angular-guides-sequence-recording-md)
- [Key State Tracking Guide](./framework-angular.md#source-hotkeys-docs-framework-angular-guides-key-state-tracking-md)
- [Formatting & Display Guide](./framework-angular.md#source-hotkeys-docs-framework-angular-guides-formatting-display-md)
