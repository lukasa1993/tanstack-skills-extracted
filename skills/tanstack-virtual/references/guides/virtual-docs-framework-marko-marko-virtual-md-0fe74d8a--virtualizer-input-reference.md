# Marko Virtual — `<virtualizer>` input reference

[Guide and prerequisites](./virtual-docs-framework-marko-marko-virtual-md-0fe74d8a.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

## `<virtualizer>` input reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `count` | `number` | required | Number of items |
| `getScrollElement` | `() => Element \| null` | required | Returns the scroll container |
| `estimateSize` | `(index: number) => number` | `() => 50` | Estimated item size in px |
| `overscan` | `number` | `5` | Items to render beyond the visible area |
| `horizontal` | `boolean` | `false` | Virtualise horizontally (columns) |
| `paddingStart` | `number` | — | Padding before first item |
| `paddingEnd` | `number` | — | Padding after last item |
| `scrollPaddingStart` | `number` | — | Scroll padding for `scrollToIndex` |
| `scrollPaddingEnd` | `number` | — | Scroll padding for `scrollToIndex` |
| `gap` | `number` | — | Gap between items in px |
| `lanes` | `number` | `1` | Lanes for masonry layouts |
| `initialOffset` | `number \| (() => number)` | — | Scroll offset (px) for the server slice — server-render at a scroll position (deep link / restore). Element only; see [SSR](./virtual-docs-framework-marko-marko-virtual-md-0fe74d8a.md#ssr) |
| `initialRect` | `{ width: number; height: number }` | — | Viewport hint for a server-rendered slice (SSR). When set, the server paints the initial visible rows; omit for client-only fill. See [SSR](./virtual-docs-framework-marko-marko-virtual-md-0fe74d8a.md#ssr). |
| `getItemKey` | `(index: number) => number \| string \| bigint` | the index | Stable per-item identity so cached measurements survive reorder |
| `rangeExtractor` | `(range: Range) => number[]` | `defaultRangeExtractor` | Hook over the visible range: force extra indexes (e.g. a pinned sticky header) into the rendered window. Compose with `defaultRangeExtractor` from `@tanstack/virtual-core` |
| `indexAttribute` | `string` | `'data-index'` | DOM attribute carrying the item index for `measureElement`. Give two instances measuring the same element (a grid cell) distinct attributes |
| `initialMeasurementsCache` | `VirtualItem[]` | — | Pre-measured items (plain data) to seed the measurement cache |
| `anchorTo` | `'start' \| 'end'` | `'start'` | Anchor the window to the list end (a chat pinned to newest). Client-behavioral: it does not position the server slice — use `initialOffset` for that |
| `followOnAppend` | `boolean \| ScrollBehavior` | `false` | With `anchorTo="end"`: stay pinned to the end as items append |
| `scrollEndThreshold` | `number` | `1` | How close (px) to the end still counts as "at the end" |
| `scrollMargin` | `number` | `0` | The list's offset (px) from the top of its scroll area, when other content sits above it in the same scroller. `item.start` values then INCLUDE this margin — subtract it when positioning items relative to the list (see the window example) |
| `enabled` | `boolean` | `true` | Disable switch. `false` is not a freeze: the virtualizer unobserves, clears its measurements, and renders an empty window until re-enabled |
| `isRtl` | `boolean` | `false` | Right-to-left horizontal lists |
| `isScrollingResetDelay` | `number` | `150` | ms after the last scroll event before "user is scrolling" ends |
| `useScrollendEvent` | `boolean` | `false` | Use the native `scrollend` event instead of the `isScrollingResetDelay` timer |
| `useAnimationFrameWithResizeObserver` | `boolean` | `false` | Batch ResizeObserver measurements into animation frames (avoids "ResizeObserver loop" console errors under heavy resize load) |
| `laneAssignmentMode` | `'estimate' \| 'measured'` | `'estimate'` | Masonry/multi-lane: assign items to lanes by estimated or measured sizes |
| `useCachedMeasurements` | `boolean` | `false` | Make the default measurer return the cached (or estimated) size instead of reading the DOM — freezes item sizes when they are already known |
| `debug` | `boolean` | `false` | Verbose engine logging |
| `measureElement` | `(element, entry, instance) => number` | border-box measurer | Replace HOW an item's size is read from its element (e.g. include margins, or measure a child) |
