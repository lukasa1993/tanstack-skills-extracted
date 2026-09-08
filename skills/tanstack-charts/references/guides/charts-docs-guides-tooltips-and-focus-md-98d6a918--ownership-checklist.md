# Tooltips And Focus — Ownership checklist

[Guide and prerequisites](./charts-docs-guides-tooltips-and-focus-md-98d6a918.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

## Ownership checklist

- Use chart-owned focus for datum inspection.
- Choose two-dimensional, nearest-axis, or grouped-axis semantics explicitly.
- Keep a finite distance unless continuous snapping is intended.
- Use `crosshair` for a single focus-driven guide; use `whenFocused` to reveal
  existing data-bound geometry.
- Share semantic cursor state through `createChartCursor`, not copied pixels.
- Use native plaintext formatting for the 90% case.
- Use the `portal` extension where clipped ancestors or stacking contexts can
  hide the tooltip.
- Use the adapter's tooltip-body composition surface for framework content;
  use focus callbacks for separate application-owned surfaces.
- Give keyboard and pointer users equivalent state and selection.
- Keep interactive content pinned and dismissible.
- Let framework lifecycle destroy nested charts and external listeners with
  their owner.
