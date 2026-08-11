#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, posix, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = join(root, '.tanstack-doc-sources')
const catalogUrl = 'https://tanstack.com/api/data/libraries'
const expectedLibraryIds = [
  'start',
  'router',
  'query',
  'table',
  'charts',
  'form',
  'db',
  'ai',
  'intent',
  'virtual',
  'pacer',
  'hotkeys',
  'markdown',
  'highlight',
  'store',
  'config',
  'devtools',
  'cli',
]

const externalGithubLinkSpecs = [
  {
    productId: 'config',
    sourcePath: 'docs/publish.md',
    originalUrl:
      'https://github.com/sxzz/userscripts/blob/main/src/npm-trusted-publisher.md',
    repository: 'sxzz/userscripts',
    targetPath: 'src/npm-trusted-publisher.md',
  },
]

const products = [
  {
    id: 'charts',
    name: 'TanStack Charts',
    repository: 'TanStack/charts',
    sourcePackage: '@tanstack/charts',
    stability: 'pre-alpha',
    experimentalFrameworks: ['react-native'],
    documentSource: 'npm-package',
    requireAlignedReleases: true,
    releasePackages: [
      {
        name: '@tanstack/charts',
        role: 'core',
        expectedMajor: 0,
        repositoryDirectory: 'packages/charts-core',
      },
      {
        name: '@tanstack/react-native-charts',
        role: 'experimental-compatibility-adapter',
        frameworks: ['react-native'],
        expectedMajor: 0,
        repositoryDirectory: 'packages/react-native-charts',
      },
    ],
    additionalDocuments: [
      {
        packageName: '@tanstack/react-native-charts',
        packagePath: 'README.md',
        sourcePath: 'packages/react-native-charts/README.md',
        outputPath: 'framework/react-native/README.md',
        kind: 'adapter-guide',
        frameworks: ['react-native'],
      },
    ],
    generatedApiRoots: [],
    required: [
      ['overview', (path) => path === 'docs/overview.md'],
      ['installation', (path) => path === 'docs/installation.md'],
      ['quick start', (path) => path === 'docs/quick-start.md'],
      ['guide', (path) => path.startsWith('docs/guides/')],
      ['framework quick start', (path) => /^docs\/framework\/[^/]+\/quick-start\.mdx?$/.test(path)],
      ['adapter guide', (path) => /^docs\/framework\/[^/]+\/adapter\.mdx?$/.test(path)],
    ],
  },
  {
    id: 'config',
    name: 'TanStack Config',
    repository: 'TanStack/config',
    sourcePackage: '@tanstack/vite-config',
    releasePackages: [
      {
        name: '@tanstack/eslint-config',
        role: 'tool',
        expectedMajor: 0,
        repositoryDirectory: 'packages/eslint-config',
      },
      {
        name: '@tanstack/publish-config',
        role: 'tool',
        expectedMajor: 0,
        repositoryDirectory: 'packages/publish-config',
      },
      {
        name: '@tanstack/vite-config',
        role: 'tool',
        expectedMajor: 0,
        repositoryDirectory: 'packages/vite-config',
      },
    ],
    verifyDocumentsAtEveryRelease: true,
    documentPackages: {
      'docs/eslint.md': '@tanstack/eslint-config',
      'docs/publish.md': '@tanstack/publish-config',
      'docs/vite.md': '@tanstack/vite-config',
    },
    generatedApiRoots: [],
    required: [
      ['overview', (path) => path === 'docs/overview.md'],
      ['ESLint guide', (path) => path === 'docs/eslint.md'],
      ['publish guide', (path) => path === 'docs/publish.md'],
      ['Vite guide', (path) => path === 'docs/vite.md'],
    ],
  },
  {
    id: 'form',
    name: 'TanStack Form',
    repository: 'TanStack/form',
    sourcePackage: '@tanstack/form-core',
    requireAdapterPackageCoverage: true,
    releasePackages: [
      {
        name: '@tanstack/form-core',
        role: 'core',
        expectedMajor: 1,
        repositoryDirectory: 'packages/form-core',
      },
      {
        name: '@tanstack/angular-form',
        role: 'adapter',
        frameworks: ['angular'],
        expectedMajor: 1,
        repositoryDirectory: 'packages/angular-form',
      },
      {
        name: '@tanstack/lit-form',
        role: 'adapter',
        frameworks: ['lit'],
        expectedMajor: 1,
        repositoryDirectory: 'packages/lit-form',
      },
      {
        name: '@tanstack/preact-form',
        role: 'adapter',
        frameworks: ['preact'],
        expectedMajor: 1,
        repositoryDirectory: 'packages/preact-form',
      },
      {
        name: '@tanstack/react-form',
        role: 'adapter',
        frameworks: ['react'],
        expectedMajor: 1,
        repositoryDirectory: 'packages/react-form',
      },
      {
        name: '@tanstack/solid-form',
        role: 'adapter',
        frameworks: ['solid'],
        expectedMajor: 1,
        repositoryDirectory: 'packages/solid-form',
      },
      {
        name: '@tanstack/svelte-form',
        role: 'adapter',
        frameworks: ['svelte'],
        expectedMajor: 1,
        repositoryDirectory: 'packages/svelte-form',
      },
      {
        name: '@tanstack/vue-form',
        role: 'adapter',
        frameworks: ['vue'],
        expectedMajor: 1,
        repositoryDirectory: 'packages/vue-form',
      },
    ],
    generatedApiRoots: [/^docs\/reference\//, /^docs\/framework\/[^/]+\/reference\//],
    required: [
      ['overview', (path) => path === 'docs/overview.md'],
      ['installation', (path) => path === 'docs/installation.md'],
      ['framework quick start', (path) => /^docs\/framework\/[^/]+\/quick-start\.mdx?$/.test(path)],
      ['framework guide', (path) => /^docs\/framework\/[^/]+\/guides\/.+\.mdx?$/.test(path)],
    ],
  },
  {
    id: 'hotkeys',
    name: 'TanStack Hotkeys',
    repository: 'TanStack/hotkeys',
    sourcePackage: '@tanstack/hotkeys',
    releasePackages: ['@tanstack/hotkeys'],
    generatedApiRoots: [/^docs\/reference\//, /^docs\/framework\/[^/]+\/reference\//],
    required: [
      ['overview', (path) => path === 'docs/overview.md'],
      ['installation', (path) => path === 'docs/installation.md'],
      ['framework quick start', (path) => /^docs\/framework\/[^/]+\/quick-start\.mdx?$/.test(path)],
      ['framework guide', (path) => /^docs\/framework\/[^/]+\/guides\/.+\.mdx?$/.test(path)],
    ],
  },
  {
    id: 'intent',
    name: 'TanStack Intent',
    repository: 'TanStack/intent',
    sourcePackage: '@tanstack/intent',
    releasePackages: ['@tanstack/intent'],
    generatedApiRoots: [],
    required: [
      ['overview', (path) => path === 'docs/overview.md'],
      ['consumer quick start', (path) => path === 'docs/getting-started/quick-start-consumers.md'],
      ['maintainer quick start', (path) => path === 'docs/getting-started/quick-start-maintainers.md'],
      ['meta skill', (path) => /^packages\/intent\/meta\/[^/]+\/SKILL\.md$/.test(path)],
    ],
  },
  {
    id: 'pacer',
    name: 'TanStack Pacer',
    repository: 'TanStack/pacer',
    sourcePackage: '@tanstack/pacer',
    releasePackages: ['@tanstack/pacer'],
    generatedApiRoots: [/^docs\/reference\//, /^docs\/framework\/[^/]+\/reference\//],
    required: [
      ['overview', (path) => path === 'docs/overview.md'],
      ['installation', (path) => path === 'docs/installation.md'],
      ['quick start', (path) => path === 'docs/quick-start.md'],
      ['guide', (path) => path.startsWith('docs/guides/')],
      ['adapter guide', (path) => /^docs\/framework\/[^/]+\/adapter\.mdx?$/.test(path)],
    ],
  },
  {
    id: 'store',
    name: 'TanStack Store',
    repository: 'TanStack/store',
    sourcePackage: '@tanstack/store',
    releasePackages: ['@tanstack/store'],
    generatedApiRoots: [/^docs\/reference\//, /^docs\/framework\/[^/]+\/reference\//],
    required: [
      ['overview', (path) => path === 'docs/overview.md'],
      ['installation', (path) => path === 'docs/installation.md'],
      ['quick start', (path) => path === 'docs/quick-start.md'],
      ['framework quick start', (path) => /^docs\/framework\/[^/]+\/quick-start\.mdx?$/.test(path)],
    ],
  },
  {
    id: 'virtual',
    name: 'TanStack Virtual',
    repository: 'TanStack/virtual',
    sourcePackage: '@tanstack/virtual-core',
    releasePackages: ['@tanstack/virtual-core'],
    generatedApiRoots: [],
    required: [
      ['introduction', (path) => path === 'docs/introduction.md'],
      ['installation', (path) => path === 'docs/installation.md'],
      ['framework adapter guide', (path) => /^docs\/framework\/[^/]+\/[^/]+\.mdx?$/.test(path)],
    ],
  },
]

const maxBytes = {
  archive: 64 * 1024 * 1024,
  asset: 24 * 1024 * 1024,
  catalog: 2 * 1024 * 1024,
  document: 8 * 1024 * 1024,
  githubApi: 2 * 1024 * 1024,
  license: 2 * 1024 * 1024,
  npmPackage: 64 * 1024 * 1024,
  registry: 4 * 1024 * 1024,
  attestation: 8 * 1024 * 1024,
  tarList: 24 * 1024 * 1024,
}
const maxProductOutputBytes = 32 * 1024 * 1024

function fail(message) {
  throw new Error(message)
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

function normalizeReleasePackage(value) {
  const spec = typeof value === 'string' ? { name: value } : value
  assertPlainObject(spec, 'release package configuration')
  if (typeof spec.name !== 'string' || !/^@tanstack\/[a-z0-9-]+$/.test(spec.name)) {
    fail('Release package configuration has an invalid package name')
  }
  const frameworks = spec.frameworks ?? []
  if (
    !Array.isArray(frameworks) ||
    frameworks.some((framework) => typeof framework !== 'string') ||
    new Set(frameworks).size !== frameworks.length
  ) {
    fail(`${spec.name} has invalid framework metadata`)
  }
  return {
    name: spec.name,
    role: spec.role ?? 'source',
    frameworks,
    expectedMajor: spec.expectedMajor,
    repositoryDirectory: spec.repositoryDirectory,
  }
}

function parseSemverMajor(version, packageName) {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.exec(
    version,
  )
  if (!match) fail(`${packageName} has non-semver latest version ${version}`)
  return Number(match[1])
}

function packageArchiveName(productId, packageName) {
  return `${productId}-npm-${packageName.replace(/^@tanstack\//, '').replace(/[^a-z0-9-]/g, '-')}.tgz`
}

function assertPlainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(`${label} must be an object`)
  }
  return value
}

function assertSafeRelativePath(path, label = 'path') {
  if (typeof path !== 'string' || !path || path.length > 4096) {
    fail(`Invalid ${label}`)
  }
  if (path.startsWith('/') || path.includes('\\') || /[\u0000-\u001f\u007f]/.test(path)) {
    fail(`Unsafe ${label}: ${JSON.stringify(path)}`)
  }
  const parts = path.split('/')
  if (parts.some((part) => !part || part === '.' || part === '..')) {
    fail(`Unsafe ${label}: ${JSON.stringify(path)}`)
  }
  if (posix.normalize(path) !== path) {
    fail(`Non-canonical ${label}: ${JSON.stringify(path)}`)
  }
  return path
}

function localPath(base, relativePath) {
  assertSafeRelativePath(relativePath)
  const result = resolve(base, ...relativePath.split('/'))
  if (!result.startsWith(`${resolve(base)}${sep}`)) {
    fail(`Output path escapes its root: ${relativePath}`)
  }
  return result
}

function checkedUrl(value, hosts, label) {
  let url
  try {
    url = new URL(value)
  } catch {
    fail(`Invalid ${label} URL: ${value}`)
  }
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port ||
    url.hash ||
    !hosts.includes(url.hostname)
  ) {
    fail(`Unsafe ${label} URL: ${url.href}`)
  }
  return url
}

async function fetchBytes(urlValue, { hosts, label, limit, headers = {} }) {
  const url = checkedUrl(urlValue, hosts, label)
  const response = await fetch(url, {
    headers: { 'user-agent': 'tanstack-skills-doc-source-fetcher/1', ...headers },
    redirect: 'error',
    signal: AbortSignal.timeout(60_000),
  })
  if (!response.ok) {
    fail(`${label} request failed with HTTP ${response.status}: ${url.href}`)
  }
  const finalUrl = checkedUrl(response.url, hosts, `${label} response`)
  if (finalUrl.href !== url.href) {
    fail(`${label} response URL changed unexpectedly: ${finalUrl.href}`)
  }
  const declaredLength = response.headers.get('content-length')
  if (declaredLength && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > limit)) {
    fail(`${label} response is larger than ${limit} bytes`)
  }

  const chunks = []
  let length = 0
  for await (const chunk of response.body) {
    length += chunk.length
    if (length > limit) {
      fail(`${label} response is larger than ${limit} bytes`)
    }
    chunks.push(chunk)
  }
  return Buffer.concat(chunks, length)
}

function decodeUtf8(bytes, label) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    fail(`${label} is not valid UTF-8`)
  }
}

