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
