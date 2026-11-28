# Formatting Display — Server-side rendering

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-formatting-display-md-13293bb7.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Server-side rendering

To render platform-accurate labels on the server without hydration mismatches or a Linux-label flash on macOS and Windows, pass `platform` to `HotkeysProvider` from the incoming request, or wrap labels in a client-only guard on static pages. See [SSR & Hydration](./hotkeys-docs-framework-octane-guides-ssr-md-afdbc3de.md#source-hotkeys-docs-framework-octane-guides-ssr-md) for TanStack Start, Astro, custom server, and static page examples.
