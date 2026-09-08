# Marko Virtual — Dynamic / variable item sizes

[Guide and prerequisites](./virtual-docs-framework-marko-marko-virtual-md-0fe74d8a.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

## Dynamic / variable item sizes

For items with unknown heights, use `measureElement` as a `<script>`-driven ref
to measure each element after render:

```marko
<div/scrollEl style="height: 400px; overflow-y: auto">
  <virtualizer/v
    count=data.length
    estimateSize=() => 50
    getScrollElement=() => scrollEl()
  />
  <div style=`height: ${v.totalSize}px; position: relative`>
    <for|item| of=v.virtualItems>
      <div/el
        data-index=item.index
        style=`position: absolute; top: 0; width: 100%; transform: translateY(${item.start}px)`>
        <script() {
          // re-run when the item changes; measureElement reads the rendered
          // height and feeds it back to the virtualizer
          const _key = item.key
          if (el() && v.measureElement) v.measureElement(el())
        }/>
        ${data[item.index].text}
      </div>
    </for>
  </div>
</div>
```
