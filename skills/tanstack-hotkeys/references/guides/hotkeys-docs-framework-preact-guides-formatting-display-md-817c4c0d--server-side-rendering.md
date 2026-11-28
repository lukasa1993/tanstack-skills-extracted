# Formatting Display — Server-side rendering

[Guide and prerequisites](./hotkeys-docs-framework-preact-guides-formatting-display-md-817c4c0d.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Server-side rendering

To render platform-accurate labels on the server without hydration mismatches or a Linux-label flash on macOS and Windows, pass `platform` to `HotkeysProvider` from the incoming request, or wrap labels in a client-only guard on static pages. See [SSR & Hydration](./hotkeys-docs-framework-preact-guides-ssr-md-41b38694.md#source-hotkeys-docs-framework-preact-guides-ssr-md) for Fresh, Astro, Vite server rendering, and static page examples.
