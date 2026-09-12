# Marko Virtual — SSR

[Guide and prerequisites](./virtual-docs-framework-marko-marko-virtual-md-0fe74d8a.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.10`.

## SSR

Both tags render on the server **without an `<if=mounted>` guard** and build their live, observing
virtualizer client-side in `onMount`. There are two modes.

**Client-fill (default).** Without `initialRect` the server renders an empty container; on mount the
client measures the scroll element and fills in the visible rows:

```marko
<div/scrollEl style="height: 400px; overflow-y: auto; position: relative;">
  <virtualizer/v
    count=10000
    estimateSize=() => 35
    getScrollElement=() => scrollEl()
  />
  <div style=`height: ${v.totalSize}px; position: relative`>
    <for|item| of=v.virtualItems>
      <div style=`position: absolute; top: 0; width: 100%; height: ${item.size}px; transform: translateY(${item.start}px)`>
        Row ${item.index}
      </div>
    </for>
  </div>
</div>
```

**Server slice (`initialRect`).** Pass a viewport hint and the server paints the initial visible
rows into the HTML, so there is real content on first paint before the client resumes:

```marko
<virtualizer/v
  count=people.length
  estimateSize=() => 48
  getScrollElement=() => scrollEl()
  initialRect=({ width: 800, height: 400 })
/>
```

`initialRect` is a hint, not a measurement: the server has no real viewport, so it uses this size to
compute the slice, and the client re-measures the actual scroll element on mount and takes over. The
instance built for the slice is transient — nothing live is serialized; only plain data (the item
positions and total size) crosses and recomputes identically on resume. The full
fetch → serialize → resume → slice flow is shown in the SSR data-fetching example.

> **Note (no-JS):** a server slice does not by itself make a no-JavaScript page. If the virtualizer
> sits inside an `<await>` with a placeholder (as in the data-fetching examples), Marko streams the
> awaited content out of order and reveals it with a small inline script — with JavaScript disabled
> the painted rows are in the HTML but the page renders blank. Script-free visibility requires
> in-order rendering (no placeholder).

**Scroll restore (`initialOffset`, element only).** To server-render the list at a scroll position
instead of the top — a deep link, or a restored scroll — pass `initialOffset` alongside `initialRect`.
The server paints the slice around that offset (it includes `overscan`, so the first *painted* row
sits a few rows above the first *visible* one). A scroll container's `scrollTop` can't be set
declaratively in HTML, so restore it on the client on mount to line the rows up:

```marko
<div/scrollEl class="list">
  <virtualizer/v
    count=people.length
    estimateSize=() => 48
    getScrollElement=() => scrollEl()
    initialRect=({ width: 800, height: 400 })
    initialOffset=(100 * 48)
  />
  <!-- rows … -->
</div>
<lifecycle onMount() { const el = scrollEl(); if (el) el.scrollTop = 100 * 48 }/>
```

For `<window-virtualizer>` the offset comes from `window.scrollY` (browser scroll restoration), so
`initialOffset` is not a separate prop there.

### Streaming: the tag inside `<await>`

The SSR modes above compose with Marko's streaming as-is — place the virtualizer inside an
`<await>` and everything holds *per streamed chunk*:

```marko
<try>
  <@placeholder>
    <p>Loading people…</p>
  </@placeholder>
  <@catch|err|>
    <p>Failed to load: ${(err as Error).message}</p>
  </@catch>

  <await|people| value=fetchPeople()>
    <div/scrollEl class="scroll-container">
      <virtualizer/v
        count=people.length
        estimateSize=() => 48
        getScrollElement=() => scrollEl()
        initialRect=({ width: 800, height: 400 })
      />
      <!-- sizer + rows exactly as usual -->
    </div>
  </await>
</try>
```

On the wire, the server flushes the page shell (with the placeholder) immediately and streams the
awaited subtree as a **later chunk** once `fetchPeople()` resolves — including the server-painted
rows when `initialRect` is set. Each streamed chunk **resumes independently**: this list's live
virtualizer mounts when its chunk arrives, without waiting for the rest of the page. No extra
configuration — the slice is computed inside the awaited subtree from the resolved data, so the
server and the resumed client agree by construction. (The no-JS note above applies: streamed
content is revealed by script.)

The SSR data-fetching example shows the streamed pattern with client-rendered rows; the
server-slice example shows it with server-painted rows — its test suite includes a wire-level
assertion that the placeholder flushes first and the painted rows arrive in a later chunk.
