# Marko Virtual — The virtualizer's lifetime must match its scroll element's

[Guide and prerequisites](./virtual-docs-framework-marko-marko-virtual-md-0fe74d8a.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.10`.

## The virtualizer's lifetime must match its scroll element's

Declare the `<virtualizer>` in the same conditional scope as its scroll element. If the
scroll container can be unmounted and remounted (an `<if>`, a route transition), put the
tag inside that same conditional:

```marko
<if=show>
  <virtualizer/v count=1000 estimateSize=() => 35 getScrollElement=() => scrollEl()/>
  <div/scrollEl class="list">...</div>
</if>
```

The tag builds its live virtualizer in `onMount` and re-reads `getScrollElement` only when
one of its inputs changes. A scroll element replaced WITHOUT any input change is invisible
to the tag — Marko's compile-time reactivity cannot track through the `getScrollElement`
thunk into your template's scope — so a tag left mounted outside the conditional would stay
bound to the removed element and render nothing after the remount. Co-locating the tag makes
its lifecycle follow the element's: unmount tears the instance down, remount builds a fresh
one. (Note: scroll position resets on remount, as a fresh element starts at offset 0.)
