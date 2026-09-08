import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { selectPublishSnapshot } from './select-publish-snapshot.mjs'

test('unrelated source metadata and infrastructure edits do not release or reindex skills', async () => {
  const root = await mkdtemp(join(tmpdir(), 'skill-publish-'))
  const git = (...args) => execFileSync('git', args, { cwd: root, stdio: 'pipe' })
  const commit = (message) => { git('add', '.'); git('-c', 'user.name=Test', '-c', 'user.email=test@example.com', '-c', 'commit.gpgsign=false', 'commit', '-m', message) }
  try {
    git('init')
    await mkdir(join(root, 'skills'))
    await writeFile(join(root, 'skills/SKILL.md'), 'Installed guidance')
    commit('catalog')
    const first = selectPublishSnapshot(root)
    await writeFile(join(root, 'sources.lock.json'), '{"unrelated-package":"new version"}')
    commit('metadata')
    await writeFile(join(root, 'README.md'), 'Maintainer instructions')
    commit('documentation')
    const unchanged = selectPublishSnapshot(root)
    assert.equal(unchanged.sha, first.sha, 'index identity should be unchanged')
    assert.equal(unchanged.version, first.version, 'release identity should be unchanged')
    assert.notEqual(unchanged.code_sha, first.code_sha)
    await writeFile(join(root, 'skills/SKILL.md'), 'Improved installed guidance')
    commit('new guidance')
    const changed = selectPublishSnapshot(root)
    assert.notEqual(changed.sha, first.sha)
    assert.equal(changed.version, 'v0.1.2')
  } finally { await rm(root, { recursive: true, force: true }) }
})
