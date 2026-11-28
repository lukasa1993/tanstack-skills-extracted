# Formatting Display — Server-side rendering

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-formatting-display-md-6f8642f5.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Server-side rendering

With Lit SSR, the server doesn't know the user's platform, so server-rendered labels use `'linux'` unless the element sets a `platform`. Give the element a `platform` property, and set it from the request's `User-Agent` header. See [SSR & Hydration](./hotkeys-docs-framework-lit-guides-ssr-md-92c130bb.md#source-hotkeys-docs-framework-lit-guides-ssr-md) for the full setup and a note on caching.
