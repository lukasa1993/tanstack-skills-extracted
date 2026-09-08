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
  sourceRef: record.sourceRef || null,
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
  if (owner.sourceRef && parsed.metadata.get('tanstack-source-ref') !== owner.sourceRef) fail(`source reference metadata mismatch in ${name}`)
  if (!owner.sourceRef && parsed.metadata.has('tanstack-source-ref')) fail(`unexpected source reference metadata in ${name}`)
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
