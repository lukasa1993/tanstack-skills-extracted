# Queuing — Overview

[Guide and prerequisites](./pacer-docs-guides-queuing-md-4661e110.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

Unlike [Rate Limiting](./pacer-docs-guides-rate-limiting-md-9f0c5f8e.md#source-pacer-docs-guides-rate-limiting-md), [Throttling](./pacer-docs-guides-throttling-md-b3667c78.md#source-pacer-docs-guides-throttling-md), and [Debouncing](./pacer-docs-guides-debouncing-md-2946516b.md#source-pacer-docs-guides-debouncing-md) which drop executions when they occur too frequently, queuers can be configured to ensure that every operation is processed. They provide a way to manage and control the flow of operations without losing any requests. This makes them ideal for scenarios where data loss is unacceptable. Queuing can also be set to have a maximum size, which can be useful for preventing memory leaks or other issues. This guide will cover the Queuing concepts of TanStack Pacer.
