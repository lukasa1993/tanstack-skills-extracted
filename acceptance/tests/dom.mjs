import { JSDOM } from 'jsdom'
import { pathToFileURL } from 'node:url'
import { join } from 'node:path'
import { after } from 'node:test'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })
for (const key of ['window', 'document', 'Element', 'HTMLElement', 'SVGElement', 'HTMLInputElement', 'Event', 'MouseEvent', 'Node', 'navigator']) {
  Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true })
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true
after(() => dom.window.close())

export const exampleUrl = (product, file) => pathToFileURL(join(process.env.TANSTACK_ACCEPTANCE_INSTALL, `tanstack-${product}`, 'references/examples', file)).href
export const deferred = () => {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
export async function eventually(check, flush = async (work) => work()) {
  const deadline = Date.now() + 3000
  while (true) {
    await flush(async () => { await new Promise((done) => setTimeout(done, 10)) })
    try { check(); return } catch (error) { if (Date.now() > deadline) throw error }
  }
}
