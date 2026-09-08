# Debouncing — Overview

[Guide and prerequisites](./pacer-docs-guides-debouncing-md-2946516b.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

Rate Limiting, Throttling, and Debouncing are three distinct approaches to controlling function execution frequency. Each technique blocks executions differently, making them "lossy" - meaning some function calls will not execute when they are requested to run too frequently. Understanding when to use each approach is crucial for building performant and reliable applications. This guide will cover the Debouncing concepts of TanStack Pacer.
