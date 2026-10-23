import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import test from 'node:test'
import { buildAtomicOriginMaps, rewriteAtomicAssets } from './build-groups.mjs'
import { reachableFiles } from './validate-guidance.mjs'

function atomicSource(name, packageName, sourcePath) {
  return { id: name, name, packageName, sourcePath, metadata: new Map() }
}

const routerCore = atomicSource('tanstack-router-core', '@tanstack/router-core', 'router-core')
const queryComposition = atomicSource('tanstack-query-intent-compositions-compose-query-with-t-d0bcdebe',
  '@tanstack/query-intent', 'compositions/compose-query-with-tanstack-router')
const legacySources = [routerCore, queryComposition]

test('legacy Router links retain fallback targets when the upstream paths are absent', () => {
  const { atomicOriginMap } = buildAtomicOriginMaps(legacySources)
  for (const prefix of ['packages/', '']) {
    assert.equal(atomicOriginMap.get(`${prefix}react-router/skills/react-router/SKILL.md`), routerCore)
    assert.equal(atomicOriginMap.get(`${prefix}react-router/skills/compositions/router-query/SKILL.md`), queryComposition)
  }
  assert.equal(atomicOriginMap.get('compositions/router-query/SKILL.md'), queryComposition)
})

test('published React Router skills take precedence over legacy aliases', () => {
  const reactRouter = atomicSource('tanstack-react-router', '@tanstack/react-router', 'react-router')
  const routerQuery = atomicSource('tanstack-react-router-compositions-router-query',
    '@tanstack/react-router', 'compositions/router-query')
  const sources = [...legacySources, reactRouter, routerQuery]
  for (const ordered of [sources, sources.toReversed()]) {
    const { atomicOriginMap, atomicOriginById } = buildAtomicOriginMaps(ordered)
    for (const source of [reactRouter, routerQuery]) {
      const origin = `packages/react-router/skills/${source.sourcePath}/SKILL.md`
      assert.equal(atomicOriginById.get(source.id), origin)
      assert.equal(atomicOriginMap.get(origin), source)
      assert.equal(atomicOriginMap.get(origin.replace(/^packages\//, '')), source)
    }
    assert.equal(atomicOriginMap.get('compositions/router-query/SKILL.md'), queryComposition)
  }
})

test('conflicting published paths still fail instead of silently selecting a skill', () => {
  const first = atomicSource('first', '@tanstack/react-router', 'react-router')
  const second = atomicSource('second', '@tanstack/react-router', 'react-router')
  assert.throws(() => buildAtomicOriginMaps([...legacySources, first, second]),
    /ambiguous atomic source path: packages\/react-router\/skills\/react-router\/SKILL\.md/)
})

test('a published path no longer requires its obsolete fallback target', () => {
  const reactRouter = atomicSource('tanstack-react-router', '@tanstack/react-router', 'react-router')
  const { atomicOriginMap } = buildAtomicOriginMaps([reactRouter, queryComposition])
  assert.equal(atomicOriginMap.get('packages/react-router/skills/react-router/SKILL.md'), reactRouter)
  assert.throws(() => buildAtomicOriginMaps([queryComposition]), /missing atomic alias target: tanstack-router-core/)
})

test('relocated nested references resolve skill links, assets, and local fragments from their own input file', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'tanstack-reference-links-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const productDir = join(root, 'installed-product')
  const owner = { kind: 'atomic', id: 'adapter-start', productId: 'table',
    directory: join(root, 'atomic', 'adapter-start'), skillPath: join(root, 'atomic', 'adapter-start', 'SKILL.md') }
  const state = { kind: 'atomic', id: 'adapter-state', productId: 'table',
    skillPath: join(root, 'atomic', 'adapter-state', 'SKILL.md') }
  const other = { kind: 'atomic', id: 'query', productId: 'query', skillPath: join(root, 'atomic', 'query', 'SKILL.md') }
  const inputFile = join(owner.directory, 'references', 'nested', 'hook.md')
  const imageFile = join(owner.directory, 'references', 'diagram.svg')
  const outputRel = 'references/assets/adapter-start/references/nested/hook.md'
  const imageRel = 'references/assets/adapter-start/references/diagram.svg'
  const stateGuide = join(productDir, 'references', 'guides', 'state.md')
  const startGuide = join(productDir, 'references', 'guides', 'start.md')
  const context = {
    productId: 'table',
    productDir,
    atomicAssetMap: new Map([[resolve(inputFile), outputRel], [resolve(imageFile), imageRel]]),
    atomicFileMap: new Map([owner, state, other].map((source) => [resolve(source.skillPath), source])),
    atomicOriginById: new Map([[owner.id, 'packages/adapter/skills/getting-started/SKILL.md']]),
    atomicOriginMap: new Map([['packages/adapter/skills/table-state/SKILL.md', state]]),
    sourceOutputMap: new Map([[state.id, { file: stateGuide, anchor: 'state' }], [owner.id, { file: startGuide, anchor: 'start' }]]),
  }
  const text = [
    '# Hook', '[State](../../../adapter-state/SKILL.md)',
    '[Original skill path](../../../table-state/SKILL.md)',
    '[Owner](../../SKILL.md)', '[Query](../../../query/SKILL.md)',
    '![Diagram](../diagram.svg)', '[Local section](#hook)',
    '```md', '[Code example](../../../fake/SKILL.md)', '```', '',
  ].join('\n')
  for (const file of [inputFile, join(productDir, outputRel), join(productDir, imageRel), stateGuide, startGuide]) {
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, file === inputFile ? text : '# Guide\n')
  }
  await writeFile(join(productDir, 'SKILL.md'), `[Hook](${outputRel})`)
  await rewriteAtomicAssets([owner], context)
  const output = await readFile(join(productDir, outputRel), 'utf8')
  assert.match(output, /\[State\]\(\.\.\/\.\.\/\.\.\/\.\.\/guides\/state\.md#state\)/)
  assert.match(output, /\[Original skill path\]\(\.\.\/\.\.\/\.\.\/\.\.\/guides\/state\.md#state\)/)
  assert.match(output, /\[Owner\]\(\.\.\/\.\.\/\.\.\/\.\.\/guides\/start\.md#start\)/)
  assert.match(output, /\[Query\]\(https:\/\/skills\.sh\/lukasa1993\/tanstack-skills-extracted\/tanstack-query\)/)
  assert.ok(output.includes('![Diagram](../diagram.svg)'))
  assert.ok(output.includes('[Local section](#hook)'))
  assert.ok(output.includes('```md\n[Code example](../../../fake/SKILL.md)\n```'))
  const reachable = await reachableFiles(productDir)
  assert.ok(reachable.has('references/guides/state.md'))
  assert.ok(reachable.has('references/guides/start.md'))
  assert.ok(reachable.has(imageRel))
})

test('supplemental Router links use the destination product unless a guide is bundled locally', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'tanstack-supplemental-links-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const productDir = join(root, 'start')
  const owner = { kind: 'atomic', id: 'router-data-loading', productId: 'router', supplemental: true,
    directory: join(root, 'atomic', 'router-data-loading'), skillPath: join(root, 'atomic', 'router-data-loading', 'SKILL.md') }
  const target = { kind: 'atomic', id: 'router-query', productId: 'router',
    skillPath: join(root, 'atomic', 'router-query', 'SKILL.md') }
  const inputFile = join(owner.directory, 'references', 'cache.md')
  const outputRel = 'references/assets/cache.md'
  const outputFile = join(productDir, outputRel)
  for (const file of [inputFile, outputFile]) await mkdir(dirname(file), { recursive: true })
  await writeFile(inputFile, '[Query integration](../../router-query/SKILL.md)\n')
  const context = {
    productId: 'start', productDir,
    atomicAssetMap: new Map([[inputFile, outputRel]]),
    atomicFileMap: new Map([[target.skillPath, target]]),
    sourceOutputMap: new Map(),
  }
  await rewriteAtomicAssets([owner], context)
  assert.match(await readFile(outputFile, 'utf8'),
    /\[Query integration\]\(https:\/\/skills\.sh\/lukasa1993\/tanstack-skills-extracted\/tanstack-router\)/)

  context.sourceOutputMap.set(target.id, { file: join(productDir, 'references/guides/query.md'), anchor: 'query' })
  await rewriteAtomicAssets([owner], context)
  assert.match(await readFile(outputFile, 'utf8'), /\[Query integration\]\(\.\.\/guides\/query\.md#query\)/)

  context.sourceOutputMap.clear()
  await assert.rejects(rewriteAtomicAssets([owner], { ...context, productId: 'router' }),
    /in-product atomic link was not bundled/)
})
