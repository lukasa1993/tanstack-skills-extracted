import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import test from 'node:test'
import { rewriteAtomicAssets } from './build-groups.mjs'
import { reachableFiles } from './validate-guidance.mjs'

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
