# Marko Virtual — Window virtualisation

[Guide and prerequisites](./virtual-docs-framework-marko-marko-virtual-md-0fe74d8a.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

## Window virtualisation

Use `<window-virtualizer>` when the entire page scrolls rather than a container:

```marko
<window-virtualizer/v
  count=10000
  estimateSize=() => 35
/>
<div style=`height: ${v.totalSize}px; position: relative`>
  <for|item| of=v.virtualItems>
    <div
      style=`
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: ${item.size}px;
        transform: translateY(${item.start}px);
      `
    >
      Row ${item.index}
    </div>
  </for>
</div>
```
