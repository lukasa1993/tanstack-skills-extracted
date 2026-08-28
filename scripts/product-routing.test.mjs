import assert from 'node:assert/strict'
import test from 'node:test'

import {
  additionalGuidanceTheme,
  createThemeBuckets,
  packageSkillName,
  resolveProduct,
  selectTheme,
} from './product-routing.mjs'

const product = (id, match) => ({ id, atomicMatch: match })
const products = [
  product('ai', (name) => /^tanstack-ai(?:-|$)/.test(name)),
  product('db', (name) => /^tanstack-db(?:-|$)/.test(name)),
  product('form', () => false),
]

test('normalizes official package names into exported skill names', () => {
  assert.equal(packageSkillName('@tanstack/ai-skills'), 'tanstack-ai-skills')
  assert.equal(packageSkillName(''), '')
})

test('resolves a product from the exported skill name', () => {
  const selected = resolveProduct(products, {
    id: 'tanstack-ai-mcp',
    name: 'tanstack-ai-mcp',
    packageName: '@tanstack/unrelated',
  })
  assert.equal(selected.id, 'ai')
})

test('resolves a renamed skill from its official package', () => {
  const selected = resolveProduct(products, {
    id: 'portable-agent-guidance',
    name: 'portable-agent-guidance',
    packageName: '@tanstack/ai-skills',
  })
  assert.equal(selected.id, 'ai')
})

test('resolves a new adapter package from its library metadata', () => {
  const selected = resolveProduct(products, {
    id: 'portable-agent-guidance',
    name: 'portable-agent-guidance',
    packageName: '@tanstack/react-agent-runtime',
    libraryName: 'TanStack AI',
  })
  assert.equal(selected.id, 'ai')
})

test('does not let broad library hints override authoritative package ownership', () => {
  const selected = resolveProduct(
    [
      product('table', (name) => /(?:^tanstack-table|table-devtools$)/.test(name)),
      product('devtools', (name) => /^tanstack-devtools(?:-|$)/.test(name)),
    ],
    {
      id: 'tanstack-angular-table-devtools',
      name: 'tanstack-angular-table-devtools',
      packageName: '@tanstack/angular-table-devtools',
      libraryName: '@tanstack/angular-table-devtools',
    },
  )
  assert.equal(selected.id, 'table')
})

test('resolves a documented package owner', () => {
  const owners = new Map([['@tanstack/form-core', 'form']])
  const selected = resolveProduct(
    products,
    {
      id: 'field-guidance',
      name: 'field-guidance',
      packageName: '@tanstack/form-core',
    },
    owners,
  )
  assert.equal(selected.id, 'form')
})

test('rejects contradictory product evidence', () => {
  assert.throws(
    () =>
      resolveProduct(products, {
        id: 'tanstack-ai-db-bridge',
        name: 'tanstack-ai-db-bridge',
        packageName: '@tanstack/db-core',
      }),
    /matched: ai, db/,
  )
})

test('rejects ambiguous library-only product hints', () => {
  assert.throws(
    () =>
      resolveProduct(products, {
        id: 'cross-product-guidance',
        name: 'cross-product-guidance',
        packageName: '@tanstack/cross-product',
        libraryName: 'TanStack AI DB',
      }),
    /matched: ai, db/,
  )
})

test('rejects a source with no product evidence', () => {
  assert.throws(
    () =>
      resolveProduct(products, {
        id: 'unknown-guidance',
        name: 'unknown-guidance',
        packageName: '@tanstack/unknown',
      }),
    /matched: none/,
  )
})

test('keeps curated topic routing when a rule matches', () => {
  const curated = { key: 'tools', match: (name) => name.includes('tools') }
  const selected = selectTheme(
    { id: 'ai', themes: [curated] },
    { id: 'tanstack-ai-tools', name: 'tanstack-ai-tools', supplemental: false },
  )
  assert.equal(selected, curated)
})

test('routes an unknown official topic to additional guidance', () => {
  let fallback
  const selected = selectTheme(
    { id: 'ai', themes: [] },
    { id: 'tanstack-ai-future', name: 'tanstack-ai-future', supplemental: false },
    (theme) => {
      fallback = theme
    },
  )
  assert.equal(selected, additionalGuidanceTheme)
  assert.equal(fallback, additionalGuidanceTheme)
})

test('rejects ambiguous supplemental routing', () => {
  const themes = [
    { key: 'first', match: () => true },
    { key: 'second', match: () => true },
  ]
  assert.throws(
    () =>
      selectTheme(
        { id: 'start', themes },
        { id: 'router-source', name: 'router-source', supplemental: true },
      ),
    /matches multiple supplemental themes/,
  )
})

test('adds one reserved fallback bucket and rejects collisions', () => {
  const buckets = createThemeBuckets({ id: 'ai', themes: [{ key: 'tools', match: () => true }] })
  assert.deepEqual([...buckets.keys()], ['tools', additionalGuidanceTheme.key])
  assert.throws(
    () => createThemeBuckets({ id: 'ai', themes: [additionalGuidanceTheme] }),
    /uses reserved theme key/,
  )
})
