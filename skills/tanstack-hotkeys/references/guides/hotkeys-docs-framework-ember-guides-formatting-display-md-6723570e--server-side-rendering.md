# Formatting Display — Server-side rendering

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-formatting-display-md-6723570e.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Server-side rendering

The server doesn't know the user's platform, so labels rendered in FastBoot use `'linux'` unless a scope sets `platform`. Pass a `createHotkeysScope` scope with `platform: detectPlatform(userAgent)` to `useFormatForDisplay`, or render labels only in the browser. See [SSR & Hydration](./hotkeys-docs-framework-ember-guides-ssr-md-78704d49.md#source-hotkeys-docs-framework-ember-guides-ssr-md) for the FastBoot, Prember, and caching details.
