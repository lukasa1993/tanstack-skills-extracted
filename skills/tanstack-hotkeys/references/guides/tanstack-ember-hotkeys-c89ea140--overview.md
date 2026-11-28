# Ember Hotkeys — Overview

[Guide and prerequisites](./tanstack-ember-hotkeys-c89ea140.md) · Published skill · `@tanstack/ember-hotkeys@0.16.0`.

# TanStack Hotkeys in Ember

Before starting, load the `@tanstack/hotkeys#hotkeys-core` skill (`npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core`).

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { array } from '@ember/helper'
import { onHotkey, useHotkey } from '@tanstack/ember-hotkeys'

export default class Editor extends Component {
  @tracked dirty = false
  save = () => saveDocument()
  close = () => closePanel()
  scrollToTop = () => window.scrollTo({ top: 0 })

  <template>
    {{useHotkey "Mod+S" this.save enabled=this.dirty}}
    {{useHotkey (array "G" "G") this.scrollToTop}}
    <div tabindex="0" {{onHotkey "Escape" this.close}}>Panel</div>
  </template>
}
```
