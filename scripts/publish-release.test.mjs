import test from 'node:test'
import assert from 'node:assert/strict'
import { ensureRelease } from './publish-release.mjs'

const identity = { repository: 'owner/repo', version: 'v0.1.2', sha: 'a'.repeat(40) }
const release = { tag_name: identity.version, html_url: 'https://github.com/owner/repo/releases/tag/v0.1.2', draft: false }

test('existing releases are verified and never recreated', async () => {
  const result = await ensureRelease({ ...identity, read: async (path) => path.includes('/commits/') ? { sha: identity.sha } : release, create: async () => assert.fail('duplicate POST') })
  assert.equal(result, release.html_url)
})

test('read failures never mean a release is missing', async () => {
  await assert.rejects(ensureRelease({ ...identity, read: async () => { throw new Error('HTTP 403') }, create: async () => assert.fail('unauthorized POST') }), /403/)
})

test('uncertain creation is reconciled without a second POST', async () => {
  let created = false
  let posts = 0
  const result = await ensureRelease({ ...identity, read: async (path) => path.includes('/commits/') ? { sha: identity.sha } : created ? release : undefined,
    create: async () => { posts++; created = true; throw new Error('lost response') } })
  assert.equal(result, release.html_url)
  assert.equal(posts, 1)
})

test('a missing release is created at the selected immutable commit', async () => {
  let created = false
  await ensureRelease({ ...identity, read: async (path) => path.includes('/commits/') ? { sha: identity.sha } : created ? release : undefined,
    create: async (_path, body) => { assert.equal(body.target_commitish, identity.sha); assert.equal(body.tag_name, identity.version); created = true } })
})

test('tag collisions fail instead of moving a release to a different snapshot', async () => {
  await assert.rejects(ensureRelease({ ...identity, read: async (path) => path.includes('/commits/') ? { sha: 'b'.repeat(40) } : release, create: async () => assert.fail('duplicate POST') }), /different commit/)
})
