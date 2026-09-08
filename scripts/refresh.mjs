#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { copyFile, lstat, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { sha256 } from './source-client.mjs'

export const generatedPaths = ['skills', 'skills.sh.json', '.claude-plugin/marketplace.json', 'sources.lock.json']
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..')

async function exists(file) {
  try { await lstat(file); return true } catch (error) { if (error.code === 'ENOENT') return false; throw error }
}

export async function promoteCandidate(candidate, root, { renamePath = rename } = {}) {
  const backedUp = []
  const installed = []
  // Check every input before replacing any output.
  for (const target of generatedPaths) {
    const stat = await lstat(join(candidate, target))
    if (stat.isSymbolicLink()) throw new Error(`Candidate is a symlink: ${target}`)
  }
  const backup = await mkdtemp(join(root, '.tanstack-refresh-backup-'))
  try {
    for (const target of generatedPaths) {
      const destination = join(root, target)
      await mkdir(dirname(destination), { recursive: true })
      if ((await lstat(dirname(destination))).isSymbolicLink()) throw new Error(`Output parent is a symlink: ${target}`)
      await mkdir(dirname(join(backup, target)), { recursive: true })
      if (await exists(destination)) {
        if ((await lstat(destination)).isSymbolicLink()) throw new Error(`Output is a symlink: ${target}`)
        await renamePath(destination, join(backup, target))
        backedUp.push(target)
      }
      await renamePath(join(candidate, target), destination)
      installed.push(target)
    }
  } catch (error) {
    for (const target of installed.reverse()) await rm(join(root, target), { recursive: true, force: true })
    for (const target of backedUp.reverse()) await renamePath(join(backup, target), join(root, target))
    await rm(backup, { recursive: true, force: true })
    throw error
  }
  await rm(backup, { recursive: true, force: true })
}

export async function writeSourceLock(snapshotDir, destination) {
  const requests = {}
  for (const file of (await readdir(snapshotDir)).filter((name) => name.endsWith('.json')).sort()) {
    const { url, entry } = JSON.parse(await readFile(join(snapshotDir, file), 'utf8'))
    requests[url] = entry
  }
  const lock = { schemaVersion: 1, requests: Object.fromEntries(Object.entries(requests).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) }
  await writeFile(destination, `${JSON.stringify(lock, null, 2)}\n`)
  return Object.keys(requests).length
}

export async function runStep(command, args, { cwd, env, logFile }) {
  const log = createWriteStream(logFile)
  try {
    await new Promise((done, reject) => {
      const child = spawn(command, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] })
      child.stdout.on('data', (bytes) => { process.stdout.write(bytes); log.write(bytes) })
      child.stderr.on('data', (bytes) => { process.stderr.write(bytes); log.write(bytes) })
      child.on('error', reject)
      child.on('close', (code, signal) => code === 0 ? done() : reject(new Error(`${command} failed (${signal || code}); see ${logFile}`)))
    })
  } finally { await new Promise((done) => log.end(done)) }
}

export async function refresh({ offline = false, check = false, lockFile = join(repository, 'sources.lock.json') } = {}) {
  const workRoot = join(repository, '.tanstack-refresh')
  await mkdir(workRoot, { recursive: true })
  const runDir = await mkdtemp(join(workRoot, 'run-'))
  const candidate = join(runDir, 'candidate')
  const snapshotDir = join(runDir, 'requests')
  await mkdir(candidate)
  await copyFile(join(repository, 'LICENSE'), join(candidate, 'LICENSE'))
  await mkdir(snapshotDir)
  const env = { ...process.env, TANSTACK_BUILD_ROOT: candidate, TANSTACK_SOURCE_SNAPSHOT: snapshotDir,
    TANSTACK_SOURCE_CACHE: resolve(process.env.TANSTACK_SOURCE_CACHE || join(repository, '.tanstack-source-cache')),
    TANSTACK_SOURCE_LOCK: resolve(lockFile), TANSTACK_OFFLINE: offline ? '1' : '0' }
  const report = { status: 'running', offline, check, runDir, stages: [] }
  const reportPath = join(workRoot, 'report.json')
  const saveReport = () => writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)
  const steps = [
    ['extract', 'bash', [join(repository, 'extractor.sh'), join(candidate, 'skills')]],
    ['documents', process.execPath, [join(repository, 'scripts/fetch-doc-sources.mjs')]],
    ['build', process.execPath, [join(repository, 'scripts/build-groups.mjs')]],
    ['validate', process.execPath, [join(repository, 'scripts/validate-catalog.mjs')]],
    ['guidance', process.execPath, [join(repository, 'scripts/validate-guidance.mjs')]],
    ['acceptance', process.execPath, [join(repository, 'acceptance/run.mjs')]],
  ]
  try {
    for (const [name, command, args] of steps) {
      const stage = { name, status: 'running' }
      report.stages.push(stage)
      await saveReport()
      const started = Date.now()
      process.stdout.write(`\n=== ${name} ===\n`)
      try {
        await runStep(command, args, { cwd: candidate, env, logFile: join(runDir, `${name}.log`) })
        stage.status = 'passed'
      } catch (error) { stage.status = 'failed'; throw error }
      finally { stage.seconds = Math.round((Date.now() - started) / 1000) }
    }
    report.sourceCount = await writeSourceLock(snapshotDir, join(candidate, 'sources.lock.json'))
    report.snapshotSha256 = sha256(await readFile(join(candidate, 'sources.lock.json')))
    if (!check) await promoteCandidate(candidate, repository)
    report.status = check ? 'validated' : 'applied'
    console.log(`${report.status}: ${report.sourceCount} locked source responses. Report: ${reportPath}`)
  } catch (error) {
    report.status = 'failed'
    report.error = error.message
    throw error
  } finally {
    await writeSourceLock(snapshotDir, join(runDir, 'sources.lock.json'))
    await saveReport()
    if (process.env.GITHUB_STEP_SUMMARY) {
      const summary = [`### Skill refresh: ${report.status}`, '', ...report.stages.map((stage) => `- ${stage.name}: ${stage.status} (${stage.seconds ?? 0}s)`), '', report.error || `${report.sourceCount} source responses locked.`, '']
      await writeFile(process.env.GITHUB_STEP_SUMMARY, summary.join('\n'), { flag: 'a' })
    }
  }
  return report
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2)
  let lockFile
  const lockIndex = args.indexOf('--lock')
  if (lockIndex !== -1 && args[lockIndex + 1] && !args[lockIndex + 1].startsWith('--')) {
    lockFile = resolve(args[lockIndex + 1])
    args.splice(lockIndex, 2)
  }
  if (args.some((arg) => !['--offline', '--check'].includes(arg))) {
    console.error('Usage: node scripts/refresh.mjs [--offline] [--check] [--lock sources.lock.json]')
    process.exitCode = 1
  } else {
    refresh({ offline: args.includes('--offline'), check: args.includes('--check'), lockFile }).catch((error) => { console.error(`ERROR: ${error.message}`); process.exitCode = 1 })
  }
}
