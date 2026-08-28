#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

import { expectedProductSkills } from './catalog-config.mjs'

const skillsDir = 'skills'
const markerName = '.tanstack-product-skill.json'
const entries = await readdir(skillsDir, { withFileTypes: true })
const markerSkills = []

for (const entry of entries) {
  if (!entry.isDirectory()) continue
  try {
    await readFile(join(skillsDir, entry.name, markerName))
    markerSkills.push(entry.name)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
}

const expectedSorted = [...expectedProductSkills].sort()
markerSkills.sort()
if (JSON.stringify(markerSkills) !== JSON.stringify(expectedSorted)) {
  throw new Error(
    `Product marker mismatch. Expected ${expectedSorted.join(', ')}, got ${markerSkills.join(', ')}`,
  )
}

for (const name of markerSkills) {
  JSON.parse(await readFile(join(skillsDir, name, markerName), 'utf8'))
  await readFile(join(skillsDir, name, 'SKILL.md'))
}

const exportManifest = await readFile(join(skillsDir, '.tanstack-skills-export.tsv'), 'utf8')
const atomicSkills = exportManifest
  .split('\n')
  .filter((line) => line && !line.startsWith('#') && !line.startsWith('package\t'))
  .flatMap((line) => (line.split('\t')[5] ?? '').split(',').filter(Boolean))
if (!atomicSkills.length || new Set(atomicSkills).size !== atomicSkills.length) {
  throw new Error('Exporter manifest has no atomic skills or contains duplicate names.')
}

for (const name of atomicSkills) {
  const source = await readFile(join(skillsDir, name, 'SKILL.md'), 'utf8')
  const frontmatter = /^---\n([\s\S]*?)\n---/.exec(source)?.[1] ?? ''
  if (!/^  internal:\s*true\s*$/m.test(frontmatter)) {
    throw new Error(`Atomic skill is visible in the default picker: ${name}`)
  }
}

const discovered = []
for (const entry of entries) {
  if (!entry.isDirectory()) continue
  try {
    await readFile(join(skillsDir, entry.name, 'SKILL.md'))
    discovered.push(entry.name)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
}
const allowed = new Set([...expectedProductSkills, ...atomicSkills])
const unexpected = discovered.filter((name) => !allowed.has(name))
if (unexpected.length) throw new Error(`Unexpected skill directories: ${unexpected.join(', ')}`)

const catalog = JSON.parse(await readFile('skills.sh.json', 'utf8'))
const listed = (catalog.groupings ?? []).flatMap((group) => group.skills ?? [])
if (JSON.stringify(listed) !== JSON.stringify(expectedProductSkills)) {
  throw new Error(
    `Public catalog mismatch. Expected ${expectedProductSkills.join(', ')}, got ${listed.join(', ')}`,
  )
}

process.stdout.write(
  `Validated ${expectedProductSkills.length} product skills and ${atomicSkills.length} atomic skills.\n`,
)
