# Marko Virtual — `<window-virtualizer>` input reference

[Guide and prerequisites](./virtual-docs-framework-marko-marko-virtual-md-0fe74d8a.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.10`.

## `<window-virtualizer>` input reference

Same as `<virtualizer>` except `getScrollElement` is not accepted — the scroll element is
always `window`. Unlike `<virtualizer>` there are two changed defaults:

- `horizontal` is accepted (the page scrolls sideways) and defaults to `false`.
- `initialOffset` defaults to the live window scroll position (`window.scrollY`, or
  `window.scrollX` when `horizontal`) on the client and `0` on the server. Pass a number to
  override it — e.g. to server-render a slice at a scroll position, paired with
  `initialRect` (see [SSR](./virtual-docs-framework-marko-marko-virtual-md-0fe74d8a.md#ssr)).

`scrollMargin` is the signature window-virtualizer option: a window-scrolled list almost never
starts at the very top of the page, so pass the list's offset from the top of the document and
subtract it from `item.start` when positioning (the window example measures it with
`offsetTop` on mount).
