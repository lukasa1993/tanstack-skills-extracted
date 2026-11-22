# Sensible Defaults — Component libraries that handle the same keys

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.33.1`.

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

Kobalte, and solid-ui and shadcn-solid built on it, and Corvu handle Escape after your hotkeys, so the option can't help with them. Their dialogs get Escape anyway. See [Let an open overlay handle Escape](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#let-an-open-overlay-handle-escape).

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

Reka UI, and shadcn-vue and Nuxt UI built on it, don't call `preventDefault()` on Escape, unlike Radix UI in React. Neither do most other Vue overlay libraries, so the option can't help with them. Their dialogs get Escape anyway. See [Let an open overlay handle Escape](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#let-an-open-overlay-handle-escape).

# Svelte

Turn it on if you use Skeleton or Ark UI.

Bits UI, and shadcn-svelte built on it, and Melt UI call `preventDefault()` on Escape from a document listener that is added when the overlay opens, so it runs after your hotkeys and the option can't help. Bits UI dialogs get Escape anyway. See [Let an open overlay handle Escape](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#let-an-open-overlay-handle-escape).

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

Escape closes one thing at a time: the innermost dialog, popover, or menu. While one is open, hotkeys outside it skip Escape. They don't run, call `preventDefault()`, or stop propagation, so the overlay gets the key press and closes. A hotkey targeted at the overlay, or at an element inside it, still receives Escape. These count as overlays:

- A native modal `<dialog>`, unless it has `closedby="none"`, and a non-modal `<dialog>` with `closedby="any"` or `closedby="closerequest"`. When modal dialogs stack, only the top one counts.
- An open popover, except a `popover="manual"` popover, which doesn't close on Escape.
- The innermost element around focus, other than a `<dialog>`, with `role="dialog"`, `role="alertdialog"`, or `role="menu"`, an expanded combobox (`aria-expanded="true"`) that has focus or contains it, and a focused element with `aria-expanded="true"` and any `aria-haspopup` value other than `"false"`, such as a menu or listbox button. Most component libraries render their dialogs, popovers, and menus this way.

TanStack Hotkeys finds native dialogs and popovers in the document, and the ones inside a shadow root that hold focus. It finds the other overlays from focus only, so a closed dialog that a library leaves in the page doesn't count. It looks when the key press reaches `window`, before listeners on the document and its elements run, so a library that closes its overlay from one of those still gets the key press alone.

Follow these rules for your own `Escape` hotkeys:

1. **Let the browser close your own overlays.** Build them on `<dialog>` with `showModal()` and on `popover` or `popover="auto"`, and don't register an `Escape` hotkey to close them. A `popover="manual"` popover doesn't close on Escape, so close it with an `Escape` hotkey targeted at it. For a dialog that users can't dismiss, use `<dialog closedby="none">`, not an element with `role="dialog"`. Browsers without `closedby` still close it on Escape, so also call `preventDefault()` on its `cancel` event.
2. **Register an overlay's `Escape` on the overlay.** When your code closes an overlay, such as an ARIA dialog you built, target its `Escape` hotkey at the overlay element. A global `Escape` hotkey skips the overlay it means to close, and nothing reports it.
3. **Use a global `Escape` only when nothing is open.** It fits actions such as clearing a selection. Turn it off with `enabled: !open`, or give the overlay an exclusive scope, while an overlay that TanStack Hotkeys can't find is open. The overlays it can't find are listed below. Keep the default `preventDefault` on that hotkey: with `'always'`, it still prevents Escape while it's off, and an overlay that checks `defaultPrevented` stays open.
4. **Keep `Escape` out of page sections and sequences.** Inside an ARIA dialog, a hotkey in any named scope keeps Escape, so a page section's `Escape` hotkey takes it from a library's dialog. Users press Escape to back out of what's open, so a sequence step on `Escape` competes with every overlay.

While focus is inside a `role="dialog"` or `role="alertdialog"` element, any hotkey in a named scope keeps Escape, whatever its target. So a dialog component that activates its own scope and registers an `Escape` hotkey to close itself still closes. While a combobox or menu inside that dialog is open, the first Escape closes it, and the next one closes the dialog. The exemption doesn't apply to native overlays: an open native dialog or popover gets Escape before any hotkey outside it, whatever its scope. While a popover is open, the first Escape closes it, and the next one reaches the dialog's hotkey. If other named scopes can be active while the dialog is open, make the dialog's scope exclusive so their `Escape` hotkeys don't run.

Some overlays don't get Escape this way:

- An overlay without focus inside it, such as a popover in a shadow root while its trigger has focus, or a dialog after a click on its plain text moved focus to the page.
- An overlay without one of these roles, such as an Alpine component that closes with `@keydown.escape.window`.
- An overlay inside a closed shadow root, which hides it from the page.
- An overlay that a `window` capture listener closes, when that listener was added before your first hotkey.

For these, give the overlay its own exclusive scope while it's open, around the overlay's content. Global hotkeys are suspended while the scope is active, and a hotkey that can't fire leaves the key alone, so Escape reaches only the overlay. For a menu or popover, you can instead pass `enabled: !open` to the global hotkey.

<!-- ::start:framework -->

# React

Tested: Radix UI and shadcn/ui dialogs and Headless UI's `Dialog` close on Escape and your hotkey doesn't run. The first Escape in an open React Aria `ComboBox` closes its list, and the next one runs your hotkey.

Not yet tested with this rule: Ant Design and Mantine.

See [scopes](./hotkeys-docs-framework-react-guides-hotkeys-provider-and-scopes-md-bdb950e6.md#source-hotkeys-docs-framework-react-guides-hotkeys-provider-and-scopes-md) to give an overlay its own scope.

# Preact

Component libraries reach Preact through `preact/compat` and behave as they do in React: Radix UI dialogs and Headless UI's `Dialog` get Escape.

See [scopes](./hotkeys-docs-framework-preact-guides-hotkeys-provider-and-scopes-md-830bfdea.md#source-hotkeys-docs-framework-preact-guides-hotkeys-provider-and-scopes-md) to give an overlay its own scope.

# Solid

Tested: Kobalte and Corvu dialogs, and solid-ui and shadcn-solid built on Kobalte, close on Escape and your hotkey doesn't run.

See [scopes](./hotkeys-docs-framework-solid-guides-hotkeys-provider-and-scopes-md-aa492c2f.md#source-hotkeys-docs-framework-solid-guides-hotkeys-provider-and-scopes-md) to give an overlay its own scope.

# Angular

Tested: Angular CDK dialogs, and Angular Material's built on them, close on Escape and your hotkey doesn't run.

Not yet tested with this rule: ng-bootstrap and PrimeNG.

See [scopes](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md#source-hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md) to give an overlay its own scope.

# Vue

Tested: Reka UI dialogs, and shadcn-vue and Nuxt UI built on Reka UI, Headless UI's `Dialog`, Vuetify's dialogs, and PrimeVue's dialogs close on Escape and your hotkey doesn't run.

Not yet tested with this rule: Naive UI, Quasar, and Element Plus.

See [scopes](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md#source-hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md) to give an overlay its own scope.

# Svelte

Tested: Bits UI dialogs, and shadcn-svelte built on Bits UI, close on Escape and your hotkey doesn't run.

Not yet tested with this rule: Melt UI and Flowbite Svelte.

See [scopes](./hotkeys-docs-framework-svelte-guides-hotkeys-provider-and-scopes-md-e8237f03.md#source-hotkeys-docs-framework-svelte-guides-hotkeys-provider-and-scopes-md) to give an overlay its own scope.

# Lit

Tested: Shoelace dialogs, Web Awesome dialogs, and Material Web dialogs close on Escape and your hotkey doesn't run.

Not yet tested with this rule: Vaadin and Ionic.

See [scopes](./hotkeys-docs-framework-lit-guides-hotkey-manager-md-506c8dcc.md#source-hotkeys-docs-framework-lit-guides-hotkey-manager-md) to give an overlay its own scope.

# Alpine

Pines and Penguin UI modals, and other components that close with `@keydown.escape.window`, get Escape only when they render one of the roles above and focus is inside them.

Not yet tested with this rule: Flowbite.

See [scopes](./hotkeys-docs-framework-alpine-guides-hotkey-manager-md-37a873d6.md#source-hotkeys-docs-framework-alpine-guides-hotkey-manager-md) to give an overlay its own scope.

# Ember

ember-power-select, ember-basic-dropdown, and ember-bootstrap haven't been tested with this rule.

See [scopes](./hotkeys-docs-framework-ember-guides-hotkey-manager-md-124cc37b.md#source-hotkeys-docs-framework-ember-guides-hotkey-manager-md) to give an overlay its own scope.

# Octane

No component library for Octane is widespread yet. Overlays get Escape as in every framework.

See [scopes](./hotkeys-docs-framework-octane-guides-hotkeys-provider-and-scopes-md-886d843a.md#source-hotkeys-docs-framework-octane-guides-hotkeys-provider-and-scopes-md) to give an overlay its own scope.

<!-- ::end:framework -->
