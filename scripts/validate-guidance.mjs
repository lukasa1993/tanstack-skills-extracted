#!/usr/bin/env node
import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { expectedProductSkills } from './catalog-config.mjs'

// Only prose links participate in navigation. Code examples may legitimately
// contain Markdown or relative application paths.
export function localLinks(body) {
  let fence
  return body.split('\n').flatMap((line) => {
    const marker = line.match(/^\s*(`{3,}|~{3,})/)?.[1]
    if (marker) {
      if (!fence) fence = marker
      else if (marker[0] === fence[0] && marker.length >= fence.length) fence = undefined
      return []
    }
    if (fence) return []
    const prose = line.replace(/(`+).*?\1/g, '')
    return [...prose.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1].replace(/^<|>$/g, '').split(/[?#]/)[0])
      .filter((target) => target && !/^(?:[a-z]+:|\/)/i.test(target)).map(decodeURIComponent)
  })
}

export async function reachableFiles(directory) {
  const root = resolve(directory), visited = new Set(), queue = ['SKILL.md']
  while (queue.length) {
    const file = queue.pop()
    if (visited.has(file)) continue
    const absolute = resolve(root, file)
    const info = await stat(absolute)
    assert.ok(info.isFile(), `Link does not reach a file: ${file}`)
    visited.add(file)
    if (!/\.mdx?$/.test(file)) continue
    for (const target of localLinks(await readFile(absolute, 'utf8'))) {
      const destination = resolve(dirname(absolute), target)
      const rel = relative(root, destination)
      assert.ok(rel && !rel.startsWith('..'), `Skill link escapes its installation: ${file} -> ${target}`)
      queue.push(rel)
    }
  }
  return visited
}

export async function validateGuidance(root = process.env.TANSTACK_BUILD_ROOT || process.cwd()) {
  const cases = JSON.parse(await readFile(new URL('./examples/manifest.json', import.meta.url), 'utf8'))
  const report = []
  for (const name of expectedProductSkills) {
    const directory = join(root, 'skills', name)
    const reachable = await reachableFiles(directory)
    const { guides } = JSON.parse(await readFile(join(directory, 'references/ROUTES.json'), 'utf8'))
    const { sources } = JSON.parse(await readFile(join(directory, 'references/PROVENANCE.json'), 'utf8'))
    assert.equal(new Set(guides.map((guide) => guide.id)).size, guides.length, `${name}: duplicate route`)
    assert.deepEqual(guides.map((guide) => guide.id).sort(), sources.map((source) => source.id).sort(), `${name}: source disappeared from routing`)
    const rootBody = await readFile(join(directory, 'SKILL.md'), 'utf8')
    assert.ok(Buffer.byteLength(rootBody) <= 12 * 1024, `${name}: entry point exceeds 12 KiB`)
    for (const guide of guides) {
      assert.ok(reachable.has(guide.file), `${name}: unreachable guide ${guide.file}`)
      assert.ok(reachable.has(`references/${guide.theme}.md`), `${name}: unreachable topic`)
      assert.ok((await stat(join(directory, `references/${guide.theme}.md`))).size <= 12 * 1024, `${name}: topic index exceeds 12 KiB`)
      assert.equal((await stat(join(directory, guide.file))).size, guide.bytes, `${name}: guide size drift`)
      const source = sources.find((entry) => entry.id === guide.id)
      assert.equal(guide.package, source.package)
      assert.equal(guide.version, source.version)
      if (guide.kind === 'document') assert.equal(guide.status, 'Release-matched documentation')
      for (const entry of [...guide.sections, ...guide.prerequisites, ...guide.examples]) {
        if (entry.file) assert.ok(reachable.has(entry.file), `${name}: unreachable dependency ${entry.file}`)
      }
    }
    for (const task of cases.filter((entry) => name === `tanstack-${entry.product}`)) {
      const guide = guides.find((entry) => entry.sourcePath === task.sourcePath)
      assert.ok(guide, `Missing representative task: ${task.title}`)
      assert.ok(localLinks(rootBody).includes(guide.file), `${task.title}: task is not directly discoverable`)
      const framework = task.file.startsWith('vue-') ? 'vue' : 'react'
      assert.ok(guide.frameworks.includes(framework), `${task.title}: wrong adapter`)
      assert.equal(guide.package, `@tanstack/${framework}-${task.product}`)
      const example = guide.examples.find((entry) => entry.file === `references/examples/${task.file}`)
      assert.deepEqual(example?.testedPackages, task.testedPackages)
      assert.deepEqual(await readFile(join(directory, example.file)), await readFile(new URL(`./examples/${task.file}`, import.meta.url)), 'Shipped example differs from its maintained source')
      // The task's complete guide can be larger; entry + the largest one-section
      // choice + the executable example must fit a focused reading session.
      const readingBytes = Buffer.byteLength(rootBody) + guide.bytes + (await stat(join(directory, example.file))).size
        + (guide.sections.some((section) => section.file !== guide.file) ? Math.max(...guide.sections.map((section) => section.bytes)) : 0)
      assert.ok(readingBytes <= 24 * 1024, `${task.title}: task path exceeds 24 KiB (${readingBytes} bytes)`)
      report.push({ task: task.title, readingBytes, testedPackages: example.testedPackages })
    }
    if (name === 'tanstack-query') {
      for (const framework of ['react', 'preact', 'vue', 'solid', 'svelte', 'angular', 'lit']) {
        const adapter = guides.filter((guide) => guide.theme === `framework-${framework}`)
        assert.ok(adapter.length > 0, `Query: missing ${framework} adapter guidance`)
        assert.ok(adapter.every((guide) => guide.kind === 'document' && guide.frameworks.includes(framework)), `Query: mixed adapter/draft route for ${framework}`)
      }
      assert.ok(guides.filter((guide) => guide.kind === 'atomic').every((guide) => guide.status === 'Draft guidance'), 'Query draft mislabeled as released guidance')
    }
  }
  return report
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  for (const entry of await validateGuidance()) console.log(`${entry.task}: ${entry.readingBytes} bytes for entry, task, one section, and example`)
  console.log('Validated self-contained navigation and source coverage for all 18 products.')
}
