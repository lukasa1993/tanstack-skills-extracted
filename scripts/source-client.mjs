import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')

export function checkedSourceUrl(value, hosts) {
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash || !hosts.includes(url.hostname)) {
    throw new Error(`Unapproved source URL: ${url.origin}${url.pathname}`)
  }
  return url
}

export function immutableSource(url) {
  return (url.hostname === 'registry.npmjs.org' && /\/-\/[^/]+\.tgz$/.test(url.pathname)) ||
    (url.hostname === 'codeload.github.com' && /\/tar\.gz\/[a-f0-9]{40}$/.test(url.pathname)) ||
    (url.hostname === 'raw.githubusercontent.com' && /^\/[^/]+\/[^/]+\/[a-f0-9]{40}\//.test(url.pathname))
}

export function retryDelay(response, attempt, now = Date.now()) {
  const retryAfter = response.headers.get('retry-after')
  if (retryAfter) {
    const delay = /^\d+$/.test(retryAfter) ? Number(retryAfter) * 1000 : Date.parse(retryAfter) - now
    if (Number.isFinite(delay)) return Math.max(0, delay)
  }
  if (response.headers.get('x-ratelimit-remaining') === '0') {
    const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000
    if (reset > now) return reset - now + 1000
  }
  return Math.min(30_000, 1000 * 2 ** attempt)
}

export async function readJsonIfExists(file) {
  try { return JSON.parse(await readFile(file, 'utf8')) }
  catch (error) { if (error.code === 'ENOENT') return undefined; throw error }
}

async function atomicWrite(file, bytes) {
  const temporary = `${file}.${randomUUID()}.tmp`
  await writeFile(temporary, bytes)
  await rename(temporary, file)
}

export class SourceClient {
  constructor({ cacheDir = process.env.TANSTACK_SOURCE_CACHE || '.tanstack-source-cache',
    snapshotDir = process.env.TANSTACK_SOURCE_SNAPSHOT,
    lockFile = process.env.TANSTACK_SOURCE_LOCK,
    offline = process.env.TANSTACK_OFFLINE === '1',
    token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN,
    fetchImpl = fetch, sleepImpl = sleep, attempts = 4, timeoutMs = 60_000 } = {}) {
    Object.assign(this, { cacheDir: resolve(cacheDir), snapshotDir, lockFile, offline, token, fetchImpl, sleepImpl, attempts, timeoutMs })
    this.pending = new Map()
  }

  async initialize() {
    if (!this.initializing) this.initializing = (async () => {
      const lock = this.lockFile && await readJsonIfExists(this.lockFile)
      if (lock && (lock.schemaVersion !== 1 || !lock.requests || Array.isArray(lock.requests))) throw new Error('Invalid source lock')
      if (this.offline && !lock) throw new Error('Offline refresh requires a source lock from a completed acquisition')
      this.lock = lock?.requests || {}
      await mkdir(join(this.cacheDir, 'objects'), { recursive: true })
      await mkdir(join(this.cacheDir, 'urls'), { recursive: true })
      if (this.snapshotDir) await mkdir(this.snapshotDir, { recursive: true })
    })()
    return this.initializing
  }

  async cached(entry, limit) {
    if (!entry || !/^[a-f0-9]{64}$/.test(entry.sha256) || ![200, 404].includes(entry.status) || !Number.isSafeInteger(entry.bytes) || entry.bytes < 0 || entry.bytes > limit) return undefined
    try {
      const bytes = await readFile(join(this.cacheDir, 'objects', entry.sha256))
      if (bytes.length !== entry.bytes || sha256(bytes) !== entry.sha256) return undefined
      return { bytes, status: entry.status }
    } catch (error) { if (error.code === 'ENOENT') return undefined; throw error }
  }

  async request(value, { hosts, label = value, limit = 16 * 1024 * 1024, allow404 = false } = {}) {
    const url = checkedSourceUrl(value, hosts)
    await this.initialize()
    const key = sha256(url.href)
    // A mutable URL is read once per run, including across acquisition processes.
    if (!this.pending.has(key)) this.pending.set(key, this.acquire(url, key, { label, limit }))
    const result = await this.pending.get(key)
    if (result.bytes.length > limit) throw new Error(`${label} exceeds ${limit} bytes`)
    if (result.status === 404 && !allow404) throw new Error(`${label}: HTTP 404 (${url.href})`)
    return result
  }

  async bytes(url, options) { return (await this.request(url, options)).bytes }
  async json(url, options) { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(await this.bytes(url, options))) }

  async acquire(url, key, { label, limit }) {
    const snapshotFile = this.snapshotDir && join(this.snapshotDir, `${key}.json`)
    const current = snapshotFile && await readJsonIfExists(snapshotFile)
    const immutable = immutableSource(url)
    let entry = current?.entry || (this.offline || immutable ? this.lock[url.href] : undefined)
    if (!entry && immutable && !this.offline) entry = await readJsonIfExists(join(this.cacheDir, 'urls', `${key}.json`))
    let result = await this.cached(entry, limit)
    if (this.offline && !result) throw new Error(`Offline source missing or corrupt: ${label}. Restore the source cache for this lock.`)
    if (!result) {
      result = await this.download(url, { label, limit })
      entry = { status: result.status, sha256: sha256(result.bytes), bytes: result.bytes.length }
      await atomicWrite(join(this.cacheDir, 'objects', entry.sha256), result.bytes)
      if (immutable && result.status === 200) await atomicWrite(join(this.cacheDir, 'urls', `${key}.json`), JSON.stringify(entry))
    }
    if (snapshotFile) await atomicWrite(snapshotFile, JSON.stringify({ url: url.href, entry }))
    return result
  }

  async download(url, { label, limit }) {
    const headers = { accept: 'application/json', 'user-agent': 'tanstack-skills-extracted' }
    // Never send GitHub credentials to npm, archives, or raw-content hosts.
    if (url.hostname === 'api.github.com') {
      headers.accept = 'application/vnd.github+json'
      headers['x-github-api-version'] = '2022-11-28'
      if (this.token) headers.authorization = `Bearer ${this.token}`
    }
    for (let attempt = 0; attempt < this.attempts; attempt++) {
      let delay = 1000 * 2 ** attempt
      let failure
      try {
        const response = await this.fetchImpl(url, { headers, redirect: 'error', signal: AbortSignal.timeout(this.timeoutMs) })
        if (response.status !== 200 && response.status !== 404) {
          const rateLimited = response.status === 403 && (response.headers.has('retry-after') || response.headers.get('x-ratelimit-remaining') === '0')
          const retryable = response.status === 429 || response.status >= 500 || rateLimited
          delay = retryDelay(response, attempt)
          await response.body?.cancel()
          failure = new Error(`${label}: HTTP ${response.status} (${url.href})`)
          if (!retryable) { failure.permanent = true; throw failure }
        } else {
          const declared = response.headers.get('content-length')
          if (declared && (!/^\d+$/.test(declared) || Number(declared) > limit)) {
            await response.body?.cancel()
            const error = new Error(`${label} exceeds ${limit} bytes`); error.permanent = true; throw error
          }
          const chunks = []
          let length = 0
          for await (const chunk of response.body) {
            length += chunk.length
            if (length > limit) { const error = new Error(`${label} exceeds ${limit} bytes`); error.permanent = true; throw error }
            chunks.push(chunk)
          }
          return { bytes: Buffer.concat(chunks, length), status: response.status }
        }
      } catch (error) {
        if (error.permanent) throw error
        failure = new Error(`${label}: ${error.message}`, { cause: error })
      }
      if (attempt + 1 === this.attempts) throw failure
      // Respect long server cooldowns by failing for a later rerun, never retrying early.
      if (delay > 60_000) throw new Error(`${failure.message}; server requests a ${Math.ceil(delay / 1000)}s cooldown. Retry later.`)
      process.stderr.write(`Retry ${attempt + 1}/${this.attempts - 1}: ${label} in ${Math.ceil(delay / 1000)}s\n`)
      await this.sleepImpl(delay)
    }
  }
}

export const sources = new SourceClient()

export async function mapLimit(values, concurrency, operation) {
  const results = new Array(values.length)
  let cursor = 0
  let failure
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, async () => {
    while (!failure && cursor < values.length) {
      const index = cursor++
      try { results[index] = await operation(values[index], index) } catch (error) { failure = error }
    }
  }))
  if (failure) throw failure
  return results
}
