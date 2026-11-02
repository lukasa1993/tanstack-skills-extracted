// Release provenance applies to imported material. An outbound citation is not
// an acquisition dependency and must never require its own network request.
export function repositoryLink(value) {
  let url
  try { url = new URL(value) } catch { return undefined }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) return undefined
  const parts = url.pathname.split('/').slice(1)
  let ownerIndex = 0
  if (url.hostname === 'codesandbox.io' && parts[0] === 's' && parts[1] === 'github') ownerIndex = 2
  else if (url.hostname === 'stackblitz.com' && parts[0] === 'github') ownerIndex = 1
  else if (!['github.com', 'raw.githubusercontent.com'].includes(url.hostname)) return undefined

  const raw = url.hostname === 'raw.githubusercontent.com'
  const kind = raw ? 'raw' : parts[ownerIndex + 2]
  if (!['blob', 'tree', 'raw', 'commits'].includes(kind)) return undefined
  const refStart = ownerIndex + (raw ? 2 : 3)
  const refIndex = parts[refStart] === 'refs' && parts[refStart + 1] === 'heads' ? refStart + 2 : refStart
  try {
    const repository = parts.slice(ownerIndex, ownerIndex + 2).map(decodeURIComponent).join('/')
    if (!/^[\w.-]+\/[\w.-]+$/.test(repository) || !parts[refIndex]) return undefined
    return {
      repository,
      ref: decodeURIComponent(parts[refIndex]),
      path: parts.slice(refIndex + 1).map(decodeURIComponent).join('/'),
      kind,
      type: kind === 'tree' ? 'directory' : 'file',
      url, parts, refStart, refIndex,
    }
  } catch { return undefined }
}

export function pinRepositoryLink(value, sourceGit) {
  const link = repositoryLink(value)
  if (!link || !sourceGit || link.repository.toLowerCase() !== sourceGit.repository.toLowerCase() ||
      !['main', 'master'].includes(link.ref)) return value
  if (!/^[a-f0-9]{40}$/i.test(sourceGit.commit)) throw new Error('Repository link requires a verified source commit')
  link.url.pathname = '/' + [...link.parts.slice(0, link.refStart), sourceGit.commit, ...link.parts.slice(link.refIndex + 1)].join('/')
  return link.url.href
}

export function rewriteRepositoryLinks(text, sourceGit, onExternal = () => {}) {
  let fence
  return text.split('\n').map((line) => {
    const marker = line.match(/^\s*(`{3,}|~{3,})/)?.[1]
    if (marker) {
      if (!fence) fence = marker
      else if (marker[0] === fence[0] && marker.length >= fence.length) fence = undefined
      return line
    }
    if (fence) return line
    const codeRanges = []
    const delimiters = [...line.matchAll(/`+/g)]
    for (let i = 0; i < delimiters.length; i++) {
      const end = delimiters.findIndex((match, j) => j > i && match[0].length === delimiters[i][0].length)
      if (end === -1) continue
      codeRanges.push([delimiters[i].index, delimiters[end].index + delimiters[end][0].length])
      i = end
    }
    return line.replace(/https:\/\/[^\s<>"'`)\]}]+/gi, (value, offset) => {
      if (codeRanges.some(([start, end]) => offset >= start && offset < end)) return value
      const link = repositoryLink(value)
      if (link && (!sourceGit || link.repository.toLowerCase() !== sourceGit.repository.toLowerCase())) {
        onExternal({ url: value, repository: link.repository })
      }
      return pinRepositoryLink(value, sourceGit)
    })
  }).join('\n')
}
