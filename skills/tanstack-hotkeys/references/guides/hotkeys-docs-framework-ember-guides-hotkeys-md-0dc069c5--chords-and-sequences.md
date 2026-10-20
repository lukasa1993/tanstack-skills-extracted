# Hotkeys — Chords and sequences

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md) · Release-matched documentation · `@tanstack/hotkeys@0.17.0`.

## Chords and sequences

A hotkey is one of two kinds:

- A **chord** is keys pressed together, such as `'Mod+S'`, or a single key, such as `'Escape'`.
- A **sequence** is chords pressed one after another, such as `['G', 'H']`. Write it as an array of chords. In a template, build the array with the `array` helper from `@ember/helper`.

```hbs
{{! Mod and K together }}
{{useHotkey 'Mod+K' this.openSearch}}

{{! G, then H }}
{{useHotkey (array 'G' 'H') this.goHome}}
```

Every helper, modifier, and option in this guide accepts both kinds, and most examples use chords. [Sequences](./hotkeys-docs-framework-ember-guides-sequences-md-0637d856.md#source-hotkeys-docs-framework-ember-guides-sequences-md) covers how sequences match, the time allowed between steps, and sequences that start with the same chord.
