# Async Retrying

<a id="source-pacer-docs-guides-async-retrying-md"></a>

Release-matched documentation · `@tanstack/pacer@0.22.0`.

[Topic index](../async-retry.md) · [Source provenance](../SOURCES.md)

## Choose a section

Read the overview or setup when it is a prerequisite, then the section needed for the task.

- [Overview](./pacer-docs-guides-async-retrying-md-099a4ebe--overview.md) — 2 KiB
- [Danger with Misconfigured Retries](./pacer-docs-guides-async-retrying-md-099a4ebe--danger-with-misconfigured-retries.md) — 3 KiB
- [Async Retrying in TanStack Pacer](./pacer-docs-guides-async-retrying-md-099a4ebe--async-retrying-in-tanstack-pacer.md) — 4 KiB
- [Backoff Strategies](./pacer-docs-guides-async-retrying-md-099a4ebe--backoff-strategies.md) — 2 KiB
- [Max Wait](./pacer-docs-guides-async-retrying-md-099a4ebe--max-wait.md) — 2 KiB
- [Jitter](./pacer-docs-guides-async-retrying-md-099a4ebe--jitter.md) — 1 KiB
- [Timeout Controls](./pacer-docs-guides-async-retrying-md-099a4ebe--timeout-controls.md) — 2 KiB
- [Error Handling](./pacer-docs-guides-async-retrying-md-099a4ebe--error-handling.md) — 5 KiB
- [Dynamic Options and Enabling/Disabling](./pacer-docs-guides-async-retrying-md-099a4ebe--dynamic-options-and-enabling-disabling.md) — 2 KiB
- [Abort and Cancellation](./pacer-docs-guides-async-retrying-md-099a4ebe--abort-and-cancellation.md) — 3 KiB
- [State Management](./pacer-docs-guides-async-retrying-md-099a4ebe--state-management.md) — 4 KiB

<!-- Original source anchors retained for inbound links. -->
<a id="danger-with-misconfigured-retries"></a>
<a id="the-thundering-herd-problem"></a>
<a id="exponential-backoff-and-resource-conservation"></a>
<a id="async-retrying-in-tanstack-pacer"></a>
<a id="using-asyncretry-function"></a>
<a id="using-asyncretryer-class"></a>
<a id="sharing-options-between-instances"></a>
<a id="backoff-strategies"></a>
<a id="exponential-backoff-default"></a>
<a id="linear-backoff"></a>
<a id="fixed-backoff"></a>
<a id="max-wait"></a>
<a id="jitter"></a>
<a id="timeout-controls"></a>
<a id="individual-execution-timeout"></a>
<a id="total-execution-timeout"></a>
<a id="combining-timeouts"></a>
<a id="error-handling"></a>
<a id="error-throwing-behavior"></a>
<a id="error-callbacks"></a>
<a id="callback-execution-order"></a>
<a id="dynamic-options-and-enablingdisabling"></a>
<a id="dynamic-max-attempts"></a>
<a id="dynamic-base-wait"></a>
<a id="dynamic-max-wait"></a>
<a id="enablingdisabling"></a>
<a id="abort-and-cancellation"></a>
<a id="manual-abort"></a>
<a id="making-functions-actually-cancellable-with-getabortsignal"></a>
<a id="reset"></a>
<a id="state-management"></a>
<a id="state-selector-framework-adapters"></a>
<a id="initial-state"></a>
<a id="subscribing-to-state-changes"></a>
<a id="available-state-properties"></a>
<a id="status-values"></a>
