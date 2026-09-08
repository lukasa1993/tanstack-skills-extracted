# Marko Virtual — Inside your own scroll handler, read the element — not the virtualizer

[Guide and prerequisites](./virtual-docs-framework-marko-marko-virtual-md-0fe74d8a.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

## Inside your own scroll handler, read the element — not the virtualizer

The virtualizer attaches its scroll listener in `onMount`; a handler in your markup attaches
at hydrate, earlier. During any single scroll event your handler therefore runs FIRST, while
the virtualizer still holds the PREVIOUS event's offset — so `v.isAtEnd()` and
`v.getDistanceFromEnd()` called inside your `onScroll` are one event stale (a jump to the top
can still report "at end"). Compute from the element instead; the arithmetic is identical:

```marko
<div/scrollEl onScroll() {
  const el = scrollEl()
  if (!el) return
  const atEnd = el.scrollHeight - el.scrollTop - el.clientHeight <= 80
}>
```

Everywhere else — click handlers, effects, `<script>` blocks — `v.isAtEnd()` and friends are
current and safe to use.
