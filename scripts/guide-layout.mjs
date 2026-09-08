import { createHash } from 'node:crypto'

export const guideTargetBytes = 12 * 1024
export const guideSlug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
export const guideId = (sourceId) => `${guideSlug(sourceId).slice(0, 100)}-${createHash('sha256').update(sourceId).digest('hex').slice(0, 8)}`

// Split at section boundaries only. Fences, tables, and Wrong/Correct pairs
// inside a subsection remain intact even when one subsection exceeds the target.
export function splitGuideBlocks(blocks, targetBytes = guideTargetBytes) {
  const sections = []
  for (const block of blocks) {
    if (Buffer.byteLength(block.content) <= targetBytes) {
      sections.push(block)
      continue
    }
    let fence
    let heading = block.heading
    let lines = []
    const flush = () => {
      if (lines.some((line) => line.trim())) sections.push({ heading, content: lines.join('\n') + '\n' })
      lines = []
    }
    for (const line of block.content.trimEnd().split('\n')) {
      const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1]
      if (marker) {
        if (!fence) fence = marker
        else if (marker[0] === fence[0] && marker.length >= fence.length) fence = undefined
      }
      const subheading = !fence && /^###\s+(.+)/.exec(line)
      if (subheading) {
        flush()
        heading = `${block.heading}: ${subheading[1]}`
      } else lines.push(line)
    }
    flush()
  }
  return sections
}

export function planGuide(blocks, targetBytes = guideTargetBytes) {
  const total = blocks.reduce((sum, block) => sum + Buffer.byteLength(block.content), 0)
  if (total <= targetBytes) return { split: false, pages: [{ key: '', blocks }] }
  const sections = splitGuideBlocks(blocks, targetBytes)
  if (sections.length < 2) return { split: false, pages: [{ key: '', blocks }] }
  const used = new Set()
  const pages = sections.map((block) => {
    const base = guideSlug(block.heading) || 'overview'
    let key = base
    let index = 2
    while (used.has(key)) key = `${base}-${index++}`
    used.add(key)
    return { key, blocks: [block] }
  })
  return { split: true, pages }
}

export function sourceStatus(source) {
  if (source.kind === 'document') return 'Release-matched documentation'
  if (source.sourceRef?.startsWith('github:')) return 'Draft guidance'
  return 'Published skill'
}
