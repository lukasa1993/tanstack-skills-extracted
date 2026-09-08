# Migrate V8 To V9 — Final Checklist

[Guide and prerequisites](./tanstack-lit-table-migrate-v8-to-v9-f7e7e2fd.md) · Published skill · `@tanstack/lit-table@9.2.4`.

## Final Checklist

- [ ] `TableController` is host-only, stable, typed with features/data, and options move to `.table(...)`.
- [ ] Features, row models, and registries are in `tableFeatures`; core row model is removed.
- [ ] State reads use selected state, atoms, or store intentionally; selectors are stable.
- [ ] `onStateChange` is replaced; controlled and external-atom ownership do not overlap.
- [ ] Rendering uses the v9 `FlexRender` object helpers.
- [ ] Prototype methods, pinning, sizing/resizing, sorting, row, and selection changes are audited.
- [ ] Helpers, types, meta, registries, and `RowData` use v9 shapes.
- [ ] Temporary `stockFeatures` usage has an explicit removal plan.
