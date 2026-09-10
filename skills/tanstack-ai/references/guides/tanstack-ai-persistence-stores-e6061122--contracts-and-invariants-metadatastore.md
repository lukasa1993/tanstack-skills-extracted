# Stores — Contracts and invariants: `MetadataStore`

[Guide and prerequisites](./tanstack-ai-persistence-stores-e6061122.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## Contracts and invariants: `MetadataStore`


```ts
interface MetadataStore {
  get: (namespace: string, key: string) => Promise<unknown | null>
  set: (namespace: string, key: string, value: unknown) => Promise<void>
  delete: (namespace: string, key: string) => Promise<void>
}
```

- The first argument is an **app-defined namespace string**, not the `Scope`
  identity type — despite SQL backends conventionally naming the column
  `scope`.
- Identity is **two fields** `(namespace, key)` — do not join with `:`
  (`('a:b','c')` and `('a','b:c')` must stay distinct).
- Stored `null` is type-indistinguishable from absence; wrap if you must
  persist real null (`{ value: null }`).
- SQL backends usually reject nullish `set` (NOT NULL JSON columns) with a
  clear `TypeError` — match that or document your semantics.
