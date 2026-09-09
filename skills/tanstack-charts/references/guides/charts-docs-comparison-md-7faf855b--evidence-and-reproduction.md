# Comparison — Evidence and reproduction

[Guide and prerequisites](./charts-docs-comparison-md-7faf855b.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Evidence and reproduction

- [Standard comparison protocol](https://github.com/TanStack/charts/blob/7747d71585562481dc2284b734b134a90aae589b/benchmarks/comparison/README.md)
- [Current tracked bundle baseline](https://github.com/TanStack/charts/blob/7747d71585562481dc2284b734b134a90aae589b/benchmarks/comparison/bundle-baseline.json)
- [Pinned release-source bundle baseline](https://github.com/TanStack/charts/blob/7747d71585562481dc2284b734b134a90aae589b/benchmarks/comparison/bundle-baseline.json)
- [Stress protocol](https://github.com/TanStack/charts/blob/7747d71585562481dc2284b734b134a90aae589b/benchmarks/comparison/stress/README.md)
- [Catalog conformance protocol](https://github.com/TanStack/charts/blob/7747d71585562481dc2284b734b134a90aae589b/benchmarks/conformance/README.md)

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
