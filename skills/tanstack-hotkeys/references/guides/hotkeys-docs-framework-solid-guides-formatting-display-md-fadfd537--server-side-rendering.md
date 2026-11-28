# Formatting Display — Server-side rendering

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-formatting-display-md-fadfd537.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Server-side rendering

To render platform-accurate labels on the server without hydration mismatches or a Linux-label flash on macOS and Windows, pass `platform` to `HotkeysProvider` from the incoming request, or wrap labels in a client-only guard on static pages. See [SSR & Hydration](./hotkeys-docs-framework-solid-guides-ssr-md-d6a11382.md#source-hotkeys-docs-framework-solid-guides-ssr-md) for SolidStart, TanStack Start, Astro, and static page examples.
