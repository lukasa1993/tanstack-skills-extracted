#!/usr/bin/env node

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const skillsDir = join(root, 'skills')

const groups = [
  {
    slug: 'tanstack-query',
    title: 'TanStack Query',
    description: 'Query core, framework adapters, lifecycle, caching, mutations, SSR, and integrations.',
    matches: (name) =>
      /^tanstack-(?:query(?:-core|-intent)?|angular-query|preact-query|react-query|solid-query|svelte-query|vue-query)(?:-|$)/.test(name),
  },
  {
    slug: 'tanstack-table',
    title: 'TanStack Table',
    description: 'Table Core, every framework adapter, devtools, virtualization integrations, and fuzzy ranking.',
    matches: (name) =>
      /^tanstack-(?:alpine|angular|ember|lit|octane|preact|react|solid|svelte|vue)-table(?:-|$)/.test(name) ||
      /^tanstack-table-(?:core|devtools)(?:-|$)/.test(name) ||
      name === 'tanstack-match-sorter-utils-fuzzy-ranking',
  },
  {
    slug: 'tanstack-router-and-start',
    title: 'TanStack Router and Start',
    description: 'Router, Start, server functions, deployment, and framework integration skills.',
    matches: (name) =>
      /^tanstack-(?:react-start|router-core|router-plugin|solid-router|solid-start|start-client-core|start-server-core|virtual-file-routes|vue-router|vue-start)(?:-|$)/.test(name),
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
    slug: 'tanstack-ai',
    title: 'TanStack AI',
    description: 'Skills for TanStack AI, MCP, Code Mode, memory, persistence, and sandboxes.',
    matches: (name) => /^tanstack-ai(?:-|$)/.test(name),
  },
  {
    slug: 'tanstack-devtools',
    title: 'TanStack Devtools',
    description: 'Devtools setup, plugins, events, framework adapters, and production builds.',
    matches: (name) => /^tanstack-devtools(?:-|$)/.test(name),
  },
  {
    slug: 'tanstack-markdown',
    title: 'TanStack Markdown',
    description: 'TanStack Markdown parsing and rendering skills.',
    matches: (name) => /^tanstack-markdown(?:-|$)/.test(name),
  },
  {
    slug: 'tanstack-highlight',
    title: 'TanStack Highlight',
    description: 'TanStack Highlight integration and extension skills.',
    matches: (name) => /^tanstack-highlight(?:-|$)/.test(name),
  },
  {
    slug: 'tanstack-cli',
    title: 'TanStack CLI',
    description: 'App creation, add-ons, integrations, and documentation queries.',
    matches: (name) => /^tanstack-cli(?:-|$)/.test(name),
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
