import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { checkedSourceUrl, mapLimit, sources } from './source-client.mjs'

const queryPackage = '@tanstack/query-intent'
const queryRepo = 'TanStack/query'
const queryBranch = 'taren/query-intent-skills'
const queryPr = 10879

export function queryCommit(pr) {
  if (pr?.number !== queryPr || pr?.base?.repo?.full_name !== queryRepo || pr?.head?.repo?.full_name !== queryRepo || pr?.head?.ref !== queryBranch) {
    throw new Error('Official Query draft pull request identity changed')
  }
  const state = pr.merged === true ? 'merged' : pr.state
  if (!['open', 'closed', 'merged'].includes(state)) throw new Error(`Unsupported Query PR state: ${state}`)
  const sha = state === 'merged' ? pr.merge_commit_sha : pr.head.sha
  if (!/^[a-f0-9]{40}$/.test(sha || '')) throw new Error('Invalid Query draft commit')
  return { sha, state }
}

export function verifyIntegrity(bytes, integrity, label) {
  const match = /^sha512-([A-Za-z0-9+/]+={0,2})$/.exec(integrity || '')
  if (!match || createHash('sha512').update(bytes).digest('base64') !== match[1]) {
    throw new Error(`${label} does not match npm sha512 integrity`)
  }
}

export async function acquirePackages(directory, client = sources) {
  await mkdir(directory, { recursive: true })
  const registry = (process.env.REGISTRY || 'https://registry.npmjs.org').replace(/\/$/, '')
  const tag = process.env.TAG || 'latest'
  // REGISTRY may select an HTTPS registry, but package archives must remain on that host.
  const host = new URL(registry).hostname
  checkedSourceUrl(registry, [host])
  const options = { hosts: [host], limit: 16 * 1024 * 1024 }
  const listing = await client.json(`${registry}/-/org/tanstack/package?format=cli`, options)
  if (!listing || typeof listing !== 'object' || Array.isArray(listing)) throw new Error('Invalid TanStack npm scope response')
  const names = Object.keys(listing).filter((name) => /^@tanstack\/[a-z0-9][a-z0-9._-]*$/.test(name)).sort()
  const resolved = (await mapLimit(names, 12, async (name) => {
    const response = await client.request(`${registry}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`, { ...options, allow404: true })
    if (response.status === 404) return null
    const metadata = JSON.parse(response.bytes)
    if (metadata?.name !== name || !/^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/.test(metadata.version || '')) throw new Error(`Invalid npm identity for ${name}`)
    checkedSourceUrl(metadata.dist?.tarball, [host])
    return metadata
  })).filter(Boolean)
  if (!resolved.length) throw new Error(`No published TanStack packages for ${tag}`)

  // Resolve this small but critical mutable dependency before scanning archives.
  if (!resolved.some((entry) => entry.name === queryPackage)) {
    const pr = await client.json(`https://api.github.com/repos/${queryRepo}/pulls/${queryPr}`, { hosts: ['api.github.com'] })
    const { sha, state } = queryCommit(pr)
    const bytes = await client.bytes(`https://codeload.github.com/${queryRepo}/tar.gz/${sha}`, { hosts: ['codeload.github.com'], limit: 256 * 1024 * 1024 })
    if (bytes.length < 1024) throw new Error('Query draft archive is unexpectedly small')
    await writeFile(join(directory, 'query-intent-draft.tgz'), bytes)
    await writeFile(join(directory, 'query-source.tsv'), `${sha}\t${state}\n`)
  }

  let completed = 0
  const rows = await mapLimit(resolved, 6, async (metadata, index) => {
    const label = `${metadata.name}@${metadata.version}`
    const bytes = await client.bytes(metadata.dist.tarball, { hosts: [host], limit: 256 * 1024 * 1024, label })
    verifyIntegrity(bytes, metadata.dist.integrity, label)
    const filename = `${index}.tgz`
    await writeFile(join(directory, filename), bytes)
    completed++
    if (completed % 50 === 0 || completed === resolved.length) process.stderr.write(`Acquired ${completed}/${resolved.length} pinned npm archives\n`)
    return `${metadata.name}\t${filename}\t${metadata.version}`
  })
  await writeFile(join(directory, 'packages.tsv'), `${rows.join('\n')}\n`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  acquirePackages(resolve(process.argv[2])).catch((error) => { console.error(`ERROR: ${error.message}`); process.exitCode = 1 })
}
