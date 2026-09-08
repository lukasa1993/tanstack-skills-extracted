# Comparison — Evidence and reproduction

[Guide and prerequisites](./charts-docs-comparison-md-7faf855b.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Evidence and reproduction

- [Standard comparison protocol](https://github.com/TanStack/charts/blob/258ed39382b09843f98e6f48a2e9d4d0bd3f1d41/benchmarks/comparison/README.md)
- [Current tracked bundle baseline](https://github.com/TanStack/charts/blob/258ed39382b09843f98e6f48a2e9d4d0bd3f1d41/benchmarks/comparison/bundle-baseline.json)
- [Pinned release-source bundle baseline](https://github.com/TanStack/charts/blob/258ed39382b09843f98e6f48a2e9d4d0bd3f1d41/benchmarks/comparison/bundle-baseline.json)
- [Stress protocol](https://github.com/TanStack/charts/blob/258ed39382b09843f98e6f48a2e9d4d0bd3f1d41/benchmarks/comparison/stress/README.md)
- [Catalog conformance protocol](https://github.com/TanStack/charts/blob/258ed39382b09843f98e6f48a2e9d4d0bd3f1d41/benchmarks/conformance/README.md)

```sh
pnpm benchmark:size
pnpm benchmark:check
pnpm benchmark:stress:quick
pnpm conformance:quick
```

The browser-backed commands require the pinned Playwright browser. Read the
[bundle and performance guide](./charts-docs-guides-bundle-size-and-performance-md-023dab9e.md#source-charts-docs-guides-bundle-size-and-performance-md) before
interpreting results, and use the [migration guide](./charts-docs-guides-migrating-md-d8cb4b55.md#source-charts-docs-guides-migrating-md) to
establish application-specific parity before replacing an existing library.