async function fetchJson(url, options) {
  const bytes = await fetchBytes(url, options)
  try {
    return JSON.parse(decodeUtf8(bytes, options.label))
  } catch (error) {
    if (error instanceof SyntaxError) {
      fail(`${options.label} is not valid JSON`)
    }
    throw error
  }
}

function githubApiHeaders() {
  const headers = {
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
  }
  const token = process.env.GITHUB_TOKEN
  if (token) {
    if (token.length > 4096 || /[^\x21-\x7e]/.test(token)) {
      fail('GITHUB_TOKEN is not a safe HTTP credential')
    }
    headers.authorization = `Bearer ${token}`
  }
  return headers
}

function parseExternalGithubLinkSpec(spec) {
  assertPlainObject(spec, 'external GitHub link configuration')
  if (
    typeof spec.productId !== 'string' ||
    !expectedLibraryIds.includes(spec.productId) ||
    typeof spec.repository !== 'string' ||
    !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(spec.repository)
  ) {
    fail('External GitHub link configuration has an invalid product or repository')
  }
  assertSafeRelativePath(spec.sourcePath, 'external link source path')
  assertSafeRelativePath(spec.targetPath, 'external link target path')
  const url = checkedUrl(spec.originalUrl, ['github.com'], 'external GitHub link')
  if (url.search) fail(`External GitHub link must not have a query: ${url.href}`)
  let parts
  try {
    parts = url.pathname
      .split('/')
      .filter(Boolean)
      .map((part) => decodeURIComponent(part))
  } catch {
    fail(`External GitHub link has invalid URL encoding: ${url.href}`)
  }
  if (
    `${parts[0]}/${parts[1]}` !== spec.repository ||
    parts[2] !== 'blob' ||
    !['main', 'master'].includes(parts[3]) ||
    parts.slice(4).join('/') !== spec.targetPath
  ) {
    fail(`External GitHub link does not match its configured repository and path: ${url.href}`)
  }
  return { ...spec, originalUrl: url.href, originalBranch: parts[3] }
}

async function resolveExternalGithubLinks() {
  const specs = externalGithubLinkSpecs
    .map(parseExternalGithubLinkSpec)
    .sort((left, right) =>
      `${left.productId}\t${left.sourcePath}\t${left.originalUrl}`.localeCompare(
        `${right.productId}\t${right.sourcePath}\t${right.originalUrl}`,
      ),
    )
  const identities = new Set()
  for (const spec of specs) {
    const identity = `${spec.productId}\t${spec.sourcePath}\t${spec.originalUrl}`
    if (identities.has(identity)) fail(`Duplicate external GitHub link configuration: ${identity}`)
    identities.add(identity)
  }

  const repositoryResolutions = new Map()
  const resolved = []
  for (const spec of specs) {
    let repositoryResolution = repositoryResolutions.get(spec.repository)
    if (!repositoryResolution) {
      const repositoryApiUrl = `https://api.github.com/repos/${spec.repository}`
      const repositoryMetadata = assertPlainObject(
        await fetchJson(repositoryApiUrl, {
          hosts: ['api.github.com'],
          headers: githubApiHeaders(),
          label: `${spec.repository} GitHub repository metadata`,
          limit: maxBytes.githubApi,
        }),
        `${spec.repository} GitHub repository metadata`,
      )
      const defaultBranch = repositoryMetadata.default_branch
      if (
        repositoryMetadata.full_name?.toLowerCase() !== spec.repository.toLowerCase() ||
        typeof defaultBranch !== 'string' ||
        !/^[A-Za-z0-9._/-]+$/.test(defaultBranch)
      ) {
        fail(`${spec.repository} has invalid GitHub repository metadata`)
      }
      repositoryResolution = {
        repositoryApiUrl,
        defaultBranch,
      }
      repositoryResolutions.set(spec.repository, repositoryResolution)
    }
    if (spec.originalBranch !== repositoryResolution.defaultBranch) {
      fail(
        `${spec.originalUrl} names ${spec.originalBranch}, but ${spec.repository} uses default branch ${repositoryResolution.defaultBranch}`,
      )
    }

    const commitApi = new URL(`${repositoryResolution.repositoryApiUrl}/commits`)
    commitApi.searchParams.set('sha', repositoryResolution.defaultBranch)
    commitApi.searchParams.set('path', spec.targetPath)
    commitApi.searchParams.set('per_page', '1')
    const commitApiUrl = commitApi.href
    const commitList = await fetchJson(commitApiUrl, {
      hosts: ['api.github.com'],
      headers: githubApiHeaders(),
      label: `${spec.repository} latest ${spec.targetPath} commit`,
      limit: maxBytes.githubApi,
    })
    if (!Array.isArray(commitList) || commitList.length !== 1) {
      fail(`${spec.repository} ${spec.targetPath} did not resolve to one latest commit`)
    }
    const commitMetadata = assertPlainObject(
      commitList[0],
      `${spec.repository} latest ${spec.targetPath} commit`,
    )
    const commit = commitMetadata.sha
    if (
      typeof commit !== 'string' ||
      !/^[0-9a-f]{40}$/.test(commit) ||
      commitMetadata.html_url !== `https://github.com/${spec.repository}/commit/${commit}`
    ) {
      fail(`${spec.repository} ${spec.targetPath} did not resolve to one full Git commit`)
    }

    const encodedPath = encodedRepositoryPath(spec.targetPath)
    const pinnedUrl = `https://github.com/${spec.repository}/blob/${commit}/${encodedPath}`
    const contentUrl = `https://raw.githubusercontent.com/${spec.repository}/${commit}/${encodedPath}`
    const content = await fetchBytes(contentUrl, {
      hosts: ['raw.githubusercontent.com'],
      label: `${spec.repository} pinned external document`,
      limit: maxBytes.document,
    })
    if (!content.length) fail(`${spec.repository} pinned external document is empty`)
    decodeUtf8(content, `${spec.repository} pinned external document`)
    resolved.push({
      ...spec,
      ...repositoryResolution,
      commitApiUrl,
      commit,
      pinnedUrl,
      contentUrl,
      contentSha256: sha256(content),
    })
  }
  return resolved
}

