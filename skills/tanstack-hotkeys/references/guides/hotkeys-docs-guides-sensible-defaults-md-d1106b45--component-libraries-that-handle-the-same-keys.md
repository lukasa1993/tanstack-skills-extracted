# Sensible Defaults — Component libraries that handle the same keys

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Component libraries that handle the same keys

UI libraries close dialogs, popovers, and menus on `Escape`, and rich-text editors handle chords like `Mod+B`. When your app binds the same key, a single keystroke can reach both unless they coordinate.

### Skip keys a library already handled

If a component library or editor calls `preventDefault()` on a key without calling `stopPropagation()`, your hotkey still sees the event. Set `ignoreDefaultPrevented: true` in your shared defaults (see [Changing the defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#changing-the-defaults)) so hotkeys skip any event another listener already prevented. A hotkey's own `preventDefault` is ignored for this check, so your element and document hotkeys still compose.

> [!NOTE]
> `ignoreDefaultPrevented` only sees `preventDefault()` calls from listeners that run *before* yours (on a child element, or in the capture phase). Libraries that attach a fresh `document` listener only when an overlay opens run *after* your hotkeys, so the option can't help there. For `Escape` on overlays, see [Let an open overlay handle Escape](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#let-an-open-overlay-handle-escape).

<!-- ::start:framework -->

# React

Turn on `ignoreDefaultPrevented: true` if you use:

- Radix UI or shadcn/ui, including vaul and cmdk, which close dialogs, popovers, selects, and menus on Escape
- Chakra UI or Ark UI
- `react-select`
- Tiptap, ProseMirror, CodeMirror, or Lexical, which handle chords such as `Mod+B` and `Mod+Z` inside the editor

React Aria, Base UI, MUI dialogs and menus, Headless UI menus and listboxes, and Monaco stop propagation on the keys they handle, so hotkeys never see them.

# Preact

Component libraries reach Preact through `preact/compat` and behave as they do in React. Turn on `ignoreDefaultPrevented: true` if you use:

- Radix UI or shadcn/ui, including vaul and cmdk
- Chakra UI or Ark UI
- `react-select`
- Tiptap, ProseMirror, CodeMirror, or Lexical

# Solid

Turn on `ignoreDefaultPrevented: true` if you use Ark UI.

Kobalte (plus solid-ui and shadcn-solid built on it) and Corvu handle Escape after your hotkeys, so `ignoreDefaultPrevented` doesn't apply there. Their dialogs still receive Escape through overlay detection below.

# Angular

Turn on `ignoreDefaultPrevented: true` if you use:

- Angular Material or the Angular CDK (dialogs, bottom sheets, menus, and selects)
- spartan/ui
- ng-zorro-antd (modals, selects, tooltips, and popovers)

PrimeNG dialogs, drawers, and popovers, as well as ng-bootstrap dropdowns and typeaheads, handle Escape after your hotkeys. Their overlays still receive Escape through overlay detection below.

# Vue

Turn on `ignoreDefaultPrevented: true` if you use:

- Ark UI
- Tiptap, ProseMirror, or CodeMirror
- PrimeVue CascadeSelect, TreeSelect, ContextMenu, TieredMenu, or DatePicker

Reka UI (plus shadcn-vue and Nuxt UI built on it) and most other Vue overlay libraries don't call `preventDefault()` on Escape, so `ignoreDefaultPrevented` doesn't apply there. Their dialogs still receive Escape through overlay detection below.

# Svelte

Turn on `ignoreDefaultPrevented: true` if you use Skeleton or Ark UI.

Bits UI (plus shadcn-svelte built on it) and Melt UI call `preventDefault()` on Escape from a document listener added when the overlay opens, so it runs after your hotkeys. Bits UI dialogs still receive Escape through overlay detection below.

# Lit

Turn on `ignoreDefaultPrevented: true` if you use the menus and selects of Material Web, Spectrum Web Components, or FAST.

# Alpine

Most Alpine components handle Escape with `@keydown.escape.window` and don't call `preventDefault()`, so `ignoreDefaultPrevented` rarely applies. See [Let an open overlay handle Escape](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#let-an-open-overlay-handle-escape).

# Ember

Turn on `ignoreDefaultPrevented: true` if you use `ember-headlessui` menus. `ember-power-select` and `ember-basic-dropdown` close on Escape without calling `preventDefault()`.

# Octane

Turn on `ignoreDefaultPrevented: true` if a component library or editor in your app calls `preventDefault()` on keys it handles without stopping propagation.

<!-- ::end:framework -->

### Let an open overlay handle Escape

By default, TanStack Hotkeys keeps `Escape` working for the innermost open overlay. When focus is inside a modal or menu, `Escape` hotkeys outside it are automatically skipped (no callback, no `preventDefault()`, no `stopPropagation()`). A hotkey targeted at the overlay, or at an element inside it, still receives `Escape`.

TanStack Hotkeys detects overlays at `window` before `document` listeners run:

- Native `<dialog>` elements (`showModal()`, or non-modal with `closedby="any"` or `closedby="closerequest"`), ignoring `<dialog closedby="none">`. When modal dialogs stack, only the top one counts.
- Open popovers (`popover` or `popover="auto"`), excluding `popover="manual"`
- The innermost element around focus (other than `<dialog>`) with `role="dialog"`, `role="alertdialog"`, `role="menu"`, an expanded `combobox` (`aria-expanded="true"`), or a focused `aria-expanded="true"` trigger with `aria-haspopup` other than `"false"`

When writing your own `Escape` hotkeys:

1. **Let the browser close native `<dialog>` and `popover`.** Build overlays on `<dialog>` with `showModal()` or `popover` (`"auto"`) without registering a custom `Escape` hotkey. A `popover="manual"` popover doesn't close on Escape, so close it with an `Escape` hotkey targeted at it. For a dialog users cannot dismiss, use `<dialog closedby="none">` and also call `preventDefault()` on its `cancel` event for browsers without `closedby`.
2. **Target custom overlays directly.** For a custom ARIA dialog you manage yourself, pass `target` on the overlay element rather than registering a global `Escape`.
3. **Guard global `Escape` when needed.** Automatic detection can't see overlays in these cases:
   - An overlay without focus inside it (such as a popover in a shadow root while its trigger has focus)
   - An overlay without one of the ARIA or native roles above (such as `@keydown.escape.window`)
   - An overlay inside a closed shadow root
   - An overlay closed by a `window` capture listener added before the first registered hotkey

   Wrap those in an `exclusive` scope while open, or pass `enabled: !open` to your global `Escape` hotkey while keeping the default `preventDefault` (not `'always'`) so the overlay still receives `Escape`.
4. **Keep `Escape` out of page sections and sequences.** Inside `role="dialog"` or `role="alertdialog"`, hotkeys in any named scope keep `Escape`, so a page section's `Escape` hotkey steals it from a library's dialog, and a sequence step on `Escape` competes with every overlay.

While focus is inside a `role="dialog"` or `role="alertdialog"` element, hotkeys in any named scope keep `Escape` (regardless of `target`), so a dialog component using its own scope can still close itself while an inner combobox or menu still closes first. Native `<dialog>` and `popover` overlays take `Escape` before any hotkey outside them regardless of scope. Make a dialog's scope `exclusive` if other named scopes can stay active behind it.

<!-- ::start:framework -->

# React

Tested: Radix UI and shadcn/ui dialogs and Headless UI `Dialog` close on Escape without triggering outer hotkeys. The first Escape in an open React Aria `ComboBox` closes its list, and the next runs your hotkey.

Not yet tested with this rule: Ant Design and Mantine.

See [Group hotkeys into scopes](./hotkeys-docs-framework-react-guides-hotkeys-provider-and-scopes-md-bdb950e6.md#source-hotkeys-docs-framework-react-guides-hotkeys-provider-and-scopes-md) to give an overlay its own scope.

# Preact

Component libraries reach Preact through `preact/compat` and behave as they do in React: Radix UI dialogs and Headless UI `Dialog` get Escape.

See [Group hotkeys into scopes](./hotkeys-docs-framework-preact-guides-hotkeys-provider-and-scopes-md-830bfdea.md#source-hotkeys-docs-framework-preact-guides-hotkeys-provider-and-scopes-md) to give an overlay its own scope.

# Solid

Tested: Kobalte dialogs (plus solid-ui and shadcn-solid built on Kobalte) and Corvu dialogs close on Escape without triggering outer hotkeys.

See [Group hotkeys into scopes](./hotkeys-docs-framework-solid-guides-hotkeys-provider-and-scopes-md-aa492c2f.md#source-hotkeys-docs-framework-solid-guides-hotkeys-provider-and-scopes-md) to give an overlay its own scope.

# Angular

Tested: Angular CDK dialogs and Angular Material dialogs close on Escape without triggering outer hotkeys.

Not yet tested with this rule: ng-bootstrap and PrimeNG.

See [Group hotkeys into scopes](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md#source-hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md) to give an overlay its own scope.

# Vue

Tested: Reka UI dialogs (plus shadcn-vue and Nuxt UI built on Reka UI), Headless UI `Dialog`, Vuetify dialogs, and PrimeVue dialogs close on Escape without triggering outer hotkeys.

Not yet tested with this rule: Naive UI, Quasar, and Element Plus.

See [Group hotkeys into scopes](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md#source-hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md) to give an overlay its own scope.

# Svelte

Tested: Bits UI dialogs (and shadcn-svelte built on Bits UI) close on Escape without triggering outer hotkeys.

Not yet tested with this rule: Melt UI and Flowbite Svelte.

See [Group hotkeys into scopes](./hotkeys-docs-framework-svelte-guides-hotkeys-provider-and-scopes-md-e8237f03.md#source-hotkeys-docs-framework-svelte-guides-hotkeys-provider-and-scopes-md) to give an overlay its own scope.

# Lit

Tested: Shoelace, Web Awesome, and Material Web dialogs close on Escape without triggering outer hotkeys.

Not yet tested with this rule: Vaadin and Ionic.

See [Activate a scope](./hotkeys-docs-framework-lit-guides-hotkey-manager-md-506c8dcc.md#source-hotkeys-docs-framework-lit-guides-hotkey-manager-md) to give an overlay its own scope.

# Alpine

Pines and Penguin UI modals and other components using `@keydown.escape.window` get Escape only when they render one of the roles above and hold focus.

Not yet tested with this rule: Flowbite.

See [Activate a scope](./hotkeys-docs-framework-alpine-guides-hotkey-manager-md-37a873d6.md#source-hotkeys-docs-framework-alpine-guides-hotkey-manager-md) to give an overlay its own scope.

# Ember

`ember-power-select`, `ember-basic-dropdown`, and `ember-bootstrap` haven't been tested with this rule.

See [Activate a scope](./hotkeys-docs-framework-ember-guides-hotkey-manager-md-124cc37b.md#source-hotkeys-docs-framework-ember-guides-hotkey-manager-md) to give an overlay its own scope.

# Octane

No component library for Octane is widespread yet. Overlays get Escape as in every framework.

See [Group hotkeys into scopes](./hotkeys-docs-framework-octane-guides-hotkeys-provider-and-scopes-md-886d843a.md#source-hotkeys-docs-framework-octane-guides-hotkeys-provider-and-scopes-md) to give an overlay its own scope.

<!-- ::end:framework -->
