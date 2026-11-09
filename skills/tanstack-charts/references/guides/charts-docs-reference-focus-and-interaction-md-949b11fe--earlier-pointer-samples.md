# Focus And Interaction — Earlier pointer samples

[Guide and prerequisites](./charts-docs-reference-focus-and-interaction-md-949b11fe.md) · Release-matched documentation · `@tanstack/charts@1.5.0`.

## Earlier pointer samples

DOM hosts use `pointermove` by default. Set `pointerEvent: 'pointerrawupdate'`
on the chart definition to use raw pointer samples when the browser exposes
that event. Unsupported environments fall back to `pointermove`. Browser
support can depend on a secure context.

The host keeps pointer ownership, so leaving the chart or canceling the
pointer still clears transient focus. This differs from application-owned
`setControlledFocus`. Only one move stream is active, including after updating
the definition. `pointer: false` still disables automatic pointer handling.

Raw samples can arrive more frequently and perform more focus work. This
option does not promise a particular input-to-paint latency improvement.
