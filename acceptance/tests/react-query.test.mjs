import { exampleUrl, deferred, eventually } from './dom.mjs'
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { createElement: h, act } = await import('react')
const { createRoot } = await import('react-dom/client')
const { QueryClient, QueryClientProvider, useQuery } = await import('@tanstack/react-query')
const { useRenameTodo, todosKey } = await import(exampleUrl('query', 'react-optimistic.js'))

for (const outcome of ['success', 'failure']) test(`optimistic rename: ${outcome}, in-flight cancellation and reconciliation`, async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } } })
  const before = [{ id: 1, title: 'Before' }]
  client.setQueryData(todosKey, before)
  const staleFetch = deferred(), save = deferred(), reconciled = deferred()
  let requests = 0, signal, mutation
  const container = document.createElement('div')
  const root = createRoot(container)
  function Harness() {
    const query = useQuery({ queryKey: todosKey, queryFn: ({ signal: requestSignal }) => {
      signal = requestSignal
      return ++requests === 1 ? staleFetch.promise : reconciled.promise
    } })
    mutation = useRenameTodo(() => save.promise)
    return h('span', null, query.data?.[0]?.title)
  }
  try {
    await act(async () => root.render(h(QueryClientProvider, { client }, h(Harness))))
    assert.equal(requests, 1)
    const staleSignal = signal
    await act(async () => mutation.mutate({ id: 1, title: 'Optimistic' }))
    await eventually(() => assert.equal(container.textContent, 'Optimistic'), act)
    assert.equal(staleSignal.aborted, true)
    assert.deepEqual(before, [{ id: 1, title: 'Before' }], 'snapshot must not be mutated')
    await act(async () => staleFetch.resolve([{ id: 1, title: 'Stale' }]))
    assert.equal(client.getQueryData(todosKey)[0].title, 'Optimistic')
    await act(async () => outcome === 'success' ? save.resolve({ id: 1, title: 'Saved' }) : save.reject(new Error('Server rejected edit')))
    await eventually(() => assert.equal(requests, 2), act)
    assert.equal(client.getQueryData(todosKey)[0].title, outcome === 'failure' ? 'Before' : 'Optimistic')
    assert.equal(mutation.isPending, true, 'another edit must wait for reconciliation')
    const serverTitle = outcome === 'success' ? 'Saved' : 'Before'
    await act(async () => reconciled.resolve([{ id: 1, title: serverTitle }]))
    await eventually(() => { assert.equal(container.textContent, serverTitle); assert.equal(mutation.isPending, false) }, act)
  } finally { await act(async () => root.unmount()); client.clear() }
})

test('failed mutation without a cached list does not leave invented data', async () => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false, gcTime: Infinity } } })
  let mutation
  const save = deferred()
  const root = createRoot(document.createElement('div'))
  function Harness() { mutation = useRenameTodo(() => save.promise); return null }
  try {
    await act(async () => root.render(h(QueryClientProvider, { client }, h(Harness))))
    await act(async () => mutation.mutate({ id: 1, title: 'Optimistic' }))
    assert.equal(client.getQueryData(todosKey), undefined)
    await act(async () => save.reject(new Error('Rejected')))
    await eventually(() => assert.equal(mutation.isError, true), act)
    assert.equal(client.getQueryData(todosKey), undefined)
  } finally { await act(async () => root.unmount()); client.clear() }
})
