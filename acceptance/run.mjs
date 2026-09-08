import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import assert from 'node:assert/strict'

const here = dirname(fileURLToPath(import.meta.url))
const repository = resolve(here, '..')
const root = resolve(process.env.TANSTACK_BUILD_ROOT || repository)
const manifest = JSON.parse(await readFile(join(repository, 'scripts/examples/manifest.json'), 'utf8'))
const packages = JSON.parse(await readFile(join(here, 'package.json'), 'utf8')).dependencies
const installation = await mkdtemp(join(here, '.run-'))
try {
  // Copy complete single-product installations; no sibling skills or source docs
  // are available inside the fixture. Compile and execute the shipped examples.
  for (const product of new Set(manifest.map((example) => example.product))) {
    await cp(join(root, 'skills', `tanstack-${product}`), join(installation, `tanstack-${product}`), { recursive: true })
  }
  const files = []
  for (const example of manifest) {
    for (const [name, version] of Object.entries(example.testedPackages)) assert.equal(packages[name], version, `Test dependency drift: ${name}`)
    const product = `tanstack-${example.product}`
    const routes = JSON.parse(await readFile(join(installation, product, 'references/ROUTES.json'), 'utf8')).guides
    const route = routes.find((guide) => guide.sourcePath === example.sourcePath)
    assert.ok(route?.examples?.some((entry) => entry.file === `references/examples/${example.file}`), `Example is not routed: ${example.file}`)
    files.push(`${product}/references/examples/${example.file}`)
  }
  await writeFile(join(installation, 'tsconfig.json'), JSON.stringify({
    compilerOptions: { target: 'ES2022', module: 'NodeNext', moduleResolution: 'NodeNext', jsx: 'react-jsx', strict: true,
      skipLibCheck: true, outDir: 'compiled', rootDir: '.', types: ['react', 'react-dom'], noEmitOnError: true }, files,
  }))
  for (const args of [
    [join(here, 'node_modules/typescript/bin/tsc'), '--project', join(installation, 'tsconfig.json')],
    ['--test', '--test-timeout=15000', join(here, 'tests/react-query.test.mjs'), join(here, 'tests/vue-query.test.mjs'), join(here, 'tests/react-form.test.mjs')],
  ]) {
    const result = spawnSync(process.execPath, args, { cwd: here, stdio: 'inherit',
      env: { ...process.env, TANSTACK_ACCEPTANCE_INSTALL: join(installation, 'compiled') } })
    if (result.error) throw result.error
    if (result.status !== 0) throw new Error(`Installed-skill acceptance failed (${result.status})`)
  }
} finally { await rm(installation, { recursive: true, force: true }) }
