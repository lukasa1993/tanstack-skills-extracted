# Formatting Display — Server-side rendering

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-formatting-display-md-9091ea8e.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Server-side rendering

To render platform-accurate labels on the server without hydration mismatches or a Linux-label flash on macOS and Windows, pass `platform` to `HotkeysProvider` from the incoming request, or wrap labels in a client-only guard on static pages. See [SSR & Hydration](./hotkeys-docs-framework-react-guides-ssr-md-35086cce.md#source-hotkeys-docs-framework-react-guides-ssr-md) for TanStack Start, Next.js, React Router, Astro, and static page examples.
