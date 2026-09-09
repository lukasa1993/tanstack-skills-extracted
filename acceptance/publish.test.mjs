import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import test from 'node:test'
import { expectedProductSkills } from '../scripts/catalog-config.mjs'
import { indexSkills } from '../scripts/index-skills.mjs'

const root = resolve(process.env.TANSTACK_BUILD_ROOT || resolve(dirname(fileURLToPath(import.meta.url)), '..'))

test('the publishing installer clones the release tag, verifies all products, and reports their remote source', { timeout: 60_000 }, async (t) => {
  const work = await mkdtemp(join(tmpdir(), 'tanstack-publish-test-'))
  t.after(() => rm(work, { recursive: true, force: true }))
  const remote = join(work, 'remote')
  await mkdir(remote)
  const git = (...args) => execFileSync('git', args, { cwd: remote, encoding: 'utf8', stdio: 'pipe' }).trim()
  git('init', '--initial-branch=main')
  git('config', 'user.name', 'Publishing test')
  git('config', 'user.email', 'publishing@example.com')
  git('config', 'commit.gpgsign', 'false')
  for (const product of expectedProductSkills) {
    await cp(join(root, 'skills', product), join(remote, 'skills', product), { recursive: true })
  }
  git('add', '.')
  git('commit', '-m', 'catalog to release')
  const sha = git('rev-parse', 'HEAD')
  git('-c', 'tag.gpgsign=false', 'tag', 'v0.1.1')
  git('-c', 'tag.gpgsign=false', 'tag', '-a', 'v0.1.2', '-m', 'annotated release')
  await writeFile(join(remote, 'skills/tanstack-query/SKILL.md'), 'New untagged main content must not be installed\n')
  git('add', '.')
  git('commit', '-m', 'main advanced after release')

  // Exercise the real CLI and Git clone/parser using a local remote. Intercept only
  // HTTP metadata/telemetry so tests never report fake installs or depend on services.
  const preload = join(work, 'http-fixture.mjs')
  const telemetry = join(work, 'telemetry.json')
  await writeFile(preload, `
    import { writeFileSync } from 'node:fs';
    globalThis.fetch = async (input) => {
      const url = new URL(input);
      if (url.hostname === 'api.github.com') return Response.json({ private: false });
      if (url.pathname === '/t') writeFileSync(${JSON.stringify(telemetry)}, JSON.stringify(Object.fromEntries(url.searchParams)));
      return Response.json({});
    };
  `)
  const env = { ...process.env, CI: 'true', DISABLE_TELEMETRY: '', DO_NOT_TRACK: '',
    NODE_OPTIONS: `--import=${pathToFileURL(preload).href}`, GIT_CONFIG_COUNT: '1',
    GIT_CONFIG_KEY_0: `url.${pathToFileURL(remote).href}.insteadOf`,
    GIT_CONFIG_VALUE_0: 'https://github.com/publishing-fixture/catalog.git' }
  const identity = { repository: 'publishing-fixture/catalog', version: 'v0.1.1', sha,
    catalogRoot: root, stateDir: join(work, 'state'), env }
  const result = await indexSkills(identity)
  assert.equal(result.products, 18)
  assert.ok(result.fileCount > 1000, 'Verify the complete committed catalog, not just entry points')
  assert.equal(await readFile(join(identity.stateDir, 'sha'), 'utf8'), `${sha}\n`)
  const report = JSON.parse(await readFile(telemetry, 'utf8'))
  assert.equal(report.source, identity.repository)
  assert.deepEqual(report.skills.split(',').sort(), [...expectedProductSkills].sort())

  await t.test('annotated release tags also install the selected commit', async () => {
    await indexSkills({ ...identity, version: 'v0.1.2' })
  })
  await t.test('missing tags and mismatched commits cannot mark publishing successful', async () => {
    const stateDir = join(work, 'failed-tag')
    await assert.rejects(indexSkills({ ...identity, version: 'v0.1.3', stateDir }), /does not resolve/)
    await assert.rejects(indexSkills({ ...identity, sha: git('rev-parse', 'HEAD'), stateDir }), /does not resolve/)
    await assert.rejects(readFile(join(stateDir, 'sha')), { code: 'ENOENT' })
  })
  await t.test('a successful CLI exit with different catalog content cannot mark publishing successful', async () => {
    const stateDir = join(work, 'failed-content')
    await assert.rejects(indexSkills({ ...identity, catalogRoot: remote, stateDir }), /Installed content differs/)
    await assert.rejects(readFile(join(stateDir, 'sha')), { code: 'ENOENT' })
  })
})
