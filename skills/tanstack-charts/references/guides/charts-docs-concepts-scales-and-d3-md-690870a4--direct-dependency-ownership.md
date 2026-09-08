# Scales And D3 — Direct dependency ownership

[Guide and prerequisites](./charts-docs-concepts-scales-and-d3-md-690870a4.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Direct dependency ownership

If application source imports a `d3-*` module, declare that module and its
matching TypeScript package directly:

```sh
pnpm add d3-scale
pnpm add -D @types/d3-scale
```

Do not declare a D3 module merely because another package uses it internally. A
chart that directly upgrades only its temporal axis should declare only
`d3-scale`; bundlers should not retain unused shape, force, geo, zoom, or
hierarchy code. Apply the same direct-dependency rule when source imports
`d3-array`, `d3-shape`, or another granular D3 module.

This rule also applies when definitions live in framework component source.
The adapter mounts a definition; it does not own the D3 imports used to author
it.

`@tanstack/charts` declares `d3-array`, `d3-shape`, and `d3-geo` because its
numeric-bin and stack transforms, polar and D3 curve features, and geo features
own those implementations. They are not peers and require no `use`
configuration. Bundlers tree-shake unused algorithms and geometry, and exact
feature subpaths remain available when an application wants a narrower import.
