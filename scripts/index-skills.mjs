#!/usr/bin/env node
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { appendFile, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { expectedProductSkills } from './catalog-config.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const installer = join(root, 'acceptance/node_modules/skills/bin/cli.mjs')

async function inventory(directory) {
  const files = {}
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      for (const [file, bytes] of Object.entries(await inventory(path))) files[`${entry.name}/${file}`] = bytes
    } else {
      assert.ok(entry.isFile(), `Expected a regular installed file: ${path}`)
      files[entry.name] = await readFile(path)
    }
  }
  return files
}

export async function indexSkills({ repository, version, sha, catalogRoot = root,
  stateDir = join(root, '.skills-index-state'), summaryFile, env = process.env }) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository) || !/^v\d+\.\d+\.\d+$/.test(version) || !/^[a-f0-9]{40}$/.test(sha)) {
    throw new Error('Invalid publishing identity')
  }
  const remote = `https://github.com/${repository}.git`
  const tag = `refs/tags/${version}`
  // A SHA is not a branch: skills@1.5.22 uses git clone --branch <ref>.
  // Resolve lightweight and annotated tags, and refuse missing or moved releases.
  const refs = new Map(execFileSync('git', ['ls-remote', '--tags', remote, tag, `${tag}^{}`], {
    encoding: 'utf8', env, timeout: 60_000,
  }).trim().split('\n').filter(Boolean).map((line) => {
    const [commit, ref] = line.split(/\s+/)
    return [ref, commit]
  }))
  if ((refs.get(`${tag}^{}`) || refs.get(tag)) !== sha) throw new Error(`${version} does not resolve to the selected catalog commit ${sha}`)

  const source = `https://github.com/${repository}/tree/${version}`
  const installation = await mkdtemp(join(tmpdir(), 'tanstack-publish-'))
  try {
    execFileSync(process.execPath, [installer, 'add', source, '--agent', 'codex', '--copy', '--yes',
      '--skill', ...expectedProductSkills], { cwd: installation, env, timeout: 300_000, stdio: 'pipe' })
    const installedRoot = join(installation, '.agents/skills')
    assert.deepEqual((await readdir(installedRoot)).sort(), [...expectedProductSkills].sort(), 'Installer did not copy exactly the product skills')
    let fileCount = 0
    for (const product of expectedProductSkills) {
      const expected = await inventory(join(catalogRoot, 'skills', product))
      const actual = await inventory(join(installedRoot, product))
      assert.deepEqual(Object.keys(actual).sort(), Object.keys(expected).sort(), `Installed files differ: ${product}`)
      for (const file of Object.keys(expected)) {
        assert.ok(actual[file].equals(expected[file]), `Installed content differs: ${product}/${file}`)
        fileCount++
      }
    }
    // The CLI can exit zero after partial failures. Only remember a fully verified copy.
    await mkdir(stateDir, { recursive: true })
    await writeFile(join(stateDir, 'sha'), `${sha}\n`)
    const summary = `Verified ${expectedProductSkills.length} product installs (${fileCount} files) from ${version} at ${sha}. skills.sh telemetry is best-effort; the CLI does not confirm indexing.\n`
    if (summaryFile) await appendFile(summaryFile, summary)
    return { source, products: expectedProductSkills.length, fileCount }
  } finally { await rm(installation, { recursive: true, force: true }) }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  indexSkills({ repository: process.env.GITHUB_REPOSITORY, version: process.env.RELEASE_VERSION,
    sha: process.env.PUBLISH_SHA, summaryFile: process.env.GITHUB_STEP_SUMMARY })
    .then((result) => console.log(`Verified ${result.products} products and ${result.fileCount} files from ${result.source}`))
    .catch((error) => {
      if (error.stdout?.length) process.stderr.write(error.stdout)
      if (error.stderr?.length) process.stderr.write(error.stderr)
      console.error(`ERROR: ${error.message}`)
      process.exitCode = 1
    })
}
