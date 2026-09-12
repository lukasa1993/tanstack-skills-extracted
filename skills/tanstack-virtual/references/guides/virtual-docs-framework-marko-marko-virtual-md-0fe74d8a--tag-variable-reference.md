# Marko Virtual — Tag variable reference

[Guide and prerequisites](./virtual-docs-framework-marko-marko-virtual-md-0fe74d8a.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.10`.

## Tag variable reference

Both tags are self-closing and expose the same tag-variable shape. Capture it with
`<virtualizer/v/>` (or any name) and read its properties as `v.property`:

| Property | Type | Description |
|---|---|---|
| `virtualItems` | `VirtualItem[]` | The currently visible virtual items |
| `totalSize` | `number` | Total scrollable size in px — set as the inner container's `height` (or `width` for columns) |
| `range` | `{ startIndex: number; endIndex: number } \| null` | The visible index window (excludes overscan). `null` until there is a window. Useful for deriving things like the active sticky header |
| `measureElement` | `(el: Element \| null) => void` | Ref callback for dynamic item sizing |
| `scrollToIndex` | `(index: number, options?: ScrollToOptions) => void` | Imperatively scroll to an item by index. Default `align: 'auto'` scrolls the MINIMUM: downward jumps land the item at the viewport end, upward jumps align it to the start (below `scrollPaddingStart`), and an already fully visible item does not move. Pass `{ align: 'start' }` to always align to the start |
| `scrollToOffset` | `(offset: number, options?: ScrollToOptions) => void` | Imperatively scroll to a pixel offset |
| `measure` | `() => void` | Drop all measured sizes and re-measure everything (after a width/font change) |
| `resizeItem` | `(index: number, size: number) => void` | Set one item's size directly, without a DOM measure |
| `scrollToEnd` | `(options?: { behavior?: ScrollBehavior }) => void` | Scroll to the very end of the list |
| `isAtEnd` | `(threshold?: number) => boolean` | Whether the scroll position is at (or within `threshold` px of) the end. `false` before mount |
| `getDistanceFromEnd` | `() => number` | Pixels between the current scroll position and the end. `Infinity` before mount |
