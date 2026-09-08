import test from 'node:test'
import assert from 'node:assert/strict'
import { planGuide, sourceStatus } from './guide-layout.mjs'

test('a short source stays one guide', () => {
  const blocks = [{ heading: 'Setup', content: 'Use the adapter.' }]
  assert.deepEqual(planGuide(blocks), { split: false, pages: [{ key: '', blocks }] })
})

test('large guides split at sections without breaking fenced examples or error/correction pairs', () => {
  const example = 'Wrong:\n```ts\n### not a heading\nwrong()\n```\nCorrect:\n```ts\ncorrect()\n```\n'
  const blocks = [{ heading: 'Patterns', content: `### First\n${example}\n### Second\n${example}` }]
  const plan = planGuide(blocks, 40)
  assert.equal(plan.pages.length, 2)
  for (const page of plan.pages) {
    assert.ok(page.blocks[0].content.includes(example))
    assert.equal(page.blocks[0].content.match(/```/g).length, 4)
  }
})

test('duplicate headings get distinct paths and indivisible examples remain intact', () => {
  const content = '```ts\n' + 'x'.repeat(100) + '\n```\n'
  const plan = planGuide([{ heading: 'Setup', content }, { heading: 'Setup', content }], 20)
  assert.deepEqual(plan.pages.map((page) => page.key), ['setup', 'setup-2'])
  assert.ok(plan.pages.every((page) => page.blocks[0].content === content))
})

test('release and draft provenance never share a maturity label', () => {
  assert.equal(sourceStatus({ kind: 'document' }), 'Release-matched documentation')
  assert.equal(sourceStatus({ kind: 'atomic', sourceRef: 'github:TanStack/query@sha#draft' }), 'Draft guidance')
  assert.equal(sourceStatus({ kind: 'atomic' }), 'Published skill')
})
