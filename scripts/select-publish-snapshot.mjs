#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { appendFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export function selectPublishSnapshot(cwd = process.cwd()) {
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()
  const content = ['skills', 'skills.sh.json', '.claude-plugin/marketplace.json']
  const sha = git('log', '-1', '--format=%H', '--', ...content)
  if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error('No committed skill catalog to publish')
  return { sha, version: `v0.1.${git('rev-list', '--count', sha, '--', ...content)}`, code_sha: git('rev-parse', 'HEAD') }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const output = Object.entries(selectPublishSnapshot()).map(([key, value]) => `${key}=${value}`).join('\n') + '\n'
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, output)
  else process.stdout.write(output)
}
