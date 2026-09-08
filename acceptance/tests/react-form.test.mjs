import { exampleUrl, deferred, eventually } from './dom.mjs'
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { createElement: h, act } = await import('react')
const { createRoot } = await import('react-dom/client')
const { Signup } = await import(exampleUrl('form', 'react-validation.js'))

test('React Form validates before submit, clears corrected errors, and awaits one valid submission', async () => {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container), submitted = [], save = deferred()
  const submit = async () => act(async () => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
  const type = async (value) => act(async () => {
    const input = container.querySelector('input')
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  try {
    await act(async () => root.render(h(Signup, { onSubmit: (email) => { submitted.push(email); return save.promise } })))
    await submit()
    await eventually(() => assert.match(container.querySelector('[role=alert]').textContent, /valid email/), act)
    assert.deepEqual(submitted, [])
    await type('invalid')
    assert.equal(container.querySelector('input').getAttribute('aria-invalid'), 'true')
    await submit()
    assert.deepEqual(submitted, [])
    await type('user@example.com')
    await eventually(() => assert.equal(container.querySelector('[role=alert]').textContent, ''), act)
    assert.equal(container.querySelector('button').disabled, false)
    await submit()
    assert.deepEqual(submitted, ['user@example.com'])
    assert.equal(container.querySelector('button').disabled, true)
    await act(async () => container.querySelector('button').click())
    assert.equal(submitted.length, 1)
    await act(async () => save.resolve())
    await eventually(() => assert.equal(container.querySelector('button').disabled, false), act)
  } finally { await act(async () => root.unmount()); container.remove() }
})
