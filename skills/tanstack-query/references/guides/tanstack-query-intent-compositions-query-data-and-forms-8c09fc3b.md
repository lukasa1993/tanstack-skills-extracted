# Query Data And Forms

<a id="source-tanstack-query-intent-compositions-query-data-and-forms"></a>

Draft guidance · `@tanstack/query-intent@5.101.0`.

This is unpublished draft guidance. Check APIs against the installed adapter and its release-matched documentation.

[Topic index](../offline-integrations.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Write Mutations And Invalidate Related Queries](./tanstack-query-intent-core-write-mutations-and-invalida-1820d5b8-d6860664.md).
Prerequisite: [Selectors And Derived State](./tanstack-query-intent-core-selectors-and-derived-state-ca3ffd5f.md).

## Core Patterns

Treat form state as client state after the user starts editing. Server state can initialize the form, but it should not be copied blindly on every query update.

### Initial data only

Use this when one user owns the form and background updates are not useful while editing.

```tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

function PersonDetail({ id }: { id: string }) {
  const queryClient = useQueryClient()
  const person = useQuery({
    queryKey: ['person', id],
    queryFn: () => fetchPerson(id),
    staleTime: Infinity,
  })

  const updatePerson = useMutation({
    mutationFn: savePerson,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['person', id] }),
  })

  if (!person.data) return <p>Loading...</p>
  return (
    <PersonForm
      person={person.data}
      isSaving={updatePerson.isPending}
      onSubmit={updatePerson.mutate}
    />
  )
}
```

### Derived server plus client state

Use this when background updates should remain visible for untouched fields.

```tsx
import * as React from 'react'
import { useQuery } from '@tanstack/react-query'

function PersonName({ id }: { id: string }) {
  const { data } = useQuery({
    queryKey: ['person', id],
    queryFn: () => fetchPerson(id),
  })
  const [draft, setDraft] = React.useState<{ firstName?: string }>({})

  if (!data) return <p>Loading...</p>

  return (
    <input
      value={draft.firstName ?? data.firstName}
      onChange={(event) => setDraft({ firstName: event.target.value })}
    />
  )
}
```

### Reset after awaited invalidation

```tsx
const mutation = useMutation({
  mutationFn: savePerson,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['person', id] }),
})

function submit(values: PersonFormValues) {
  mutation.mutate(values, { onSuccess: () => resetFormDraft() })
}
```

Return the invalidation promise from `onSuccess` or `onSettled` when the saved server state must be back in the cache before the form resets.

## Common Mistakes

### HIGH Initializing form defaults before query data exists

Wrong:

```tsx
const { data } = useQuery({
  queryKey: ['person', id],
  queryFn: () => fetchPerson(id),
})
const [draft, setDraft] = React.useState(data)
```

Correct:

```tsx
const { data } = useQuery({
  queryKey: ['person', id],
  queryFn: () => fetchPerson(id),
})
if (!data) return <p>Loading...</p>
return <PersonForm initialPerson={data} />
```

The first render usually has no query data. Split the form boundary or derive field values from query data plus draft state.

Source: https://tkdodo.eu/blog/react-query-and-forms

### HIGH Background refetch overwrites or hides dirty client state

Wrong:

```tsx
React.useEffect(() => {
  setDraft(personQuery.data)
}, [personQuery.data])
```

Correct:

```tsx
const shownFirstName = draft.firstName ?? personQuery.data?.firstName ?? ''
```

Do not synchronize every server update into the draft. Derive displayed values or intentionally opt out of background updates for initial-only forms.

Source: https://tkdodo.eu/blog/deriving-client-state-from-server-state

### MEDIUM Form submit can run twice

Wrong:

```tsx
<button type="submit">Save</button>
```

Correct:

```tsx
<button type="submit" disabled={mutation.isPending}>
  Save
</button>
```

Use mutation state to block duplicate writes while a submission is in flight.

Source: https://tkdodo.eu/blog/react-query-and-forms
