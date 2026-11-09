import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { buildProduct, products, validateReleaseVersion, validateDocumentSet, rewriteMarkdownLinks } from './fetch-doc-sources.mjs'
import { rewriteRepositoryLinks } from './repository-links.mjs'
import { rewriteLinks } from './build-groups.mjs'
import { sha256 } from './source-client.mjs'

async function configFixture(t, changeFiles = () => {}) {
  const dir = await mkdtemp(join(tmpdir(), 'tanstack-config-releases-'))
  t.after(() => rm(dir, { recursive: true, force: true }))
  const product = products.find(({ id }) => id === 'config')
  const repositories = new Map()
  const releases = new Map()
  const originals = new Map()
  for (const [index, tool] of ['eslint', 'publish', 'vite'].entries()) {
    const name = `@tanstack/${tool}-config`
    const commit = String(index + 1).repeat(40)
    const files = {
      LICENSE: 'MIT License\n',
      'docs/overview.md': `# Overview at ${tool} release\n\n[ESLint](./eslint.md)\n`,
      'docs/eslint.md': `# ESLint at ${tool} release\n\n[Overview](./overview.md)\n`,
      'docs/publish.md': `# Publish at ${tool} release\n\n[Source](../src/publish.ts)\n`,
      'docs/vite.md': `# Vite at ${tool} release\n`,
      'src/publish.ts': '// fixture\n',
    }
    changeFiles(files, tool)
    const archiveRoot = `config-${commit}`
    const archivePath = join(dir, `${tool}.tgz`)
    for (const [path, body] of Object.entries(files)) {
      await mkdir(dirname(join(dir, archiveRoot, path)), { recursive: true })
      await writeFile(join(dir, archiveRoot, path), body)
    }
    execFileSync('tar', ['-czf', archivePath, '-C', dir, archiveRoot])
    repositories.set(commit, { archivePath, archiveRoot, entries: Object.keys(files), manifest: { commit } })
    releases.set(name, { manifest: { name, version: `${index + 1}.0.0`, commit, frameworks: [], role: 'tool' } })
    originals.set(name, files)
  }
  const stageDir = join(dir, 'stage')
  const build = (overrides = {}) => buildProduct(stageDir, dir, { ...product, ...overrides }, { frameworks: [] }, {
    fetchRelease: async ({ name }) => releases.get(name),
    fetchRepository: async (_, commit) => repositories.get(commit),
  })
  return { stageDir, product, releases, originals, build }
}

test('Config imports each guide from its owning release when package docs diverge', async (t) => {
  const fixture = await configFixture(t)
  const manifest = await fixture.build()
  assert.equal(manifest.documents.length, 4)
  for (const document of manifest.documents) {
    const owner = fixture.product.documentPackages[document.sourcePath] || fixture.product.sourcePackage
    const release = fixture.releases.get(owner).manifest
    const original = fixture.originals.get(owner)[document.sourcePath]
    assert.equal(document.sourcePackage, owner)
    assert.equal(document.sourceCommit, release.commit)
    assert.deepEqual(document.verifiedCommits, [release.commit])
    assert.equal(document.sourceSha256, sha256(original))
    const body = await readFile(join(fixture.stageDir, 'products/config', document.sourcePath), 'utf8')
    assert.ok(body.startsWith(original.split('\n')[0]))
    if (document.sourcePath === 'docs/publish.md') {
      assert.ok(body.includes(`https://github.com/TanStack/config/blob/${release.commit}/src/publish.ts`))
    }
  }
})

test('owned guides are discovered even when absent from the primary package release', async (t) => {
  const fixture = await configFixture(t, (files, tool) => {
    if (tool === 'vite') {
      files['docs/overview.md'] = '# Overview\n'
      delete files['docs/eslint.md']
      delete files['docs/publish.md']
    }
  })
  assert.equal((await fixture.build()).documents.length, 4)
})

test('missing owner guides and unconfigured owners fail instead of borrowing another release', async (t) => {
  const fixture = await configFixture(t, (files, tool) => {
    if (tool === 'eslint') delete files['docs/eslint.md']
  })
  await assert.rejects(fixture.build(), /@tanstack\/eslint-config.*missing.*docs\/eslint\.md/)
  await assert.rejects(fixture.build({ documentPackages: { 'docs/eslint.md': '@tanstack/missing-config' } }),
    /no release for @tanstack\/missing-config/)
})

test('missing required shared guidance still fails', async (t) => {
  const fixture = await configFixture(t, (files, tool) => {
    if (tool === 'vite') delete files['docs/overview.md']
  })
  await assert.rejects(fixture.build(), /no required overview/)
})

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

test('new external references survive document import and product guide generation', () => {
  const sourcePath = 'docs/framework/octane/guides/formatting-display.md'
  const sourceGit = { repository: 'TanStack/hotkeys', commit: 'a'.repeat(40) }
  const external = 'https://github.com/octanejs/octane/blob/main/docs/ssr.md'
  const owned = 'https://github.com/TanStack/hotkeys/blob/main/docs/overview.md'
  const body = `# Formatting display\n\n[SSR](${external}#hydration)\n[Overview](${owned})\n`
  const imported = rewriteRepositoryLinks(rewriteMarkdownLinks(body, sourcePath,
    (value) => ({ destination: value })), sourceGit)
  const context = { source: { kind: 'document', id: `hotkeys:${sourcePath}`, sourcePath,
    sourceCommit: sourceGit.commit, productManifest: sourceGit } }
  const output = rewriteLinks(imported, context)
  assert.ok(output.includes(`[SSR](${external}#hydration)`))
  assert.ok(output.includes(owned.replace('/main/', `/${sourceGit.commit}/`)))
  assert.equal(rewriteLinks(output, context), output)
})
