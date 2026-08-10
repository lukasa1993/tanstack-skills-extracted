#!/usr/bin/env bash
set -euo pipefail

EXPORTER_VERSION="5.1.0"
REGISTRY="${REGISTRY:-https://registry.npmjs.org}"
TAG="${TAG:-latest}"
MARKER=".tanstack-skills-export.tsv"

SELF_TEST=0
if [[ "${1:-}" == "--self-test" ]]; then
  SELF_TEST=1
  shift
fi
OUT="${1:-./tanstack-skills}"

for cmd in npm node tar find grep wc tr mktemp mkdir mv rm dirname; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "ERROR: required command not found: $cmd" >&2
    exit 1
  }
done

SCRIPT_DIR="$(
  cd -P "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1
  pwd -P
)"

# Resolve through existing parent symlinks, then reject targets whose removal
# could erase a filesystem root, a working tree, or another broad directory.
# FORCE only bypasses the exporter-marker check; it never bypasses these guards.
if ! OUT="$(node - "$OUT" "$SCRIPT_DIR" <<'NODE'
const fs = require('fs')
const os = require('os')
const path = require('path')

const raw = process.argv[2]
const scriptDir = fs.realpathSync(process.argv[3])
const cwd = fs.realpathSync(process.cwd())

function fail(reason) {
  process.stderr.write(`ERROR: unsafe output path ${JSON.stringify(raw)}: ${reason}\n`)
  process.exit(2)
}

if (!raw || /[\u0000-\u001f\u007f]/.test(raw)) {
  fail('the path is empty or contains control characters')
}

const lexical = path.resolve(raw)
if (fs.existsSync(lexical) && fs.lstatSync(lexical).isSymbolicLink()) {
  fail('the target is a symbolic link')
}

// realpathSync requires the full path to exist. Resolve the closest existing
// parent and append any missing components so parent symlinks cannot bypass the
// checks below.
let existing = lexical
const missing = []
while (!fs.existsSync(existing)) {
  const parent = path.dirname(existing)
  if (parent === existing) fail('no existing parent directory could be resolved')
  missing.unshift(path.basename(existing))
  existing = parent
}
const output = path.resolve(fs.realpathSync(existing), ...missing)
const root = path.parse(output).root

function isSameOrAncestor(candidate, child) {
  const rel = path.relative(candidate, child)
  return rel === '' || (!rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel))
}

if (output === root) fail('refusing to target the filesystem root')

const belowRoot = path.relative(root, output).split(path.sep).filter(Boolean)
if (belowRoot.length < 2) fail('refusing to target a top-level system directory')
if (belowRoot.includes('.git')) fail('refusing to target a path inside .git')

if (isSameOrAncestor(output, cwd)) {
  fail(output === cwd ? 'refusing to target the current working directory' : 'refusing to target an ancestor of the current working directory')
}
if (isSameOrAncestor(output, scriptDir)) {
  fail(output === scriptDir ? 'refusing to target the exporter directory' : 'refusing to target an ancestor of the exporter directory')
}

const home = os.homedir()
if (home && fs.existsSync(home) && output === fs.realpathSync(home)) {
  fail('refusing to target the user home directory')
}
if (fs.existsSync(path.join(output, '.git'))) {
  fail('refusing to replace a Git working tree')
}

process.stdout.write(output)
NODE
)"; then
  exit 1
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
PACKS="$TMP/packs"
STAGE="$TMP/stage"
mkdir -p "$PACKS" "$STAGE"

TRANSFORM_JS="$TMP/transform.js"
FINALIZE_JS="$TMP/finalize.js"
VALIDATE_JS="$TMP/validate.js"

cat > "$TRANSFORM_JS" <<'NODE'
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const skillsDir = path.resolve(process.argv[2])
const outRoot = path.resolve(process.argv[3])
const pkg = process.argv[4]
const version = process.argv[5]
const packageLicense = process.argv[6]
const packageLicenseFile = process.argv[7] ? path.resolve(process.argv[7]) : null

if (!packageLicense || /[\u0000-\u001f\u007f]/.test(packageLicense)) {
  throw new Error(`Invalid package license metadata for ${pkg}@${version}`)
}
if (packageLicenseFile && (!fs.existsSync(packageLicenseFile) || !fs.statSync(packageLicenseFile).isFile())) {
  throw new Error(`Upstream license file is not readable for ${pkg}@${version}: ${packageLicenseFile}`)
}

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isSymbolicLink()) throw new Error(`Refusing symlink in skills tree: ${full}`)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (entry.isFile()) out.push(full)
  }
  return out
}

function posixRel(from, to) {
  return path.relative(from, to).split(path.sep).join('/')
}

function isInside(parent, child) {
  const rel = path.relative(parent, child)
  return rel === '' || (!rel.startsWith('..' + path.sep) && rel !== '..' && !path.isAbsolute(rel))
}

function cleanSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function hash8(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 8)
}

function boundedName(base, identity) {
  base = cleanSlug(base) || 'tanstack-skill'
  if (base.length <= 64) return base
  return `${base.slice(0, 55).replace(/-+$/g, '')}-${hash8(identity)}`
}

