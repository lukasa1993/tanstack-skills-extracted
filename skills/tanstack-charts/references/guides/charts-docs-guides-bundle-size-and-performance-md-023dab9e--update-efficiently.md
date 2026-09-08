# Bundle Size And Performance — Update efficiently

[Guide and prerequisites](./charts-docs-guides-bundle-size-and-performance-md-023dab9e.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Update efficiently

- Keep fixed definitions at module scope.
- Memoize captured-data definitions until their application values change.
- Reuse derived data references when source data is unchanged.
- Let marks infer identity from IDs or unique positions; supply `key` only when
  that identity is unavailable or can change.
- Memoize expensive derived data in the application.
- Bound streaming windows.
- Build a spatial index only when a measurement justifies it.
- Disable animation for high-frequency updates or reduced-motion users.

The host reconciles nodes by key and starts interrupted animation from the
currently painted geometry. Stable identity helps both correctness and
performance; it does not reduce the cost of an unnecessarily large scene.
