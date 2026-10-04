import assert from 'node:assert/strict'
import test from 'node:test'
import { products, validateReleaseVersion } from './fetch-doc-sources.mjs'

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
