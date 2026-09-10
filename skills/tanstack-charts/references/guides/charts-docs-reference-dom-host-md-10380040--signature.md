# Dom Host — Signature

[Guide and prerequisites](./charts-docs-reference-dom-host-md-10380040.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Signature

```ts
function mountChart<
  TDatum,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>(
  container: HTMLElement,
  initialOptions: ChartHostOptions<TDatum, TXValue, TYValue>,
  runtime?: ChartRuntime<TDatum, TXValue, TYValue>,
): ChartHost<TDatum, TXValue, TYValue>
```

The optional runtime is for adapters or advanced applications that already
rendered an initial scene. Ownership transfers to the host: `host.destroy()`
also destroys that runtime. In ordinary vanilla use, omit it.