function baseOutputName(pkgName, skillRel) {
  const pkgShort = cleanSlug(pkgName.replace(/^@tanstack\//, ''))
  const relSlug = cleanSlug(skillRel.split(path.sep).join('-'))

  let base
  if (relSlug === `tanstack-${pkgShort}` || relSlug.startsWith(`tanstack-${pkgShort}-`)) {
    base = relSlug
  } else if (relSlug === pkgShort) {
    base = `tanstack-${pkgShort}`
  } else if (relSlug.startsWith(`${pkgShort}-`)) {
    base = `tanstack-${relSlug}`
  } else if (pkgShort.endsWith(`-${relSlug}`)) {
    base = `tanstack-${pkgShort}`
  } else {
    base = `tanstack-${pkgShort}-${relSlug}`
  }
  return boundedName(base, `${pkgName}\0${skillRel}`)
}

function parseFrontmatter(text, file) {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!fm) throw new Error(`Missing YAML frontmatter: ${file}`)
  const nameMatch = fm[1].match(/^name:\s*["']?([^"'\r\n#]+?)["']?\s*$/m)
  if (!nameMatch) throw new Error(`Missing skill name: ${file}`)
  if (!/^description:\s*\S.*$/m.test(fm[1]) && !/^description:\s*[>|][-+]?\s*$/m.test(fm[1])) {
    throw new Error(`Missing skill description: ${file}`)
  }
  return { full: fm[0], body: fm[1], oldName: nameMatch[1].trim(), index: fm.index }
}

function rewriteSkillFrontmatter(file, newName) {
  let text = fs.readFileSync(file, 'utf8')
  const fm = parseFrontmatter(text, file)
  let nextBody = fm.body.replace(/^name:\s*.*$/m, `name: ${newName}`)
  if (!/^license:\s*\S.*$/m.test(nextBody)) {
    // A JSON string is also a valid YAML double-quoted scalar. This keeps SPDX
    // expressions and other upstream npm license identifiers byte-for-byte.
    nextBody += `\nlicense: ${JSON.stringify(packageLicense)}`
  }
  text = text.slice(0, fm.index) + `---\n${nextBody}\n---\n` + text.slice(fm.index + fm.full.length)
  fs.writeFileSync(file, text)
  return fm.oldName
}

const allFiles = walk(skillsDir)
const skillFiles = allFiles.filter((f) => path.basename(f) === 'SKILL.md')
if (skillFiles.length === 0) {
  process.stdout.write(JSON.stringify({ skillFiles: 0, outputSkills: 0, outputRoots: [] }))
  process.exit(0)
}

const entries = skillFiles
  .map((skillFile) => ({
    skillFile: path.resolve(skillFile),
    skillDir: path.dirname(path.resolve(skillFile)),
    rel: posixRel(skillsDir, path.dirname(path.resolve(skillFile))),
  }))
  .sort((a, b) => a.rel.localeCompare(b.rel))

const skillDirSet = new Set(entries.map((e) => e.skillDir))
const reservedNames = new Set()

for (const entry of entries) {
  let outputName = baseOutputName(pkg, entry.rel)
  let identity = `${pkg}\0${entry.rel}`
  let attempt = 0
  while (reservedNames.has(outputName) || fs.existsSync(path.join(outRoot, outputName))) {
    attempt += 1
    const suffix = hash8(`${identity}\0${attempt}`)
    const prefix = cleanSlug(outputName).slice(0, 55).replace(/-+$/g, '')
    outputName = `${prefix}-${suffix}`
  }
  reservedNames.add(outputName)
  entry.outputName = outputName
  entry.outDir = path.join(outRoot, outputName)
}

// Each original file is owned by its nearest skill directory. A parent skill
// does not copy a descendant skill tree; that descendant becomes its own flat
// standard skill instead.
function owningEntry(file) {
  let best = null
  for (const entry of entries) {
    if (!isInside(entry.skillDir, file)) continue
    if (!best || entry.skillDir.length > best.skillDir.length) best = entry
  }
  return best
}

const fileMap = new Map() // original absolute file -> exported absolute file
const reverseMap = new Map() // exported absolute file -> original absolute file
const entryByDest = new Map()

for (const file of allFiles) {
  const owner = owningEntry(path.resolve(file))
  if (!owner) continue
  const rel = path.relative(owner.skillDir, file)
  const dest = path.join(owner.outDir, rel)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(file, dest)
  fileMap.set(path.resolve(file), path.resolve(dest))
  reverseMap.set(path.resolve(dest), path.resolve(file))
  entryByDest.set(path.resolve(dest), owner)
}

for (const entry of entries) {
  const destSkill = path.join(entry.outDir, 'SKILL.md')
  entry.oldName = rewriteSkillFrontmatter(destSkill, entry.outputName)
  if (packageLicenseFile) {
    const licenseDest = path.join(entry.outDir, path.basename(packageLicenseFile))
    if (fs.existsSync(licenseDest)) {
      const existing = fs.readFileSync(licenseDest)
      const upstream = fs.readFileSync(packageLicenseFile)
      if (!existing.equals(upstream)) {
        throw new Error(`Conflicting license file in exported skill: ${licenseDest}`)
      }
    } else {
      fs.copyFileSync(packageLicenseFile, licenseDest)
    }
  }
}

// Write a small mapping reference into every exported skill. TanStack Intent
// can use hierarchical identifiers such as ai-core/adapter-configuration; the
// base Agent Skills format cannot. This keeps the original identifiers visible
// after finalization normalizes dependency metadata to exported skill names.
const mappingLines = [
  '# TanStack Intent skill ID map',
  '',
  `Published package: ${pkg}@${version}`,
  '',
  '| Original Intent ID | Exported Agent Skill |',
  '| --- | --- |',
  ...entries.map((e) => `| \`${e.oldName}\` | \`${e.outputName}\` |`),
  '',
]

for (const entry of entries) {
  const mapFile = path.join(entry.outDir, 'references', 'INTENT-SKILL-MAP.md')
  fs.mkdirSync(path.dirname(mapFile), { recursive: true })
  fs.writeFileSync(mapFile, mappingLines.join('\n'))
}

function isTextFile(file) {
  return /\.(?:md|mdx|txt|json|yaml|yml|js|jsx|ts|tsx|mjs|cjs|sh|py|toml)$/i.test(file)
}

function copySharedFor(entry, originalTarget) {
  const rel = posixRel(skillsDir, originalTarget)
  const dest = path.join(entry.outDir, 'references', '_intent-shared', ...rel.split('/'))
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(originalTarget, dest)
  }
  return path.resolve(dest)
}

