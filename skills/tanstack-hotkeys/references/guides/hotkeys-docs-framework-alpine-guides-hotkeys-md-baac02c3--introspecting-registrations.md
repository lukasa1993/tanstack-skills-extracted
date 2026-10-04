# Hotkeys — Introspecting registrations

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md) · Release-matched documentation · `@tanstack/hotkeys@0.11.0`.

## Introspecting registrations

Read `hotkeys` and `sequences` from `createHotkeyRegistrations()`. Disabled entries stay listed; destroyed registrations disappear. Both arrays include options and metadata. Hotkey views include enabled state and trigger counts; sequence views include sequence steps and progress.

```ts
// Inside init():
this.registrations = this.scope.createHotkeyRegistrations()
this.scope.createHotkey('Mod+S', () => this.save(), {
	meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

```html
<template x-for="registration in registrations.hotkeys" :key="registration.id">
	<p x-text="registration.options.meta?.name + ': ' + registration.hotkey"></p>
</template>
```

Read `registrations.sequences` in the same way. Format each sequence step with `formatForDisplay` and join the labels with an arrow. Group entries by `registration.options.meta?.group` when building a help panel.
