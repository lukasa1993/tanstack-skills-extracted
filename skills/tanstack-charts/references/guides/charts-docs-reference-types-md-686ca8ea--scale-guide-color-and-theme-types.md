# Types — Scale, guide, color, and theme types

[Guide and prerequisites](./charts-docs-reference-types-md-686ca8ea.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Scale, guide, color, and theme types

| Type                            | Purpose                                                               |
| ------------------------------- | --------------------------------------------------------------------- |
| `ChartScales`                   | Reserved x/y entries plus optional named positional scales            |
| `ChartPositionScaleOptions`     | One registry entry, its Cartesian channel, side, and axis behavior    |
| `ChartAxisOptions`              | Positional scale and optional axis behavior                           |
| `ChartPositionChannel`          | Cartesian registry channel, `x` or `y`                                |
| `ChartAxisSide`                 | Cartesian axis side                                                   |
| `CartesianScaleBindings`        | Optional mark bindings to named `xScale` and `yScale` entries         |
| `ChartAxisViewportOptions`      | Continuous semantic window and transient pixel translation            |
| `ChartAxisGuideOptions`         | Guide behavior without the scale field                                |
| `ChartAxisPresentationOptions`  | Axis line, ticks, tick labels, and title presentation                 |
| `ChartAxisTickOptions`          | Candidate values, density, formatting, size, and padding              |
| `ChartAxisTickLabelOptions`     | Per-candidate typography, anchor, offset, rotation, and thinning      |
| `ChartAxisTickLabelContext`     | Semantic value, stable candidate index, pixel position, and bandwidth |
| `ChartAxisTickLabelValue`       | Constant or context accessor for one tick-label property              |
| `ChartAxisTickLabelThinOptions` | Minimum gap, end priority, and labels that must be kept               |
| `ChartAxisLabelOptions`         | Axis title text and explicit or measured offset                       |
| `ChartScaleFactory`             | Creates a positional scale with a mark-inferred domain                |
| `ChartScaleInput`               | Factory or configured positional scale instance                       |
| `InferableScaleLike`            | Domain-configurable scale returned by a factory                       |
| `ConfiguredScaleLike`           | Callable, copyable positional scale contract                          |
| `ChartNumericScale`             | Radius mapper, configured instance, or inferred factory spec          |
| `ChartNumericScaleOptions`      | Inferred or configured radius scale with optional nicening            |
| `ChartScale`                    | Custom positional scale extension                                     |
| `ChartScaleResolveContext`      | Values, responsive range, guide options, and hints                    |
| `ChartScaleResolver`            | Function form of custom scale resolution                              |
| `ChartContinuousValue`          | Numeric or Date value accepted by an axis viewport                    |
| `ChartContinuousDomain`         | Homogeneous numeric or Date viewport endpoint tuple                   |
| `ResolvedScaleViewport`         | Content domain, committed window, and presented mapper                |
| `ChartColorOptions`             | Factory, configured/custom color scale, hints, and legend             |
| `ChartColorScaleFactory`        | Creates a color scale with a channel-inferred domain                  |
| `ConfiguredColorScaleLike`      | Callable and copyable color scale contract                            |
| `InferableColorScaleLike`       | Domain-configurable color scale returned by a factory                 |
| `ChartColorScale`               | Custom color scale extension                                          |
| `ChartColorScaleContext`        | Observed values, hints, and theme                                     |
| `ResolvedColorScale`            | Resolved mapping and optional stepped legend boundaries               |
| `ResolvedColorScaleKind`        | Categorical, continuous, quantile, quantize, or threshold             |
| `ChartColorLegend`              | Legend layout and scene rendering                                     |
| `ChartColorLegendContext`       | Resolved colors, chart bounds, theme, and width                       |
| `CrosshairOptions`              | Data-less x/y guides, marker, style, and motion options               |
| `CrosshairRuleOptions`          | Stroke shared by both crosshair axes or overridden per axis           |
| `CrosshairAxisOptions`          | Per-axis rule or categorical band with an optional label              |
| `CrosshairBandOptions`          | Categorical cursor-band inset, radius, fill, stroke, and opacity      |
| `CrosshairLabelOptions`         | Guide label formatting, spacing, text, and halo paint                 |
| `CrosshairMarkerOptions`        | Primary-coordinate marker geometry and paint                          |
| `ChartTheme`                    | Foreground, muted, grid, background, and palette                      |
| `ChartLinearGradient`           | Named linear-gradient resource                                        |
| `ChartGradientStop`             | Gradient offset, color, and optional opacity                          |
| `ChartCurve`                    | Line and y-area path generation                                       |

See [Scales, guides, and color](./charts-docs-reference-scales-guides-and-color-md-f0dc1024.md#source-charts-docs-reference-scales-guides-and-color-md).

`crosshair<TXValue, TYValue>` carries the semantic axis types into each
`CrosshairLabelOptions<TValue>.format` callback. `CrosshairBandOptions` replaces
one axis rule with plot-spanning geometry derived from the resolved categorical
scale bandwidth; zero-bandwidth axes emit no band.
