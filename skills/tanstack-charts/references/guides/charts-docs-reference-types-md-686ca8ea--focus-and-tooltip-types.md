# Types — Focus and tooltip types

[Guide and prerequisites](./charts-docs-reference-types-md-686ca8ea.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Focus and tooltip types

| Type                                  | Purpose                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------ |
| `ChartFocusStrategy`                  | Pointer resolution, grouping, and keyboard ordering                      |
| `ChartFocusResolveContext`            | Pointer coordinates and maximum focus distance                           |
| `ChartFocusGroupContext`              | Point being grouped or restored                                          |
| `ChartFocusPreset`                    | Built-in nearest and grouped axis focus names                            |
| `ChartFocusMode`                      | Focus preset or custom strategy                                          |
| `ChartFocusState`                     | Primary, group, source, and pinned interaction state                     |
| `ChartFocusSource`                    | Pointer, keyboard, programmatic, or restored source                      |
| `ChartFocusFilter`                    | Focus-filtered mark matching configuration                               |
| `ChartFocusMatch`                     | Primary, group, key, x, y, or series matching                            |
| `ChartFocusAffinity`                  | Primitive fallback axis after exact geometry containment                 |
| `ResolvedFocusScene`                  | Scene plus whether retargetable focus geometry was materialized          |
| `ChartInteractionController`          | Resolves client pointers and paints application-owned focus              |
| `ChartPointerResolution`              | Scene position, primary point, and resolved focus group                  |
| `ChartControlledFocusOptions`         | Source and sticky-tooltip state for controlled focus                     |
| `ChartCursorController`               | Observable application-owned cursor state                                |
| `ChartCursorState`                    | Scene-, normalized-, or semantic-value-anchored cursor                   |
| `ChartCursorStateUpdater`             | Cursor state, null, or a previous-state updater function                 |
| `ChartCursorCoordinates`              | One or both coordinates in one coordinate space                          |
| `ChartCursorValues`                   | One or both semantic axis values                                         |
| `ChartCursorPointIdentity`            | Host-local key, mark, and datum-index cursor tie-breaker                 |
| `ChartCursorExtensionToken`           | Environment-neutral contract implemented by cursor host extensions       |
| `ChartCursorBinding`                  | Focus-snapped or free definition binding                                 |
| `ChartFocusCursorBinding`             | Semantic datum-focus cursor options                                      |
| `ChartFreeCursorBinding`              | Free coordinate cursor with resolved inversion and axis overrides        |
| `ChartCursorAxisContext`              | Scene, position, normalized position, and axis given to `valueAt`        |
| `ChartCursorAxisOptions`              | Optional free-cursor `valueAt` override for one axis                     |
| `ChartCursorAxisPresentation`         | Host-local position, normalized position, and optional semantic value    |
| `ChartCursorPresentation`             | Host-local projection of shared cursor state into one chart              |
| `ChartCursorHostExtension`            | Platform-neutral cursor lifecycle and projection implementation          |
| `ChartCursorHostSession`              | One binding's ownership-safe host cursor session                         |
| `ChartSpatialIndex`                   | Nearest-point query                                                      |
| `ChartSpatialIndexFactory`            | Builds an index from current scene points and resolved scene             |
| `ChartSpatialIndexFactoryContext`     | Resolved scene supplied to an index factory                              |
| `ChartSelectionSource`                | Pointer or keyboard origin for a controlled selection change             |
| `ChartSelectionController`            | Definition-owned point activation and clear contract                     |
| `ChartControl`                        | Final-scale interaction behavior placed on a definition                  |
| `ChartControlContext`                 | Final plot, scales, colors, theme, and surface size                      |
| `ChartControlScene`                   | Renderer-neutral fallback nodes and optional host controls               |
| `ChartExtensionInput`                 | Generic bare-token or `{ use, ...options }` extension input              |
| `ChartTooltipInput`                   | Tooltip extension token or configured extension options                  |
| `ChartTooltipExtensionToken`          | Environment-neutral contract implemented by host tooltip extensions      |
| `ChartTooltipExtension`               | Tooltip lifecycle implementation                                         |
| `ChartTooltipExtensionContext`        | Container, dismissal, and adapter-body bridge given to a tooltip         |
| `ChartTooltipExtensionInstance`       | Tooltip update, paint, hide, containment, and destroy lifecycle          |
| `ChartTooltipPaintContext`            | Focus, points, scene, surface, pointer, and pinned state                 |
| `ChartTooltipOptions`                 | Built-in tooltip content, ordering, anchoring, visibility, and pinning   |
| `ChartTooltipPortalInput`             | Portal extension token or configured transport options                   |
| `ChartTooltipPortalExtensionToken`    | Environment-neutral contract implemented by host portal extensions       |
| `ChartTooltipPortalExtension`         | Tooltip transport lifecycle implementation                               |
| `ChartTooltipPortalExtensionContext`  | Container, tooltip element, and reposition callback given to a portal    |
| `ChartTooltipPortalExtensionInstance` | Portal update, position, hide, and destroy lifecycle                     |
| `ChartTooltipPortalOptions`           | Reserved configuration object for portal extensions                      |
| `ChartTooltipPortalPositionContext`   | Scene, surface, anchor, placement, and offset for viewport positioning   |
| `ChartTooltipItem`                    | Ordered channel, datum-field, or derived point row                       |
| `ChartTooltipItemBase`                | Shared label and point-text contract for object items                    |
| `ChartTooltipChannelItem`             | Configured x, y, or group row                                            |
| `ChartTooltipDatumItem`               | Scalar datum-field row                                                   |
| `ChartTooltipDerivedItem`             | Row derived from the complete focused point                              |
| `ChartTooltipSort`                    | Group row ordering                                                       |
| `ChartTooltipAnchor`                  | Preset, independent axis coordinates, or custom scene anchor             |
| `ChartTooltipAxisAnchor`              | Independent x and y anchor sources                                       |
| `ChartTooltipXAnchor`                 | Point, pointer, value, group, or plot x source                           |
| `ChartTooltipYAnchor`                 | Point, pointer, value, group, or plot y source                           |
| `ChartTooltipAnchorContext`           | Focus, pointer, plot, surface, and resolved scales                       |
| `ChartTooltipPlacement`               | Tooltip box placement around its anchor                                  |
| `ChartTooltipPosition`                | Scene-pixel x/y coordinate                                               |
| `ChartDefinitionOptions`              | Focus, selection, controls, cursor, tooltip, and host interaction policy |
| `ResponsiveChartConfig`               | Responsive builder plus definition-owned interaction policy              |
| `ChartTooltipContent`                 | Safe title and row model for a built-in tooltip                          |
| `ChartTooltipRow`                     | Label, formatted value, and optional color swatch                        |
| `ChartTooltipContentContext`          | Pinned state, axis labels, and value formatters for tooltip callbacks    |
| `ChartTooltipBodyContext`             | Focused points, content, pinned state, and dismissal                     |
| `ChartTooltipBodyTarget`              | Renderer-adapter body mount element plus body context                    |
| `TooltipBounds`                       | Host-local tooltip placement boundary                                    |
| `TooltipSize`                         | Measured host-local tooltip dimensions                                   |

Host adapters share `sameChartPointIdentity`, `restoreChartFocusPoint`,
`resolveMarkStateScene`, `orderChartTooltipPoints`,
`createChartTooltipContent`, `resolveChartTooltipAnchor`,
`resolveChartTooltipPlacement`, and `formatChartTooltipValue` instead of
reimplementing focus restoration or tooltip policy.

`ChartCursorState.origin` optionally carries a `ChartCursorPointIdentity` when
a focus host publishes one of several points with equal semantic values. A
consumer matches its stable key and mark first, then uses the datum index only
to disambiguate duplicate keys. If that key and mark do not exist locally, the
consumer resolves from the portable semantic `value` and preferred `group` as
usual.

See [Focus and interaction](./charts-docs-reference-focus-and-interaction-md-949b11fe.md#source-charts-docs-reference-focus-and-interaction-md).
