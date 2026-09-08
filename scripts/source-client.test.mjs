import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { SourceClient, mapLimit, retryDelay, sha256 } from './source-client.mjs'
import { queryCommit, verifyIntegrity } from './acquire-packages.mjs'
import { promoteCandidate, generatedPaths, writeSourceLock } from './refresh.mjs'
import { rename } from 'node:fs/promises'

const api = 'https://api.github.com/repos/TanStack/query/pulls/10879'
const npm = 'https://registry.npmjs.org/@tanstack/test/-/test-1.0.0.tgz'
const options = { hosts: ['api.github.com', 'registry.npmjs.org'] }
async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'tanstack-refresh-test-'))
  t.after(() => rm(dir, { recursive: true, force: true }))
  return dir
}

test('retries rate limits and transient failures using server cooldowns', async (t) => {
  const sleeps = []
  const replies = [new Response('', { status: 403, headers: { 'retry-after': '2' } }), new Response('', { status: 503 }), new Response('ok')]
  const client = new SourceClient({ cacheDir: await fixture(t), fetchImpl: async () => replies.shift(), sleepImpl: async (ms) => sleeps.push(ms) })
  assert.equal((await client.bytes(api, options)).toString(), 'ok')
  assert.deepEqual(sleeps, [2000, 2000])
})

test('does not retry authorization errors or wait less than a long server cooldown', async (t) => {
  for (const headers of [{}, { 'retry-after': '120' }]) {
    let calls = 0
    const client = new SourceClient({ cacheDir: await fixture(t), fetchImpl: async () => { calls++; return new Response('', { status: 403, headers }) }, sleepImpl: async () => assert.fail('unexpected retry') })
    await assert.rejects(client.bytes(api, options), /HTTP 403/)
    assert.equal(calls, 1)
  }
  assert.equal(retryDelay(new Response('', { headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '10' } }), 0, 2000), 9000)
})

test('transport and body-stream failures retry, bounded by the attempt limit', async (t) => {
  let calls = 0
  const client = new SourceClient({ cacheDir: await fixture(t), attempts: 3, sleepImpl: async () => {}, fetchImpl: async () => {
    calls++
    if (calls === 1) throw new TypeError('connection reset')
    return new Response(new ReadableStream({ start(controller) { controller.error(new Error('truncated body')) } }))
  } })
  await assert.rejects(client.bytes(api, options), /truncated body/)
  assert.equal(calls, 3)
})

test('credentials only go to api.github.com and redirects are forbidden', async (t) => {
  const requests = []
  const client = new SourceClient({ cacheDir: await fixture(t), token: 'fixture-secret', fetchImpl: async (url, init) => { requests.push([url.hostname, init]); return new Response('ok') } })
  await client.bytes(api, options)
  await client.bytes(npm, options)
  assert.equal(requests[0][1].headers.authorization, 'Bearer fixture-secret')
  assert.equal(requests[1][1].headers.authorization, undefined)
  assert.ok(requests.every(([, init]) => init.redirect === 'error'))
  await assert.rejects(client.bytes('https://evil.example/archive', options), /Unapproved/)
})

test('fresh runs refetch mutable sources, reuse immutable archives, and replay offline', async (t) => {
  const dir = await fixture(t)
  const snapshotDir = join(dir, 'snapshot')
  const lockFile = join(dir, 'lock.json')
  let calls = 0
  const fetchImpl = async () => new Response(`response-${++calls}`)
  const config = { cacheDir: dir, snapshotDir, fetchImpl }
  const first = new SourceClient(config)
  await first.bytes(api, options)
  await first.bytes(npm, options)
  // Different processes share a snapshot, so even mutable URLs are stable during a build.
  const sameRun = new SourceClient(config)
  await sameRun.bytes(api, options)
  assert.equal(calls, 2)
  await writeSourceLock(snapshotDir, lockFile)
  const offline = new SourceClient({ cacheDir: dir, lockFile, offline: true, fetchImpl: async () => assert.fail('offline network access') })
  assert.equal((await offline.bytes(api, options)).toString(), 'response-1')
  const fresh = new SourceClient({ cacheDir: dir, lockFile, fetchImpl })
  assert.equal((await fresh.bytes(api, options)).toString(), 'response-3')
  assert.equal((await fresh.bytes(npm, options)).toString(), 'response-2')
  assert.equal(calls, 3)
})

