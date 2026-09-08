# Virtualizer — Optional Options: `anchorTo`

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.9`.

## Optional Options: `anchorTo`


```tsx
anchorTo?: 'start' | 'end'
```

**Default:** `'start'`

Controls which side of the scrollable content should be treated as the stable anchor when list data changes. The default `'start'` preserves TanStack Virtual's existing top/left anchored behavior.

Set `anchorTo: 'end'` for chat, logs, and reverse/inverted feeds. In end-anchored mode, the virtualizer keeps the current visible item stable when older items are prepended, and keeps an end-pinned viewport pinned when the last item grows during streaming output. See the [Chat guide](./virtual-docs-chat-md-213070d1.md#source-virtual-docs-chat-md) for the full pattern.

For prepend stability, use a stable `getItemKey` based on each item's persistent id. Index keys cannot distinguish prepends from appends after items shift.
