# Virtualizer — Optional Options: `onChange`

[Guide and prerequisites](./virtual-docs-api-virtualizer-md-c3b477a3.md) · Release-matched documentation · `@tanstack/virtual-core@3.17.10`.

## Optional Options: `onChange`


```tsx
onChange?: (instance: Virtualizer<TScrollElement, TItemElement>, sync: boolean) => void
```

A callback function that fires when the virtualizer's internal state changes. It's passed the virtualizer instance and the sync parameter.

The sync parameter indicates whether scrolling is currently in progress. It is `true` when scrolling is ongoing, and `false` when scrolling has stopped or other actions (such as resizing) are being performed.
