import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { SourceClient } from './source-client.mjs'

// Reads may retry. A release POST is sent once; an uncertain result is reconciled
// by reading its deterministic tag, so rerunning this job cannot create duplicates.
export async function ensureRelease({ repository, version, sha, read, create }) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository) || !/^v\d+\.\d+\.\d+$/.test(version) || !/^[a-f0-9]{40}$/.test(sha)) throw new Error('Invalid release identity')
  const path = `repos/${repository}/releases/tags/${version}`
  const verify = async (release) => {
    const commit = await read(`repos/${repository}/commits/${version}`)
    if (commit?.sha !== sha || release.draft || release.tag_name !== version) throw new Error(`${version} already exists with a different commit or release state`)
    return release.html_url
  }
  const existing = await read(path)
  if (existing) return verify(existing)
  try {
    await create(`repos/${repository}/releases`, { tag_name: version, target_commitish: sha, generate_release_notes: true })
  } catch (error) {
    const recovered = await read(path)
    if (recovered) return verify(recovered)
    throw error
  }
  const created = await read(path)
  if (!created) throw new Error(`${version} was not visible after creation; rerun publishing to reconcile`)
  return verify(created)
}

async function main() {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN
  if (!token) throw new Error('GH_TOKEN is required for publishing')
  const client = new SourceClient({ token })
  const read = async (path) => {
    const { bytes, status } = await client.download(new URL(`https://api.github.com/${path}`), { label: path, limit: 8 * 1024 * 1024 })
    return status === 404 ? undefined : JSON.parse(bytes)
  }
  const create = async (path, body) => {
    const response = await fetch(`https://api.github.com/${path}`, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(60_000),
      headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'content-type': 'application/json', 'user-agent': 'tanstack-skills-extracted', 'x-github-api-version': '2022-11-28' },
      body: JSON.stringify(body) })
    await response.body?.cancel()
    if (response.status !== 201) throw new Error(`Release creation returned HTTP ${response.status}`)
  }
  console.log(await ensureRelease({ repository: process.env.GITHUB_REPOSITORY, version: process.env.RELEASE_VERSION, sha: process.env.PUBLISH_SHA, read, create }))
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(`ERROR: ${error.message}`); process.exitCode = 1 })
}
