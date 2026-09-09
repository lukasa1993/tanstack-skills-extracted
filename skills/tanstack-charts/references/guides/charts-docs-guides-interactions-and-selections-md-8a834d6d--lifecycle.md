# Interactions And Selections — Lifecycle

[Guide and prerequisites](./charts-docs-guides-interactions-and-selections-md-8a834d6d.md) · Release-matched documentation · `@tanstack/charts@0.16.2`.

## Lifecycle

An interaction controller may install pointer capture, event listeners,
observers, nested chart hosts, or animation frames. `onRender` can update an
existing controller, but the application surface must destroy every resource
when the chart unmounts or ownership changes. `createChartCursor` itself owns
no platform resources; hosts unsubscribe when destroyed. A host clears only
the exact unpinned state object that it most recently published. If the
application or another host has replaced the controller state, cancellation,
rebinding, or unmount leaves that newer state intact. Pinned state also
survives lifecycle cleanup until an explicit dismissal or programmatic clear.
