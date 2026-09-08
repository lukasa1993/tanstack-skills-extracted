const fs = require('fs')
const path = require('path')

const root = path.resolve(process.argv[2])
const mappingsFile = path.resolve(process.argv[3])

function fail(message) {
  throw new Error(`Finalization failed: ${message}`)
}

const packages = fs.readFileSync(mappingsFile, 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line, index) => {
    try {
      return JSON.parse(line)
    } catch (error) {
      fail(`invalid mapping JSON on line ${index + 1}: ${error.message}`)
    }
  })

const entries = packages.flatMap((record) => record.entries.map((entry) => ({
  ...entry,
  package: record.package,
  packageVersion: record.version,
  sourceRef: record.sourceRef || null,
  licenseFile: record.licenseFile,
})))
const byOutput = new Map()
const byPackage = new Map()
const globalAliases = new Map()

function addAlias(index, alias, outputName) {
  if (!alias) return
  if (!index.has(alias)) index.set(alias, new Set())
  index.get(alias).add(outputName)
}

for (const entry of entries) {
  if (byOutput.has(entry.outputName)) fail(`duplicate exported skill name: ${entry.outputName}`)
  byOutput.set(entry.outputName, entry)

  if (!byPackage.has(entry.package)) byPackage.set(entry.package, new Map())
  const packageAliases = byPackage.get(entry.package)
  for (const alias of new Set([entry.sourceName, entry.sourceRel])) {
    addAlias(packageAliases, alias, entry.outputName)
    addAlias(globalAliases, alias, entry.outputName)
  }
}

function unique(index, alias) {
  const values = index?.get(alias)
  return values?.size === 1 ? [...values][0] : null
}

function resolveIdentifier(value, owner) {
  if (byOutput.has(value)) return value

  const qualified = value.match(/^(@tanstack\/[^#]+)#(.+)$/)
  if (qualified) return unique(byPackage.get(qualified[1]), qualified[2])

  const slashQualified = value.match(/^tanstack-([a-z0-9._-]+)\/(.+)$/)
  if (slashQualified) {
    const packageName = `@tanstack/${slashQualified[1]}`
    const packageAliases = byPackage.get(packageName)
    const resolved = unique(packageAliases, slashQualified[2])
      || unique(packageAliases, `${slashQualified[1]}-${slashQualified[2]}`)
    if (resolved) return resolved
  }

  const current = unique(byPackage.get(owner.package), value)
  if (current) return current
  return unique(globalAliases, value)
}

function parseFrontmatter(text, file) {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!fm) fail(`missing YAML frontmatter: ${file}`)
  return { full: fm[0], body: fm[1], index: fm.index }
}

function parseTopLevelFields(body, file) {
  const fields = new Map()
  let current = null

  for (const line of body.split('\n')) {
    const key = line.match(/^([A-Za-z][A-Za-z0-9_-]*):(?:\s*(.*))?$/)
    if (key) {
      if (fields.has(key[1])) fail(`duplicate frontmatter field ${key[1]}: ${file}`)
      current = { key: key[1], first: key[2] || '', continuation: [] }
      fields.set(key[1], current)
      continue
    }
    if (current) {
      current.continuation.push(line)
    } else if (line.trim() && !/^\s*#/.test(line)) {
      fail(`cannot parse frontmatter line in ${file}: ${line}`)
    }
  }
  return fields
}

function yamlScalar(raw) {
  const value = raw.trim()
  if (!value) return ''
  if (value.startsWith('"') && value.endsWith('"')) {
    try { return JSON.parse(value) } catch {}
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'")
  }
  return value
}

function splitFlow(raw) {
  const out = []
  let start = 0
  let quote = null
  let escaped = false
  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i]
    if (escaped) {
      escaped = false
      continue
    }
    if (quote === '"' && char === '\\') {
      escaped = true
      continue
    }
    if (quote) {
      if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
    } else if (char === ',') {
      out.push(raw.slice(start, i))
      start = i + 1
    }
  }
  out.push(raw.slice(start))
  return out.map((item) => item.trim()).filter(Boolean)
}

function flowList(raw, file) {
  const value = raw.trim()
  if (!value.startsWith('[') || !value.endsWith(']')) {
    fail(`invalid flow sequence in ${file}: ${raw}`)
  }
  return splitFlow(value.slice(1, -1)).map(yamlScalar)
}

function fieldScalar(field) {
  if (/^[>|][-+]?\s*$/.test(field.first)) {
    const parts = field.continuation.map((line) => line.replace(/^\s+/, '').trim())
    return parts.filter(Boolean).join(field.first.startsWith('|') ? '\n' : ' ')
  }
  if (field.first.trim()) return yamlScalar(field.first)
  return field.continuation.map((line) => line.trim()).filter(Boolean).join(' ')
}