// Rewrite relative Markdown links. Links to another Intent skill now point to
// its flattened sibling folder. Existing shared files under package/skills are
// copied into the current skill so references remain usable.
const queue = [...reverseMap.entries()].map(([dest, src]) => ({ dest, src, entry: entryByDest.get(dest) }))
const seenText = new Set()
const mdLink = /(!?\[[^\]]*\]\()(<)?([^\s)>]+)(>)?(\))/g

while (queue.length) {
  const item = queue.shift()
  if (!item || !item.entry || !isTextFile(item.dest) || seenText.has(item.dest)) continue
  seenText.add(item.dest)

  let text = fs.readFileSync(item.dest, 'utf8')
  let changed = false

  text = text.replace(mdLink, (whole, open, lt, rawRef, gt, close) => {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(rawRef)) return whole

    let ref = rawRef
    let suffix = ''
    const cutCandidates = [ref.indexOf('#'), ref.indexOf('?')].filter((n) => n >= 0)
    if (cutCandidates.length) {
      const cut = Math.min(...cutCandidates)
      suffix = ref.slice(cut)
      ref = ref.slice(0, cut)
    }
    if (!ref) return whole

    let decoded = ref
    try { decoded = decodeURIComponent(ref) } catch {}
    const originalTarget = path.resolve(path.dirname(item.src), decoded)

    let mappedTarget = fileMap.get(originalTarget)
    if (!mappedTarget && isInside(skillsDir, originalTarget) && fs.existsSync(originalTarget) && fs.statSync(originalTarget).isFile()) {
      mappedTarget = copySharedFor(item.entry, originalTarget)
      if (isTextFile(mappedTarget)) queue.push({ dest: mappedTarget, src: originalTarget, entry: item.entry })
    }
    if (!mappedTarget) return whole

    let next = posixRel(path.dirname(item.dest), mappedTarget)
    if (!next.startsWith('.')) next = `./${next}`
    changed = true
    return `${open}${lt || ''}${next}${suffix}${gt || ''}${close}`
  })

  if (changed) fs.writeFileSync(item.dest, text)
}

process.stdout.write(JSON.stringify({
  package: pkg,
  version,
  license: packageLicense,
  licenseFile: packageLicenseFile ? path.basename(packageLicenseFile) : null,
  skillFiles: entries.length,
  outputSkills: entries.length,
  outputRoots: entries.map((e) => e.outputName),
  sourceNames: entries.map((e) => e.oldName),
  entries: entries.map((e) => ({
    sourceName: e.oldName,
    sourceRel: e.rel,
    outputName: e.outputName,
  })),
}))
NODE

cat > "$FINALIZE_JS" <<'NODE'
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
NODE

cat > "$VALIDATE_JS" <<'NODE'
const fs = require('fs')
const path = require('path')

const root = path.resolve(process.argv[2])
const marker = process.argv[3]
const mappingsFile = path.resolve(process.argv[4])
const allowedFrontmatter = new Set(['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools'])

function fail(message) {
  throw new Error(`Validation failed: ${message}`)
}

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isSymbolicLink()) fail(`symlink not allowed in output: ${full}`)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (entry.isFile()) out.push(full)
  }
  return out
}

function parseFields(body, file) {
  const fields = new Map()
  let current = null
  for (const line of body.split('\n')) {
    const key = line.match(/^([A-Za-z][A-Za-z0-9_-]*):(?:\s*(.*))?$/)
    if (key) {
      if (fields.has(key[1])) fail(`duplicate frontmatter field ${key[1]}: ${file}`)
      current = { first: key[2] || '', continuation: [] }
      fields.set(key[1], current)
    } else if (current) {
      current.continuation.push(line)
    } else if (line.trim()) {
      fail(`cannot parse frontmatter line in ${file}: ${line}`)
    }
  }
  return fields
}

function jsonString(raw, field, file) {
  let value
  try { value = JSON.parse(raw) } catch (error) {
    fail(`${field} must be a quoted string in ${file}: ${error.message}`)
  }
  if (typeof value !== 'string' || !value) fail(`${field} must be a non-empty string in ${file}`)
  return value
}

