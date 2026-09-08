# Installation — Browser and server requirements

[Guide and prerequisites](./charts-docs-installation-md-6ab2967d.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Browser and server requirements

Chart definitions, scene creation, and SVG string rendering do not require a
browser. The vanilla hosts require normal DOM APIs and use `ResizeObserver`
when width is responsive. Canvas rendering additionally requires Canvas 2D;
curved, polar, and geographic path data requires `Path2D`. React and Octane
Canvas entries emit an accessible shell on the server, then paint pixels and
connect the shared host on the client.

Use `initialWidth` for deterministic server and hidden-container output. See [SSR and Hydration](./charts-docs-guides-ssr-and-hydration-md-ff83bc62.md#source-charts-docs-guides-ssr-and-hydration-md) for adapter-specific setup.