function fieldSequence(field, file) {
  if (field.first.trim()) {
    return field.first.trim().startsWith('[')
      ? flowList(field.first, file)
      : [yamlScalar(field.first)]
  }

  const meaningful = field.continuation.filter((line) => line.trim() && !/^\s*#/.test(line))
  if (meaningful.length === 1 && meaningful[0].trim().startsWith('[')) {
    return flowList(meaningful[0].trim(), file)
  }
  return meaningful.map((line) => {
    const item = line.match(/^\s*-\s*(.+)$/)
    if (!item) fail(`invalid YAML sequence item in ${file}: ${line}`)
    return yamlScalar(item[1])
  })
}

function flowMapping(raw, file) {
  const value = raw.trim()
  if (!value.startsWith('{') || !value.endsWith('}')) {
    fail(`invalid flow mapping in ${file}: ${raw}`)
  }
  const result = new Map()
  for (const item of splitFlow(value.slice(1, -1))) {
    const colon = item.indexOf(':')
    if (colon < 1) fail(`invalid flow mapping entry in ${file}: ${item}`)
    const key = item.slice(0, colon).trim()
    const rawValue = item.slice(colon + 1).trim()
    result.set(key, rawValue.startsWith('[') ? flowList(rawValue, file) : yamlScalar(rawValue))
  }
  return result
}

function metadataValues(field, file) {
  if (field.first.trim()) return flowMapping(field.first, file)

  const meaningful = field.continuation.filter((line) => line.trim() && !/^\s*#/.test(line))
  if (meaningful.length === 0) return new Map()
  if (meaningful[0].trim().startsWith('{')) {
    return flowMapping(meaningful.map((line) => line.trim()).join(' '), file)
  }
  const indent = Math.min(...meaningful.map((line) => line.match(/^\s*/)[0].length))
  const nested = parseTopLevelFields(field.continuation.map((line) => line.slice(Math.min(indent, line.length))).join('\n'), file)
  const result = new Map()
  for (const [key, nestedField] of nested) {
    result.set(key, key === 'requires' || key === 'sources'
      ? fieldSequence(nestedField, file)
      : fieldScalar(nestedField))
  }
  return result
}

function safeMetadataKey(key) {
  const normalized = key.toLowerCase().replace(/_/g, '-').replace(/[^a-z0-9-]+/g, '-')
  return normalized.startsWith('tanstack-') ? normalized : `tanstack-${normalized}`
}

function sanitizeDescription(value) {
  let description = String(value).replace(/\s+/g, ' ').trim()
  description = description
    .replace(/\s*(?:=>|→)\s*/g, ' returns ')
    .replace(/</g, 'less than')
    .replace(/>/g, 'greater than')
  if (Buffer.byteLength(description, 'utf8') <= 1024) return description

  const triggerAt = description.lastIndexOf('Use whenever')
  const tail = triggerAt >= 0 ? description.slice(triggerAt) : ''
  const separator = tail ? ' ... ' : '...'
  const budget = 1024 - Buffer.byteLength(tail, 'utf8') - Buffer.byteLength(separator, 'utf8')
  if (budget < 80) fail('description trigger text leaves no room for a useful summary')

  const points = Array.from(description)
  let low = 0
  let high = points.length
  while (low < high) {
    const middle = Math.ceil((low + high) / 2)
    if (Buffer.byteLength(points.slice(0, middle).join(''), 'utf8') <= budget) low = middle
    else high = middle - 1
  }
  let head = points.slice(0, low).join('')
  if (low < points.length && !/\s/.test(points[low])) head = head.replace(/\s+\S*$/, '')
  head = head.replace(/[\s,;:-]+$/, '')
  return `${head}${separator}${tail}`
}

function normalizeFrontmatter(file, owner) {
  let text = fs.readFileSync(file, 'utf8')
  const fm = parseFrontmatter(text, file)
  const fields = parseTopLevelFields(fm.body, file)
  const descriptionField = fields.get('description')
  const licenseField = fields.get('license')
  if (!descriptionField) fail(`missing description field: ${file}`)
  if (!licenseField) fail(`missing license field: ${file}`)

  const metadata = new Map()
  const requirements = []
  const sources = []

  const originalMetadata = fields.get('metadata')
    ? metadataValues(fields.get('metadata'), file)
    : new Map()
  for (const [key, value] of originalMetadata) {
    if (key === 'requires') requirements.push(...value)
    else if (key === 'sources') sources.push(...value)
    else metadata.set(safeMetadataKey(key), String(value))
  }

  if (fields.has('requires')) requirements.push(...fieldSequence(fields.get('requires'), file))
  if (fields.has('sources')) sources.push(...fieldSequence(fields.get('sources'), file))

  const standard = new Set(['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools', 'requires', 'sources'])
  for (const [key, field] of fields) {
    if (standard.has(key)) continue
    metadata.set(safeMetadataKey(key), String(fieldScalar(field)))
  }

  const resolvedRequirements = [...new Set(requirements.map((value) => resolveIdentifier(value, owner) || value))]
  if (requirements.length) metadata.set('tanstack-requires', JSON.stringify(resolvedRequirements))
  if (sources.length) metadata.set('tanstack-sources', JSON.stringify([...new Set(sources)]))
  metadata.set('tanstack-package', owner.package)
  metadata.set('tanstack-package-version', owner.packageVersion)
  if (owner.sourceRef) metadata.set('tanstack-source-ref', owner.sourceRef)
  metadata.set('tanstack-source-skill', owner.sourceName)

  const description = sanitizeDescription(fieldScalar(descriptionField))
  if (!description || Buffer.byteLength(description, 'utf8') > 1024 || /[<>]/.test(description)) {
    fail(`invalid normalized description for ${file}`)
  }

  const next = [
    `name: ${owner.outputName}`,
    `description: ${JSON.stringify(description)}`,
    `license: ${JSON.stringify(String(fieldScalar(licenseField)))}`,
  ]
  if (fields.has('compatibility')) next.push(`compatibility: ${JSON.stringify(String(fieldScalar(fields.get('compatibility'))))}`)
  if (metadata.size) {
    next.push('metadata:')
    for (const [key, value] of [...metadata].sort(([a], [b]) => a.localeCompare(b))) {
      next.push(`  ${key}: ${JSON.stringify(String(value))}`)
    }
  }
  if (fields.has('allowed-tools')) next.push(`allowed-tools: ${JSON.stringify(String(fieldScalar(fields.get('allowed-tools'))))}`)

  const nextBody = next.join('\n')
  text = text.slice(0, fm.index) + `---\n${nextBody}\n---\n` + text.slice(fm.index + fm.full.length)
  fs.writeFileSync(file, text)
}

function posixRel(from, to) {
  return path.relative(from, to).split(path.sep).join('/')
}

function isTextFile(file) {
  return /\.(?:md|mdx|txt|json|yaml|yml|js|jsx|ts|tsx|mjs|cjs|sh|py|toml)$/i.test(file)
}

function walk(dir) {
  const out = []
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name)
    if (item.isSymbolicLink()) fail(`symlink found in staged output: ${full}`)
    if (item.isDirectory()) out.push(...walk(full))
    else if (item.isFile()) out.push(full)
  }
  return out
}

