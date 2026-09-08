const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const skillsDir = path.resolve(process.argv[2])
const outRoot = path.resolve(process.argv[3])
const pkg = process.argv[4]
const version = process.argv[5]
const packageLicense = process.argv[6]
const packageLicenseFile = process.argv[7] ? path.resolve(process.argv[7]) : null
const sourceRef = process.argv[8] || null

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
  sourceRef ? `Source: ${sourceRef}` : `Published package: ${pkg}@${version}`,
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
  sourceRef,
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
