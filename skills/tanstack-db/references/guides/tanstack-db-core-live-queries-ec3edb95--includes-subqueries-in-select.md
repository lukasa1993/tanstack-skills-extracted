# Live Queries — Includes (Subqueries in Select)

[Guide and prerequisites](./tanstack-db-core-live-queries-ec3edb95.md) · Published skill · `@tanstack/db@0.9.0`.

## Includes (Subqueries in Select)

Embed a correlated subquery inside `select()` to produce hierarchical (nested)
data. The subquery must contain a `where` with an `eq()` that correlates a
parent field with a child field.

### Collection includes (default)

Return a child `Collection` on each parent row:

```ts
import { eq, createLiveQueryCollection } from '@tanstack/db'

const projectsWithIssues = createLiveQueryCollection((q) =>
  q.from({ p: projectsCollection }).select(({ p }) => ({
    id: p.id,
    name: p.name,
    issues: q
      .from({ i: issuesCollection })
      .where(({ i }) => eq(i.projectId, p.id))
      .select(({ i }) => ({
        id: i.id,
        title: i.title,
      })),
  })),
)

// Each row's `issues` is a live Collection
for (const project of projectsWithIssues) {
  console.log(project.name, project.issues.toArray)
}
```

### Array includes with toArray()

Wrap the subquery in `toArray()` to get a plain array instead of a Collection:

```ts
import { eq, toArray, createLiveQueryCollection } from '@tanstack/db'

const messagesWithParts = createLiveQueryCollection((q) =>
  q.from({ m: messagesCollection }).select(({ m }) => ({
    id: m.id,
    contentParts: toArray(
      q
        .from({ c: chunksCollection })
        .where(({ c }) => eq(c.messageId, m.id))
        .orderBy(({ c }) => c.timestamp)
        .select(({ c }) => c.text),
    ),
  })),
)
// row.contentParts is string[]
```

### Plain values with materialize()

Use `materialize()` when the parent row should hold a plain snapshot rather
than a child collection:

```ts
import { eq, materialize, createLiveQueryCollection } from '@tanstack/db'

const issuesWithProject = createLiveQueryCollection((q) =>
  q.from({ issue: issuesCollection }).select(({ issue }) => ({
    ...issue,
    project: materialize(
      q
        .from({ project: projectsCollection })
        .where(({ project }) => eq(project.id, issue.projectId))
        .findOne(),
    ),
  })),
)
// row.project is Project | undefined
```

For a multi-row subquery, `materialize()` returns `Array<T>` like `toArray()`.
For a subquery ending in `findOne()`, it returns `T | undefined`. In both cases,
the parent row is re-emitted when the child result changes.

### Concatenated scalar with concat(toArray())

Wrap `toArray()` in `concat()` to join the scalar results into a single string:

```ts
import { eq, toArray, concat, createLiveQueryCollection } from '@tanstack/db'

const messagesWithContent = createLiveQueryCollection((q) =>
  q.from({ m: messagesCollection }).select(({ m }) => ({
    id: m.id,
    content: concat(
      toArray(
        q
          .from({ c: chunksCollection })
          .where(({ c }) => eq(c.messageId, m.id))
          .orderBy(({ c }) => c.timestamp)
          .select(({ c }) => c.text),
      ),
    ),
  })),
)
// row.content is a single concatenated string
```

### Includes rules

- The subquery **must** have a `where` clause with an `eq()` correlating a parent alias with a child alias. The library extracts this automatically as the join condition.
- `toArray()` works with both scalar selects (e.g., `select(({ c }) => c.text)` → `string[]`) and object selects (e.g., `select(({ c }) => ({ id: c.id, title: c.title }))` → `Array<{id, title}>`).
- `materialize()` returns an array, or one value for a `findOne()` subquery.
  Like `toArray()`, it must be a top-level value in `select()` and cannot be
  nested inside `coalesce()`, `eq()`, or another expression.
- `concat(toArray())` requires a **scalar** `select` to concatenate into a string.
- Collection includes (bare subquery) require an **object** `select`.
- Includes subqueries are compiled into the same incremental pipeline as the parent query -- they are not separate live queries.