test('offline rejects missing or corrupt blobs; online repairs a corrupt immutable cache', async (t) => {
  const dir = await fixture(t)
  const snapshotDir = join(dir, 'snapshot')
  const lockFile = join(dir, 'lock.json')
  await new SourceClient({ cacheDir: dir, snapshotDir, fetchImpl: async () => new Response('original') }).bytes(npm, options)
  await writeSourceLock(snapshotDir, lockFile)
  await writeFile(join(dir, 'objects', sha256('original')), 'tampered')
  const offline = new SourceClient({ cacheDir: dir, lockFile, offline: true, fetchImpl: async () => assert.fail('offline network access') })
  await assert.rejects(offline.bytes(npm, options), /missing or corrupt/)
  const repaired = new SourceClient({ cacheDir: dir, lockFile, fetchImpl: async () => new Response('original') })
  assert.equal((await repaired.bytes(npm, options)).toString(), 'original')
  await assert.rejects(new SourceClient({ cacheDir: dir, offline: true }).bytes(api, options), /requires a source lock/)
})

test('oversized source bodies fail without retries or cache entries', async (t) => {
  const dir = await fixture(t)
  const client = new SourceClient({ cacheDir: dir, fetchImpl: async () => new Response('too large'), sleepImpl: async () => assert.fail('size failures cannot retry') })
  await assert.rejects(client.bytes(api, { ...options, limit: 2 }), /exceeds/)
  assert.deepEqual(await readdir(join(dir, 'objects')), [])
})

test('404s are explicit, snapshot-backed, and never replace a required source', async (t) => {
  const dir = await fixture(t)
  const client = new SourceClient({ cacheDir: dir, fetchImpl: async () => new Response('{}', { status: 404 }) })
  assert.equal((await client.request(api, { ...options, allow404: true })).status, 404)
  await assert.rejects(client.bytes(api, options), /HTTP 404/)
})

test('closed Query draft remains valid, merged PRs use the merge commit, identity changes fail', () => {
  const sha = 'a'.repeat(40)
  const pr = { number: 10879, state: 'closed', base: { repo: { full_name: 'TanStack/query' } }, head: { repo: { full_name: 'TanStack/query' }, ref: 'taren/query-intent-skills', sha } }
  assert.deepEqual(queryCommit(pr), { sha, state: 'closed' })
  assert.equal(queryCommit({ ...pr, merged: true, merge_commit_sha: 'b'.repeat(40) }).sha, 'b'.repeat(40))
  assert.throws(() => queryCommit({ ...pr, number: 1 }), /identity/)
  assert.throws(() => queryCommit({ ...pr, head: { ...pr.head, sha: 'main' } }), /Invalid/)
})

test('npm archives must match registry sha512 integrity', () => {
  const bytes = Buffer.from('archive')
  const integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`
  verifyIntegrity(bytes, integrity, 'fixture')
  assert.throws(() => verifyIntegrity(Buffer.from('changed'), integrity, 'fixture'), /integrity/)
  assert.throws(() => verifyIntegrity(bytes, undefined, 'fixture'), /integrity/)
})

test('bounded acquisition preserves input order and drains running work before rejecting', async () => {
  let active = 0
  let maximum = 0
  const output = await mapLimit([3, 2, 1], 2, async (value) => {
    active++; maximum = Math.max(maximum, active)
    await new Promise((done) => setTimeout(done, value))
    active--; return value
  })
  assert.deepEqual(output, [3, 2, 1])
  assert.equal(maximum, 2)
  await assert.rejects(mapLimit([1, 2, 3], 2, async (value) => { if (value === 1) throw new Error('fail'); await new Promise((done) => setTimeout(done, 10)); active = 0 }), /fail/)
  assert.equal(active, 0)
})

test('promotion rolls back the entire catalog when any replacement fails', async (t) => {
  const dir = await fixture(t)
  const root = join(dir, 'repo')
  const candidate = join(dir, 'candidate')
  for (const base of [root, candidate]) {
    await mkdir(join(base, 'skills'), { recursive: true })
    await mkdir(join(base, '.claude-plugin'), { recursive: true })
    for (const file of ['skills/fixture.md', ...generatedPaths.slice(1)]) await writeFile(join(base, file), base)
  }
  let count = 0
  await assert.rejects(promoteCandidate(candidate, root, { renamePath: async (...args) => {
    if (++count === 6) throw new Error('disk failure')
    return rename(...args)
  } }), /disk failure/)
  for (const file of ['skills/fixture.md', ...generatedPaths.slice(1)]) assert.equal(await readFile(join(root, file), 'utf8'), root)
})