function decodeBase64(value, label) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9+/_-]+={0,2}$/.test(value)) {
    fail(`${label} is not valid base64`)
  }
  const standard = value.replaceAll('-', '+').replaceAll('_', '/').replace(/=+$/, '')
  if (standard.length % 4 === 1) {
    fail(`${label} is not valid base64`)
  }
  const padded = standard.padEnd(Math.ceil(standard.length / 4) * 4, '=')
  const decoded = Buffer.from(padded, 'base64')
  if (decoded.toString('base64').replace(/=+$/, '') !== standard) {
    fail(`${label} is not canonical base64`)
  }
  return decoded
}

function integrityDigest(integrity, packageLabel) {
  const match = /^sha512-([A-Za-z0-9+/]+={0,2})$/.exec(integrity ?? '')
  if (!match) {
    fail(`${packageLabel} does not have one canonical sha512 integrity value`)
  }
  const digest = decodeBase64(match[1], `${packageLabel} integrity`)
  if (digest.length !== 64) {
    fail(`${packageLabel} has an invalid sha512 integrity length`)
  }
  return digest
}

function repositoryUrl(repository) {
  return `https://github.com/${repository}`
}

async function fetchReleasePackage(packageValue, expectedRepository, archiveDir, productId) {
  const spec = normalizeReleasePackage(packageValue)
  const packageName = spec.name
  const encodedName = encodeURIComponent(packageName)
  const registryUrl = `https://registry.npmjs.org/${encodedName}/latest`
  const metadata = assertPlainObject(
    await fetchJson(registryUrl, {
      hosts: ['registry.npmjs.org'],
      label: `${packageName} registry metadata`,
      limit: maxBytes.registry,
    }),
    `${packageName} registry metadata`,
  )
  const version = metadata.version
  if (typeof version !== 'string') {
    fail(`${packageName} has no safe latest version`)
  }
  const major = parseSemverMajor(version, packageName)
  if (spec.expectedMajor !== undefined && major !== spec.expectedMajor) {
    fail(`${packageName}@${version} must stay on major ${spec.expectedMajor}`)
  }
  if (metadata.name !== packageName || metadata.version !== version) {
    fail(`${packageName}@${version} registry identity does not match the request`)
  }
  const license = metadata.license
  if (typeof license !== 'string' || !license.trim() || /[\u0000-\u001f\u007f]/.test(license)) {
    fail(`${packageName}@${version} has no valid license identifier`)
  }
  const repositoryMetadata =
    typeof metadata.repository === 'string' ? { url: metadata.repository } : metadata.repository
  const expectedRepoUrl = repositoryUrl(expectedRepository)
  const repositoryValue = repositoryMetadata?.url
    ?.replace(/^git\+/, '')
    .replace(/\.git$/, '')
  if (repositoryValue !== expectedRepoUrl) {
    fail(`${packageName}@${version} package metadata does not name ${expectedRepoUrl}`)
  }
  if (
    spec.repositoryDirectory !== undefined &&
    repositoryMetadata?.directory !== spec.repositoryDirectory
  ) {
    fail(
      `${packageName}@${version} repository directory is ${repositoryMetadata?.directory}, not ${spec.repositoryDirectory}`,
    )
  }
  const dist = assertPlainObject(metadata.dist, `${packageName}@${version} dist metadata`)
  const integrity = dist.integrity
  const digest = integrityDigest(integrity, `${packageName}@${version}`)
  const tarballLocation = checkedUrl(
    dist.tarball,
    ['registry.npmjs.org'],
    `${packageName}@${version} tarball`,
  )
  const tarball = await fetchBytes(tarballLocation.href, {
    hosts: ['registry.npmjs.org'],
    label: `${packageName}@${version} tarball`,
    limit: maxBytes.npmPackage,
  })
  const downloadedDigest = createHash('sha512').update(tarball).digest()
  if (!downloadedDigest.equals(digest)) {
    fail(`${packageName}@${version} tarball does not match npm integrity`)
  }
  const packageArchivePath = join(archiveDir, packageArchiveName(productId, packageName))
  await writeFile(packageArchivePath, tarball, { flag: 'wx', mode: 0o600 })
  const packageEntries = await listArchive(packageArchivePath, 'package', {
    requireRootEntry: false,
  })
  if (!packageEntries.includes('package.json')) {
    fail(`${packageName}@${version} tarball has no package.json`)
  }
  const packedMetadata = assertPlainObject(
    JSON.parse(
      decodeUtf8(
        await extractArchiveFile(
          packageArchivePath,
          'package',
          'package.json',
          maxBytes.document,
        ),
        `${packageName}@${version} packed package.json`,
      ),
    ),
    `${packageName}@${version} packed package.json`,
  )
  if (
    packedMetadata.name !== packageName ||
    packedMetadata.version !== version ||
    packedMetadata.license !== license
  ) {
    fail(`${packageName}@${version} packed metadata does not match registry metadata`)
  }
  const attestationUrl = dist.attestations?.url
  const attestationPredicate = dist.attestations?.provenance?.predicateType
  if (
    typeof attestationUrl !== 'string' ||
    attestationPredicate !== 'https://slsa.dev/provenance/v1'
  ) {
    fail(`${packageName}@${version} has no npm SLSA provenance attestation`)
  }
  const attestationLocation = checkedUrl(
    attestationUrl,
    ['registry.npmjs.org'],
    `${packageName}@${version} attestation`,
  )
  if (!attestationLocation.pathname.startsWith('/-/npm/v1/attestations/')) {
    fail(`${packageName}@${version} has an unexpected attestation endpoint`)
  }

  const attestation = assertPlainObject(
    await fetchJson(attestationLocation.href, {
      hosts: ['registry.npmjs.org'],
      label: `${packageName}@${version} attestation`,
      limit: maxBytes.attestation,
    }),
    `${packageName}@${version} attestation`,
  )
  const provenance = attestation.attestations?.filter(
    (entry) => entry?.predicateType === 'https://slsa.dev/provenance/v1',
  )
  if (!Array.isArray(provenance) || provenance.length !== 1) {
    fail(`${packageName}@${version} must have exactly one SLSA provenance statement`)
  }
  const encodedPayload = provenance[0]?.bundle?.dsseEnvelope?.payload
  const statement = assertPlainObject(
    JSON.parse(
      decodeUtf8(
        decodeBase64(encodedPayload, `${packageName}@${version} provenance payload`),
        `${packageName}@${version} provenance payload`,
      ),
    ),
    `${packageName}@${version} provenance statement`,
  )
  if (
    statement._type !== 'https://in-toto.io/Statement/v1' ||
    statement.predicateType !== 'https://slsa.dev/provenance/v1'
  ) {
    fail(`${packageName}@${version} has an unexpected provenance statement type`)
  }
  const expectedSubject = `pkg:npm/${packageName.replace(/^@/, '%40')}@${version}`
  if (
    !Array.isArray(statement.subject) ||
    statement.subject.length !== 1 ||
    statement.subject[0]?.name !== expectedSubject ||
    statement.subject[0]?.digest?.sha512 !== digest.toString('hex')
  ) {
    fail(`${packageName}@${version} provenance subject does not match npm integrity`)
  }

  const workflowRepository =
    statement.predicate?.buildDefinition?.externalParameters?.workflow?.repository
  if (workflowRepository !== expectedRepoUrl) {
    fail(`${packageName}@${version} provenance names ${workflowRepository}, not ${expectedRepoUrl}`)
  }
  const dependencies = statement.predicate?.buildDefinition?.resolvedDependencies
  const expectedUriPrefix = `git+${expectedRepoUrl}@`
  const sources = Array.isArray(dependencies)
    ? dependencies.filter(
        (dependency) =>
          typeof dependency?.uri === 'string' &&
          dependency.uri.startsWith(expectedUriPrefix) &&
          /^refs\/(?:heads|tags)\/[A-Za-z0-9._/-]+$/.test(
            dependency.uri.slice(expectedUriPrefix.length),
          ) &&
          typeof dependency?.digest?.gitCommit === 'string',
      )
    : []
  if (sources.length !== 1 || !/^[0-9a-f]{40}$/.test(sources[0].digest.gitCommit)) {
    fail(`${packageName}@${version} does not resolve to one full Git commit`)
  }

  return {
    manifest: {
      name: packageName,
      version,
      license,
      role: spec.role,
      frameworks: [...spec.frameworks],
      integrity,
      tarballUrl: tarballLocation.href,
      tarballSha256: sha256(tarball),
      attestationUrl: attestationLocation.href,
      commit: sources[0].digest.gitCommit,
    },
    archivePath: packageArchivePath,
    archiveRoot: 'package',
    entries: packageEntries,
  }
}

