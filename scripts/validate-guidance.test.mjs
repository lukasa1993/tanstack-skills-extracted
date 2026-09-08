import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { localLinks, reachableFiles } from './validate-guidance.mjs'

test('navigation follows prose links, preserving code examples as data', () => {
  assert.deepEqual(localLinks('[task](refs/task.md#setup)\n```md\n[app](../app.md)\n```\n`[code](fake.md)`\n[external](https://example.com)'), ['refs/task.md'])
})

test('a copied product needs neither sibling skills nor repository files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'skill-install-'))
  try {
    await mkdir(join(root, 'references'))
    await writeFile(join(root, 'SKILL.md'), '[Task](references/task.md)')
    await writeFile(join(root, 'references/task.md'), '[Entry](../SKILL.md)')
    assert.deepEqual([...await reachableFiles(root)].sort(), ['SKILL.md', 'references/task.md'])
    await writeFile(join(root, 'references/task.md'), '[Sibling](../../other/SKILL.md)')
    await assert.rejects(reachableFiles(root), /escapes its installation/)
    await writeFile(join(root, 'references/task.md'), '[Missing](missing.md)')
    await assert.rejects(reachableFiles(root), /ENOENT/)
  } finally { await rm(root, { recursive: true, force: true }) }
})
