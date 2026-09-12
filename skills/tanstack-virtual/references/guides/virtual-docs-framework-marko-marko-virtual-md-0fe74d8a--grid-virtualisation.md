# Marko Virtual — Grid virtualisation

[Guide and prerequisites](./virtual-docs-framework-marko-marko-virtual-md-0fe74d8a.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.10`.

## Grid virtualisation

Compose two `<virtualizer>` tags — one for rows, one for columns — sharing the
same scroll element. Each returns its own tag variable. Pass `getScrollElement` as an
arrow (`() => ref()`) so each virtualizer resolves its own element:

```marko
<div/scrollEl
  style="height: 500px; width: 500px; overflow: auto; position: relative;"
>
  <virtualizer/rowV
    count=10000
    estimateSize=() => 35
    getScrollElement=() => scrollEl()
  />
  <virtualizer/colV
    count=200
    estimateSize=() => 100
    horizontal=true
    getScrollElement=() => scrollEl()
  />
  <div style=`height: ${rowV.totalSize}px; width: ${colV.totalSize}px; position: relative`>
    <for|row| of=rowV.virtualItems>
      <for|col| of=colV.virtualItems>
        <div
          style=`
            position: absolute;
            top: 0;
            left: 0;
            width: ${col.size}px;
            height: ${row.size}px;
            transform: translateX(${col.start}px) translateY(${row.start}px);
          `
        >
          Cell ${row.index}, ${col.index}
        </div>
      </for>
    </for>
  </div>
</div>
```