function runTar(args, { label, limit }) {
  return new Promise((resolvePromise, rejectPromise) => {
    const childEnv = Object.fromEntries(
      Object.entries(process.env).filter(([name]) => !name.startsWith('TAR_')),
    )
    delete childEnv.TAPE
    const child = spawn('tar', args, {
      env: { ...childEnv, LANG: 'C', LC_ALL: 'C' },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    const stdout = []
    const stderr = []
    let stdoutLength = 0
    let stderrLength = 0
    let failure
    const timer = setTimeout(() => {
      failure = new Error(`${label} timed out`)
      child.kill('SIGKILL')
    }, 30_000)

    child.stdout.on('data', (chunk) => {
      stdoutLength += chunk.length
      if (stdoutLength > limit && !failure) {
        failure = new Error(`${label} produced more than ${limit} bytes`)
        child.kill('SIGKILL')
        return
      }
      stdout.push(chunk)
    })
    child.stderr.on('data', (chunk) => {
      stderrLength += chunk.length
      if (stderrLength <= 1024 * 1024) stderr.push(chunk)
    })
    child.on('error', (error) => {
      failure ||= new Error(`${label} could not start: ${error.message}`)
    })
    child.on('close', (code, signal) => {
      clearTimeout(timer)
      if (failure) {
        rejectPromise(failure)
        return
      }
      const errorText = Buffer.concat(stderr).toString('utf8').trim()
      if (code !== 0 || signal || errorText) {
        rejectPromise(
          new Error(
            `${label} failed${code === null ? '' : ` with exit ${code}`}${
              signal ? ` (${signal})` : ''
            }${errorText ? `: ${errorText}` : ''}`,
          ),
        )
        return
      }
      resolvePromise(Buffer.concat(stdout, stdoutLength))
    })
  })
}

async function listArchive(archivePath, expectedRoot, { requireRootEntry = true } = {}) {
  const bytes = await runTar(['-tzf', archivePath], {
    label: `list archive ${expectedRoot}`,
    limit: maxBytes.tarList,
  })
  const text = decodeUtf8(bytes, `archive listing for ${expectedRoot}`)
  const lines = text.endsWith('\n') ? text.slice(0, -1).split('\n') : text.split('\n')
  if (!lines.length || lines.length > 50_000) {
    fail(`Archive ${expectedRoot} has an invalid entry count`)
  }
  const rootEntry = `${expectedRoot}/`
  const entries = new Set()
  for (const entry of lines) {
    if (!entry || entry.length > 8192 || entry.includes('\\') || /[\u0000-\u001f\u007f]/.test(entry)) {
      fail(`Archive ${expectedRoot} contains an unsafe entry name`)
    }
    if (entry !== rootEntry && !entry.startsWith(rootEntry)) {
      fail(`Archive entry is outside ${rootEntry}: ${entry}`)
    }
    const relativePath = entry.slice(rootEntry.length).replace(/\/$/, '')
    if (relativePath) assertSafeRelativePath(relativePath, 'archive entry')
    if (entries.has(entry)) {
      fail(`Archive ${expectedRoot} contains duplicate entry ${entry}`)
    }
    entries.add(entry)
  }
  if (requireRootEntry && !entries.has(rootEntry)) {
    fail(`Archive ${expectedRoot} has no root directory entry`)
  }
  return [...entries]
    .filter((entry) => entry !== rootEntry && !entry.endsWith('/'))
    .map((entry) => entry.slice(rootEntry.length))
    .sort()
}

async function extractArchiveFile(archivePath, archiveRoot, sourcePath, limit) {
  assertSafeRelativePath(sourcePath, 'source path')
  return runTar(['-xOzf', archivePath, '--', `${archiveRoot}/${sourcePath}`], {
    label: `extract ${sourcePath}`,
    limit,
  })
}

async function fetchRepositoryArchive(product, commit, archiveDir) {
  if (!/^[0-9a-f]{40}$/.test(commit)) fail(`${product.name} has an invalid source commit`)
  const repositoryName = product.repository.split('/')[1]
  const url = `https://codeload.github.com/${product.repository}/tar.gz/${commit}`
  const bytes = await fetchBytes(url, {
    hosts: ['codeload.github.com'],
    label: `${product.name} source archive at ${commit}`,
    limit: maxBytes.archive,
  })
  const archivePath = join(archiveDir, `${product.id}-repo-${commit}.tgz`)
  await writeFile(archivePath, bytes, { flag: 'wx', mode: 0o600 })
  const archiveRoot = `${repositoryName}-${commit}`
  return {
    archivePath,
    archiveRoot,
    entries: await listArchive(archivePath, archiveRoot),
    manifest: { url, commit, sha256: sha256(bytes) },
  }
}

function isGeneratedReference(product, path) {
  return product.generatedApiRoots.some((pattern) => pattern.test(path))
}

function isDocument(product, path) {
  if (/^docs\/.+\.mdx?$/.test(path) && !isGeneratedReference(product, path)) return true
  return product.id === 'intent' && /^packages\/intent\/meta\/[^/]+\/SKILL\.md$/.test(path)
}

function documentOutputPath(path) {
  if (path.startsWith('docs/')) return path.slice('docs/'.length)
  const metaMatch = /^packages\/intent\/meta\/([^/]+\/SKILL\.md)$/.exec(path)
  if (metaMatch) return `meta/${metaMatch[1]}`
  fail(`No document output mapping for ${path}`)
}

function documentMetadata(path) {
  const frameworkMatch = /^docs\/framework\/([^/]+)\//.exec(path)
  const frameworks = frameworkMatch ? [frameworkMatch[1]] : []
  let kind = 'guide'
  if (/^packages\/intent\/meta\//.test(path)) {
    kind = 'meta-skill'
  } else if (frameworkMatch && /\/(?:adapter|[^/]+-virtual)\.mdx?$/.test(path)) {
    kind = 'adapter-guide'
  } else if (frameworkMatch) {
    kind = 'framework-guide'
  }
  return { kind, frameworks }
}

function encodedRepositoryPath(path) {
  return path.split('/').map((part) => encodeURIComponent(part)).join('/')
}

function pinnedRepositoryUrl(product, commit, path, type = 'blob') {
  return `${repositoryUrl(product.repository)}/${type}/${commit}/${encodedRepositoryPath(path)}`
}

function splitLinkDestination(value) {
  const wrapped = value.startsWith('<') && value.endsWith('>')
  const destination = wrapped ? value.slice(1, -1) : value
  const suffixIndex = destination.search(/[?#]/)
  const pathname = suffixIndex === -1 ? destination : destination.slice(0, suffixIndex)
  const suffix = suffixIndex === -1 ? '' : destination.slice(suffixIndex)
  return { wrapped, pathname, suffix }
}

function joinLinkDestination(pathname, suffix, wrapped) {
  const value = `${pathname}${suffix}`
  return wrapped ? `<${value}>` : value
}

function resolveRepositoryPath(sourcePath, destination, repositoryEntries) {
  let decoded
  try {
    decoded = decodeURIComponent(destination)
  } catch {
    fail(`Link in ${sourcePath} has invalid URL encoding: ${destination}`)
  }
  const base = posix.dirname(sourcePath)
  let candidate = posix.normalize(posix.join(base, decoded))
  if (candidate === '..' || candidate.startsWith('../') || candidate.startsWith('/')) {
    fail(`Link in ${sourcePath} escapes the source repository: ${destination}`)
  }

  const generatedExample = /^docs\/framework\/([^/]+)\/examples\/([^/]+)$/.exec(candidate)
  if (generatedExample) candidate = `examples/${generatedExample[1]}/${generatedExample[2]}`

  const fileCandidates = [
    candidate,
    `${candidate}.md`,
    `${candidate}.mdx`,
    `${candidate}/index.md`,
    `${candidate}/index.mdx`,
    `${candidate}/README.md`,
  ]
  const file = fileCandidates.find((path) => repositoryEntries.has(path))
  if (file) return { path: file, type: 'file' }
  if ([...repositoryEntries].some((path) => path.startsWith(`${candidate}/`))) {
    return { path: candidate, type: 'directory' }
  }
  return undefined
}

function relativeOutputLink(fromPath, toPath) {
  const relativePath = posix.relative(posix.dirname(fromPath), toPath)
  if (!relativePath) return `./${posix.basename(toPath)}`
  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`
}

function assetOutputPath(sourcePath) {
  if (sourcePath.startsWith('docs/assets/')) return sourcePath.slice('docs/'.length)
  return `assets/repository/${sourcePath}`
}

function isAssetPath(path) {
  return /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(path)
}

function sameRepositoryUrlTarget(product, destination) {
  let url
  try {
    url = new URL(destination)
  } catch {
    return undefined
  }
  const parts = url.pathname.split('/').filter(Boolean)
  const [owner, repository] = product.repository.split('/')
  if (parts[0]?.toLowerCase() !== owner.toLowerCase() || parts[1]?.toLowerCase() !== repository.toLowerCase()) {
    return undefined
  }

  if (url.hostname === 'github.com' && ['blob', 'tree'].includes(parts[2])) {
    if (parts.length < 5) return undefined
    return {
      path: parts.slice(4).map((part) => decodeURIComponent(part)).join('/'),
      type: parts[2] === 'tree' ? 'directory' : 'file',
      suffix: `${url.search}${url.hash}`,
    }
  }
  if (url.hostname === 'raw.githubusercontent.com') {
    let pathStart = 3
    if (parts[2] === 'refs' && parts[3] === 'heads') pathStart = 5
    if (parts.length <= pathStart) return undefined
    return {
      path: parts.slice(pathStart).map((part) => decodeURIComponent(part)).join('/'),
      type: 'file',
      raw: true,
      suffix: `${url.search}${url.hash}`,
    }
  }
  return undefined
}

function inlineCodeRanges(line) {
  const ranges = []
  let index = 0
  while (index < line.length) {
    if (line[index] !== '`') {
      index += 1
      continue
    }
    let length = 1
    while (line[index + length] === '`') length += 1
    const delimiter = '`'.repeat(length)
    const end = line.indexOf(delimiter, index + length)
    if (end === -1) break
    ranges.push([index, end + length])
    index = end + length
  }
  return ranges
}

function insideRange(index, ranges) {
  return ranges.some(([start, end]) => index >= start && index < end)
}

function isMutableGithubUrl(value) {
  let url
  try {
    url = new URL(value)
  } catch {
    return false
  }
  let parts
  try {
    parts = url.pathname
      .split('/')
      .filter(Boolean)
      .map((part) => decodeURIComponent(part).toLowerCase())
  } catch {
    fail(`GitHub link has invalid URL encoding: ${value}`)
  }
  if (url.hostname === 'github.com') {
    if (!['blob', 'tree', 'raw', 'commits'].includes(parts[2])) return false
    const branch =
      parts[3] === 'refs' && parts[4] === 'heads' ? parts[5] : parts[3]
    return ['main', 'master'].includes(branch)
  }
  if (url.hostname === 'raw.githubusercontent.com') {
    const branch =
      parts[2] === 'refs' && parts[3] === 'heads' ? parts[4] : parts[2]
    return ['main', 'master'].includes(branch)
  }
  return false
}

function assertNoMutableGithubLinks(text, label) {
  const lines = text.match(/[^\n]*\n|[^\n]+$/g) ?? []
  let fence
  for (const line of lines) {
    const fenceMatch = /^ {0,3}(`{3,}|~{3,})/.exec(line)
    if (fenceMatch) {
      const marker = fenceMatch[1]
      if (!fence) {
        fence = { character: marker[0], length: marker.length }
      } else if (marker[0] === fence.character && marker.length >= fence.length) {
        fence = undefined
      }
      continue
    }
    if (fence) continue
    const codeRanges = inlineCodeRanges(line)
    const pattern = /https:\/\/(?:github\.com|raw\.githubusercontent\.com)\/[^\s<>"'`)\]}]+/gi
    for (const match of line.matchAll(pattern)) {
      if (!insideRange(match.index, codeRanges) && isMutableGithubUrl(match[0])) {
        fail(`${label} retained mutable GitHub branch link ${match[0]}`)
      }
    }
  }
}

