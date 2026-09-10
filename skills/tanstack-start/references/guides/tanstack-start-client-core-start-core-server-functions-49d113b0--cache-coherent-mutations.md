# Server Functions — Cache-Coherent Mutations

[Guide and prerequisites](./tanstack-start-client-core-start-core-server-functions-49d113b0.md) · Published skill · `@tanstack/start-client-core@1.170.29`.

## Cache-Coherent Mutations

Keep reads and writes behind server functions that use the same authoritative store. Await the write, then invalidate the route cache so its loader reads the persisted result:

```tsx
const listIssues = createServerFn({ method: 'GET' }).handler(() => {
  return db.issues.findMany()
})

const createIssue = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (
      typeof data !== 'object' ||
      data === null ||
      !('title' in data) ||
      typeof data.title !== 'string' ||
      data.title.trim().length === 0
    ) {
      throw new Error('Title is required')
    }
    return { title: data.title.trim() }
  })
  .handler(async ({ data }) => {
    return db.issues.create({ data })
  })

export const Route = createFileRoute('/issues')({
  loader: () => listIssues(),
  component: IssuesPage,
})

function IssuesPage() {
  const router = useRouter()
  const createIssueFn = useServerFn(createIssue)

  const handleCreate = async (title: string) => {
    await createIssueFn({ data: { title } })
    await router.invalidate({ sync: true })
  }

  // render Route.useLoaderData() and call handleCreate from the form
}
```

Do not update only local component state after a persistent mutation. Verify the rendered list after create, update, delete, and a fresh page load.
