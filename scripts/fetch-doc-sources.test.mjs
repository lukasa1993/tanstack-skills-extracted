import assert from 'node:assert/strict'
import test from 'node:test'
import { products, validateReleaseVersion, validateDocumentSet } from './fetch-doc-sources.mjs'

test('every product follows upstream releases across major versions', () => {
  for (const product of products) {
    for (const spec of product.releasePackages) {
      const name = typeof spec === 'string' ? spec : spec.name
      for (const version of ['0.9.0', '1.0.0', '2.0.0', '9.2.5', '42.0.0', '3.0.0-beta.1+build.2']) {
        assert.doesNotThrow(() => validateReleaseVersion(version, name), `${name}@${version}`)
      }
    }
  }
})

test('invalid registry versions still fail before downloading a package', () => {
  for (const version of ['latest', '1.0', 'v1.0.0', '01.0.0', '1.0.0/path', '1.0.0\n']) {
    assert.throws(() => validateReleaseVersion(version, '@tanstack/charts'), /non-semver/)
  }
})

test('official release documents determine framework coverage as adapters evolve', () => {
  const product = { name: 'TanStack Hotkeys', generatedApiRoots: [], required: [
    ['overview', (path) => path === 'docs/overview.md'],
  ] }
  const documents = [
    { sourcePath: 'docs/overview.md', frameworks: [] },
    { sourcePath: 'docs/framework/react/quick-start.md', frameworks: ['react'] },
    { sourcePath: 'docs/framework/alpine/quick-start.md', frameworks: ['alpine'] },
    { sourcePath: 'docs/framework/new-framework/quick-start.md', frameworks: ['new-framework'] },
  ]
  assert.deepEqual(validateDocumentSet(product, documents), ['alpine', 'new-framework', 'react'])
  assert.throws(() => validateDocumentSet(product, documents.slice(1)), /no required overview/)
  assert.throws(() => validateDocumentSet(product, []), /no selected documents/)
})
