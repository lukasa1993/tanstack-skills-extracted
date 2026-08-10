#!/usr/bin/env node

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const skillsDir = join(root, 'skills')

const groups = [
  {
    slug: 'tanstack-ai',
    title: 'TanStack AI',
    description: 'Skills for TanStack AI, MCP, Code Mode, and sandboxes.',
    matches: (name) => /^tanstack-ai(?:-|$)/.test(name),
  },
  {
    slug: 'tanstack-db',
    title: 'TanStack DB',
    description: 'Core database skills, framework bindings, and offline transactions.',
    matches: (name) =>
      /^tanstack-db(?:-|$)/.test(name) ||
      /^tanstack-(?:angular|react|solid|svelte|vue)-db$/.test(name) ||
      /^tanstack-offline-transactions(?:-|$)/.test(name),
  },
  {
    slug: 'tanstack-cli',
    title: 'TanStack CLI',
    description: 'App creation, add-ons, integrations, and documentation queries.',
    matches: (name) => /^tanstack-cli(?:-|$)/.test(name),
  },
  {
    slug: 'tanstack-devtools',
    title: 'TanStack Devtools',
    description: 'Devtools setup, plugins, events, framework adapters, and production builds.',
    matches: (name) => /^tanstack-devtools(?:-|$)/.test(name),
  },
  {
    slug: 'router-and-start',
    title: 'TanStack Router and Start',
    description: 'Router, Start, server functions, deployment, and framework integration skills.',
    matches: (name) =>
      /^tanstack-(?:react-start|router-core|router-plugin|solid-router|solid-start|start-client-core|start-server-core|virtual-file-routes|vue-router|vue-start)(?:-|$)/.test(name),
  },
  {
    slug: 'table-core',
    title: 'Table Core',
    description: 'Framework-neutral TanStack Table skills required by framework adapters.',
    matches: (name) => /^tanstack-table-core(?:-|$)/.test(name),
  },
  {
    slug: 'react-table',
    title: 'React Table',
    description: 'React adapter skills. Select Table Core too.',
    matches: (name) => /^tanstack-react-table(?:-|$)/.test(name),
  },
  {
    slug: 'angular-table',
    title: 'Angular Table',
    description: 'Angular adapter skills. Select Table Core too.',
    matches: (name) => /^tanstack-angular-table(?:-|$)/.test(name),
  },
  {
    slug: 'solid-table',
    title: 'Solid Table',
    description: 'Solid adapter skills. Select Table Core too.',
    matches: (name) => /^tanstack-solid-table(?:-|$)/.test(name),
  },
  {
    slug: 'svelte-table',
    title: 'Svelte Table',
    description: 'Svelte adapter skills. Select Table Core too.',
    matches: (name) => /^tanstack-svelte-table(?:-|$)/.test(name),
  },
  {
    slug: 'vue-table',
    title: 'Vue Table',
    description: 'Vue adapter skills. Select Table Core too.',
    matches: (name) => /^tanstack-vue-table(?:-|$)/.test(name),
  },
  {
    slug: 'preact-table',
    title: 'Preact Table',
    description: 'Preact adapter skills. Select Table Core too.',
    matches: (name) => /^tanstack-preact-table(?:-|$)/.test(name),
  },
  {
    slug: 'lit-table',
    title: 'Lit Table',
    description: 'Lit adapter skills. Select Table Core too.',
    matches: (name) => /^tanstack-lit-table(?:-|$)/.test(name),
  },
  {
    slug: 'ember-table',
    title: 'Ember Table',
    description: 'Ember adapter skills. Select Table Core too.',
    matches: (name) => /^tanstack-ember-table(?:-|$)/.test(name),
  },
  {
    slug: 'alpine-table',
    title: 'Alpine Table',
    description: 'Alpine adapter skills. Select Table Core too.',
    matches: (name) => /^tanstack-alpine-table(?:-|$)/.test(name),
  },
  {
    slug: 'octane-table',
    title: 'Octane Table',
    description: 'Octane adapter skills. Select Table Core too.',
    matches: (name) => /^tanstack-octane-table(?:-|$)/.test(name),
  },
  {
    slug: 'markdown',
    title: 'Markdown',
    description: 'TanStack Markdown parsing and rendering skills.',
    matches: (name) => /^tanstack-markdown(?:-|$)/.test(name),
  },
  {
    slug: 'highlight',
    title: 'Highlight',
    description: 'TanStack Highlight integration and extension skills.',
    matches: (name) => /^tanstack-highlight(?:-|$)/.test(name),
  },
  {
    slug: 'table-tools',
    title: 'Table Tools',
    description: 'Table developer tools and fuzzy ranking.',
    matches: (name) =>
      name === 'tanstack-table-devtools' || name === 'tanstack-match-sorter-utils-fuzzy-ranking',
  },
]

async function exists(path) {
  try {
    await readFile(path)
    return true
  } catch (error) {
    if (error?.code === 'EISDIR') return true
    if (error?.code === 'ENOENT') return false
    throw error
  }
}

async function listSkills() {
  const entries = await readdir(skillsDir, { withFileTypes: true })
  const names = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (await exists(join(skillsDir, entry.name, 'SKILL.md'))) names.push(entry.name)
  }

  return names.sort()
}

function assignSkills(skillNames) {
  const assignments = new Map(groups.map((group) => [group.slug, []]))
  const ungrouped = []

  for (const name of skillNames) {
    const matches = groups.filter((group) => group.matches(name))
    if (matches.length > 1) {
      throw new Error(`${name} matches more than one group: ${matches.map((group) => group.slug).join(', ')}`)
    }
    if (matches.length === 0) {
      ungrouped.push(name)
      continue
    }
    assignments.get(matches[0].slug).push(name)
  }

  return { assignments, ungrouped }
}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

async function main() {
  const skillNames = await listSkills()
  const { assignments, ungrouped } = assignSkills(skillNames)
  const populatedGroups = groups.filter((group) => assignments.get(group.slug).length > 0)

  const skillsShConfig = {
    $schema: 'https://skills.sh/schemas/skills.sh.schema.json',
    notGrouped: 'bottom',
    groupings: populatedGroups.map((group) => ({
      title: group.title,
      description: group.description,
      skills: assignments.get(group.slug),
    })),
  }

  const marketplace = {
    name: 'tanstack-skills-extracted',
    description: 'Install extracted TanStack skills by product or framework.',
    owner: { name: 'lukasa1993' },
    plugins: populatedGroups.map((group) => ({
      name: group.slug,
      source: './',
      description: group.description,
      license: 'MIT',
      strict: false,
      skills: assignments.get(group.slug).map((name) => `./skills/${name}`),
    })),
  }

  await writeFile(join(root, 'skills.sh.json'), json(skillsShConfig))
  await mkdir(join(root, '.claude-plugin'), { recursive: true })
  await writeFile(join(root, '.claude-plugin', 'marketplace.json'), json(marketplace))

  const groupedCount = [...assignments.values()].reduce((sum, names) => sum + names.length, 0)
  console.log(`Built ${populatedGroups.length} groups for ${groupedCount} skills.`)
  if (ungrouped.length > 0) console.log(`Left ${ungrouped.length} new skill(s) in Other: ${ungrouped.join(', ')}`)
}

await main()
