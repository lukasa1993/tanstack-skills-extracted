# Marko Virtual — Overview

[Guide and prerequisites](./virtual-docs-framework-marko-marko-virtual-md-0fe74d8a.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

# Marko Virtual

`@tanstack/marko-virtual` is the Marko 6 adapter for TanStack Virtual. It provides
row, column, and grid virtualisation via two auto-discovered Marko tags:

- **`<virtualizer>`** — element-based scrolling (rows, columns, grids)
- **`<window-virtualizer>`** — full-page/window scrolling

Tags are discovered automatically by the Marko compiler when the package is
installed. No imports are needed in your `.marko` files.

Each tag is used **self-closing** and exposes a **tag variable** (written `<virtualizer/v/>`).
You then own the markup, reading `v.virtualItems` and `v.totalSize` to render the visible rows.
