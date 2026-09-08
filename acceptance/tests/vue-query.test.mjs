import { exampleUrl, eventually } from './dom.mjs'
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { createApp, h, ref, nextTick } = await import('vue')
const { QueryClient, VueQueryPlugin } = await import('@tanstack/vue-query')
const { useUser } = await import(exampleUrl('query', 'vue-reactivity.js'))

for (const input of ['ref', 'getter']) test(`Vue ${input} inputs refetch, retain separate cache entries, and respect reactive enabled`, async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 60000 } } })
  const id = ref('one'), enabled = ref(false), calls = []
  const container = document.createElement('div')
  const app = createApp({ setup() {
    const query = useUser(input === 'ref' ? id : () => id.value, enabled, async (value, signal) => {
      assert.ok(signal instanceof AbortSignal)
      calls.push(value)
      return { id: value, name: `User ${value}` }
    })
    return () => h('span', query.data.value?.name || 'Waiting')
  } })
  app.use(VueQueryPlugin, { queryClient: client })
  try {
    app.mount(container)
    await nextTick()
    assert.deepEqual(calls, [])
    enabled.value = true
    await eventually(() => assert.equal(container.textContent, 'User one'))
    id.value = 'two'
    await eventually(() => assert.equal(container.textContent, 'User two'))
    assert.deepEqual(calls, ['one', 'two'])
    assert.equal(client.getQueryData(['user', 'one']).id, 'one')
    assert.equal(client.getQueryData(['user', 'two']).id, 'two')
    enabled.value = false
    await nextTick()
    id.value = 'three'
    await nextTick()
    assert.deepEqual(calls, ['one', 'two'])
    enabled.value = true
    await eventually(() => assert.equal(container.textContent, 'User three'))
    assert.deepEqual(calls, ['one', 'two', 'three'])
  } finally { app.unmount(); client.clear() }
})
