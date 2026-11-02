# Sensible Defaults — Component libraries that handle the same keys

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.24.0`.

## Component libraries that handle the same keys

Component libraries close dialogs, menus, and popovers on Escape, and editors handle chords such as `Mod+B`. When a hotkey uses the same key, one key press can reach both. What happens depends on where the library listens and whether it calls `preventDefault()`.

### Skip keys a library already handled

Many libraries call `preventDefault()` on a key they handle and let it keep going. Your hotkey then runs too, so one Escape press closes a dropdown and also clears the user's selection. Set `ignoreDefaultPrevented: true` in your shared defaults (see [Changing the defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#changing-the-defaults)) so hotkeys skip a key that another listener already prevented. A hotkey's own `preventDefault` doesn't count, so hotkeys on an element and on the document still work together.

The option sees a library's `preventDefault()` only when the library's listener runs before your hotkey's: on an element inside the page, or on the document during the capture phase. A library that adds a document listener when an overlay opens runs after your hotkeys, so the option can't help.

<!-- ::start:framework -->

# React

Turn it on if you use:

- Radix UI or shadcn/ui, including vaul and cmdk, which close dialogs, popovers, selects, and menus on Escape
- Chakra UI or Ark UI
- react-select
- Tiptap or ProseMirror, CodeMirror, or Lexical, which handle chords such as `Mod+B` and `Mod+Z` in the editor

React Aria, Base UI, MUI's dialogs and menus, Headless UI's menus and listboxes, and Monaco stop the keys they handle, so your hotkeys never see them.

# Preact

Component libraries reach Preact through `preact/compat` and behave as they do in React. Turn the option on if you use:

- Radix UI or shadcn/ui, including vaul and cmdk
- Chakra UI or Ark UI
- react-select
- Tiptap or ProseMirror, CodeMirror, or Lexical

# Solid

Turn it on if you use Ark UI.

Kobalte, and solid-ui and shadcn-solid built on it, call `preventDefault()` on Escape from a document listener that is added when the overlay opens, so it runs after your hotkeys. Corvu doesn't call `preventDefault()`. For these libraries, see [Let an open overlay handle Escape](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#let-an-open-overlay-handle-escape).

# Angular

Turn it on if you use:

- Angular Material or the Angular CDK: dialogs, bottom sheets, menus, and selects
- spartan/ui
- ng-zorro-antd: modals, selects, tooltips, and popovers

PrimeNG's dialogs, drawers, and popovers, and ng-bootstrap's dropdowns and typeaheads, handle Escape after your hotkeys. See [Let an open overlay handle Escape](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#let-an-open-overlay-handle-escape).

# Vue

Turn it on if you use:

- Ark UI
- Tiptap or ProseMirror, or CodeMirror
- PrimeVue's CascadeSelect, TreeSelect, ContextMenu, TieredMenu, or DatePicker

Reka UI, and shadcn-vue and Nuxt UI built on it, don't call `preventDefault()` on Escape, unlike Radix UI in React. Neither do most other Vue overlay libraries. For these libraries, see [Let an open overlay handle Escape](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#let-an-open-overlay-handle-escape).

# Svelte

Turn it on if you use Skeleton or Ark UI.

Bits UI, and shadcn-svelte built on it, and Melt UI call `preventDefault()` on Escape from a document listener that is added when the overlay opens, so it runs after your hotkeys. For these libraries, see [Let an open overlay handle Escape](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#let-an-open-overlay-handle-escape).

# Lit

Turn it on if you use the menus and selects of Material Web, Spectrum Web Components, or FAST.

# Alpine

Most Alpine components handle Escape with `@keydown.escape.window` and don't call `preventDefault()`, so the option rarely helps. See [Let an open overlay handle Escape](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#let-an-open-overlay-handle-escape).

# Ember

Turn it on if you use ember-headlessui's menus. ember-power-select and ember-basic-dropdown close on Escape without calling `preventDefault()`. See [Let an open overlay handle Escape](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#let-an-open-overlay-handle-escape).

# Octane

Turn it on if a component in your app calls `preventDefault()` on keys it handles and lets them keep going.

<!-- ::end:framework -->

### Let an open overlay handle Escape

A native modal `<dialog>` or an open popover gets Escape on its own, except a `popover="manual"` popover, which doesn't close on Escape. While one is open, hotkeys outside it skip Escape, so the browser closes it and your hotkey doesn't run. A hotkey targeted at the dialog or popover, or at an element inside it, still receives Escape. TanStack Hotkeys finds these elements in the document, not inside shadow roots.

For other overlays, when the option above can't help, a global `Escape` hotkey and an open overlay both act on one key press:

- With the default `preventDefault` and `stopPropagation`, the hotkey takes the key press. A library that listens on `window` never receives a key that stopped propagating at the document, so the overlay stays open and your hotkey runs.
- A library that closes without calling `preventDefault()`, or after your hotkeys run, closes the overlay, and your hotkey runs too.

Give the overlay its own exclusive scope while it's open, around the overlay's content. Global hotkeys are suspended while the scope is active, and a hotkey that can't fire leaves the key alone, so Escape reaches only the overlay. For a menu or popover, you can instead pass `enabled: !open` to the global hotkey.

<!-- ::start:framework -->

# React

These overlays stay open:

- Headless UI's `Dialog`
- Ant Design's modals, drawers, dropdowns, and popovers

Mantine's modals, drawers, popovers, menus, and comboboxes close on Escape without calling `preventDefault()`, so they close and your hotkey runs too.

See [scopes](./hotkeys-docs-framework-react-guides-hotkeys-provider-and-scopes-md-bdb950e6.md#source-hotkeys-docs-framework-react-guides-hotkeys-provider-and-scopes-md) to give an overlay its own scope.

# Preact

These overlays stay open:

- Headless UI's `Dialog`
- Ant Design's modals, drawers, dropdowns, and popovers

Mantine's overlays close on Escape and your hotkey runs too.

See [scopes](./hotkeys-docs-framework-preact-guides-hotkeys-provider-and-scopes-md-830bfdea.md#source-hotkeys-docs-framework-preact-guides-hotkeys-provider-and-scopes-md) to give an overlay its own scope.

# Solid

Kobalte, solid-ui, shadcn-solid, and Corvu overlays close on Escape and your hotkey runs too.

See [scopes](./hotkeys-docs-framework-solid-guides-hotkeys-provider-and-scopes-md-aa492c2f.md#source-hotkeys-docs-framework-solid-guides-hotkeys-provider-and-scopes-md) to give an overlay its own scope.

# Angular

These overlays stay open:

- ng-bootstrap's modals and offcanvas

PrimeNG's dialogs, drawers, and popovers, and ng-bootstrap's dropdowns and typeaheads, close on Escape and your hotkey runs too.

See [scopes](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md#source-hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md) to give an overlay its own scope.

# Vue

These overlays stay open:

- Reka UI, shadcn-vue, and Nuxt UI: dialogs, popovers, selects, and menus
- Headless UI's `Dialog`
- Vuetify's dialogs and menus
- Naive UI's modals, drawers, and dropdowns
- Quasar's dialogs and menus

PrimeVue's dialogs, drawers, and popovers, and Element Plus's dialogs, drawers, and dropdowns, close on Escape and your hotkey runs too.

See [scopes](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md#source-hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md) to give an overlay its own scope.

# Svelte

Bits UI, shadcn-svelte, Melt UI, and Flowbite Svelte overlays close on Escape and your hotkey runs too.

See [scopes](./hotkeys-docs-framework-svelte-guides-hotkeys-provider-and-scopes-md-e8237f03.md#source-hotkeys-docs-framework-svelte-guides-hotkeys-provider-and-scopes-md) to give an overlay its own scope.

# Lit

These overlays stay open:

- Material Web dialogs, which keep their native `<dialog>` inside a shadow root
- Shoelace dialogs, drawers, and dropdowns, in browsers with `CloseWatcher`
- Vaadin overlays

Web Awesome and Ionic overlays close on Escape and your hotkey runs too.

See [scopes](./hotkeys-docs-framework-lit-guides-hotkey-manager-md-506c8dcc.md#source-hotkeys-docs-framework-lit-guides-hotkey-manager-md) to give an overlay its own scope.

# Alpine

These overlays stay open:

- Pines and Penguin UI modals, slide-overs, and dropdowns
- Any component that closes with `@keydown.escape.window`

Flowbite's modals, drawers, and popovers close on Escape and your hotkey runs too.

See [scopes](./hotkeys-docs-framework-alpine-guides-hotkey-manager-md-37a873d6.md#source-hotkeys-docs-framework-alpine-guides-hotkey-manager-md) to give an overlay its own scope.

# Ember

ember-power-select, ember-basic-dropdown, and ember-bootstrap close on Escape and your hotkey runs too.

See [scopes](./hotkeys-docs-framework-ember-guides-hotkey-manager-md-124cc37b.md#source-hotkeys-docs-framework-ember-guides-hotkey-manager-md) to give an overlay its own scope.

# Octane

No component library for Octane is widespread yet. Native modal dialogs and popovers that close on Escape get it on their own, as in every framework.

See [scopes](./hotkeys-docs-framework-octane-guides-hotkeys-provider-and-scopes-md-886d843a.md#source-hotkeys-docs-framework-octane-guides-hotkeys-provider-and-scopes-md) to give an overlay its own scope.

<!-- ::end:framework -->
