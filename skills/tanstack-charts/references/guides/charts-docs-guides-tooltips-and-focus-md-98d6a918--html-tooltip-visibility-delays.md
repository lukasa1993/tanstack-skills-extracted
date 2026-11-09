# Tooltips And Focus — HTML tooltip visibility delays

[Guide and prerequisites](./charts-docs-guides-tooltips-and-focus-md-98d6a918.md) · Release-matched documentation · `@tanstack/charts@1.5.0`.

## HTML tooltip visibility delays

Set `tooltip.showDelay` and `tooltip.hideDelay` in milliseconds to postpone
appearance or the start of hiding. Both default to zero. For example,
`tooltip: { use: tooltip, showDelay: 150, hideDelay: 100 }` keeps brief hovers
from opening a tooltip and leaves time to return before it hides.

Losing focus before the show deadline cancels it. Moving between targets
preserves that deadline and shows the latest target. Returning during the hide
delay cancels hiding. Changing a pending delay restarts its clock; an unchanged
delay preserves it. Destroying the host cancels both timers immediately.

Nonpositive and nonfinite delays act as zero. Positive values are capped at
2,147,483,647 milliseconds to avoid native timer overflow. These options belong
to the built-in HTML tooltip, not the React Native tooltip. They do not change
motion inheritance: `motion: false` disables animation while authored visibility
delays still apply.
