# Marko Virtual — Column virtualisation

[Guide and prerequisites](./virtual-docs-framework-marko-marko-virtual-md-0fe74d8a.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

## Column virtualisation

Same tag, `horizontal=true`:

```marko
<div/scrollEl
  style="width: 400px; height: 100px; overflow-x: auto; position: relative;"
>
  <virtualizer/v
    count=10000
    estimateSize=() => 100
    horizontal=true
    getScrollElement=() => scrollEl()
  />
  <div style=`width: ${v.totalSize}px; height: 100%; position: relative`>
    <for|item| of=v.virtualItems>
      <div
        style=`
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: ${item.size}px;
          transform: translateX(${item.start}px);
        `
      >
        Column ${item.index}
      </div>
    </for>
  </div>
</div>
```
