# Formatting Display

<a id="source-hotkeys-docs-framework-svelte-guides-formatting-display-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.8.0`.

[Topic index](../framework-svelte.md) · [Source provenance](../SOURCES.md)

TanStack Hotkeys includes utilities for turning hotkey strings into display-friendly labels. These utilities are framework-agnostic, but they pair naturally with Svelte templates and reactive UI.

## `formatForDisplay`

```ts
import { formatForDisplay } from '@tanstack/svelte-hotkeys'

formatForDisplay('Mod+S')
formatForDisplay('Mod+Shift+Z')
```

## `formatWithLabels`

```ts
import { formatWithLabels } from '@tanstack/svelte-hotkeys'

formatWithLabels('Mod+S')
formatWithLabels('Mod+Shift+Z')
```

## Using Formatted Hotkeys in Svelte

### Keyboard Shortcut Badges

```svelte
<script lang="ts">
  import { formatForDisplay } from '@tanstack/svelte-hotkeys'
</script>

<kbd class="shortcut-badge">{formatForDisplay(hotkey)}</kbd>
```

### Menu Items with Hotkeys

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

## Validation

```ts
import { validateHotkey } from '@tanstack/svelte-hotkeys'

const result = validateHotkey('Alt+A')
```
