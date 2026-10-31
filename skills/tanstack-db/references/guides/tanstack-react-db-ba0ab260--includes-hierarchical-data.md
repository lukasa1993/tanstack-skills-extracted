# React Db — Includes (Hierarchical Data)

[Guide and prerequisites](./tanstack-react-db-ba0ab260.md) · Published skill · `@tanstack/react-db@1.0.0-rc.1.1`.

## Includes (Hierarchical Data)

When a query uses `include()` for a subquery in `select`, each child field is a live `Collection`. Subscribe to it with `useLiveQuery` in a subcomponent:

```tsx
function ProjectList() {
  const { data: projects } = useLiveQuery({
    query: (q) =>
      q.from({ p: projectsCollection }).select(({ p }) => ({
        id: p.id,
        name: p.name,
        issues: include(
          q
            .from({ i: issuesCollection })
            .where(({ i }) => eq(i.projectId, p.id))
            .select(({ i }) => ({ id: i.id, title: i.title })),
        ),
      })),
  })

  return (
    <ul>
      {projects.map((project) => (
        <li key={project.id}>
          {project.name}
          <IssueList issuesCollection={project.issues} />
        </li>
      ))}
    </ul>
  )
}

// Child component subscribes to the child Collection
function IssueList({ issuesCollection }) {
  const { data: issues } = useLiveQuery(issuesCollection)
  return (
    <ul>
      {issues.map((issue) => (
        <li key={issue.id}>{issue.title}</li>
      ))}
    </ul>
  )
}
```

Only the affected `IssueList` re-renders when an issue changes — the parent does not.

With `toArray()`, child results are plain arrays and the parent re-renders on child changes:

```tsx
import { toArray, eq } from '@tanstack/react-db'

const { data: projects } = useLiveQuery({
  query: (q) =>
    q.from({ p: projectsCollection }).select(({ p }) => ({
      id: p.id,
      name: p.name,
      issues: toArray(
        q
          .from({ i: issuesCollection })
          .where(({ i }) => eq(i.projectId, p.id))
          .select(({ i }) => ({ id: i.id, title: i.title })),
      ),
    })),
})
// project.issues is Array<{ id: string; title: string }> — no subcomponent needed
```

See ./tanstack-db-core-live-queries-ec3edb95.md#source-tanstack-db-core-live-queries for full includes rules (correlation conditions, nested includes, aggregates).
