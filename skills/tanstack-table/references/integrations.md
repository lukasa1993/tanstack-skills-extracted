# Integrations and tools

Devtools and fuzzy ranking.

<a id="source-tanstack-match-sorter-utils-fuzzy-ranking"></a>

## Fuzzy Ranking

Source: `tanstack-match-sorter-utils-fuzzy-ranking`.

### Setup

<!-- skill-snippet:check -->

```ts
import { compareItems, rankItem, rankings } from '@tanstack/match-sorter-utils'

const query = 'tan'
const values = ['table', 'tanner', 'router']
export const ranked = values
  .map((value) => ({
    value,
    info: rankItem(value, query, { threshold: rankings.MATCHES }),
  }))
  .filter((entry) => entry.info.passed)
  .sort((a, b) => compareItems(a.info, b.info))
```

### Core Patterns

#### Separate ranking, filtering, and sorting

Call `rankItem` once, filter on `info.passed`, retain the `RankingInfo`, then order matching results with `compareItems`.

#### Rank object fields through accessors

```ts
type Person = { name: string; email: string }
const person: Person = { name: 'Ada Lovelace', email: 'ada@example.test' }
const info = rankItem(person, 'lov', {
  accessors: [(item) => item.name, (item) => item.email],
})
```

Accessor options can set a per-accessor threshold plus minRanking/maxRanking bounds.

#### Store ranking as Table filter metadata

In a Table filterFn, call `addMeta?.({ itemRank })`. Register the corresponding
meta shape with `filterMeta: metaHelper<{ itemRank: RankingInfo }>()`. A related
sortFn reads `row.columnFiltersMeta[columnId]?.itemRank` and uses `compareItems`,
falling back to an ordinary comparator for ties or absent metadata. For the
primary Table composition, load `@tanstack/table-core#global-filtering` and
register the fuzzy filter under `filterFns` for `globalFilterFn: 'fuzzy'`.

### Common Mistakes

#### HIGH Numeric rank used as pass flag

Wrong: `if (rankItem(value, query).rank) include(value)`.

Correct: test `rankItem(value, query).passed`.

Ranks below the configured threshold can still be nonzero; `passed` records the threshold decision.

Source: TanStack/table:packages/match-sorter-utils/src/index.ts

#### HIGH Ranking recomputed during sorting

Wrong: call `rankItem` for both rows on every comparator invocation.

Correct: retain RankingInfo during filtering and pass the stored values to `compareItems`.

Sorting is called many times; recomputing also risks using different query/options than the filter decision.

Source: TanStack/table:docs/framework/react/guide/fuzzy-filtering.md

#### MEDIUM compareItems direction reversed twice

Wrong: negate `compareItems(a, b)` because a larger rank should appear first.

Correct: use `compareItems(a, b)` directly for ascending fuzzy relevance.

The function already returns -1 when `a.rank` is greater than `b.rank`.

Source: TanStack/table:packages/match-sorter-utils/src/index.ts

### API Discovery

Inspect `node_modules/@tanstack/match-sorter-utils/dist/index.d.ts` for the installed `RankItemOptions`, accessor attributes, ranking constants, and comparator behavior. For TanStack Table metadata integration, load the global-filtering and sorting skills.

<a id="source-tanstack-table-devtools"></a>

## Devtools

Source: `tanstack-table-devtools`.

### Setup

Framework adapters should use their lifecycle hook or injector. The framework-neutral registration primitive is:

```ts
import { constructTable, tableFeatures } from '@tanstack/table-core'
import { storeReactivityBindings } from '@tanstack/table-core/store-reactivity-bindings'
import { upsertTableDevtoolsTarget } from '@tanstack/table-devtools'

const features = tableFeatures({
  coreReactivityFeature: storeReactivityBindings(),
})

const table = constructTable({
  key: 'users-table',
  features,
  columns: [],
  data: [],
})

const cleanup = upsertTableDevtoolsTarget({ table })
cleanup()
```

### Core Patterns

#### Give every live table a descriptive unique key

The non-empty `options.key` is both registry identity and panel label. Use stable application identity, not an array index.

#### Let adapter lifecycles own registration

React/Preact/Solid/Vue hooks and the Angular injector register and clean up at the correct time. Use core target functions only for unsupported frameworks or infrastructure code.

#### Keep ordinary Devtools development-only

Default entrypoints export no-op panels/plugins outside development. Use `/production` only when the application explicitly chooses production inspection and its security/bundle implications.

### Common Mistakes

#### HIGH Missing key skips registration

Wrong: register a table whose `options.key` is absent or whitespace.

Correct: set a stable value such as `key: 'billing-invoices'` before registration.

The registry logs the missing-key error and returns without adding a target.

Source: TanStack/table:packages/table-devtools/src/tableTarget.ts

#### HIGH Two tables share one key

Wrong: use `key: 'table'` for simultaneous tables.

Correct: use unique domain identities such as `users-table` and `orders-table`.

Upserting a different table under an existing key replaces that registration.

Source: TanStack/table:packages/table-devtools/src/tableTarget.ts

#### MEDIUM Production panel expected by default

Wrong: debug why the normal entrypoint renders nothing in production.

Correct: keep Devtools development-only unless production inspection was explicitly requested; then import the documented `/production` entrypoint.

Default production exports intentionally use no-op implementations.

Source: TanStack/table:docs/devtools.md

### API Discovery

Inspect `node_modules/@tanstack/table-devtools/dist/index.d.ts`, `tableTarget.d.ts`, and `production.d.ts`. Framework registration belongs to the matching `@tanstack/<framework>-table-devtools` package.