function parseSkill(file) {
  const text = fs.readFileSync(file, 'utf8')
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!fm) fail(`missing YAML frontmatter: ${file}`)
  const fields = parseFields(fm[1], file)
  for (const key of fields.keys()) {
    if (!allowedFrontmatter.has(key)) fail(`non-standard frontmatter field ${key}: ${file}`)
  }

  const name = fields.get('name')?.first.trim()
  if (!name) fail(`missing skill name: ${file}`)
  const description = jsonString(fields.get('description')?.first || '', 'description', file)
  if (Buffer.byteLength(description, 'utf8') > 1024) fail(`description exceeds 1024 UTF-8 bytes in ${file}`)
  if (/[<>]/.test(description)) fail(`description contains a forbidden angle bracket in ${file}`)
  const license = jsonString(fields.get('license')?.first || '', 'license', file)

  const metadata = new Map()
  const metadataField = fields.get('metadata')
  if (metadataField) {
    if (metadataField.first.trim()) fail(`metadata must be a block mapping in ${file}`)
    for (const line of metadataField.continuation) {
      if (!line.trim()) continue
      const item = line.match(/^\s+([a-z0-9]+(?:-[a-z0-9]+)*):\s*(.+)$/)
      if (!item) fail(`invalid metadata entry in ${file}: ${line}`)
      if (!item[1].startsWith('tanstack-')) fail(`metadata key is not TanStack-namespaced in ${file}: ${item[1]}`)
      if (metadata.has(item[1])) fail(`duplicate metadata key in ${file}: ${item[1]}`)
      metadata.set(item[1], jsonString(item[2], `metadata.${item[1]}`, file))
    }
  }

  return { text, name, description, license, metadata }
}

const mappingRecords = fs.readFileSync(mappingsFile, 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line, index) => {
    try { return JSON.parse(line) } catch (error) {
      fail(`invalid mapping JSON on line ${index + 1}: ${error.message}`)
    }
  })
const mappingEntries = mappingRecords.flatMap((record) => record.entries.map((entry) => ({
  ...entry,
  package: record.package,
  packageVersion: record.version,
  licenseFile: record.licenseFile,
})))
const mappingByOutput = new Map(mappingEntries.map((entry) => [entry.outputName, entry]))
if (mappingByOutput.size !== mappingEntries.length) fail('mapping data contains duplicate output names')

const direct = fs.readdirSync(root, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort()

if (direct.length === 0) fail('no exported skill directories')

const seenNames = new Set()
const parsedSkills = new Map()
let skillCount = 0

for (const dirName of direct) {
  const skillRoot = path.join(root, dirName)
  const skillFile = path.join(skillRoot, 'SKILL.md')
  if (!fs.existsSync(skillFile)) fail(`direct child has no SKILL.md: ${skillRoot}`)

  const nestedSkillFiles = walk(skillRoot).filter((f) => path.basename(f) === 'SKILL.md')
  if (nestedSkillFiles.length !== 1 || path.resolve(nestedSkillFiles[0]) !== path.resolve(skillFile)) {
    fail(`nested SKILL.md remains inside flat skill: ${skillRoot}`)
  }

  const parsed = parseSkill(skillFile)
  const { name } = parsed
  if (name !== dirName) fail(`skill name mismatch: ${skillFile}: name=${name}, directory=${dirName}`)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) fail(`invalid standard skill name: ${name}`)
  if (name.length > 64) fail(`skill name is longer than 64 characters: ${name}`)
  if (seenNames.has(name)) fail(`duplicate skill name: ${name}`)
  if (!mappingByOutput.has(name)) fail(`skill is absent from export mappings: ${name}`)
  seenNames.add(name)
  parsedSkills.set(name, parsed)
  skillCount += 1
}

if (mappingEntries.length !== skillCount) {
  fail(`mapping count mismatch: ${mappingEntries.length} mappings for ${skillCount} skills`)
}

