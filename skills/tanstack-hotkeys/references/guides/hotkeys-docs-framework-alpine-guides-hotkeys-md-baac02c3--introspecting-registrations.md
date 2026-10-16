# Hotkeys — Introspecting registrations

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md) · Release-matched documentation · `@tanstack/hotkeys@0.14.0`.

## Introspecting registrations

Use the `createHotkeyRegistrations` scope method to get a live view of every registration, chords and sequences together. It's the building block for shortcut palettes and help dialogs.

```ts
// Inside init():
this.registrations = this.scope.createHotkeyRegistrations()
this.scope.createHotkey('Mod+S', () => this.save(), {
	meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

```html
<template x-for="registration in registrations.hotkeys" :key="registration.id">
	<p x-text="registration.options.meta?.name + ': ' + formatForDisplay(registration.hotkey)"></p>
</template>
```

Read the reactive `hotkeys` array in templates or effects. Each view has an `id`, the `hotkey`, its `options` (including `meta`), its `target`, and a `triggerCount`. Narrow with `kind`: chord views add `parsedHotkey`; sequence views add `parsedSequence` and `matchedStepCount`, the steps matched so far in the current attempt. Disabled entries stay listed; unmounted registrations disappear. Format any hotkey with `formatForDisplay`, and group entries by `options.meta?.group` when building a help panel.

Registrations only exist while their components are mounted. To list hotkeys from routes that have not rendered, declare them with [app hotkeys](./hotkeys-docs-framework-alpine-guides-app-hotkeys-md-06d36fd9.md#source-hotkeys-docs-framework-alpine-guides-app-hotkeys-md).
