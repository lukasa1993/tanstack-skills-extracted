# Migrate V8 To V9 — Complete breaking-change map: State and React subscriptions

[Guide and prerequisites](./tanstack-react-table-migrate-v8-to-v9-d475ddab.md) · Published skill · `@tanstack/react-table@9.2.4`.

## Complete breaking-change map: State and React subscriptions


| v8                        | v9                                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `table.getState()`        | `table.state`, `table.store.state`, or `table.atoms.<slice>.get()`                                                                                     |
| Top-level `onStateChange` | Per-slice `onSortingChange`, `onPaginationChange`, etc., or `table.store.subscribe()` for all changes                                                  |
| Broad component updates   | Default `useTable` selector still subscribes to all registered state; narrow with a selector, `table.Subscribe`, or `useSelector(table.atoms.<slice>)` |
| Framework state only      | Optional writable atoms through `options.atoms`                                                                                                        |

Controlled `state` plus per-slice callbacks remains valid:

```tsx
const [sorting, setSorting] = useState<SortingState>([])
const table = useTable({
  features,
  columns,
  data,
  state: { sorting },
  onSortingChange: setSorting,
})
```

For fine-grained rendering, pass a selector as the second `useTable` argument or select closer to the consumer:

```tsx
const table = useTable(options, () => null)

<table.Subscribe selector={state => state.pagination}>
  {pagination => <span>Page {pagination.pageIndex + 1}</span>}
</table.Subscribe>
```

External atoms override the same slice in `state`; table setters write directly to them, and `table.reset()` does not reset them. Do not supply an atom, controlled value, and callback for the same slice without intentionally applying that precedence.
