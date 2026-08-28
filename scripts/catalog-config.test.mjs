import assert from 'node:assert/strict'
import test from 'node:test'

import {
  categoryGroups,
  expectedCatalogIds,
  expectedProductSkills,
} from './catalog-config.mjs'

test('catalog ids are unique', () => {
  assert.equal(new Set(expectedCatalogIds).size, expectedCatalogIds.length)
})

test('public groups contain every catalog product exactly once', () => {
  const groupedIds = categoryGroups.flatMap(([, ids]) => ids)
  assert.equal(new Set(groupedIds).size, groupedIds.length)
  assert.deepEqual([...groupedIds].sort(), [...expectedCatalogIds].sort())
})

test('public skill names are derived from grouped product ids', () => {
  assert.deepEqual(
    expectedProductSkills,
    categoryGroups.flatMap(([, ids]) => ids.map((id) => `tanstack-${id}`)),
  )
})