function normalizedAlias(value) {
  let alias = value.replace(/\\/g, '/')
  alias = path.posix.normalize(alias)
  alias = alias.replace(/^(?:\.\/)+/, '').replace(/^skills\//, '')
  return alias === '.' ? '' : alias
}

function resolveSkillPath(rawRef, owner) {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(rawRef)) return null
  if (rawRef.includes('node_modules/') || rawRef.startsWith('@tanstack/')) return null

  let decoded = rawRef
  try { decoded = decodeURIComponent(rawRef) } catch {}
  if (!decoded.endsWith('/SKILL.md')) return null

  const withoutFile = decoded.slice(0, -'/SKILL.md'.length)
  if (withoutFile.split('/').some((part) => part.startsWith('tanstack-'))) return null

  const currentAliases = byPackage.get(owner.package)
  const relativeToSource = normalizedAlias(path.posix.join(owner.sourceRel, withoutFile))
  const fromPackageRoot = normalizedAlias(withoutFile)

  const relativeTarget = unique(currentAliases, relativeToSource)
  if (relativeTarget) return relativeTarget

  const packageTarget = unique(currentAliases, fromPackageRoot)
  if (packageTarget) return packageTarget

  return unique(globalAliases, fromPackageRoot)
}

for (const entry of entries) {
  normalizeFrontmatter(path.join(root, entry.outputName, 'SKILL.md'), entry)
}

// Markdown emphasis delimiters are valid boundaries too. Keep the path itself
// strict, then resolve it against known export mappings before changing text.
const skillPath = /(^|[*_~]{1,3}|[\s`"'([{<>:|!])((?:(?:\.{1,2}|[A-Za-z0-9@][A-Za-z0-9_@.-]*)\/)+SKILL\.md)(?=$|[\s`"',.;:)\]}<>#?|!*_~])/gm
let rewrittenPaths = 0

for (const file of walk(root).filter(isTextFile)) {
  const rel = path.relative(root, file)
  const outputName = rel.split(path.sep)[0]
  const owner = byOutput.get(outputName)
  if (!owner) continue

  let text = fs.readFileSync(file, 'utf8')
  const next = text.replace(skillPath, (whole, prefix, rawRef) => {
    const targetName = resolveSkillPath(rawRef, owner)
    if (!targetName) return whole

    let target = posixRel(path.dirname(file), path.join(root, targetName, 'SKILL.md'))
    if (!target.startsWith('.')) target = `./${target}`
    rewrittenPaths += 1
    return `${prefix}${target}`
  })
  if (next !== text) fs.writeFileSync(file, next)
}

process.stdout.write(JSON.stringify({ packages: packages.length, skills: entries.length, rewrittenPaths }))
