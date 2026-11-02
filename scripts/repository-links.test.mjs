import assert from 'node:assert/strict'
import test from 'node:test'
import { repositoryLink, pinRepositoryLink, rewriteRepositoryLinks } from './repository-links.mjs'

const source = { repository: 'TanStack/hotkeys', commit: 'a'.repeat(40) }
const external = 'https://github.com/octanejs/octane/blob/main/docs/ssr.md'

test('external references need no URL, repository, branch, or document allowlist', () => {
  const urls = [external, external.replace('/main/', '/master/'), external.replace('/main/', '/next/'),
    external.replace('octanejs/octane', 'new-owner/new-project'),
    'https://raw.githubusercontent.com/octanejs/octane/refs/heads/main/docs/ssr.md',
    'https://stackblitz.com/github/other/repository/tree/main/examples/demo',
    'https://github.com/sxzz/userscripts/blob/main/src/npm-trusted-publisher.md',
  ]
  const text = urls.map((url) => `[Reference](${url}#details)`).join('\n')
  const references = []
  assert.equal(rewriteRepositoryLinks(text, source, (link) => references.push(link)), text)
  assert.deepEqual(references.map((link) => link.url), urls.map((url) => `${url}#details`))
  assert.equal(rewriteRepositoryLinks(text, source), text, 'repeated citations remain valid')
  assert.equal(rewriteRepositoryLinks('Reference removed upstream.', source), 'Reference removed upstream.')
})

test('owned links share one pinning policy across GitHub URL forms', () => {
  for (const [prefix, ref] of [
    ['https://github.com/TanStack/hotkeys/blob/', 'main'],
    ['https://github.com/tanstack/HOTKEYS/tree/', 'master'],
    ['https://github.com/TanStack/hotkeys/raw/', 'refs/heads/main'],
    ['https://github.com/TanStack/hotkeys/commits/', 'main'],
    ['https://raw.githubusercontent.com/TanStack/hotkeys/', 'refs/heads/master'],
    ['https://codesandbox.io/s/github/TanStack/hotkeys/tree/', 'main'],
    ['https://stackblitz.com/github/TanStack/hotkeys/tree/', 'main'],
  ]) {
    const suffix = '/docs/a%20b.md?plain=1#setup'
    assert.equal(pinRepositoryLink(`${prefix}${ref}${suffix}`, source), `${prefix}${source.commit}${suffix}`)
  }
  const tagged = 'https://github.com/TanStack/hotkeys/blob/v1.0.0/docs/overview.md'
  assert.equal(pinRepositoryLink(tagged, source), tagged)
  assert.equal(pinRepositoryLink(external, source), external)
  assert.equal(pinRepositoryLink(external.replace('octanejs/octane', 'TanStack/hotkeys-extra'), source), external.replace('octanejs/octane', 'TanStack/hotkeys-extra'))
  assert.throws(() => pinRepositoryLink(external.replace('octanejs/octane', source.repository), { ...source, commit: 'main' }), /verified source commit/)
})

test('prose URLs are pinned without altering code examples or external references', () => {
  const owned = 'https://github.com/TanStack/hotkeys/blob/main/docs/overview.md'
  const pinned = owned.replace('/main/', `/${source.commit}/`)
  const prose = [`[Overview](${owned} "Title")`, `<${owned}>`, `<a href="${owned}">Overview</a>`,
    `[overview]: ${owned}`, `Read ${owned}`, `[SSR](${external})`].join('\n')
  const code = [`\`${owned}\``, `\`\`literal \` ${owned}\`\``, '```md', `[Example](${owned})`, '```',
    '~~~~md', owned, '~~~', owned, '~~~~'].join('\n')
  assert.equal(rewriteRepositoryLinks(`${prose}\n${code}`, source), `${prose.replaceAll(owned, pinned)}\n${code}`)
})

test('unknown links and sources without a verified commit stay as authored', () => {
  for (const value of ['https://example.com/owner/repo/blob/main/file', 'https://github.com/owner/repo/issues/1',
    'https://github.com/owner/repo/blob/main/bad%ZZ', 'relative.md']) {
    assert.equal(repositoryLink(value), undefined)
    assert.equal(pinRepositoryLink(value, source), value)
  }
  assert.equal(rewriteRepositoryLinks(`[Reference](${external})`, null), `[Reference](${external})`)
})
