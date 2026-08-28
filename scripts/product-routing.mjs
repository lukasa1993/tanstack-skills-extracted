export const additionalGuidanceTheme = Object.freeze({
  key: 'additional-guidance',
  title: 'Additional official guidance',
  description: 'New official guidance that has not yet been assigned to a specialized topic.',
  match: () => false,
})

export function packageSkillName(packageName) {
  return packageName?.replace(/^@tanstack\//, 'tanstack-') || ''
}

function productHintIds(productSpecs, libraryName) {
  const tokens = String(libraryName || '')
    .replace(/^@tanstack\//i, '')
    .replace(/^tanstack(?:[\s-]+)?/i, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
  const tokenSet = new Set(tokens)
  return new Set(productSpecs.map((spec) => spec.id).filter((id) => tokenSet.has(id)))
}

export function resolveProduct(productSpecs, source, docPackageOwners = new Map()) {
  const packageName = source.packageName || ''
  const packageNameAsSkill = packageSkillName(packageName)
  const documentedOwner = docPackageOwners.get(packageName)
  // Names and documentation ownership are authoritative. Library metadata is
  // only a fallback because adapter names can mention multiple products.
  const authoritativeMatches = productSpecs.filter(
    (spec) =>
      spec.atomicMatch(source.name) ||
      spec.atomicMatch(packageNameAsSkill) ||
      documentedOwner === spec.id,
  )
  if (authoritativeMatches.length === 1) return authoritativeMatches[0]
  if (authoritativeMatches.length > 1) {
    throw new Error(
      `${source.id || source.name} must match exactly one product, matched: ${authoritativeMatches.map((spec) => spec.id).join(', ')}`,
    )
  }

  const hintedIds = productHintIds(productSpecs, source.libraryName)
  const matches = productSpecs.filter((spec) => hintedIds.has(spec.id))
  if (matches.length !== 1) {
    throw new Error(
      `${source.id || source.name} must match exactly one product, matched: ${matches.map((spec) => spec.id).join(', ') || 'none'}`,
    )
  }
  return matches[0]
}

export function selectTheme(spec, source, onFallback = () => {}) {
  const candidates = spec.themes.filter((entry) => entry.match(source.name, source))
  if (source.supplemental && candidates.length > 1) {
    throw new Error(`${source.id} matches multiple supplemental themes in ${spec.id}`)
  }
  if (!candidates.length) {
    onFallback(additionalGuidanceTheme)
    return additionalGuidanceTheme
  }
  return candidates[0]
}

export function createThemeBuckets(spec) {
  if (spec.themes.some((entry) => entry.key === additionalGuidanceTheme.key)) {
    throw new Error(`${spec.id} uses reserved theme key: ${additionalGuidanceTheme.key}`)
  }
  return new Map(
    [...spec.themes, additionalGuidanceTheme].map((entry) => [entry.key, { ...entry, sources: [] }]),
  )
}