const byPackage = new Map()
const globalAliases = new Map()
function addAlias(index, alias, target) {
  if (!index.has(alias)) index.set(alias, new Set())
  index.get(alias).add(target)
}
for (const entry of mappingEntries) {
  if (!byPackage.has(entry.package)) byPackage.set(entry.package, new Map())
  for (const alias of new Set([entry.sourceName, entry.sourceRel])) {
    addAlias(byPackage.get(entry.package), alias, entry.outputName)
    addAlias(globalAliases, alias, entry.outputName)
  }
  if (entry.licenseFile) {
    if (path.basename(entry.licenseFile) !== entry.licenseFile) fail(`unsafe mapped license filename: ${entry.licenseFile}`)
    const licenseFile = path.join(root, entry.outputName, entry.licenseFile)
    if (!fs.existsSync(licenseFile) || !fs.statSync(licenseFile).isFile()) {
      fail(`missing copied upstream license for ${entry.outputName}: ${entry.licenseFile}`)
    }
  }
}
function unique(index, alias) {
  const values = index?.get(alias)
  return values?.size === 1 ? [...values][0] : null
}
function expectedRequirement(value, owner) {
  if (seenNames.has(value)) return value
  const qualified = value.match(/^(@tanstack\/[^#]+)#(.+)$/)
  if (qualified) return unique(byPackage.get(qualified[1]), qualified[2])
  return unique(byPackage.get(owner.package), value) || unique(globalAliases, value)
}

for (const [name, parsed] of parsedSkills) {
  const owner = mappingByOutput.get(name)
  if (parsed.metadata.get('tanstack-package') !== owner.package) fail(`package metadata mismatch in ${name}`)
  if (parsed.metadata.get('tanstack-package-version') !== owner.packageVersion) fail(`package version metadata mismatch in ${name}`)
  if (parsed.metadata.get('tanstack-source-skill') !== owner.sourceName) fail(`source skill metadata mismatch in ${name}`)

  const rawRequirements = parsed.metadata.get('tanstack-requires')
  if (!rawRequirements) continue
  let requirements
  try { requirements = JSON.parse(rawRequirements) } catch (error) {
    fail(`tanstack-requires is not JSON in ${name}: ${error.message}`)
  }
  if (!Array.isArray(requirements) || requirements.some((value) => typeof value !== 'string')) {
    fail(`tanstack-requires must encode a string array in ${name}`)
  }
  for (const value of requirements) {
    const expected = expectedRequirement(value, owner)
    if (expected && value !== expected) fail(`unrewritten dependency in ${name}: ${value} should be ${expected}`)
    if (value.startsWith('tanstack-') && !seenNames.has(value)) fail(`dependency target does not exist in ${name}: ${value}`)
  }
}

function isInside(parent, child) {
  const rel = path.relative(parent, child)
  return rel === '' || (!rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel))
}

function normalizedAlias(value) {
  let alias = value.replace(/\\/g, '/')
  alias = path.posix.normalize(alias)
  alias = alias.replace(/^(?:\.\/)+/, '').replace(/^skills\//, '')
  return alias === '.' ? '' : alias
}

function expectedSkillPathTarget(rawRef, owner) {
  if (!owner || /^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(rawRef)) return null
  if (rawRef.includes('node_modules/') || rawRef.startsWith('@tanstack/')) return null

  let decoded = rawRef
  try { decoded = decodeURIComponent(rawRef) } catch {}
  if (!decoded.endsWith('/SKILL.md')) return null

  const withoutFile = decoded.slice(0, -'/SKILL.md'.length)
  if (withoutFile.split('/').some((part) => part.startsWith('tanstack-'))) return null

  const currentAliases = byPackage.get(owner.package)
  const relativeToSource = normalizedAlias(path.posix.join(owner.sourceRel, withoutFile))
  const fromPackageRoot = normalizedAlias(withoutFile)
  return unique(currentAliases, relativeToSource)
    || unique(currentAliases, fromPackageRoot)
    || unique(globalAliases, fromPackageRoot)
}

const skillPath = /(^|[*_~]{1,3}|[\s`"'([{<>:|!])((?:(?:\.{1,2}|[A-Za-z0-9@][A-Za-z0-9_@.-]*)\/)+SKILL\.md)(?=$|[\s`"',.;:)\]}<>#?|!*_~])/gm
for (const file of walk(root).filter((value) => /\.(?:md|mdx|txt|json|yaml|yml)$/i.test(value))) {
  const text = fs.readFileSync(file, 'utf8')
  const outputName = path.relative(root, file).split(path.sep)[0]
  const owner = mappingByOutput.get(outputName)
  for (const match of text.matchAll(skillPath)) {
    const rawRef = match[2]
    const expected = expectedSkillPathTarget(rawRef, owner)
    if (expected) {
      fail(`unrewritten known SKILL.md reference: ${file} -> ${rawRef}; expected ${expected}`)
    }
    if (!rawRef.split('/').some((part) => part.startsWith('tanstack-'))) continue
    const target = path.resolve(path.dirname(file), rawRef)
    if (!isInside(root, target)) fail(`exported SKILL.md reference escapes output: ${file} -> ${rawRef}`)
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
      fail(`broken exported SKILL.md reference: ${file} -> ${rawRef}`)
    }
  }
}

process.stdout.write(JSON.stringify({ skillCount, directChildren: direct.length }))
NODE

run_self_test() {
  echo "TanStack published-skills exporter v$EXPORTER_VERSION self-test"
  local fixtures="$TMP/fixtures"
  local test_mappings="$TMP/self-test-mappings.jsonl"
  local upstream_license="$fixtures/UPSTREAM-LICENSE"
  mkdir -p "$fixtures/ai/skills/ai-core/adapter-configuration/references"
  mkdir -p "$fixtures/ai/skills/ai-core/tools"
  mkdir -p "$fixtures/angular/skills/table-state"
  mkdir -p "$fixtures/ember/skills/table-state"

  printf '%s\n' 'MIT License' 'Fixture license text.' > "$upstream_license"

  node - "$fixtures/ai/skills/ai-core/SKILL.md" <<'NODE'
const fs = require('fs')
const file = process.argv[2]
const trigger = 'Use whenever an AI adapter must be configured.'
const description = `Core AI routing skill. ${'Preserve detailed routing context for adapters and providers. '.repeat(24)}${trigger}`
fs.writeFileSync(file, `---
name: ai-core
description: ${JSON.stringify(description)}
metadata:
  type: core
  requires: [ai-core/adapter-configuration]
sources:
  - 'TanStack/ai:fixture/core.md'
---
# AI Core
Use [adapter configuration](./adapter-configuration/SKILL.md).
Read \`ai-core/adapter-configuration/SKILL.md\`.
Use [shared tool notes](./tools/notes.md).
`)
NODE

  cat > "$fixtures/ai/skills/ai-core/adapter-configuration/SKILL.md" <<'EOF'
---
name: ai-core/adapter-configuration
description: Configure AI adapters.
license: Apache-2.0
metadata:
  requires: ai-core
---
# Adapter Configuration
Return to [AI core](../SKILL.md).
Read `ai-core/SKILL.md`.
Read **ai-core/SKILL.md** in bold.
Read __ai-core/SKILL.md__ with underscore emphasis.
Read ~~ai-core/SKILL.md~~ with strike emphasis.
See [reference](./references/detail.md).
EOF

  printf '%s\n' '# Detail' > "$fixtures/ai/skills/ai-core/adapter-configuration/references/detail.md"
  printf '%s\n' '# Tool notes' > "$fixtures/ai/skills/ai-core/tools/notes.md"

  cat > "$fixtures/angular/skills/table-state/SKILL.md" <<'EOF'
---
name: table-state
description: Angular table state.
requires:
  - '@tanstack/ai#ai-core'
  - tanstack-ai/core
---
# Angular Table State
Read `ai-core/adapter-configuration/SKILL.md`.
EOF

  cat > "$fixtures/ember/skills/table-state/SKILL.md" <<'EOF'
---
name: table-state
description: Ember getter (() => value) table state.
metadata:
  {
    type: framework,
    framework: ember,
  }
---
# Ember Table State
EOF

  local r1 r2 r3
  r1="$(node "$TRANSFORM_JS" "$fixtures/ai/skills" "$STAGE" '@tanstack/ai' '0.test' 'MIT' "$upstream_license")"
  r2="$(node "$TRANSFORM_JS" "$fixtures/angular/skills" "$STAGE" '@tanstack/angular-table' '9.test' 'MIT' "$upstream_license")"
  r3="$(node "$TRANSFORM_JS" "$fixtures/ember/skills" "$STAGE" '@tanstack/ember-table' '9.test' 'MIT' "$upstream_license")"
  printf '%s\n' "$r1" "$r2" "$r3" > "$test_mappings"

  node "$FINALIZE_JS" "$STAGE" "$test_mappings" >/dev/null
  node "$VALIDATE_JS" "$STAGE" "$MARKER" "$test_mappings" >/dev/null

  test -f "$STAGE/tanstack-ai-core/SKILL.md"
  test -f "$STAGE/tanstack-ai-core-adapter-configuration/SKILL.md"
  test -f "$STAGE/tanstack-angular-table-table-state/SKILL.md"
  test -f "$STAGE/tanstack-ember-table-table-state/SKILL.md"
  test -f "$STAGE/tanstack-ai-core/tools/notes.md"
  test -f "$STAGE/tanstack-ai-core-adapter-configuration/references/detail.md"
  test -f "$STAGE/tanstack-ai-core/UPSTREAM-LICENSE"
  test -f "$STAGE/tanstack-angular-table-table-state/UPSTREAM-LICENSE"

  grep -q '^name: tanstack-ai-core-adapter-configuration$' "$STAGE/tanstack-ai-core-adapter-configuration/SKILL.md"
  grep -q '../tanstack-ai-core-adapter-configuration/SKILL.md' "$STAGE/tanstack-ai-core/SKILL.md"
  grep -q '../tanstack-ai-core/SKILL.md' "$STAGE/tanstack-ai-core-adapter-configuration/SKILL.md"
  grep -Fq 'tanstack-requires: "[\"tanstack-ai-core\"]"' "$STAGE/tanstack-ai-core-adapter-configuration/SKILL.md"
  grep -Fq 'tanstack-requires: "[\"tanstack-ai-core-adapter-configuration\"]"' "$STAGE/tanstack-ai-core/SKILL.md"
  grep -Fq 'tanstack-requires: "[\"tanstack-ai-core\"]"' "$STAGE/tanstack-angular-table-table-state/SKILL.md"
  grep -q '^license: "MIT"$' "$STAGE/tanstack-ai-core/SKILL.md"
  grep -q '^license: "Apache-2.0"$' "$STAGE/tanstack-ai-core-adapter-configuration/SKILL.md"
  grep -q '^  tanstack-framework: "ember"$' "$STAGE/tanstack-ember-table-table-state/SKILL.md"
  grep -q '^  tanstack-type: "core"$' "$STAGE/tanstack-ai-core/SKILL.md"
  grep -q 'Read `../tanstack-ai-core-adapter-configuration/SKILL.md`' "$STAGE/tanstack-angular-table-table-state/SKILL.md"
  grep -Fq 'Read **../tanstack-ai-core/SKILL.md** in bold' "$STAGE/tanstack-ai-core-adapter-configuration/SKILL.md"
  grep -Fq 'Read __../tanstack-ai-core/SKILL.md__ with underscore emphasis' "$STAGE/tanstack-ai-core-adapter-configuration/SKILL.md"
  grep -Fq 'Read ~~../tanstack-ai-core/SKILL.md~~ with strike emphasis' "$STAGE/tanstack-ai-core-adapter-configuration/SKILL.md"
  grep -q '| `ai-core/adapter-configuration` | `tanstack-ai-core-adapter-configuration` |' "$STAGE/tanstack-ai-core/references/INTENT-SKILL-MAP.md"

  if grep -Eq '^(type|library|library_version|framework|requires|sources):' "$STAGE"/*/SKILL.md; then
    echo "ERROR: self-test found non-standard top-level frontmatter" >&2
    exit 1
  fi
  node - "$STAGE/tanstack-ai-core/SKILL.md" "$STAGE/tanstack-ember-table-table-state/SKILL.md" <<'NODE'
const fs = require('fs')
for (const file of process.argv.slice(2)) {
  const body = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/)[1]
  const description = JSON.parse(body.match(/^description:\s*(.+)$/m)[1])
  if (Buffer.byteLength(description, 'utf8') > 1024 || /[<>]/.test(description)) throw new Error(`Invalid description: ${file}`)
  if (file.includes('tanstack-ai-core') && !description.endsWith('Use whenever an AI adapter must be configured.')) {
    throw new Error(`Truncated trigger text: ${file}`)
  }
}
NODE

  local broken_ref="$STAGE/tanstack-ai-core/references/BROKEN.md"
  local broken_error="$TMP/broken-validation.err"
  printf '%s\n' 'Read `../../tanstack-missing/SKILL.md`.' > "$broken_ref"
  if node "$VALIDATE_JS" "$STAGE" "$MARKER" "$test_mappings" >/dev/null 2>"$broken_error"; then
    echo "ERROR: validator accepted a broken exported SKILL.md path" >&2
    exit 1
  fi
  grep -q 'broken exported SKILL.md reference' "$broken_error"
  rm -f "$broken_ref" "$broken_error"

  local stale_ref="$STAGE/tanstack-ai-core/references/STALE.md"
  local stale_error="$TMP/stale-validation.err"
  printf '%s\n' 'Read **ai-core/SKILL.md**.' > "$stale_ref"
  if node "$VALIDATE_JS" "$STAGE" "$MARKER" "$test_mappings" >/dev/null 2>"$stale_error"; then
    echo "ERROR: validator accepted a resolvable stale SKILL.md path" >&2
    exit 1
  fi
  grep -q 'unrewritten known SKILL.md reference' "$stale_error"
  rm -f "$stale_ref" "$stale_error"

  echo "PASS: hierarchical Intent names were flattened"
  echo "PASS: Angular/Ember table-state collision was preserved as two skills"
  echo "PASS: nested resources were preserved"
  echo "PASS: same-package and cross-package dependencies were resolved"
  echo "PASS: plain and Markdown SKILL.md paths were rewritten and validated"
  echo "PASS: upstream license identifiers and files were preserved"
  echo "PASS: frontmatter satisfies the standard field and description limits"
  echo "Self-test passed."
}

if [[ "$SELF_TEST" == "1" ]]; then
  run_self_test
  exit 0
fi

echo "TanStack published-skills exporter v$EXPORTER_VERSION"
echo "Source: npm dist-tag '$TAG' via $REGISTRY"
echo "Output format: flat Agent Skills bundle"
echo

PACKAGES_TXT="$TMP/packages.txt"
MANIFEST="$TMP/$MARKER"
MAPPINGS_JSONL="$TMP/export-mappings.jsonl"
: > "$MAPPINGS_JSONL"

echo "Discovering all published @tanstack/* packages ..."

node - "$REGISTRY" "$TAG" > "$PACKAGES_TXT" <<'NODE'
const registry = process.argv[2].replace(/\/$/, '')
const tag = process.argv[3]
const orgUrl = `${registry}/-/org/tanstack/package?format=cli`

async function request(url, attempts = 3) {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(30_000),
      })
      if (response.ok || response.status === 404) return response
      if (response.status < 500 && response.status !== 429) {
        throw new Error(`HTTP ${response.status}`)
      }
      lastError = new Error(`HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    }
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 500))
  }
  throw lastError
}

const orgResponse = await request(orgUrl)
if (!orgResponse.ok) throw new Error(`Could not list the TanStack npm scope: HTTP ${orgResponse.status}`)
const listing = await orgResponse.json()
if (!listing || typeof listing !== 'object' || Array.isArray(listing)) {
  throw new Error('The TanStack npm scope response is not an object')
}

const names = Object.keys(listing)
  .filter((name) => /^@tanstack\/[a-z0-9][a-z0-9._-]*$/.test(name))
  .sort()
const available = []
let cursor = 0

async function inspectLatestTags() {
  while (cursor < names.length) {
    const name = names[cursor++]
    const latestUrl = `${registry}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`
    const response = await request(latestUrl)
    if (response.status === 404) continue
    const metadata = await response.json()
    if (metadata?.name !== name || typeof metadata?.version !== 'string') {
      throw new Error(`Invalid npm metadata for ${name}`)
    }
    available.push(name)
  }
}

await Promise.all(Array.from({ length: 16 }, inspectLatestTags))
for (const name of available.sort()) console.log(name)
NODE

if [[ ! -s "$PACKAGES_TXT" ]]; then
  echo "ERROR: npm returned no published @tanstack/* packages for dist-tag '$TAG'." >&2
  exit 1
fi

printf 'package\tversion\tlicense\tpublished_skill_files\texported_skills\toutput_skills\n' > "$MANIFEST"

package_total="$(wc -l < "$PACKAGES_TXT" | tr -d ' ')"
package_index=0
skill_total=0
included_packages=0

while IFS= read -r pkg; do
  [[ -n "$pkg" ]] || continue
  package_index=$((package_index + 1))
  pack_json="$TMP/pack-$package_index.json"

  npm pack "$pkg@$TAG" \
    --json \
    --ignore-scripts \
    --pack-destination="$PACKS" \
    --registry="$REGISTRY" > "$pack_json"

  pack_line="$(node - "$pack_json" <<'NODE'
const fs = require('fs')
const rows = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const row = rows[0]
if (!row?.filename || !row?.version) process.exit(2)
process.stdout.write(`${row.filename}\t${row.version}`)
NODE
  )"
  IFS=$'\t' read -r pack_filename version <<< "$pack_line"
  tgz="$PACKS/$pack_filename"
  tar_list="$TMP/tar-$package_index.list"

  if ! tar -tzf "$tgz" > "$tar_list"; then
    echo "ERROR: could not list npm tarball for $pkg@$version: $tgz" >&2
    exit 1
  fi

  if ! grep -Eq '^package/skills/.*/SKILL\.md$' "$tar_list"; then
    if (( package_index % 25 == 0 || package_index == package_total )); then
      echo "[$package_index/$package_total] scanned published packages ..."
    fi
    rm -f "$tgz"
    continue
  fi

  if grep -Eq '(^|/)\.\.(/|$)|^/' "$tar_list"; then
    echo "ERROR: unsafe absolute or parent-traversal path in $pkg@$version tarball" >&2
    exit 1
  fi
  if ! grep -Fxq 'package/package.json' "$tar_list"; then
    echo "ERROR: $pkg@$version tarball has skills but no package/package.json" >&2
    exit 1
  fi

  license_entry="$(node - "$tar_list" <<'NODE'
const fs = require('fs')
const entries = fs.readFileSync(process.argv[2], 'utf8').split(/\r?\n/)
const licenses = entries
  .filter((entry) => /^package\/(?:licen[cs]e|copying)(?:\.[^/]*)?$/i.test(entry))
  .sort((a, b) => a.length - b.length || a.localeCompare(b))
if (licenses[0]) process.stdout.write(licenses[0])
NODE
  )"

  pkg_stage="$TMP/pkg-$package_index"
  mkdir -p "$pkg_stage"
  extract_members=(package/package.json package/skills)
  if [[ -n "$license_entry" ]]; then
    extract_members+=("$license_entry")
  fi
  if ! tar -xzf "$tgz" \
    -C "$pkg_stage" \
    --no-same-owner \
    --no-same-permissions \
    "${extract_members[@]}"; then
    echo "ERROR: could not extract skills and metadata from $pkg@$version" >&2
    exit 1
  fi
  if [[ -L "$pkg_stage/package/package.json" || ! -f "$pkg_stage/package/package.json" ]]; then
    echo "ERROR: package metadata is missing or is a symlink for $pkg@$version" >&2
    exit 1
  fi
  if [[ -n "$license_entry" && ( -L "$pkg_stage/$license_entry" || ! -f "$pkg_stage/$license_entry" ) ]]; then
    echo "ERROR: upstream license is missing or is a symlink for $pkg@$version: $license_entry" >&2
    exit 1
  fi

  license="$(node - "$pkg_stage/package/package.json" "$pkg" "$version" <<'NODE'
const fs = require('fs')
const file = process.argv[2]
const expectedName = process.argv[3]
const expectedVersion = process.argv[4]
let metadata
try {
  metadata = JSON.parse(fs.readFileSync(file, 'utf8'))
} catch (error) {
  process.stderr.write(`ERROR: invalid package metadata for ${expectedName}@${expectedVersion}: ${error.message}\n`)
  process.exit(2)
}
if (metadata.name !== expectedName || metadata.version !== expectedVersion) {
  process.stderr.write(`ERROR: package metadata identity mismatch: expected ${expectedName}@${expectedVersion}, got ${metadata.name}@${metadata.version}\n`)
  process.exit(2)
}
const raw = typeof metadata.license === 'string'
  ? metadata.license
  : metadata.license && typeof metadata.license.type === 'string'
    ? metadata.license.type
    : ''
const license = raw.trim()
if (!license || /[\u0000-\u001f\u007f]/.test(license)) {
  process.stderr.write(`ERROR: ${expectedName}@${expectedVersion} has no valid string license identifier in package.json\n`)
  process.exit(2)
}
process.stdout.write(license)
NODE
  )"

  upstream_license_file=""
  if [[ -n "$license_entry" ]]; then
    upstream_license_file="$pkg_stage/$license_entry"
  fi

  result_json="$TMP/result-$package_index.json"
  node "$TRANSFORM_JS" \
    "$pkg_stage/package/skills" "$STAGE" "$pkg" "$version" "$license" "$upstream_license_file" > "$result_json"

  node - "$result_json" >> "$MAPPINGS_JSONL" <<'NODE'
const fs = require('fs')
const value = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
process.stdout.write(`${JSON.stringify(value)}\n`)
NODE

  result_line="$(node - "$result_json" <<'NODE'
const fs = require('fs')
const x = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
process.stdout.write(`${x.skillFiles}\t${x.outputSkills}\t${x.outputRoots.join(',')}`)
NODE
  )"
  IFS=$'\t' read -r skill_count output_count output_roots <<< "$result_line"

  printf '%s\t%s\t%s\t%s\t%s\t%s\n' \
    "$pkg" "$version" "$license" "$skill_count" "$output_count" "$output_roots" >> "$MANIFEST"

  skill_total=$((skill_total + output_count))
  included_packages=$((included_packages + 1))
  echo "[$package_index/$package_total] $pkg@$version: $skill_count published skills -> $output_count flat skills"
  rm -f "$tgz"
done < "$PACKAGES_TXT"

finalization="$(node "$FINALIZE_JS" "$STAGE" "$MAPPINGS_JSONL")"
validation="$(node "$VALIDATE_JS" "$STAGE" "$MARKER" "$MAPPINGS_JSONL")"
validated_count="$(node -e 'const x=JSON.parse(process.argv[1]); process.stdout.write(String(x.skillCount))' "$validation")"

if [[ "$validated_count" -ne "$skill_total" ]]; then
  echo "ERROR: validation count mismatch: expected $skill_total, got $validated_count" >&2
  exit 1
fi

{
  printf '# exporter_version=%s\n' "$EXPORTER_VERSION"
  printf '# source_registry=%s\n' "$REGISTRY"
  printf '# source_tag=%s\n' "$TAG"
  cat "$MANIFEST"
} > "$STAGE/$MARKER"

if [[ -e "$OUT" ]]; then
  if [[ ! -f "$OUT/$MARKER" && "${FORCE:-0}" != "1" ]]; then
    echo "ERROR: output exists and was not created by this exporter: $OUT" >&2
    echo "       Use another output path, remove it, or set FORCE=1." >&2
    exit 1
  fi
  rm -rf "$OUT"
fi

mkdir -p "$(dirname "$OUT")"
mv "$STAGE" "$OUT"

echo
echo "Done."
echo "Packages with skills: $included_packages"
echo "Exported skills:      $skill_total"
echo "Validated skills:     $validated_count"
echo "Output:               $OUT"
echo "Manifest:             $OUT/$MARKER"