function rewriteMarkdownLinks(text, sourcePath, resolveDestination) {
  const lines = text.match(/[^\n]*\n|[^\n]+$/g) ?? []
  let fence
  const rewritten = []

  for (const line of lines) {
    const fenceMatch = /^ {0,3}(`{3,}|~{3,})/.exec(line)
    if (fenceMatch) {
      const marker = fenceMatch[1]
      if (!fence) {
        fence = { character: marker[0], length: marker.length }
      } else if (marker[0] === fence.character && marker.length >= fence.length) {
        fence = undefined
      }
      rewritten.push(line)
      continue
    }
    if (fence) {
      rewritten.push(line)
      continue
    }

    const codeRanges = inlineCodeRanges(line)
    const replacements = []
    const inlinePattern = /(!?)\[([^\]\n]*)\]\((<[^>\n]+>|[^)\s]+)([ \t]+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\)/g
    for (const match of line.matchAll(inlinePattern)) {
      if (insideRange(match.index, codeRanges)) continue
      const isImage = match[1] === '!'
      const result = resolveDestination(match[3], { isImage, sourcePath })
      if (result.unavailable) {
        const label = match[2].trim() || posix.basename(result.sourcePath)
        replacements.push({
          start: match.index,
          end: match.index + match[0].length,
          value: `[Upstream image unavailable in pinned release: ${label}]`,
        })
      } else if (result.destination !== match[3]) {
        const suffix = match[4] ?? ''
        replacements.push({
          start: match.index,
          end: match.index + match[0].length,
          value: `${match[1]}[${match[2]}](${result.destination}${suffix})`,
        })
      }
    }

    const htmlPattern = /<(img|a)\b[^>]*?\b(src|href)=(['"])(.*?)\3[^>]*>/gi
    for (const match of line.matchAll(htmlPattern)) {
      if (insideRange(match.index, codeRanges)) continue
      const isImage = match[1].toLowerCase() === 'img'
      const result = resolveDestination(match[4], { isImage, sourcePath })
      if (result.unavailable) {
        replacements.push({
          start: match.index,
          end: match.index + match[0].length,
          value: `[Upstream image unavailable in pinned release: ${posix.basename(result.sourcePath)}]`,
        })
      } else if (result.destination !== match[4]) {
        const destinationOffset = match[0].indexOf(match[4])
        replacements.push({
          start: match.index + destinationOffset,
          end: match.index + destinationOffset + match[4].length,
          value: result.destination,
        })
      }
    }

    const referenceMatch = /^( {0,3}\[[^\]\n]+\]:[ \t]*)(<[^>\n]+>|\S+)/.exec(line)
    if (referenceMatch && !insideRange(referenceMatch[1].length, codeRanges)) {
      const result = resolveDestination(referenceMatch[2], { isImage: false, sourcePath })
      if (result.unavailable) fail(`Non-image link in ${sourcePath} is unavailable`)
      if (result.destination !== referenceMatch[2]) {
        replacements.push({
          start: referenceMatch[1].length,
          end: referenceMatch[1].length + referenceMatch[2].length,
          value: result.destination,
        })
      }
    }

    replacements.sort((left, right) => right.start - left.start)
    let next = line
    let lastStart = line.length + 1
    for (const replacement of replacements) {
      if (replacement.end > lastStart) fail(`Overlapping Markdown links in ${sourcePath}`)
      next = `${next.slice(0, replacement.start)}${replacement.value}${next.slice(replacement.end)}`
      lastStart = replacement.start
    }
    rewritten.push(next)
  }
  return rewritten.join('')
}

function normalizeText(bytes, label) {
  let text = decodeUtf8(bytes, label).replace(/\r\n?/g, '\n')
  if (!text.trim()) fail(`${label} is empty`)
  if (!text.endsWith('\n')) text += '\n'
  return Buffer.from(text, 'utf8')
}

function looksLikeGeneratedTypeDoc(bytes) {
  const text = bytes.toString('utf8')
  const frontmatter = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(text)?.[1]
  if (!frontmatter || !/^id:/m.test(frontmatter)) return false
  return /^(?:Defined in:|# (?:Class|Function|Interface|Type Alias|Variable):|# @tanstack\/)/m.test(
    text,
  )
}

async function writeOutputFile(stageDir, relativePath, bytes) {
  const destination = localPath(stageDir, relativePath)
  await mkdir(dirname(destination), { recursive: true })
  await writeFile(destination, bytes, { flag: 'wx', mode: 0o644 })
}

function validateDocumentSet(product, documentDefinitions, catalogProduct) {
  const documentPaths = documentDefinitions.map((document) => document.sourcePath)
  if (!documentDefinitions.length) fail(`${product.name} has no selected documents`)
  if (documentPaths.some((path) => isGeneratedReference(product, path))) {
    fail(`${product.name} selected a generated API reference`)
  }
  for (const [label, matches] of product.required) {
    if (!documentPaths.some(matches)) {
      fail(`${product.name} release docs have no required ${label}`)
    }
  }
  const allowedFrameworks = new Set([
    ...catalogProduct.frameworks,
    ...(product.experimentalFrameworks ?? []),
  ])
  for (const document of documentDefinitions) {
    for (const framework of document.frameworks) {
      if (!allowedFrameworks.has(framework)) {
        fail(`${product.name} document uses framework ${framework}, which is absent from the public catalog`)
      }
    }
  }
  for (const framework of allowedFrameworks) {
    if (
      framework !== 'vanilla' &&
      !documentDefinitions.some((document) => document.frameworks.includes(framework))
    ) {
      fail(`${product.name} has no selected ${framework} framework guide`)
    }
  }
}

async function buildProduct(
  stageDir,
  archiveDir,
  product,
  catalogProduct,
  externalGithubLinks,
) {
  const packageSpecs = product.releasePackages
    .map(normalizeReleasePackage)
    .sort((left, right) => left.name.localeCompare(right.name))
  const releaseSources = []
  for (const packageSpec of packageSpecs) {
    releaseSources.push(
      await fetchReleasePackage(packageSpec, product.repository, archiveDir, product.id),
    )
  }
  const sourceRelease = releaseSources.find(
    (release) => release.manifest.name === product.sourcePackage,
  )
  if (!sourceRelease) fail(`${product.name} source package is not in its release package list`)

  if (product.requireAlignedReleases) {
    const versions = new Set(releaseSources.map((release) => release.manifest.version))
    const commits = new Set(releaseSources.map((release) => release.manifest.commit))
    if (versions.size !== 1 || commits.size !== 1) {
      fail(`${product.name} core and compatibility packages must have aligned releases`)
    }
  }
  if (product.requireAdapterPackageCoverage) {
    const adapterFrameworks = releaseSources
      .filter((release) => release.manifest.role === 'adapter')
      .flatMap((release) => release.manifest.frameworks)
      .sort()
    const catalogFrameworks = catalogProduct.frameworks
      .filter((framework) => framework !== 'vanilla')
      .sort()
    if (!arraysEqual(adapterFrameworks, catalogFrameworks)) {
      fail(
        `${product.name} adapter packages [${adapterFrameworks.join(', ')}] do not match catalog frameworks [${catalogFrameworks.join(', ')}]`,
      )
    }
  }

  const commit = sourceRelease.manifest.commit
  const repositorySources = new Map()
  const getRepositorySource = async (sourceCommit) => {
    if (!repositorySources.has(sourceCommit)) {
      repositorySources.set(
        sourceCommit,
        await fetchRepositoryArchive(product, sourceCommit, archiveDir),
      )
    }
    return repositorySources.get(sourceCommit)
  }
  const sourceRepository = await getRepositorySource(commit)
  if (product.verifyDocumentsAtEveryRelease) {
    for (const release of releaseSources) await getRepositorySource(release.manifest.commit)
  }

  const primaryDocumentSource =
    product.documentSource === 'npm-package' ? sourceRelease : sourceRepository
  const documentDefinitions = primaryDocumentSource.entries
    .filter((path) => isDocument(product, path))
    .map((sourcePath) => {
      const { kind, frameworks } = documentMetadata(sourcePath)
      return {
        sourcePath,
        packagePath: sourcePath,
        outputPath: assertSafeRelativePath(
          documentOutputPath(sourcePath),
          'document output path',
        ),
        kind,
        frameworks,
        sourcePackage: sourceRelease.manifest.name,
        sourceCommit: commit,
        sourceKind:
          product.documentSource === 'npm-package'
            ? 'npm-package'
            : 'github-release-archive',
        fileSource: primaryDocumentSource,
      }
    })

  for (const additional of product.additionalDocuments ?? []) {
    const release = releaseSources.find(
      (candidate) => candidate.manifest.name === additional.packageName,
    )
    if (!release || !release.entries.includes(additional.packagePath)) {
      fail(`${product.name} is missing packaged document ${additional.packagePath}`)
    }
    documentDefinitions.push({
      sourcePath: assertSafeRelativePath(additional.sourcePath, 'additional source path'),
      packagePath: assertSafeRelativePath(additional.packagePath, 'package document path'),
      outputPath: assertSafeRelativePath(additional.outputPath, 'additional output path'),
      kind: additional.kind,
      frameworks: [...additional.frameworks],
      sourcePackage: release.manifest.name,
      sourceCommit: release.manifest.commit,
      sourceKind: 'npm-package',
      fileSource: release,
    })
  }
  documentDefinitions.sort((left, right) => left.sourcePath.localeCompare(right.sourcePath))
  if (documentDefinitions.length > 2_000) fail(`${product.name} selected too many documents`)
  validateDocumentSet(product, documentDefinitions, catalogProduct)

  const usedSourcePaths = new Set()
  const usedOutputPaths = new Set()
  for (const document of documentDefinitions) {
    if (usedSourcePaths.has(document.sourcePath) || usedOutputPaths.has(document.outputPath)) {
      fail(`${product.name} has duplicate document paths at ${document.sourcePath}`)
    }
    usedSourcePaths.add(document.sourcePath)
    usedOutputPaths.add(document.outputPath)

    document.rawBytes = normalizeText(
      await extractArchiveFile(
        document.fileSource.archivePath,
        document.fileSource.archiveRoot,
        document.packagePath,
        maxBytes.document,
      ),
      `${product.name} ${document.sourcePath}`,
    )
    if (looksLikeGeneratedTypeDoc(document.rawBytes)) {
      fail(`${product.name} selected generated TypeDoc content at ${document.sourcePath}`)
    }

    const repositorySource = await getRepositorySource(document.sourceCommit)
    if (!repositorySource.entries.includes(document.sourcePath)) {
      fail(`${product.name} pinned repository is missing ${document.sourcePath}`)
    }
    if (document.sourceKind === 'npm-package') {
      const repositoryBytes = normalizeText(
        await extractArchiveFile(
          repositorySource.archivePath,
          repositorySource.archiveRoot,
          document.sourcePath,
          maxBytes.document,
        ),
        `${product.name} repository ${document.sourcePath}`,
      )
      if (!document.rawBytes.equals(repositoryBytes)) {
        fail(`${product.name} packaged document differs from its attested repository commit: ${document.sourcePath}`)
      }
    }

    const verifiedCommits = product.verifyDocumentsAtEveryRelease
      ? [...repositorySources.keys()].sort()
      : [document.sourceCommit]
    for (const verifiedCommit of verifiedCommits) {
      const verifiedSource = await getRepositorySource(verifiedCommit)
      if (!verifiedSource.entries.includes(document.sourcePath)) {
        fail(`${product.name} ${document.sourcePath} is absent at release ${verifiedCommit}`)
      }
      const verifiedBytes = normalizeText(
        await extractArchiveFile(
          verifiedSource.archivePath,
          verifiedSource.archiveRoot,
          document.sourcePath,
          maxBytes.document,
        ),
        `${product.name} ${document.sourcePath} at ${verifiedCommit}`,
      )
      if (!document.rawBytes.equals(verifiedBytes)) {
        fail(`${product.name} ${document.sourcePath} differs at release ${verifiedCommit}`)
      }
    }
    document.verifiedCommits = verifiedCommits
    document.sourceSha256 = sha256(document.rawBytes)

    const owningPackage = product.documentPackages?.[document.sourcePath]
    if (owningPackage) {
      const ownerRelease = releaseSources.find(
        (release) => release.manifest.name === owningPackage,
      )
      if (!ownerRelease) fail(`${product.name} has no release for ${owningPackage}`)
      document.sourcePackage = owningPackage
      document.sourceCommit = ownerRelease.manifest.commit
    }
  }

  const documentsBySourcePath = new Map(
    documentDefinitions.map((document) => [document.sourcePath, document]),
  )
  const configuredExternalLinks = externalGithubLinks.filter(
    (link) => link.productId === product.id,
  )
  const externalLinksByUrl = new Map()
  for (const link of configuredExternalLinks) {
    if (!documentsBySourcePath.has(link.sourcePath)) {
      fail(`${product.name} external link source is not selected: ${link.sourcePath}`)
    }
    if (externalLinksByUrl.has(link.originalUrl)) {
      fail(`${product.name} has duplicate external link URL ${link.originalUrl}`)
    }
    externalLinksByUrl.set(link.originalUrl, link)
  }
  const externalLinkUsage = new Map()
  const assetRequests = new Map()
  const unavailableAssets = new Map()
  const linkCounts = {
    localDocuments: 0,
    localAssets: 0,
    pinnedRepository: 0,
    pinnedExternalRepository: 0,
  }

  const requestAsset = (sourcePath, document, repositorySource) => {
    const outputPath = assertSafeRelativePath(assetOutputPath(sourcePath), 'asset output path')
    let request = assetRequests.get(outputPath)
    if (!request) {
      request = { sourcePath, outputPath, sources: new Map() }
      assetRequests.set(outputPath, request)
    } else if (request.sourcePath !== sourcePath) {
      fail(`${product.name} asset output collision at ${outputPath}`)
    }
    request.sources.set(document.sourceCommit, repositorySource)
    linkCounts.localAssets += 1
    return relativeOutputLink(document.outputPath, outputPath)
  }

  const resolveDestination = (value, { isImage, sourcePath }) => {
    const document = documentsBySourcePath.get(sourcePath)
    if (!document) fail(`${product.name} has no document context for ${sourcePath}`)
    const { wrapped, pathname, suffix } = splitLinkDestination(value)
    if (!pathname || pathname.startsWith('#')) return { destination: value }
    const repositorySource = repositorySources.get(document.sourceCommit)
    if (!repositorySource) fail(`${product.name} has no source archive for ${document.sourceCommit}`)
    const repositoryEntries = new Set(repositorySource.entries)

    const externalLink = externalLinksByUrl.get(pathname)
    if (externalLink) {
      if (externalLink.sourcePath !== sourcePath) {
        fail(
          `${product.name} external link ${pathname} appeared in unexpected document ${sourcePath}`,
        )
      }
      externalLinkUsage.set(pathname, (externalLinkUsage.get(pathname) ?? 0) + 1)
      linkCounts.pinnedExternalRepository += 1
      return {
        destination: joinLinkDestination(externalLink.pinnedUrl, suffix, wrapped),
      }
    }

    const sameRepositoryTarget = sameRepositoryUrlTarget(product, pathname)
    if (sameRepositoryTarget) {
      const targetExists =
        sameRepositoryTarget.type === 'file'
          ? repositoryEntries.has(sameRepositoryTarget.path)
          : [...repositoryEntries].some((path) =>
              path.startsWith(`${sameRepositoryTarget.path}/`),
            )
      if (!targetExists) {
        if (isImage) {
          const key = `${sourcePath}\t${sameRepositoryTarget.path}`
          unavailableAssets.set(key, {
            document: sourcePath,
            sourcePath: sameRepositoryTarget.path,
          })
          return { unavailable: true, sourcePath: sameRepositoryTarget.path }
        }
        fail(`${product.name} same-repository link is absent at ${document.sourceCommit}: ${pathname}`)
      }
      if (
        sameRepositoryTarget.type === 'file' &&
        (isImage || isAssetPath(sameRepositoryTarget.path))
      ) {
        const localPath = requestAsset(sameRepositoryTarget.path, document, repositorySource)
        return {
          destination: joinLinkDestination(
            localPath,
            suffix,
            wrapped,
          ),
        }
      }
      linkCounts.pinnedRepository += 1
      return {
        destination: joinLinkDestination(
          pinnedRepositoryUrl(
            product,
            document.sourceCommit,
            sameRepositoryTarget.path,
            sameRepositoryTarget.type === 'directory' ? 'tree' : 'blob',
          ),
          suffix,
          wrapped,
        ),
      }
    }

    if (/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(pathname)) return { destination: value }
    const target = resolveRepositoryPath(sourcePath, pathname, repositoryEntries)
    if (!target) {
      if (document.kind === 'meta-skill') return { destination: value }
      if (isImage) {
        const unresolved = posix.normalize(posix.join(posix.dirname(sourcePath), pathname))
        const key = `${sourcePath}\t${unresolved}`
        unavailableAssets.set(key, { document: sourcePath, sourcePath: unresolved })
        return { unavailable: true, sourcePath: unresolved }
      }
      fail(`${product.name} has unresolved relative link in ${sourcePath}: ${pathname}`)
    }

    const targetDocument = documentsBySourcePath.get(target.path)
    if (target.type === 'file' && targetDocument) {
      linkCounts.localDocuments += 1
      return {
        destination: joinLinkDestination(
          relativeOutputLink(document.outputPath, targetDocument.outputPath),
          suffix,
          wrapped,
        ),
      }
    }
    if (target.type === 'file' && (isImage || isAssetPath(target.path))) {
      return {
        destination: joinLinkDestination(
          requestAsset(target.path, document, repositorySource),
          suffix,
          wrapped,
        ),
      }
    }

    linkCounts.pinnedRepository += 1
    return {
      destination: joinLinkDestination(
        pinnedRepositoryUrl(
          product,
          document.sourceCommit,
          target.path,
          target.type === 'directory' ? 'tree' : 'blob',
        ),
        suffix,
        wrapped,
      ),
    }
  }

  for (const document of documentDefinitions) {
    const rewritten = rewriteMarkdownLinks(
      document.rawBytes.toString('utf8'),
      document.sourcePath,
      resolveDestination,
    )
    document.bytes = Buffer.from(rewritten, 'utf8')
    assertNoMutableGithubLinks(rewritten, `${product.name} ${document.sourcePath}`)
  }

  const externalRepositoryPins = configuredExternalLinks.map((link) => {
    const occurrences = externalLinkUsage.get(link.originalUrl) ?? 0
    if (!occurrences) {
      fail(`${product.name} did not find configured external link ${link.originalUrl}`)
    }
    return {
      sourcePath: link.sourcePath,
      originalUrl: link.originalUrl,
      repository: link.repository,
      defaultBranch: link.defaultBranch,
      commit: link.commit,
      targetPath: link.targetPath,
      pinnedUrl: link.pinnedUrl,
      repositoryApiUrl: link.repositoryApiUrl,
      commitApiUrl: link.commitApiUrl,
      contentUrl: link.contentUrl,
      contentSha256: link.contentSha256,
      occurrences,
    }
  })

  const assets = []
  for (const request of [...assetRequests.values()].sort((left, right) =>
    left.outputPath.localeCompare(right.outputPath),
  )) {
    let bytes
    const verifiedCommits = [...request.sources.keys()].sort()
    for (const verifiedCommit of verifiedCommits) {
      const repositorySource = request.sources.get(verifiedCommit)
      const candidate = await extractArchiveFile(
        repositorySource.archivePath,
        repositorySource.archiveRoot,
        request.sourcePath,
        maxBytes.asset,
      )
      if (!candidate.length) fail(`${product.name} asset ${request.sourcePath} is empty`)
      if (bytes && !bytes.equals(candidate)) {
        fail(`${product.name} asset ${request.sourcePath} differs across release commits`)
      }
      bytes = candidate
    }
    await writeOutputFile(stageDir, `products/${product.id}/${request.sourcePath}`, bytes)
    assets.push({
      sourcePath: request.sourcePath,
      outputPath: request.outputPath,
      sourceCommit: verifiedCommits[0],
      verifiedCommits,
      sha256: sha256(bytes),
    })
  }

  const closedOutputPaths = new Set([
    ...documentDefinitions.map((document) => document.outputPath),
    ...assets.map((asset) => asset.outputPath),
  ])
  const validateClosedDestination = (value, { sourcePath }) => {
    const document = documentsBySourcePath.get(sourcePath)
    const { pathname } = splitLinkDestination(value)
    if (!pathname || /^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(pathname)) {
      return { destination: value }
    }
    let decoded
    try {
      decoded = decodeURIComponent(pathname)
    } catch {
      fail(`Rewritten link in ${sourcePath} has invalid URL encoding`)
    }
    const target = posix.normalize(posix.join(posix.dirname(document.outputPath), decoded))
    if (!closedOutputPaths.has(target)) {
      fail(`${product.name} retained an open relative link in ${sourcePath}: ${pathname}`)
    }
    return { destination: value }
  }
  for (const document of documentDefinitions) {
    const checked = rewriteMarkdownLinks(
      document.bytes.toString('utf8'),
      document.sourcePath,
      validateClosedDestination,
    )
    if (checked !== document.bytes.toString('utf8')) {
      fail(`${product.name} link validation changed ${document.sourcePath}`)
    }
  }

  const licenseDefinitions = []
  if (!primaryDocumentSource.entries.includes('LICENSE')) {
    fail(`${product.name} release source has no root LICENSE file`)
  }
  licenseDefinitions.push({
    sourcePath: 'LICENSE',
    packagePath: 'LICENSE',
    fileSource: primaryDocumentSource,
    sourceCommit: commit,
  })
  for (const additional of product.additionalDocuments ?? []) {
    const release = releaseSources.find(
      (candidate) => candidate.manifest.name === additional.packageName,
    )
    const packageSpec = packageSpecs.find((candidate) => candidate.name === additional.packageName)
    const repositoryLicense = `${packageSpec.repositoryDirectory}/LICENSE`
    if (!release.entries.includes('LICENSE')) {
      fail(`${additional.packageName} has no packaged LICENSE`)
    }
    licenseDefinitions.push({
      sourcePath: repositoryLicense,
      packagePath: 'LICENSE',
      fileSource: release,
      sourceCommit: release.manifest.commit,
    })
  }

  let stagedBytes = 0
  const accountStagedBytes = (bytes, sourcePath) => {
    stagedBytes += bytes.length
    if (stagedBytes > maxProductOutputBytes) {
      fail(`${product.name} selected files exceed ${maxProductOutputBytes} bytes at ${sourcePath}`)
    }
  }

  const documents = []
  for (const document of documentDefinitions) {
    accountStagedBytes(document.bytes, document.sourcePath)
    await writeOutputFile(
      stageDir,
      `products/${product.id}/${document.sourcePath}`,
      document.bytes,
    )
    documents.push({
      sourcePath: document.sourcePath,
      outputPath: document.outputPath,
      kind: document.kind,
      frameworks: document.frameworks,
      sourceKind: document.sourceKind,
      sourcePackage: document.sourcePackage,
      sourceCommit: document.sourceCommit,
      verifiedCommits: document.verifiedCommits,
      sourceSha256: document.sourceSha256,
      sha256: sha256(document.bytes),
    })
  }
  for (const asset of assets) {
    const assetPath = localPath(stageDir, `products/${product.id}/${asset.sourcePath}`)
    accountStagedBytes(await readFile(assetPath), asset.sourcePath)
  }

  const licenses = []
  for (const license of licenseDefinitions.sort((left, right) =>
    left.sourcePath.localeCompare(right.sourcePath),
  )) {
    const bytes = normalizeText(
      await extractArchiveFile(
        license.fileSource.archivePath,
        license.fileSource.archiveRoot,
        license.packagePath,
        maxBytes.license,
      ),
      `${product.name} ${license.sourcePath}`,
    )
    const repositorySource = await getRepositorySource(license.sourceCommit)
    if (!repositorySource.entries.includes(license.sourcePath)) {
      fail(`${product.name} repository is missing ${license.sourcePath}`)
    }
    const repositoryBytes = normalizeText(
      await extractArchiveFile(
        repositorySource.archivePath,
        repositorySource.archiveRoot,
        license.sourcePath,
        maxBytes.license,
      ),
      `${product.name} repository ${license.sourcePath}`,
    )
    if (!bytes.equals(repositoryBytes)) {
      fail(`${product.name} packaged license differs from ${license.sourcePath}`)
    }
    accountStagedBytes(bytes, license.sourcePath)
    await writeOutputFile(stageDir, `products/${product.id}/${license.sourcePath}`, bytes)
    licenses.push({
      sourcePath: license.sourcePath,
      outputPath: license.sourcePath,
      sourceCommit: license.sourceCommit,
      sha256: sha256(bytes),
    })
  }

  return {
    id: product.id,
    name: product.name,
    frameworks: [...catalogProduct.frameworks],
    experimentalFrameworks: [...(product.experimentalFrameworks ?? [])],
    stability: product.stability ?? 'unspecified',
    repository: product.repository,
    sourcePackage: product.sourcePackage,
    documentSource: product.documentSource ?? 'github-release-archive',
    commit,
    archive: sourceRepository.manifest,
    repositoryArchives: [...repositorySources.values()]
      .map((source) => source.manifest)
      .sort((left, right) => left.commit.localeCompare(right.commit)),
    releasePackages: releaseSources.map((release) => release.manifest),
    documents,
    assets,
    licenses,
    linkValidation: {
      ...linkCounts,
      externalRepositoryPins,
      unavailableAssets: [...unavailableAssets.values()].sort((left, right) =>
        `${left.document}\t${left.sourcePath}`.localeCompare(
          `${right.document}\t${right.sourcePath}`,
        ),
      ),
    },
  }
}

async function validateCatalog() {
  const catalogBytes = await fetchBytes(catalogUrl, {
    hosts: ['tanstack.com'],
    label: 'TanStack public library catalog',
    limit: maxBytes.catalog,
  })
  let parsedCatalog
  try {
    parsedCatalog = JSON.parse(decodeUtf8(catalogBytes, 'TanStack public library catalog'))
  } catch (error) {
    if (error instanceof SyntaxError) fail('TanStack public library catalog is not valid JSON')
    throw error
  }
  const catalog = assertPlainObject(parsedCatalog, 'TanStack public library catalog')
  if (!Array.isArray(catalog.libraries)) fail('TanStack public library catalog has no libraries array')
  const ids = catalog.libraries.map((library) => library?.id)
  if (!arraysEqual(ids, expectedLibraryIds)) {
    fail(
      `TanStack public library catalog changed. Expected [${expectedLibraryIds.join(', ')}], received [${ids.join(', ')}]`,
    )
  }
  const byId = new Map()
  for (const library of catalog.libraries) {
    assertPlainObject(library, 'TanStack public library')
    if (
      typeof library.name !== 'string' ||
      !Array.isArray(library.frameworks) ||
      library.frameworks.some((framework) => typeof framework !== 'string') ||
      new Set(library.frameworks).size !== library.frameworks.length
    ) {
      fail(`TanStack public library ${library.id} has invalid metadata`)
    }
    byId.set(library.id, library)
  }
  for (const product of products) {
    const library = byId.get(product.id)
    if (!library || library.name !== product.name) {
      fail(`${product.name} does not match the public library catalog`)
    }
    if (library.repo?.toLowerCase() !== product.repository.toLowerCase()) {
      fail(`${product.name} catalog repository does not match ${product.repository}`)
    }
  }
  return { ids, byId, bodySha256: sha256(catalogBytes) }
}

async function exists(path) {
  try {
    await lstat(path)
    return true
  } catch (error) {
    if (error?.code === 'ENOENT') return false
    throw error
  }
}

async function replaceOutput(stageDir) {
  const backupDir = join(root, `.tanstack-doc-sources.backup-${process.pid}`)
  if (await exists(backupDir)) fail(`Refusing to overwrite stale backup ${backupDir}`)
  let backedUp = false
  if (await exists(outputDir)) {
    const outputStat = await lstat(outputDir)
    if (!outputStat.isDirectory() || outputStat.isSymbolicLink()) {
      fail(`${outputDir} is not a real directory`)
    }
    await rename(outputDir, backupDir)
    backedUp = true
  }
  try {
    await rename(stageDir, outputDir)
  } catch (error) {
    if (backedUp) await rename(backupDir, outputDir)
    throw error
  }
  if (backedUp) await rm(backupDir, { recursive: true, force: false })
}

async function main() {
  if (process.argv.length > 2) {
    if (process.argv.length === 3 && ['-h', '--help'].includes(process.argv[2])) {
      process.stdout.write('Usage: node scripts/fetch-doc-sources.mjs\n')
      return
    }
    fail('Usage: node scripts/fetch-doc-sources.mjs')
  }

  const { ids, byId, bodySha256 } = await validateCatalog()
  const externalGithubLinks = await resolveExternalGithubLinks()
  const stageDir = await mkdtemp(join(root, '.tanstack-doc-sources.tmp-'))
  const archiveDir = await mkdtemp(join(tmpdir(), 'tanstack-doc-source-archives-'))
  let installed = false
  try {
    const productManifests = []
    for (const product of products) {
      productManifests.push(
        await buildProduct(
          stageDir,
          archiveDir,
          product,
          byId.get(product.id),
          externalGithubLinks,
        ),
      )
    }
    const manifest = {
      schemaVersion: 1,
      generator: 'scripts/fetch-doc-sources.mjs',
      verification: {
        npmTarballs: 'sha512 integrity verified against npm registry metadata',
        provenancePayloads:
          'SLSA subject digest, package identity, repository, and Git commit validated',
        provenanceSignatures:
          'not cryptographically verified because this repository has no local Sigstore verifier',
      },
      catalog: { url: catalogUrl, sha256: bodySha256, ids },
      products: productManifests,
    }
    await writeFile(join(stageDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, {
      flag: 'wx',
      mode: 0o644,
    })
    await replaceOutput(stageDir)
    installed = true
    const documentCount = productManifests.reduce(
      (total, product) => total + product.documents.length,
      0,
    )
    process.stdout.write(
      `Fetched ${productManifests.length} products and ${documentCount} documents into .tanstack-doc-sources.\n`,
    )
  } finally {
    await rm(archiveDir, { recursive: true, force: true })
    if (!installed) await rm(stageDir, { recursive: true, force: true })
  }
}

main().catch((error) => {
  process.stderr.write(`ERROR: ${error?.message ?? error}\n`)
  process.exitCode = 1
})
