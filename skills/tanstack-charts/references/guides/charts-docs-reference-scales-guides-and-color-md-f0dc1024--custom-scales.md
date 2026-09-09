# Scales Guides And Color — Custom scales

[Guide and prerequisites](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Custom scales

`ChartScale` is the final extension boundary for a nonstandard positional
mapping. Prefer a compact scale, then a D3 scale with the required semantics,
before implementing this contract:

```ts
interface ChartScale {
  id: string
  resolve(context: ChartScaleResolveContext): ResolvedScale
}

type ChartScaleResolver = (context: ChartScaleResolveContext) => ResolvedScale
```

The resolver context contains `id`, all materialized `values`, the responsive
`range`, the axis `options`, a target `tickCount`, and `includeZero`. It must
return a complete `ResolvedScale`:

```ts
interface ResolvedScale {
  id: string
  type: string
  domain: readonly ChartValue[]
  map(value: unknown): number
  invert?(position: number): ChartValue
  ticks: readonly { value: ChartValue; label: string; position: number }[]
  bandwidth: number
  viewport?: {
    contentDomain: readonly ChartValue[]
    domain: ChartContinuousDomain
    translate: number
    map(value: unknown): number
  }
}
```

Prefer a compact or D3 scale when it can express the mapping. A custom scale
owns correct domains, finite mapping, ticks, formatting, bandwidth, and
response to the supplied range. Do not wrap an existing compact or D3 scale in
`ChartScale`.

The host cannot apply an authored `axis.viewport` to an opaque custom
`ChartScale`. A custom resolver can return a complete
`ResolvedScale.viewport` itself, in which case it owns the content domain,
committed domain, translation, and presented mapper.
