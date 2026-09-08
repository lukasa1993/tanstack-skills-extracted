export const expectedCatalogIds = Object.freeze([
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
])

export const categoryGroups = Object.freeze([
  Object.freeze(['Framework', Object.freeze(['start', 'router'])]),
  Object.freeze(['Data and state', Object.freeze(['query', 'db', 'store', 'ai'])]),
  Object.freeze(['UI and UX', Object.freeze(['table', 'charts', 'form', 'hotkeys', 'markdown', 'highlight'])]),
  Object.freeze(['Performance', Object.freeze(['virtual', 'pacer'])]),
  Object.freeze(['Tooling', Object.freeze(['devtools', 'config', 'cli', 'intent'])]),
])

export const expectedProductSkills = Object.freeze(
  categoryGroups.flatMap(([, ids]) => ids.map((id) => `tanstack-${id}`)),
)

// The upstream catalog is a set of identities, not a versioned ordering contract.
export function inspectCatalogIds(libraries) {
  if (!Array.isArray(libraries)) throw new Error('Public catalog has no libraries array')
  const ids = libraries.map((library) => library?.id)
  if (ids.some((id) => typeof id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(id)) || new Set(ids).size !== ids.length) {
    throw new Error('Public catalog contains invalid or duplicate library identities')
  }
  const missing = expectedCatalogIds.filter((id) => !ids.includes(id))
  if (missing.length) throw new Error(`Public catalog is missing required products: ${missing.join(', ')}`)
  return { ids: [...expectedCatalogIds], additional: ids.filter((id) => !expectedCatalogIds.includes(id)).sort() }
}
